export interface User {
    id: string;
    clerk_id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    created_at: string;
}

export interface UserSearchResult {
    clerk_id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
}

export interface UserRelationship {
    id: string;
    follower_clerk_id: string;
    following_clerk_id: string;
    created_at: string;
}
