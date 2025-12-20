import { Router } from 'express'
import { handleClerkWebhook } from '../controller/webhook.controller'

const router = Router()

router.route('/')
    .post(handleClerkWebhook)

export default router