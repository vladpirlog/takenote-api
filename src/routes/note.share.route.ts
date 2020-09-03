import { Router } from 'express'
import noteShareController from '../controllers/note.share.controller'
import requestFieldsDefined from '../middlewares/requestFieldsDefined.middleware'

const router = Router()

/**
 * GET a shared note using the share code; no authentication required
 */
router.get('/:code', requestFieldsDefined('params', ['code']), noteShareController.getNote)

export default router
