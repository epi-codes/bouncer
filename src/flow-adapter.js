const debug = require('debug')('bouncer:adapter');

const redis = require("redis");
const cryptoRandomString = require('crypto-random-string');

class FlowAdapter {
  constructor (webapp, discordbot, config) {
    debug('init');

    this.webapp = webapp;
    this.discordbot = discordbot;
    this.config = config;

    this.webapp.locals.adapter = this;
    this.discordbot.locals.adapter = this;

    this.redis = redis.createClient({
      url: config.redis.url,
      prefix: config.redis.prefix
    });

    this.redis.on('ready', () => {
      debug('redis client ready');
    });
  }

  checkActiveFlow (guild_member) {
    return new Promise((resolve, reject) => {
      debug('check flow');

      this.redis.get(
        `flow:active:${guild_member.id}:${guild_member.guild.id}`,
        (err, reply) => {
          if (err) return reject(err);

          resolve(reply);
        }
      );
    });
  }

  createFlow (member) {
    return new Promise((resolve, reject) => {
      debug('new flow');

      let key = cryptoRandomString(32);
      let data = {
        guild: {
          id: member.guild.id,
          name: member.guild.name
        },
        member: {
          id: member.id,
          name: member.displayName
        }
      };

      this.redis.set(
        `flow:data:${key}`,
        JSON.stringify(data),
        'EX', this.config.flow.expire,
        (err) => {
          if (err) return reject(err);

          this.redis.set(
            `flow:active:${member.id}:${member.guild.id}`,
            key,
            'EX', this.config.flow.expire,
            (err) => {
              if (err) return reject(err);

              resolve(key);
            }
          );
        }
      );
    });
  }

  getFlow(key) {
    return new Promise((resolve, reject) => {
      debug('get flow');

      this.redis.get(
        `flow:data:${key}`,
        (err, reply) => {
          if (err) return reject(err);

          resolve(reply ? JSON.parse(reply) : reply);
        }
      );
    });
  }

  completeFlow(key) {
    return new Promise(async (resolve, reject) => {
      try {
        let data = await this.getFlow(key);
        let guild = this.discordbot.guilds.get(data.guild.id);
        let member = guild.members.get(data.member.id);

        let role = guild.roles.find(item => item.name == '2022');
        if (!role) throw Error();

        await member.addRole(role, 'automated role assignation');

        this.redis.del(
          `flow:data:${key}`,
          `flow:active:${member.id}:${member.guild.id}`,
          (err) => {
            if (err) return reject(err);

            resolve();
          }
        );
      }
      catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = FlowAdapter;