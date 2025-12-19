const { createClient } = require('@supabase/supabase-js')
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

const createSupabaseClerkClient = (getAccessToken: () => Promise<string | null>) => {
    return createClient(supabaseUrl!, supabaseAnonKey!, {
        accessToken: getAccessToken
    })
}