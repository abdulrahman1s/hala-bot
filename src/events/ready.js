module.exports = async (client) => {
	console.log('Connected!')
	console.log(client.user.username)

	const commands = [...client.commands.values()]

	for (const guild of client.guilds.cache.values()) {
		await guild.commands.set(commands)
	}
}