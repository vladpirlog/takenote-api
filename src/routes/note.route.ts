import { Router } from 'express'
import noteCrudController from '../controllers/note.crud.controller'
import checkAuthStatus from '../middlewares/checkAuthStatus.middleware'
import checkUserState from '../middlewares/checkUserState.middleware'
import noteShareController from '../controllers/note.share.controller'
import checkParams from '../middlewares/checkParams.middleware'
import noteTagsController from '../controllers/note.tags.controller'
import checkBody from '../middlewares/checkBody.middleware'
import noteAttachmentsController from '../controllers/note.attachments.controller'
import checkAttachmentInfo from '../middlewares/attachmentInfo.middleware'
import checkQueryNotArray from '../middlewares/checkQueryNotArray.middleware'
import { State } from '../interfaces/state.enum'
import checkQuery from '../middlewares/checkQuery.middleware'
import checkUserRole from '../middlewares/checkUserRole.middleware'
import { Role } from '../interfaces/role.enum'
import verifyInput from '../middlewares/verifyInput.middleware'

const router = Router()

/**
 * Check authentication status, the role and the state of the user making the request.
 */
router.all(
    '*',
    checkAuthStatus(true),
    checkUserRole([Role.USER]),
    checkUserState([State.ACTIVE])
)

/**
 * GET all notes
 */
router.get('/', checkQueryNotArray(['collaborations', 'skip', 'limit']), noteCrudController.getAllNotes)

/**
 * GET notes by tag or tag RegExp
 */
router.get('/tags', checkQuery(['tag']), checkQueryNotArray(['tag', 'match']), noteTagsController.getByTag)

/**
 * GET a note
 */
router.get('/:id', checkParams(['id']), noteCrudController.getOneNote)

/**
 * ADD a note
 */
router.post('/', verifyInput.note, noteCrudController.addNote)

/**
 * UPDATE a note
 */
router.put('/:id', checkParams(['id']), verifyInput.note, noteCrudController.editNote)

/**
 * DELETE a note
 */
router.delete('/:id', checkParams(['id']), noteCrudController.deleteNote)

/**
 * DUPLICATE a note
 */
router.post('/:id/duplicate', checkParams(['id']), noteCrudController.duplicateNote)

/**
 * GET sharing URL and set that URL's state; optionally, request a new URL for a note
 */
router.post(
    '/:id/share',
    checkParams(['id']),
    checkQueryNotArray(['active', 'get_new']),
    noteShareController.getShareLink
)

/**
 * ADD a collaborator to a note, in the form of username/email/id and type (r, rw)
 */
router.post(
    '/:id/share/collaborators',
    checkParams(['id']),
    checkBody(['user', 'type']),
    noteShareController.addCollaborator
)

/**
 * DELETE a collaborator from a note
 */
router.delete(
    '/:id/share/collaborators/:permissionID',
    checkParams(['id', 'permissionID']),
    noteShareController.deleteCollaborator
)

/**
 * ADD tags to a note
 */
router.post(
    '/:id/tags',
    checkParams(['id']),
    checkQuery(['tags']),
    checkQueryNotArray(['tags']),
    noteTagsController.addTags
)

/**
 * DELETE tags from a note
 */
router.delete(
    '/:id/tags',
    checkParams(['id']),
    checkQuery(['tags']),
    checkQueryNotArray(['tags']),
    noteTagsController.deleteTags
)

/**
 * ADD a photo attachment to a note
 */
router.post(
    '/:id/attachments',
    checkParams(['id']),
    verifyInput.attachment,
    checkAttachmentInfo,
    noteAttachmentsController.addAttachment
)

/**
 * UPDATE a photo attachment of a note
 */
router.put(
    '/:id/attachments/:attachmentID',
    checkParams(['id', 'attachmentID']),
    verifyInput.attachment,
    noteAttachmentsController.editAttachment
)

/**
 * DELETE a photo attachment from a note
 */
router.delete(
    '/:id/attachments/:attachmentID',
    checkParams(['id', 'attachmentID']),
    noteAttachmentsController.deleteAttachment
)

export default router
