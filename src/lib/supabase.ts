import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database

export const createSupabaseClient = (supabaseUrl: string, supabaseKey: string) => createClient(supabaseUrl, supabaseKey);
