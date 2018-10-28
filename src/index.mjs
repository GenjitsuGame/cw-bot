import config from 'config';
import Discord from 'discord.js';
import Promise from 'bluebird';

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
  if (msg.content === '!!cw' && config.allowedUsers.includes(msg.author.id)) {
    const cwMessage = await client
      .channels
      .find(channel => channel.id === config.channelId) // cw channel
      .fetchMessage(config.messageId); // cw message

    const days = cwMessage.reactions.array().slice(0, 2)
    const members = await Promise.map(
      days,
      async day => (await day.fetchUsers()).map(user => user.username).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    );

    msg.author.send(
      `Friday (${members[0].length} members):` + '\n' +
      members[0].join('\n') + '\n\n' +
      `Saturday (${members[1].length} members):` + '\n' +
      members[1].join('\n')
    );
  }


  if (msg.content === '!!cwall' && config.allowedUsers.includes(msg.author.id)) {
    const cwMessage = await client
      .channels
      .find(channel => channel.id === config.channelId) // cw channel
      .fetchMessage(config.messageId); // cw message

    const days = cwMessage.reactions.array().slice(0, 2)
    const members = await Promise.map(
      days,
      async day => (await day.fetchUsers()).map(user => user.username).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    );

    const usersToDM = await Promise
      .map(
        config.allowedUsers,
        async allowedUser => client.fetchUser(allowedUser)
      );

    await Promise
      .each(
        usersToDM,
        async user => {
          try {
            await user.send(
              `Friday (${members[0].length} members):` + '\n' +
              members[0].join('\n') + '\n\n' +
              `Saturday (${members[1].length} members):` + '\n' +
              members[1].join('\n')
            );
          } catch(e) {
            console.log(user.username);
            console.log(e);
          }
        }
      );
  }
});

client.login(config.botToken);