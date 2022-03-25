const fs = require('fs')

function convertTo1Channel(filePath, convertedFilePath = filePath) {
  const file = fs.readFileSync(filePath)

  fs.writeFileSync(convertedFilePath, convertBufferTo1Channel(file))
}

function convertBufferTo1Channel(buffer) {
  const convertedBuffer = Buffer.alloc(buffer.length / 2)

  for (let i = 0; i < convertedBuffer.length / 2; i++) {
    const uint16 = buffer.readUInt16LE(i * 4)
    convertedBuffer.writeUInt16LE(uint16, i * 2)
  }

  return convertedBuffer
}

module.exports = { convertTo1Channel, convertBufferTo1Channel }
