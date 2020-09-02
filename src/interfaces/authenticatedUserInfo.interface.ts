import { IUserSchema } from '../models/User'

export default interface IAuthenticatedUserInfo {
    _id: IUserSchema['_id'],
    role: IUserSchema['role'],
    state: IUserSchema['state']
}
