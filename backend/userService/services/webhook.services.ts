import { Request } from 'express'
import { addClerkUser } from '../repositories/users.repo'

export const handleUserCreatedWebhook = async (id: string) => {
    await addClerkUser(id)
}