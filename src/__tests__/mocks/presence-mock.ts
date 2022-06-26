import { ActivityMock } from './activity-mock'
import { UserMock } from './user-mock'

export class PresenceMock {
  user = new UserMock()
  userId = 'userId'
  activities: ActivityMock[] = []
}
