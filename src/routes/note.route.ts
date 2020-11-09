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
import validateBody from '../middlewares/bodyValidation.middleware'
import checkLimits from '../middlewares/checkLimits.middleware'
import deleteFileOnFinish from '../middlewares/deleteFileOnFinish.middleware'
import UserRole from '../enums/UserRole.enum'
import AuthStatus from '../enums/AuthStatus.enum'
import State from '../enums/State.enum'
import noteCommentsController from '../controllers/note.comments.controller'
import validateQuery from '../middlewares/queryValidation.middleware'
import { Permission } from '../enums/Permission.enum'
import {
    checkEditNotePermissions,
    checkEditCommentPermissions,
    checkDeleteCommentPermissions,
    checkNotePermissions,
    checkNoteMovingPermissions
} from '../middlewares/checkPermissions.middleware'

const router = Router()

// Check authentication status, the role and the state of the user making the request.
router.all(
    '*',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    checkUserRole([UserRole.USER]),
    checkUserState([State.ACTIVE])
)

// GET all notes
router.get(
    '/',
    validateQuery('getAllNotes'),
    noteCrudController.getAllNotes
)

// GET notes by tag or tag RegExp
router.get(
    '/tags',
    validateQuery('tag', 'Tag invalid.'),
    noteTagsController.getByTag
)

// GET a note
router.get(
    '/:id',
    checkNotePermissions([Permission.NOTE_VIEW]),
    noteCrudController.getOneNote
)

// ADD a note
router.post(
    '/',
    validateBody('note', 'Note invalid.'),
    checkLimits.forNote,
    noteCrudController.addNote
)

// UPDATE a note
router.put(
    '/:id',
    checkEditNotePermissions(),
    validateBody('note', 'Note invalid.'),
    noteCrudController.editNote
)

// DELETE a note
router.delete(
    '/:id',
    checkNotePermissions([Permission.NOTE_DELETE]),
    noteCrudController.deleteNote
)

// DUPLICATE a note
router.post(
    '/:id/duplicate',
    checkNotePermissions([Permission.NOTE_VIEW]),
    noteCrudController.duplicateNote
)

// UPDATE sharing url and its state
router.post(
    '/:id/share',
    checkNotePermissions([Permission.NOTE_SHARING_EDIT]),
    validateQuery('share'),
    noteShareController.getShareLink
)

// ADD a collaborator to a note
router.post(
    '/:id/share/collaborators',
    checkNotePermissions([Permission.NOTE_COLLABORATOR_ADD]),
    validateBody('collaborator', 'Invalid collaborator.'),
    checkLimits.forCollaborator,
    noteShareController.addCollaborator
)

// DELETE self as a note collaborator
router.delete(
    '/:id/share/collaborators',
    noteShareController.deleteSelfCollaborator
)

// DELETE a collaborator from a note
router.delete(
    '/:id/share/collaborators/:collaboratorID',
    checkNotePermissions([Permission.NOTE_COLLABORATOR_DELETE]),
    noteShareController.deleteCollaborator
)

// ADD tags to a note
router.post(
    '/:id/tags',
    checkNotePermissions([Permission.NOTE_EDIT_PERSONAL_PROPERTIES]),
    validateQuery('tag', 'Tag invalid.'),
    checkLimits.forTag,
    noteTagsController.addTags
)

// DELETE tags from a note
router.delete(
    '/:id/tags',
    checkNotePermissions([Permission.NOTE_EDIT_PERSONAL_PROPERTIES]),
    validateQuery('tag', 'Tag invalid.'),
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
    checkNotePermissions([Permission.NOTE_ATTACHMENT_ADD]),
    validateBody('addAttachment', 'Attachment invalid.'),
    attachmentMetadata,
    checkLimits.forAttachment,
    noteAttachmentsController.addAttachment
)

// UPDATE a photo attachment of a note
router.put(
    '/:id/attachments/:attachmentID',
    checkNotePermissions([Permission.NOTE_ATTACHMENT_ADD]),
    validateBody('editAttachment', 'Attachment invalid.'),
    noteAttachmentsController.editAttachment
)

// DELETE a photo attachment from a note
router.delete(
    '/:id/attachments/:attachmentID',
    checkNotePermissions([Permission.NOTE_ATTACHMENT_DELETE]),
    noteAttachmentsController.deleteAttachment
)

// GET all comments of a note
router.get(
    '/:id/comments',
    checkNotePermissions([Permission.NOTE_COMMENT_VIEW]),
    noteCommentsController.getAllComments
)

// GET one comment
router.get(
    '/:id/comments/:commentID',
    checkNotePermissions([Permission.NOTE_COMMENT_VIEW]),
    noteCommentsController.getComment
)

// ADD a comment to a note
router.post(
    '/:id/comments',
    checkNotePermissions([Permission.NOTE_COMMENT_ADD]),
    validateBody('comment', 'Comment invalid.'),
    noteCommentsController.addComment
)

// EDIT a comment
router.put(
    '/:id/comments/:commentID',
    checkEditCommentPermissions(),
    validateBody('comment', 'Comment invalid.'),
    noteCommentsController.editComment
)

// DELETE a comment
router.delete(
    '/:id/comments/:commentID',
    checkDeleteCommentPermissions(),
    noteCommentsController.deleteComment
)

// SET the state of the comments section (enabled or disabled)
router.post(
    '/:id/comments/state',
    checkNotePermissions([Permission.NOTE_COMMENTS_CHANGE_STATE]),
    validateQuery('commentsSectionState', 'State invalid.'),
    noteCommentsController.setCommentSectionState
)

// MOVE a note between a notepad and the user's personal notes or another notepad
router.post(
    '/:id/move',
    checkNoteMovingPermissions,
    validateQuery('moveNote'),
    noteCrudController.moveNote
)

export default router
