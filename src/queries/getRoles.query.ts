import Note from '../models/Note'
import { IUserSchema } from '../types/User'
import Notepad from '../models/Notepad'
import { IEntity } from '../types/Entity'

const getRolesOfEntity = (type: 'note' | 'notepad') => {
    return async (
        userID: IUserSchema['id'],
        entityID: IEntity['id']
    ) => {
        const query = { id: entityID, [`users.${userID}.subject.id`]: userID }
        const entity = type === 'note'
            ? await Note.findOne(query).exec()
            : await Notepad.findOne(query).exec()
        return entity?.users.get(userID)?.roles || []
    }
}

/**
 * Returns an array on roles the user has on a given note.
 * @param userID id of the user
 * @param entityID id of the note
 */
export const getRolesOfNote = getRolesOfEntity('note')

/**
 * Returns an array on roles the user has on a given notepad.
 * @param userID id of the user
 * @param entityID id of the notepad
 */
export const getRolesOfNotepad = getRolesOfEntity('notepad')
