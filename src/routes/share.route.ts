import { Router } from 'express'
import noteShareController from '../controllers/note.share.controller'
import notepadShareController from '../controllers/notepad.share.controller'

const router = Router()

/**
 * GET a shared note using the share code; no authentication required
 */
router.get('/note/:code', noteShareController.getNote)

/**
 * GET a shared notepad using the share code; no authentication required
 */
router.get('/notepad/:code', notepadShareController.getNotepad)

export default router
