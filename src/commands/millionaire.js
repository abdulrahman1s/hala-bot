const { MessageActionRow, MessageButton } = require('discord.js')
const Command = require('../structures/Command')
const questions = require('../../assets/millionaire.json')
const { shuffle, between } = require('../utils')


module.exports = class extends Command {
	constructor() {
		super({
			name: 'millionaire',
			description: 'Who Wants to be a Millionaire? 🤑',
		})
	}

	async execute(ctx) {
		const game = new Millionaire()
		const filter = intercation => intercation.user.id === ctx.user.id

		await ctx.reply({
			content: game.toString(),
			components: game.toComponent()
		})

		const channel = await ctx.client.channels.fetch(ctx.channelId)

		while (!game.ended) {
			await game.ask(channel, filter)
			await ctx.editReply({ content: game.toString(), components: game.toComponent() })
		}

		if (game.lose) {
			await ctx.editReply({ components: game.toComponent() })
		} else {
			await ctx.editReply({ components: [], content: 'You win the **$1,000,000!!** 💸\nhttps://tenor.com/view/duffy-duck-money-a-lot-of-money-millionaire-gif-16438831' })
		}
	}
}

const MONEY = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000]


class Millionaire {
	score = 0
	questions = shuffle(questions)
	deletedQuestions = []
	lose = false	

	help(type) {
		switch (type) {
		case 'ask_someone': break
		
		case 'delete_two_answers': {
			
			while (this.deletedQuestions.length !== 2) {
				const id = between(0, 3)
				if (this.deletedQuestions.includes(id)) continue
				if (this.question.correct === this.question.content[id]) continue
				this.deletedQuestions.push(this.question.content[id])
			}
			
			break
		}
		
		case 'public_help': break
		}
	}

	ask(channel, filter) {
		const collector = channel.createMessageComponentCollector({ filter, time: 30000 })

		return new Promise((resolve) => {
			collector.on('collect', async ctx => {
				await ctx.deferUpdate()

				if (['ask', 'public', 'delete'].some((x) => ctx.customId.startsWith(x))) {
					this.help(ctx.customId)
				} else if (ctx.customId === this.question.correct) {
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

	get question() {
		return this.questions[this.score]
	}

	get ended() {
		return this.lose || this.score === this.questions.length - 1
	}

	toComponent() {
		const rows = [new MessageActionRow(), new MessageActionRow()]
		
		const questions = this.question.content.map((question) => {
			const style = this.lose && question === this.question.correct ? 'SUCCESS' : 'PRIMARY'
			const deletedQuestion = this.deletedQuestions.includes(question)
			return new MessageButton()
				.setCustomId(question)
				.setLabel(question)
				.setStyle(style)
				.setDisabled(this.lose || deletedQuestion)
		})


		const help = [
			new MessageButton()
				.setCustomId('delete_two_answers')
				.setStyle('SECONDARY')
				.setLabel('حذف إجابتين')
				.setDisabled(!!this.deletedQuestions.length || this.ended),
			new MessageButton()
				.setCustomId('ask_someone')
				.setStyle('SECONDARY')
				.setLabel('إتصال بصديق')
				.setDisabled(),
			new MessageButton()
				.setCustomId('public_help')
				.setStyle('SECONDARY')
				.setLabel('مساعدة الجمهور')
				.setDisabled()
		]

		rows[0].addComponents(help)
		rows[1].addComponents(questions)

		return rows
	}

	toString() {
		const format = new Intl.NumberFormat('en-US').format
		const { question } = this.question

		if (this.ended) {
			return `**$${MONEY[this.score]}**\n\n${question}`
		}

		return MONEY.map((number, index) => {
			const money = format(number)
			return `${index + 1} | ${index === this.score ? `**$${money}**` : `$${money}`}`
		}).reverse().join('\n') + '\n\n' + question
	}
}