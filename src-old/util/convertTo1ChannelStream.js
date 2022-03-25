const { Transform } = require('stream')
const { convertBufferTo1Channel } = require('./convertTo1Channel')

class ConvertTo1ChannelStream extends Transform {
  constructor(source, options) {
    super(options)
  }

  _transform(data, encoding, next) {
    next(null, convertBufferTo1Channel(data))
  }
}

module.exports = ConvertTo1ChannelStream
