import { createSupabaseClient } from '../config/supabase';
import {
    searchUsers as searchUsersRepo,
    getUserProfile as getUserProfileRepo,
    followUser as followUserRepo,
    unfollowUser as unfollowUserRepo,
    isFollowing as isFollowingRepo
} from '../repositories/user.repo';
import { User, UserSearchResult } from '../types/app';

export const searchUsersService = async (
    sessionToken: Promise<string | null>,
    query: string
): Promise<UserSearchResult[]> => {
    const supabase = createSupabaseClient(sessionToken);
    return await searchUsersRepo(supabase, query);
};

export const getUserProfileService = async (
    sessionToken: Promise<string | null>,
    clerkId: string
): Promise<User> => {
    const supabase = createSupabaseClient(sessionToken);
    return await getUserProfileRepo(supabase, clerkId);
};

export const followUserService = async (
    sessionToken: Promise<string | null>,
    followerClerkId: string,
    followingClerkId: string
): Promise<void> => {
    const supabase = createSupabaseClient(sessionToken);
    await followUserRepo(supabase, followerClerkId, followingClerkId);
};

export const unfollowUserService = async (
    sessionToken: Promise<string | null>,
    followerClerkId: string,
    followingClerkId: string
): Promise<void> => {
    const supabase = createSupabaseClient(sessionToken);
    await unfollowUserRepo(supabase, followerClerkId, followingClerkId);
};

export const checkIsFollowingService = async (
    sessionToken: Promise<string | null>,
    followerClerkId: string,
    followingClerkId: string
): Promise<boolean> => {
    const supabase = createSupabaseClient(sessionToken);
    return await isFollowingRepo(supabase, followerClerkId, followingClerkId);
};
