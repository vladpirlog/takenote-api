import { IEntity } from './Entity'

export interface IAttachmentSchema extends IEntity {
    url: string
    title: string
    description: string
}
