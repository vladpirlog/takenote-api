import { Document } from 'mongoose'

export interface IEntity extends Document {
    /** ID of the entity */
    id: string
    /** entity creation date */
    createdAt: Date
    /** entity last modified date */
    updatedAt: Date
}
