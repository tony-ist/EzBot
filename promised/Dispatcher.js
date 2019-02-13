async function playFile(connection, filePath) {
  return new Promise((resolve, reject) => {
    const dispatcher = connection.playFile(filePath)
    dispatcher.setVolume(1)
    dispatcher.on('start', () => {
      console.log('Playing')
    })
    dispatcher.on('end', () => {
      resolve()
    })
    dispatcher.on('error', (error) => {
      console.error(error)
      reject(error)
    })
  })
}

module.exports = { playFile }
