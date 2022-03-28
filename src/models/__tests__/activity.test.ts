import { Activity, ActivityModel } from '../activity'

describe('activity', () => {
  it('should mock activity findOne method', async () => {
    const mockedDocument: Activity = {
      name: 'Overwatch',
      emoji: ':ow:',
      roleId: 'my-role-uuid',
      presenceNames: ['Overwatch', 'Overwatch 2'],
    }

    ActivityModel.findOne = jest.fn(async () => mockedDocument) as any
    const doc = await ActivityModel.findOne()

    expect(doc?.name).toEqual('Overwatch')
  })
})
