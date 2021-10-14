const { Client: DiscordClient, Collection } = require('discord.js')
const { readdir } = require('../utils')

const events = [
	'ready',
	'interactionCreate'
].map(name => ({
	name,
	event: require(`../events/${name}`)
}))

module.exports = class Client extends DiscordClient {
	commands = new Collection()

	async start() {
		for (const { name, event } of events) this.on(name, event)

		for (const Command of readdir(__dirname, '../commands')) {
			const command = new Command()
			this.commands.set(command.name, command)
		}

		await super.login(process.env.DISCORD_TOKEN)
	}
}