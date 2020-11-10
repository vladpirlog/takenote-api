import { Router } from 'express'
import notepadCrudController from '../controllers/notepad.crud.controller'
import AuthStatus from '../enums/AuthStatus.enum'
import { Permission } from '../enums/Permission.enum'
import State from '../enums/State.enum'
import UserRole from '../enums/UserRole.enum'
import checkAuthStatus from '../middlewares/checkAuthStatus.middleware'
import checkLimits from '../middlewares/checkLimits.middleware'
import { checkNotepadPermissions } from '../middlewares/checkPermissions.middleware'
import checkUserRole from '../middlewares/checkUserRole.middleware'
import checkUserState from '../middlewares/checkUserState.middleware'
import { validateBody, validateQuery } from '../middlewares/requestValidation.middleware'
import shareController from '../controllers/share.controller'

const router = Router()

// Check authentication status, the role and the state of the user making the request.
router.all(
    '*',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    checkUserRole([UserRole.USER]),
    checkUserState([State.ACTIVE])
)

// GET all notepads, alongside their notes
router.get(
    '/',
    validateQuery('getAllNotepads'),
    notepadCrudController.getAllNotepads
)

// GET one notepad, alongside its notes
router.get(
    '/:id',
    checkNotepadPermissions([Permission.NOTEPAD_VIEW]),
    validateQuery('getOneNotepad'),
    notepadCrudController.getOneNotepad
)

// ADD a notepad
router.post(
    '/',
    validateBody('notepad'),
    notepadCrudController.addNotepad
)

// EDIT a notepad
router.put(
    '/:id',
    checkNotepadPermissions([Permission.NOTEPAD_EDIT_COMMON_PROPERTIES]),
    validateBody('notepad'),
    notepadCrudController.editNotepad
)

// DELETE a notepad
router.delete(
    '/:id',
    checkNotepadPermissions([Permission.NOTEPAD_DELETE]),
    notepadCrudController.deleteNotepad
)

// UPDATE sharing url and its state
router.post(
    '/:id/share',
    checkNotepadPermissions([Permission.NOTEPAD_SHARING_EDIT]),
    validateQuery('share'),
    shareController.getNotepadShareLink
)

// ADD a collaborator to a notepad
router.post(
    '/:id/share/collaborators',
    checkNotepadPermissions([Permission.NOTEPAD_COLLABORATOR_ADD]),
    validateBody('collaborator'),
    shareController.addNotepadCollaborator
)

// DELETE self as a notepad collaborator
router.delete(
    '/:id/share/collaborators',
    shareController.deleteNotepadSelfCollaborator
)

// DELETE a collaborator
router.delete(
    '/:id/share/collaborators/:collaboratorID',
    checkNotepadPermissions([Permission.NOTEPAD_COLLABORATOR_DELETE]),
    shareController.deleteNotepadCollaborator
)

// ADD a new note to a notepad
router.post(
    '/:id/notes',
    checkNotepadPermissions([Permission.NOTEPAD_ADD_NOTES]),
    validateBody('note', 'Note invalid.'),
    checkLimits.forNote,
    notepadCrudController.addNoteInNotepad
)

export default router
