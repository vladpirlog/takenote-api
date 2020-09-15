import { IUserSchema } from '../models/User'

export default interface IPublicUserInfo {
    _id: IUserSchema['_id'],
    username: IUserSchema['username'],
    email: IUserSchema['email'],
    isOAuthUser: boolean
    twoFactorAuth: {
        active: IUserSchema['twoFactorAuth']['active'],
        nextCheck: IUserSchema['twoFactorAuth']['nextCheck']
    }
}
