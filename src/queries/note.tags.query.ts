import Note from '../models/Note'
import { INoteSchema } from '../types/Note'
import { IUserSchema } from '../types/User'

/**
 * Returns an array of notes which contain the given tag.
 * @param userID id of the user whose notes will be searched through
 * @param tag the tag or regex pattern to search by
 * @param exactMatch if true, no RegExp pattern search will be made
 */
const getByTag = (
    userID: IUserSchema['id'],
    tag: string,
    exactMatch: boolean
) => {
    return Note.find({
        [`users.${userID}.tags`]: exactMatch ? tag : new RegExp(tag)
    })
}

/**
 * Returns a function that adds or deletes tags from a given note.
 * @param type the operation to run: add or delete
 */
const addDeleteTags = (type: 'add' | 'delete') => {
    return (
        noteID: INoteSchema['id'],
        userID: IUserSchema['id'],
        tags: string[]
    ) => {
        return Note.findOneAndUpdate(
            { id: noteID, [`users.${userID}.subject.id`]: userID },
            type === 'add'
                ? { $addToSet: { [`users.${userID}.tags`]: { $each: tags } } }
                : { $pull: { [`users.${userID}.tags`]: { $in: tags } } },
            { new: true }
        ).exec()
    }
}

export default {
    get: getByTag,
    add: addDeleteTags('add'),
    delete: addDeleteTags('delete')
}
