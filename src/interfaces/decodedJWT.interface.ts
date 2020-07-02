import { IUserSchema } from '../models/User'

export interface IDecodedJWT {
    jti: string
    sub: IUserSchema['_id']
    _info: IUserSchema['role']
    _state: IUserSchema['state']
    exp: number
}
