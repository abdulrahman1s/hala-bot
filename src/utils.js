const { join } = require('path')
const fs = require('fs')

function readdir(...path) {
	return fs.readdirSync(join(...path)).map((filePath) => require(join(...path, filePath)))
}

function shuffle (array) {
	let currentIndex = array.length
	let temporaryValue
	let randomIndex
	
	const newArray = array.slice()
	
	while (currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex -= 1
		temporaryValue = newArray[currentIndex]
		newArray[currentIndex] = newArray[randomIndex]
		newArray[randomIndex] = temporaryValue
	}
	
	return newArray
}

module.exports = {
	readdir,shuffle
}