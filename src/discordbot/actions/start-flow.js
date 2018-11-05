const debug = require('debug')('bouncer:discord');

module.exports = async function startFlow(client, member)
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
};