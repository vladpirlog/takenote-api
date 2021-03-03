import AuthStatus from '../enums/AuthStatus.enum'
import { IUserSchema } from './User'

declare module 'express-session' {
    interface SessionData {
        authenticationStatus: AuthStatus
        userState: IUserSchema['state']
        userRole: IUserSchema['role']
        userID: IUserSchema['id']
        userEmail: IUserSchema['email']
        isOAuthUser: boolean
    }
}
