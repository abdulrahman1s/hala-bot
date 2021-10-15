require('dotenv/config')

const Client = require('./structures/Client')
const TempChannels = require('discord-temp-channels')
const Giveaways = require('discord-giveaways').GiveawaysManager

const client = new Client({
	intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES']
})

client.giveaways = new Giveaways(client, {
	storage: './giveaways.json'
})

const tempChannels = new TempChannels(client)

tempChannels.registerChannel('896165943842058290', {
	childCategory: '896165580598558730',
	childAutoDeleteIfEmpty: true,
	childMaxUsers: null,
	childFormat: (member) => member.user.username
})

tempChannels.registerChannel('898338864274477056', {
	childCategory: '895918275005935639',
	childAutoDeleteIfEmpty: true,
	childMaxUsers: null,
	childFormat: (member) => member.user.username
})


void client.start()