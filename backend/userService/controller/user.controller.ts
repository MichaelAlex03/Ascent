import { Request, Response } from 'express';
import { verifyWebhook } from '@clerk/express/webhooks';

export const handleAddUser = async (req: Request, res: Response) => {

    try {
        const evt = await verifyWebhook(req, { signingSecret: process.env.CLERK_WEBHOOK_SECRET });

        if (evt.type === "user.created"){
            console.log("Test worked 33333")
        }

    } catch (error) {
        console.log(error)
    }
}

