import { IUserSchema } from '../models/User'

export default interface IAuthenticatedUserInfo {
    id: IUserSchema['id'],
    role: IUserSchema['role'],
    state: IUserSchema['state']
}
