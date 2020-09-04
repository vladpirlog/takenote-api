import { INoteSchema } from '../models/Note'
import { IUserSchema } from '../models/User'

/**
 * Splits an array of notes in own notes and collab notes. The collab notes are stripped of sensitive data.
 * @param notes array of notes to be split
 * @param authUserID the user of the user making the request
 */
const splitNotesByOwnership = (notes: INoteSchema[], authUserID: IUserSchema['_id']) => {
    const ownNotes: INoteSchema[] = []
    const collabNotes: INoteSchema[] = []

    notes.forEach(n => {
        if (n.owner === authUserID) ownNotes.push(n)
        else collabNotes.push(n)
    })

    collabNotes.forEach(n => {
        n.permissions = n.permissions.filter(p => p.subject._id === authUserID)
        // delete n.archived
        // delete n.tags
    })

    return { ownNotes, collabNotes }
}

export default splitNotesByOwnership
