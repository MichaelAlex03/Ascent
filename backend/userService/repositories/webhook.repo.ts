import { createSupabaseAdminClient } from '../config/supabase'

const webhookSupabase = createSupabaseAdminClient()

export const addClerkUser = async (id: string) => {
    const { error } = await webhookSupabase
        .from('users')
        .upsert(
                { clerk_id: id },
                {
                    onConflict: 'clerk_id',
                    ignoreDuplicates: true
                }
            )
    if (error) throw error;
}