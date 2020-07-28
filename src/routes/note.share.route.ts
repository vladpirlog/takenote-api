import { Router } from 'express'
import noteShareController from '../controllers/note.share.controller'
import checkParams from '../middlewares/checkParams.middleware'

const router = Router()

/**
 * GET a shared note, using the share code,with no authentication required
 */
router.get('/:code', checkParams(['code']), noteShareController.getNote)

export default router
