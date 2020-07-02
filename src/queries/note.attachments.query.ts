import Note, { INoteSchema, INoteBody } from '../models/Note'
import { IUserSchema } from '../models/User'
import Permission, { PermissionLevel } from '../models/Permission'
import Attachment from '../models/Attachment'

/**
 * Fetches all the notes belonging to the user.
 * @param userID id of the user
 */
const getAllOwn = async (
    userID: IUserSchema['_id']
): Promise<INoteSchema[]> => {
    return await Note.find({ owner: userID }).exec()
}

/**
 * Fetches all the notes where the user is a collaborator.
 * @param userID id of the user
 */
const getAllCollab = async (
    userID: INoteSchema['permissions'][0]['subject']
): Promise<INoteSchema[]> => {
    return await Note.find({
        'permissions.subject': userID
    })
        .select('-permissions')
        .exec()
}

/**
 * Fetches a note by the id property.
 * @param noteID id of the note
 * @param userID id of the note's owner
 */
const getOneOwnByID = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id']
): Promise<INoteSchema | null> => {
    const notes = await Note.findOne({ _id: noteID, owner: userID }).exec()
    return notes
}

/**
 * Fetches a note by the share code.
 * The note does not include the permissions array.
 * @param code share code of the note
 */
const getOneByShareCode = async (
    code: INoteSchema['share']['code']
): Promise<INoteSchema | null> => {
    const note = await Note.findOne({ 'share.code': code })
        .select('-permissions')
        .exec()
    return note
}

/**
 * Creates a new note with the specified properties.
 * @param props object containing the note properties and the owner
 */
const createNewNote = async (props: {
  title?: INoteSchema['title'];
  content?: INoteSchema['content'];
  archived?: INoteSchema['archived'];
  color?: INoteSchema['color'];
  owner: INoteSchema['owner'];
}): Promise<INoteSchema | null> => {
    const newNote = new Note(props)
    return await newNote.save()
}

/**
 * Removes one of the user's notes.
 * @param noteID id of the note
 * @param userID id of the note's owner
 */
const deleteOneOwn = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id']
): Promise<INoteSchema | null> => {
    const notes = await Note.findOneAndDelete({
        _id: noteID,
        owner: userID
    }).exec()
    return notes
}

/**
 * Updates a note where the user is the owner or a collaborator.
 * Updating a collaborating note does not return the permissions array.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param props object containing the new note properties
 * @param allowForCollab allow collaborating notes to be updated
 */
const updateOneOwnOrCollabByID = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    props: INoteBody,
    allowForCollab: boolean
): Promise<INoteSchema | null> => {
    if (allowForCollab) {
        const newNote = await Note.findOneAndUpdate(
            {
                _id: noteID,
                $or: [
                    { owner: userID },
                    {
                        permissions: {
                            $elemMatch: {
                                subject: userID,
                                level: PermissionLevel.readWrite
                            }
                        }
                    }
                ]
            },
            props,
            { new: true }
        )
            .select('-permissions')
            .exec()
        return newNote
    }
    const newNote = await Note.findOneAndUpdate(
        {
            _id: noteID,
            owner: userID
        },
        props,
        { new: true }
    ).exec()
    return newNote
}

/**
 * Adds a permission(subject and level) to a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param permission object of type permission
 */
const addPermission = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    permission: {
        subject: INoteSchema['permissions'][0]['subject'],
        level: INoteSchema['permissions'][0]['level']
    }
): Promise<INoteSchema | null> => {
    await Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        {
            $pull: { permissions: { subject: permission.subject } }
        },
        { new: true }
    ).exec()
    const newNote = await Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        {
            $push: { permissions: new Permission({ ...permission }) }
        },
        { new: true }
    ).exec()
    return newNote
}

/**
 * Removes a permission from a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param collabUserID id of the collaborator to be removed
 */
const deletePermission = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    permissionID: INoteSchema['permissions'][0]['_id']
): Promise<INoteSchema | null> => {
    return await Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        {
            $pull: { permissions: { _id: permissionID } }
        },
        { new: true }
    ).exec()
}

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

/**
 * Adds an attachment(title, description, url) to a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param attachment object of type attachment
 */
const addAttachment = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    attachment: {
        title: INoteSchema['attachments'][0]['title'],
        url: INoteSchema['attachments'][0]['url'],
        description: INoteSchema['attachments'][0]['description']
    }
) => {
    return await Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        { $push: { attachments: new Attachment({ ...attachment }) } },
        { new: true }
    ).exec()
}

/**
 * Updated an attachment of a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param newAttachment object of type attachment with the url as identifier
 */
const editAttachment = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    attachment: {
        _id: INoteSchema['attachments'][0]['_id'],
        title: INoteSchema['attachments'][0]['title'],
        description: INoteSchema['attachments'][0]['description']
    }
) => {
    return await Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        {
            'attachments.$[element].title': attachment.title,
            'attachments.$[element].description': attachment.description
        },
        { new: true, arrayFilters: [{ 'element._id': attachment._id }] }
    ).exec()
}

/**
 * Remove an attachment from a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param attachmentURL the url of the attachment to be removed
 */
const deleteAttachment = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    attachmentID: INoteSchema['attachments'][0]['_id']
) => {
    return await Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        { $pull: { attachments: { _id: attachmentID } } },
        { new: true }
    ).exec()
}

export default {
    getAllOwn,
    getAllCollab,
    getOneOwnByID,
    getOneByShareCode,
    createNewNote,
    deleteOneOwn,
    updateOneOwnOrCollabByID,
    addPermission,
    deletePermission,
    addTags,
    deleteTags,
    addAttachment,
    editAttachment,
    deleteAttachment
}
