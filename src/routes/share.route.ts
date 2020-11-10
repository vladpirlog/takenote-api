import { Router } from 'express'
import shareController from '../controllers/share.controller'

const router = Router()

/**
 * GET a shared note using the share code; no authentication required
 */
router.get('/note/:code', shareController.getNote)

/**
 * GET a shared notepad using the share code; no authentication required
 */
router.get('/notepad/:code', shareController.getNotepad)

export default router
