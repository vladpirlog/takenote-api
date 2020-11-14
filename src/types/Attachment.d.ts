import { AttachmentType } from '../enums/AttachmentType.enum'
import { IEntity } from './Entity'

export type PublicAttachmentInfo = Pick<IAttachmentSchema, 'id' | 'title' | 'description'
| 'createdAt' | 'type' | 'updatedAt' | 'url'>

export interface IAttachmentSchema extends IEntity {
    url: string
    title: string
    description: string
    type: AttachmentType

    getPublicInfo(): Readonly<PublicAttachmentInfo>
}
