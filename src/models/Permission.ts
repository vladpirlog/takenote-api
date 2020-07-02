import { IUserSchema } from '../models/User'
import mongoose, { Schema, Document } from 'mongoose'

/**
 * Schema describing a permission, containing a subject and a level (read or read-write).
 */
export interface IPermissionSchema extends Document {
  subject: IUserSchema['_id'];
  level: PermissionLevel;
}

export enum PermissionLevel {
    read = 0,
    readWrite = 1,
}

export const PermissionSchema: Schema = new Schema({
    subject: {
        type: String,
        required: true,
        ref: 'User'
    },
    level: {
        type: Number,
        required: true,
        enum: [PermissionLevel.read, PermissionLevel.readWrite]
    }
})

export default mongoose.model<IPermissionSchema>('Permission', PermissionSchema)
