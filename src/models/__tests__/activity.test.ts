import { Activity, ActivityModel } from '../activity'
import mockingoose from 'mockingoose'

describe('activity', () => {
  it('should mock activity by mockingoose', async () => {
    const mockedDocument: Activity = {
      name: 'Overwatch',
      emojiName: ':ow:',
      roleId: 'my-role-uuid',
      presenceNames: ['Overwatch', 'Overwatch 2'],
    }

    mockingoose(ActivityModel)
      .toReturn(mockedDocument, 'findOne')

    const doc = await ActivityModel.findOne()

    expect(doc?.name).toEqual('Overwatch')
  })
})
