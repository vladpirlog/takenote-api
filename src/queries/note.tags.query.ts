import Note, { INoteSchema } from '../models/Note'
import { IUserSchema } from '../models/User'

/**
 * Returns a function that adds or deletes tags from a given note.
 * @param type the operation to run: add or delete
 */
const tagsQuery = (type: 'add' | 'delete') => {
    return (
        noteID: INoteSchema['_id'],
        userID: IUserSchema['_id'],
        tags: INoteSchema['tags']
    ) => {
        return Note.findOneAndUpdate(
            { _id: noteID, owner: userID },
            type === 'add'
                ? { $addToSet: { tags: { $each: tags } } }
                : { $pull: { tags: { $in: tags } } },
            { new: true }
        ).exec()
    }
}

export default {
    add: tagsQuery('add'),
    delete: tagsQuery('delete')
}
