import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseClient } from '../config/supabase';
import { addClimb as addClimbRepo, getClimbs as getClimbsRepo } from '../repositories/journal.repo';
import { CreateClimb, Climb } from '../types/app';

export const addClimbService = async (
    sessionToken: Promise<string | null>,
    climbData: CreateClimb
): Promise<void> => {
    const supabase = createSupabaseClient(sessionToken);
    await addClimbRepo(supabase, climbData);
};

export const getClimbsService = async (
    sessionToken: Promise<string | null>
): Promise<Climb[]> => {
    const supabase = createSupabaseClient(sessionToken);
    return await getClimbsRepo(supabase);
};