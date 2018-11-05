const debug = require('debug')('bouncer:discord');

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  debug('bot ready');

  client.user.setPresence({
    game: {
      name: 'you',
      type: 'WATCHING'
    }
  });
});

async function startFlow(member)
{
  debug(`${member.displayName} requested auth flow for guild ${member.guild.name}`);

  let flow_id = await client.locals.adapter.checkActiveFlow(member);
  let created = false;

  if (!flow_id) {
    flow_id = await client.locals.adapter.createFlow(member);
    created = true;
  }

  let link = `${client.locals.config.webapp.entrypoint}/${flow_id}`;
  let message = `In case my earlier message was lost, here is the link once again:
${link}`;

  if (created) {
    message = `Hello! Welcome to ${member.guild.name}.
Please authenticate yourself by visiting the link below.
${link}`
  }

  member.send(message);
}

client.on('guildMemberAdd', startFlow);

client.on('message', msg => {
  if (msg.channel.name == 'lobby') {
    if (!msg.member.hasPermission('ADMINISTRATOR')) {
      startFlow(msg.member);
      msg.delete();
    }
  }
});

client.locals = {};
module.exports = client;