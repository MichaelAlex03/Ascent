import { CreateClimb, Climb } from "../types/app";
import { SupabaseClient } from '@supabase/supabase-js'; 


export const addClimb = async (supabase: SupabaseClient, climb: CreateClimb) => {
    const { error } = await supabase
        .from('climbs')
        .insert({
            climb_type: climb.climb_type,
            grade: climb.grade,
            climb_wall_type: climb.climb_wall_type,
            climb_attempts: climb.climb_attempts,
            climb_notes: climb.climb_notes,
            clerk_id: climb.clerk_id,
        })

    if (error) throw error;
}

// Not filtering by userId because RLS policy makes it so that each user can only see their data
export const getClimbs = async (supabase: SupabaseClient): Promise<Climb[]> => {
    const { data, error } = await supabase
        .from('climbs')
        .select('*')
    if (error) throw error;
    return data;
}
