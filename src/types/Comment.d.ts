import { IEntity } from './Entity'

export type PublicCommentInfo = Pick<ICommentSchema, 'id' | 'subject' | 'text' | 'createdAt' | 'updatedAt'>

export interface ICommentSchema extends IEntity {
    subject: Pick<IUserSchema, 'id' | 'email'>
    text: string

    getPublicInfo(): Readonly<PublicCommentInfo>
}
