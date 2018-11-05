const debug = require('debug')('bouncer:discord');

const Discord = require('discord.js');

const startFlow = require('./actions/start-flow');

module.exports = function (config) {
  const client = new Discord.Client();
  client.locals = { config };

  client.on('ready', () => {
    debug('bot ready');

    client.user.setPresence({
      game: {
        name: 'you',
        type: 'WATCHING'
      }
    });
  });

  client.on('guildMemberAdd', member => startFlow(client, member));

  client.on('message', msg => {
    if (msg.channel.name == 'lobby') {
      if (!msg.member.hasPermission('ADMINISTRATOR')) {
        startFlow(client, msg.member);
        msg.delete();
      }
    }
  });

  return client;
}