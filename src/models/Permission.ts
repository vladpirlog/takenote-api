import { IUserSchema } from '../models/User'
import mongoose, { Schema, Document } from 'mongoose'
import createID from '../utils/createID.util'

export enum PermissionLevel {
    read = 0,
    readWrite = 1,
}

/**
 * Schema describing a permission, containing a subject and a level (read or read-write).
 */
export interface IPermissionSchema extends Document {
    subject: {
        _id: IUserSchema['_id'],
        username: IUserSchema['username'],
        email: IUserSchema['email']
    },
    level: PermissionLevel
}

export const PermissionSchema: Schema = new Schema({
    _id: {
        type: String,
        required: true,
        default: () => createID('permission')
    },
    subject: {
        _id: {
            type: String,
            required: true,
            ref: 'User'
        },
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    level: {
        type: Number,
        required: true,
        enum: [PermissionLevel.read, PermissionLevel.readWrite]
    }
})

export default mongoose.model<IPermissionSchema>('Permission', PermissionSchema)
