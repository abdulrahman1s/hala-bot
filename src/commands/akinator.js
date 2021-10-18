const Command = require('../structures/Command')
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')
const { Aki } = require('aki-api')


const emojis = ['👍', '👎', '❔', '🤔', '🙄', '❌']


module.exports = class extends Command {
	constructor() {
		super({
			name: 'akinator',
			description: 'Akinator Game! 🧞',
			options: [{
				name: 'language',
				description: 'Select the language you prefer. (default: English)',
				type: 'STRING',
				required: false,
				choices: [{
					name: 'English',
					value: 'en'
				}, {
					name: 'Arabic',
					value: 'ar'
				}, {
					name: 'Spanish',
					value: 'es'
				}, {
					name: 'French',
					value: 'fr'
				}, {
					name: 'Italian',
					value: 'it'
				}, {
					name: 'Japanese',
					value: 'jp'
				}, {
					name: 'Russian',
					value: 'ru'
				}, {
					name: 'Portuguese',
					value: 'pt'
				}, {
					name: 'Turkish',
					value: 'tr'
				}, {
					name: 'Chinese',
					value: 'cn'
				}]
			}]
		})
	}

	async execute(ctx) {
		await ctx.deferReply()

		const language = ctx.options.getString('language', false) || 'en'
		const game = new Akinator(language)
    
		// Start The game.
		await game.start()
    
		// Filter to ignore non-playing users.
		const filter = intercation => intercation.user.id === ctx.user.id
    
		await ctx.editReply({
			components: [game.toComponent()],
			embeds: [game.toEmbed()]
		})
    
		const channel = await ctx.client.channels.fetch(ctx.channelId)
    
		while (!game.ended) { // Game loop, only stops once the game ended.
			try { // Trying to catch game errors without break the while bot.
				await game.ask(channel, filter)
				await ctx.editReply({ embeds: [game.toEmbed()], components: [game.toComponent()] })
			} catch (e) { // Only happens while the 30 seconds ends without response. 
				// Log errors.
				if (e instanceof Error) console.error(e)
    
				await ctx.editReply({
					components: [],
					embeds: [],
					content: 'Timeout.'
				})
    
				return // Stop The Game
			}
		}
    
		// End the game.
		await game.end()
    
		// Remove buttons, And put the final embed.
		await ctx.editReply({ components: [], embeds: [game.toEmbed()] })
	}
}


class Akinator {
	constructor(region = 'en') {
		this.api = new Aki({ region })
	}

	get answers() {
		return this.api.answers
	}

	get question() {
		return this.api.question
	}

	get score() {
		return this.api.currentStep
	}

	get eneded() {
		return this.api.progress >= 70 || this.api.currentStep >= 78
	}

	async start() {
		await this.api.start()
	}

	async end() {
		this.api.win()
	}

	async ask(channel, filter) {
		const collector = channel.createMessageComponentCollector({ filter, time: 30_000 })
		return new Promise((resolve, reject) => {
			collector
				.on('collect', async ctx => {
					await ctx.deferUpdate()

					const answer = Number(ctx.customId)

					await this.api.step(answer)

					collector.stop()
				})
				.on('end', (_, reason) => {
					if (reason === 'time') {
						reject()
					} else {
						resolve()
					}
				})
		})
	}

	toEmbed() {
		if (this.ended) {
			const someone = this.answers[0]
			return new MessageEmbed()
				.setTitle('Is this your character?')
				.setDescription(`**${someone.name}**\n${someone.description}\nRanking as **#${someone.ranking}**`)
				.setImage(someone.absolute_picture_path)
				.setColor('RANDOM')
		}

		return new MessageEmbed()
			.setTitle(`${this.score + 1}. ${this.question}`)
			.setColor('RANDOM')
			.setFooter('You have 30 seconds to answer.')
	}

	toComponent() {
		const row = new MessageActionRow()

		const buttons = this.answers.map((answer, index) => {
			return new MessageButton()
				.setEmoji(emojis[index])
				.setLabel(answer)
				.setStyle('PRIMARY')
				.setCustomId(index.toString())
		})

		row.addComponents(buttons)

		return row
	}
}