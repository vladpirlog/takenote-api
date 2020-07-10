import { IUserSchema } from '../models/User'

export default interface IAuthenticatedUserInfo {
    userID: IUserSchema['_id'],
    role: IUserSchema['role'],
    state: IUserSchema['state']
}
