const { join } = require('path')
const fs = require('fs')

function readdir(...path) {
	return fs.readdirSync(join(...path)).map((filePath) => require(join(...path, filePath)))
}

module.exports = {
	readdir
}