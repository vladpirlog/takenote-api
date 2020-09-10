import { Router } from 'express'
import noteCrudController from '../controllers/note.crud.controller'
import checkAuthStatus from '../middlewares/checkAuthStatus.middleware'
import checkUserState from '../middlewares/checkUserState.middleware'
import noteShareController from '../controllers/note.share.controller'
import noteTagsController from '../controllers/note.tags.controller'
import noteAttachmentsController from '../controllers/note.attachments.controller'
import attachmentMetadata from '../middlewares/attachmentMetadata.middleware'
import { State } from '../interfaces/state.enum'
import checkUserRole from '../middlewares/checkUserRole.middleware'
import { Role } from '../interfaces/role.enum'
import regexTest from '../middlewares/regexTest.middleware'
import requestFieldsDefined from '../middlewares/requestFieldsDefined.middleware'
import { AuthStatus } from '../interfaces/authStatus.enum'

const router = Router()

/**
 * Check authentication status, the role and the state of the user making the request.
 */
router.all(
    '*',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    checkUserRole([Role.USER]),
    checkUserState([State.ACTIVE])
)

/**
 * GET all notes
 */
router.get('/', noteCrudController.getAllNotes)

/**
 * GET notes by tag or tag RegExp
 */
router.get('/tags', requestFieldsDefined('query', ['tag']), noteTagsController.getByTag)

/**
 * GET a note
 */
router.get('/:id', requestFieldsDefined('params', ['id']), noteCrudController.getOneNote)

/**
 * ADD a note
 */
router.post('/', regexTest.note, noteCrudController.addNote)

/**
 * UPDATE a note
 */
router.put('/:id', requestFieldsDefined('params', ['id']), regexTest.note, noteCrudController.editNote)

/**
 * DELETE a note
 */
router.delete('/:id', requestFieldsDefined('params', ['id']), noteCrudController.deleteNote)

/**
 * DUPLICATE a note
 */
router.post('/:id/duplicate', requestFieldsDefined('params', ['id']), noteCrudController.duplicateNote)

/**
 * GET sharing URL and set that URL's state; optionally, request a new URL for a note
 */
router.post(
    '/:id/share',
    requestFieldsDefined('params', ['id']),
    noteShareController.getShareLink
)

/**
 * ADD a collaborator to a note, in the form of username/email/id and type (r, rw)
 */
router.post(
    '/:id/share/collaborators',
    requestFieldsDefined('params', ['id']),
    requestFieldsDefined('body', ['user', 'type']),
    noteShareController.addCollaborator
)

/**
 * DELETE a collaborator from a note
 */
router.delete(
    '/:id/share/collaborators/:permissionID',
    requestFieldsDefined('params', ['id', 'permissionID']),
    noteShareController.deleteCollaborator
)

/**
 * ADD tags to a note
 */
router.post(
    '/:id/tags',
    requestFieldsDefined('params', ['id']),
    requestFieldsDefined('query', ['tags']),
    noteTagsController.addTags
)

/**
 * DELETE tags from a note
 */
router.delete(
    '/:id/tags',
    requestFieldsDefined('params', ['id']),
    requestFieldsDefined('query', ['tags']),
    noteTagsController.deleteTags
)

/**
 * ADD a photo attachment to a note
 */
router.post(
    '/:id/attachments',
    requestFieldsDefined('params', ['id']),
    regexTest.attachment,
    attachmentMetadata,
    noteAttachmentsController.addAttachment
)

/**
 * UPDATE a photo attachment of a note
 */
router.put(
    '/:id/attachments/:attachmentID',
    requestFieldsDefined('params', ['id', 'attachmentID']),
    regexTest.attachment,
    noteAttachmentsController.editAttachment
)

/**
 * DELETE a photo attachment from a note
 */
router.delete(
    '/:id/attachments/:attachmentID',
    requestFieldsDefined('params', ['id', 'attachmentID']),
    noteAttachmentsController.deleteAttachment
)

export default router
