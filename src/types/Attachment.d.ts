import { IEntity } from './Entity'

export type PublicAttachmentInfo = Pick<IAttachmentSchema, 'id' | 'title' | 'description' | 'createdAt' | 'updatedAt' | 'url'>

export interface IAttachmentSchema extends IEntity {
    url: string
    title: string
    description: string

    getPublicInfo(): Readonly<PublicAttachmentInfo>
}
