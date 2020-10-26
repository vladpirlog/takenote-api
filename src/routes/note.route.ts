import { Router } from 'express'
import fileUpload from 'express-fileupload'
import noteCrudController from '../controllers/note.crud.controller'
import checkAuthStatus from '../middlewares/checkAuthStatus.middleware'
import checkUserState from '../middlewares/checkUserState.middleware'
import noteShareController from '../controllers/note.share.controller'
import noteTagsController from '../controllers/note.tags.controller'
import noteAttachmentsController from '../controllers/note.attachments.controller'
import attachmentMetadata from '../middlewares/attachmentMetadata.middleware'
import checkUserRole from '../middlewares/checkUserRole.middleware'
import checkNoteRole from '../middlewares/checkNoteRole.middleware'
import {
    validateAddAttachmentBody,
    validateEditAttachmentBody,
    validateNoteBody
} from '../middlewares/bodyValidation.middleware'
import requestFieldsDefined from '../middlewares/requestFieldsDefined.middleware'
import { AuthStatus } from '../interfaces/authStatus.enum'
import checkLimits from '../middlewares/checkLimits.middleware'
import deleteFileOnFinish from '../middlewares/deleteFileOnFinish.middleware'
import { State, UserRole } from '../models/User'
import { NoteRole } from '../models/Note'

const router = Router()

// Check authentication status, the role and the state of the user making the request.
router.all(
    '*',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    checkUserRole([UserRole.USER]),
    checkUserState([State.ACTIVE])
)

// GET all notes
router.get('/', noteCrudController.getAllNotes)

// GET notes by tag or tag RegExp
router.get('/tags', requestFieldsDefined('query', ['tag']), noteTagsController.getByTag)

// GET a note
router.get('/:id', requestFieldsDefined('params', ['id']), noteCrudController.getOneNote)

// ADD a note
router.post('/', validateNoteBody, checkLimits.forNote, noteCrudController.addNote)

// UPDATE a note
router.put('/:id', requestFieldsDefined('params', ['id']), validateNoteBody, noteCrudController.editNote)

// DELETE a note
router.delete('/:id', requestFieldsDefined('params', ['id']), noteCrudController.deleteNote)

// DUPLICATE a note
router.post('/:id/duplicate', requestFieldsDefined('params', ['id']), noteCrudController.duplicateNote)

// UPDATE sharing url and its state
router.post(
    '/:id/share',
    requestFieldsDefined('params', ['id']),
    checkNoteRole([NoteRole.OWNER]),
    noteShareController.getShareLink
)

// ADD a collaborator to a note, in the form of username/email/id and type (editor or viewer)
router.post(
    '/:id/share/collaborators',
    requestFieldsDefined('params', ['id']),
    checkNoteRole([NoteRole.OWNER]),
    checkLimits.forCollaborator,
    noteShareController.addCollaborator
)

// DELETE a collaborator from a note
router.delete(
    '/:id/share/collaborators/:collaboratorID',
    requestFieldsDefined('params', ['id', 'collaboratorID']),
    checkNoteRole([NoteRole.OWNER]),
    noteShareController.deleteCollaborator
)

// ADD tags to a note
router.post(
    '/:id/tags',
    requestFieldsDefined('params', ['id']),
    requestFieldsDefined('query', ['tags']),
    checkLimits.forTag,
    noteTagsController.addTags
)

// DELETE tags from a note
router.delete(
    '/:id/tags',
    requestFieldsDefined('params', ['id']),
    requestFieldsDefined('query', ['tags']),
    noteTagsController.deleteTags
)

// ADD a photo attachment to a note
router.post(
    '/:id/attachments',
    fileUpload({
        tempFileDir: './temp/',
        useTempFiles: true
    }),
    deleteFileOnFinish,
    requestFieldsDefined('params', ['id']),
    checkNoteRole([NoteRole.OWNER, NoteRole.EDITOR]),
    validateAddAttachmentBody,
    attachmentMetadata,
    checkLimits.forAttachment,
    noteAttachmentsController.addAttachment
)

// UPDATE a photo attachment of a note
router.put(
    '/:id/attachments/:attachmentID',
    requestFieldsDefined('params', ['id', 'attachmentID']),
    checkNoteRole([NoteRole.OWNER, NoteRole.EDITOR]),
    validateEditAttachmentBody,
    noteAttachmentsController.editAttachment
)

// DELETE a photo attachment from a note
router.delete(
    '/:id/attachments/:attachmentID',
    requestFieldsDefined('params', ['id', 'attachmentID']),
    checkNoteRole([NoteRole.OWNER, NoteRole.EDITOR]),
    noteAttachmentsController.deleteAttachment
)

export default router
