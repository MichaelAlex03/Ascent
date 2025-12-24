import { SupabaseClient } from '@supabase/supabase-js';
import { User, UserSearchResult } from '../types/app';

export const searchUsers = async (
    supabase: SupabaseClient,
    query: string
): Promise<UserSearchResult[]> => {
    const sanitizedQuery = query.replace(/[%_(),"]/g, '');

    const { data, error } = await supabase
        .from('users')
        .select('clerk_id, username, full_name, avatar_url')
        .or(`username.ilike."%${sanitizedQuery}%",full_name.ilike."%${sanitizedQuery}%"`)
        .limit(20);

    if (error) throw error;
    return data;
};

export const getUserProfile = async (
    supabase: SupabaseClient,
    clerkId: string
): Promise<User> => {
    const { data, error} = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

    if (error) throw error;
    return data;
};

export const followUser = async (
    supabase: SupabaseClient,
    followerClerkId: string,
    followingClerkId: string
): Promise<void> => {
    const { error } = await supabase
        .from('user_relationships')
        .insert({
            follower_clerk_id: followerClerkId,
            following_clerk_id: followingClerkId
        });

    if (error) throw error;
};

export const unfollowUser = async (
    supabase: SupabaseClient,
    followerClerkId: string,
    followingClerkId: string
): Promise<void> => {
    const { error } = await supabase
        .from('user_relationships')
        .delete()
        .eq('follower_clerk_id', followerClerkId)
        .eq('following_clerk_id', followingClerkId);

    if (error) throw error;
};

export const isFollowing = async (
    supabase: SupabaseClient,
    followerClerkId: string,
    followingClerkId: string
): Promise<boolean> => {
    const { data, error } = await supabase
        .from('user_relationships')
        .select('id')
        .eq('follower_clerk_id', followerClerkId)
        .eq('following_clerk_id', followingClerkId)
        .maybeSingle();

    if (error) throw error;
    return data !== null;
};
