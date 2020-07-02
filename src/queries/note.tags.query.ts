import Note, { INoteSchema } from '../models/Note'
import { IUserSchema } from '../models/User'

/**
 * Adds an array of tags to a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param tags the array of tags to be added to the note
 */
const addTags = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    tags: INoteSchema['tags']
) => {
    return await Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        { $addToSet: { tags: { $each: tags } } },
        { new: true }
    ).exec()
}

/**
 * Removes an array of tags from a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param tags the array of tags to be removed from the note
 */
const deleteTags = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    tags: INoteSchema['tags']
) => {
    return await Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        { $pull: { tags: { $in: tags } } },
        { new: true }
    ).exec()
}

export default {
    addTags,
    deleteTags
}
