const fs = require('fs')

function convertTo1Channel(filePath, convertedFilePath = filePath) {
  const file = fs.readFileSync(filePath)
  const convertedFile = Buffer.alloc(file.length / 2)

  for (let i = 0; i < convertedFile.length / 2; i++) {
    const uint16 = file.readUInt16LE(i * 4)
    convertedFile.writeUInt16LE(uint16, i * 2)
  }

  fs.writeFileSync(convertedFilePath, convertedFile)
}

module.exports = convertTo1Channel
