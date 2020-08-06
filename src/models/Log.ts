import { IUserSchema } from './User'
import mongoose, { Schema, Document } from 'mongoose'
import createID from '../utils/createID.util'

export interface ILogSchema extends Document {
    ip: string
    userID: IUserSchema['_id']
    type: 'login' | 'register' | 'logout'
    successful: boolean
    location: {
        type: 'Point',
        coordinates: [number, number]
    }
    createdAt: Date,
    updatedAt: Date
}

const LogSchema = new Schema({
    _id: {
        type: String,
        required: true,
        default: () => createID('log')
    },
    ip: {
        type: String,
        required: true
    },
    userID: {
        type: String,
        required: true,
        ref: 'User'
    },
    type: {
        type: String,
        required: true,
        enum: ['login', 'register', 'logout']
    },
    successful: {
        type: Boolean,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: false
        },
        coordinates: {
            type: [Number],
            required: false
        }
    }
}, { timestamps: true, writeConcern: { w: 0 } })

export default mongoose.model<ILogSchema>('Log', LogSchema)
