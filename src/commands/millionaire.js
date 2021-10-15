const { MessageActionRow, MessageButton } = require('discord.js')
const Command = require('../structures/Command')
const questions = require('../../assets/millionaire.json')
const { shuffle } = require('../utils')


module.exports = class extends Command {
	constructor() {
		super({
			name: 'millionaire',
			description: 'Who Wants to be a Millionaire? :money_mouth_face:',
		})
	}

	async execute(ctx) {
		const game = new Millionaire()
		const filter = i => i.user.id === ctx.user.id

		const msg = await ctx.reply({
			content: game.toString(),
			components: [game.toComponent()],
			fetchReply: true
		})

		while (!game.ended) {
			await game.ask(msg, filter)
			await msg.edit({ content: game.toString(), components: [game.toComponent()] })
		}

		if (game.lose) {
			await msg.edit({ components: [game.toComponent()] })
		} else {
			await msg.edit({ components: [], content: 'You win the **$1,000,000!!** 💸\nhttps://tenor.com/view/duffy-duck-money-a-lot-of-money-millionaire-gif-16438831' })
		}
	}
}

const MONEY = [ 100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000 ]


class Millionaire {
	score = 0
	questions = shuffle(questions)
	lose = false

	ask(message, filter) {
		const collector = message.channel.createMessageComponentCollector({ filter, time: 30000 })

		return new Promise((resolve) => {
			collector.on('collect', async ctx => {
				await ctx.deferUpdate()
				
				if (ctx.customId === this.questions[this.score].correct) {
					this.score++
				} else {
					this.lose = true
				}
				
				collector.stop()
			})

			collector.on('end', (_, reason) => {
				if (reason === 'time') this.lose = true
				resolve()
			})
		})
	}

	get ended() {
		return this.lose || this.score === this.questions.length - 1
	}

	toComponent() {
		const row = new MessageActionRow()
		
		const question = this.questions[this.score]

		question.content.forEach((question) => {
			row.addComponents(new MessageButton()
				.setCustomId(question)
				.setLabel(question)
				.setStyle(this.lose && question === this.questions[this.score].correct ? 'SUCCESS' : 'PRIMARY')
				.setDisabled(this.lose)
			)
		})

		return row
	}

	toString() {
		const { question } = this.questions[this.score]
		return MONEY.map((number, index) => {
			const money = new Intl.NumberFormat('en-IN').format(number)
			return `${index + 1} | ${index === this.score ? `**$${money}**` : `$${money}`}`
		}).reverse().join('\n') + '\n\n' + question
	}
}