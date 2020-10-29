import { IEntity } from './Entity'

export interface ITokenSchema extends IEntity {
    exp: number
}
