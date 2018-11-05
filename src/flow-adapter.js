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

  createFlow (guild_member) {
    return new Promise((resolve, reject) => {
      debug('new flow');

      let key = cryptoRandomString(32);
      let data = {
        guild: {
          id: guild_member.guild.id,
          name: guild_member.guild.name
        },
        id: {
          id: guild_member.id,
          name: guild_member.displayName
        }
      };

      this.redis.set(
        `flow:data:${key}`,
        JSON.stringify(data),
        'EX', this.config.flow.expire,
        (err) => {
          if (err) return reject(err);

          this.redis.set(
            `flow:active:${guild_member.id}:${guild_member.guild.id}`,
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
}

module.exports = FlowAdapter;