import { EmojiMock } from './emoji-mock'
import { MessageMock } from './message-mock'

export class MessageReactionMock {
  message = new MessageMock()
  emoji = new EmojiMock()
}
