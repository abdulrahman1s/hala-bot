const Command = require('../structures/Command')

const ACTIVITIES = {
	755827207812677713: 'Poker Night',
	773336526917861400: 'Betrayal.io',
	755600276941176913: 'YouTube Together',
	814288819477020702: 'Fishington.io',
	832012774040141894: 'Chess in the Park',
	880218394199220334: 'Watch Together',
	878067389634314250: 'Doodle Crew',
	879863686565621790: 'Letter Tile',
	879863976006127627: 'Word Snacks',
  	852509694341283871: 'SpellCast',
}

module.exports = class extends Command {
	constructor() {
		super({
			name: 'activity',
			description: 'Start activity',
			options: [{
				name: 'channel',
				description: 'The voice channel to start activity in',
				type: 'CHANNEL',
				channelTypes: ['GUILD_VOICE'],
				required: true
			}, {
				name: 'activity',
				description: 'Which activity to start?',
				type: 'STRING',
				choices: Object.entries(ACTIVITIES).map(([value, name]) => ({ name, value })),
				required: true
			}]
		})
	}

	async execute(ctx) {
		const channel = ctx.options.getChannel('channel')
		const activityId = ctx.options.getString('activity')
		const invite = await channel.createInvite({
			maxAge: 0,
			targetApplication: activityId,
			targetType: 'EMBEDDED_APPLICATION'
		}).catch(() => null)

		if (!invite) {
			return ctx.reply('Failed to create invite..')
		}

		const content = `[Click to open ${invite.targetApplication.name} in ${invite.channel.name}](<https://discord.gg/${invite.code}>)`

		await ctx.reply(content)
	}
}
