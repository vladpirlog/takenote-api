import Note, { INoteSchema } from '../models/Note'
import { IUserSchema } from '../models/User'

const note = (userID: IUserSchema['_id']) => {
    return Note.find({ owner: userID }).countDocuments().exec()
}

const tag = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id']
): Promise<number | undefined> => {
    const output = await Note.aggregate([
        {
            $match: { _id: noteID, owner: userID }
        },
        {
            $project: { tagsLength: { $size: '$tags' } }
        }
    ]).exec()
    return output[0].tagsLength
}

const permissionOrAttachment = (type: 'permissions' | 'attachments') => {
    return async (
        noteID: INoteSchema['_id'],
        userID: IUserSchema['_id']
    ): Promise<number | undefined> => {
        const output = await Note.aggregate([
            {
                $match: { _id: noteID, owner: userID }
            },
            {
                $project: { length: { $size: `$${type}` } }
            }
        ]).exec()
        return output[0].length
    }
}

export default {
    note,
    tag,
    permissionOrAttachment
}
