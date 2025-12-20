import { Request, Response } from 'express';
import { verifyWebhook } from '@clerk/express/webhooks';

export const handleClerkWebhook = async (req: Request, res: Response) => {

    try {
        const evt = await verifyWebhook(req);

        if (evt.type === "user.created"){
            console.log("Test worked 33333")
        }

        return res.sendStatus(200);

    } catch (error) {
        console.error('❌ Webhook verification failed:', error)
        return res.sendStatus(400);
    }
}