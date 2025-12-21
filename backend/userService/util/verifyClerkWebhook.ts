import { Request } from 'express'
import { verifyWebhook, WebhookEvent } from '@clerk/express/webhooks';


export const verifyClerkWebhook = async (req: Request): Promise<WebhookEvent> => {
    const evt = await verifyWebhook(req);
    return evt
}