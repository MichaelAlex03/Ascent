import { addClerkUser } from '../repositories/webhook.repo'

export const handleUserCreatedWebhook = async (id: string) => {
    await addClerkUser(id)
}