import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const createSupabaseClient = (accessToken: Promise<string | null>) => {

    return createClient(
       supabaseUrl!,
       supabaseAnonKey!,
       {
         accessToken: () => accessToken,
       }
     )
}