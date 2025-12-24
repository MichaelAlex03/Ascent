import { Request, Response } from 'express';
import { verifyClerkWebhook } from '../util/verifyClerkWebhook';
import { handleUserCreatedWebhook } from '../services/webhook.services';

export const handleClerkWebhook = async (req: Request, res: Response) => {

    try {
        const eventData = await verifyClerkWebhook(req);
        console.log(eventData.data)
        if (eventData.type === "user.created"){
            await handleUserCreatedWebhook(eventData.data.id)
        }

        return res.sendStatus(200);

    } catch (error) {
        console.error('❌ Webhook verification failed:', error)
        return res.sendStatus(400);
    }
}