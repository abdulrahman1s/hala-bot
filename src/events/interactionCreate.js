const { GuildMember } = require('discord.js')

module.exports = async (ctx) => {
	if (!ctx.isCommand() || !ctx.inGuild()) return

	const command = ctx.client.commands.get(ctx.commandName)

	if (!command) {
		return ctx.reply({ content: 'Command not found.', ephemeral: true })
	}

	if (!ctx.member || !(ctx.member instanceof GuildMember)) {
		ctx.member = await ctx.guild.members.fetch(ctx.user.id)
	}

	try {
		await Promise.resolve(command.execute(ctx))
	} catch (error) {
		console.error(error)
	}
}
