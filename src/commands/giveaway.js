const Command = require('../structures/Command')
const ms = require('ms')

module.exports = class extends Command {
	constructor() {
		super({
			name: 'giveaway',
			description: 'Giveaways 🎉',
			options: [
				{
					name: 'start',
					description: 'Start a giveaway',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'duration',
							description: 'How long the giveaway should last for. Example values: 1m, 1h, 1d',
							type: 'STRING',
							required: true,
						},
						{
							name: 'winners',
							description: 'How many winners the giveaway should have',
							type: 'INTEGER',
							required: true,
						},
						{
							name: 'prize',
							description: 'What the prize of the giveaway should be',
							type: 'STRING',
							required: true,
						},
					],
				},
				{
					name: 'end',
					description: 'End a giveaway',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'message_id',
							description: 'The giveaway to end (message ID)',
							type: 'STRING',
							required: true,
						},
					],
				},
				{
					name: 'reroll',
					description: 'Reroll a giveaway',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'message_id',
							description: 'The giveaway to reroll (message ID)',
							type: 'STRING',
							required: true,
						},
					],
				},
			],
		})
	}

	async execute(ctx) {
		const hasAccess =
      ctx.member.permissions.has('MANAGE_MESSAGES') ||
      ctx.member.roles.cache.some((r) => r.name === 'Giveaways')
    
		if (!hasAccess) {
			return ctx.reply({
				content:
          'You need to have the manage messages permissions to start giveaways.',
				ephemeral: true,
			})
		}

		await this[ctx.options.getSubcommand(true)](ctx)
	}

	async start(ctx) {
		await ctx.deferReply({ ephemeral: true })

		const duration = ctx.options.getString('duration')
		const winnerCount = ctx.options.getInteger('winners')
		const prize = ctx.options.getString('prize')

		await ctx.client.giveaways.start(ctx.channel, {
			duration: ms(duration),
			winnerCount,
			prize,
		})

		await ctx.editReply({ content: 'Giveaway started 🎉', ephemeral: true })
	}

	async end(ctx) {
		await ctx.deferReply({ ephemeral: true })

		const messageId = ctx.options.getString('message_id')

		ctx.client.giveaways
			.end(messageId)
			.then(() => {
				ctx.editReply({ content: 'Success! Giveaway ended!', ephemeral: true })
			})
			.catch((err) => {
				ctx.editReply({
					content: `An error has occurred, please check and try again.\n\`${err}\``,
					ephemeral: true,
				})
			})
	}

	async reroll(ctx) {
		await ctx.deferReply({ ephemeral: true })

		const messageId = ctx.options.getString('message_id')

		ctx.client.giveaways
			.reroll(messageId)
			.then(() => {
				ctx.editReply({
					content: 'Success! Giveaway rerolled!',
					ephemeral: true,
				})
			})
			.catch((err) => {
				ctx.editReply({
					content: `An error has occurred, please check and try again.\n\`${err}\``,
					ephemeral: true,
				})
			})
	}
}
