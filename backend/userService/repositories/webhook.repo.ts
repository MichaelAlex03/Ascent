import { createSupabaseAdminClient } from '../config/supabase'

const webhookSupabase = createSupabaseAdminClient()

export const addClerkUser = async (id: string) => {
    const { error } = await webhookSupabase
        .from('users')
        .insert({ clerk_id: id })
    if (error) throw error;
}