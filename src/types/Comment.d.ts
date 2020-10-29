import { IEntity } from './Entity'

export interface ICommentSchema extends IEntity {
    subject: Pick<IUserSchema, 'id' | 'username' | 'email'>
    text: string
}
