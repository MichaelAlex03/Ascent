import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const createSupabaseClient = (accessToken: Promise<string | null>) => {
    return createClient(supabaseUrl!, supabaseAnonKey!, {
        accessToken: () => accessToken,
    });
};


// For the webhook since using service role by passes RLS
export const createSupabaseAdminClient = () => {
    return createClient(supabaseUrl!, supabaseServiceKey!, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
