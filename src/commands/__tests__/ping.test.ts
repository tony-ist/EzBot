import { pingCommand } from '../ping'
import { CommandInteractionMock } from './mocks/command-interaction-mock'

describe('ping', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should have name ping', () => {
    expect(pingCommand.builder.name).toEqual('ping')
  })

  it('should reply with pong', async () => {
    const interactionMock = new CommandInteractionMock()
    await pingCommand.execute(interactionMock as any)
    expect(interactionMock.reply).toBeCalledWith('Pong!')
  })
})
