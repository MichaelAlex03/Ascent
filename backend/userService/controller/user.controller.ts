import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import {
    searchUsersService,
    getUserProfileService,
    followUserService,
    unfollowUserService,
    checkIsFollowingService
} from '../services/user.services';
import { SearchQuerySchema } from '../schemas/schemas';

export const searchUsers = async (req: Request, res: Response) => {
    const auth = getAuth(req);
    if (!auth.isAuthenticated) {
        return res.status(401).json({ message: "user is not authenticated" });
    }

    const validation = SearchQuerySchema.safeParse(req.query);
      if (!validation.success) {
          return res.status(400).json({
              message: "Invalid search query",
              errors: validation.error
          });
      }


    try {
        const users = await searchUsersService(auth.getToken(), validation.data.q);
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to search users" });
    }
};

export const getUserProfile = async (req: Request, res: Response) => {
    const auth = getAuth(req);
    if (!auth.isAuthenticated) {
        return res.status(401).json({ message: "user is not authenticated" });
    }

    const { clerkId } = req.params;
    if (!clerkId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const user = await getUserProfileService(auth.getToken(), clerkId);
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to get user profile" });
    }
};

export const followUser = async (req: Request, res: Response) => {
    const auth = getAuth(req);
    if (!auth.isAuthenticated) {
        return res.status(401).json({ message: "user is not authenticated" });
    }

    const { clerkId } = req.params;
    if (!clerkId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    if (auth.userId === clerkId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
    }

    try {
        await followUserService(auth.getToken(), auth.userId, clerkId);
        return res.status(201).json({ message: "Successfully followed user" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to follow user" });
    }
};

export const unfollowUser = async (req: Request, res: Response) => {
    const auth = getAuth(req);
    if (!auth.isAuthenticated) {
        return res.status(401).json({ message: "user is not authenticated" });
    }

    const { clerkId } = req.params;
    if (!clerkId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        await unfollowUserService(auth.getToken(), auth.userId, clerkId);
        return res.status(200).json({ message: "Successfully unfollowed user" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to unfollow user" });
    }
};

export const checkIsFollowing = async (req: Request, res: Response) => {
    const auth = getAuth(req);
    if (!auth.isAuthenticated) {
        return res.status(401).json({ message: "user is not authenticated" });
    }

    const { clerkId } = req.params;
    if (!clerkId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const isFollowing = await checkIsFollowingService(auth.getToken(), auth.userId, clerkId);
        return res.status(200).json({ isFollowing });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to check follow status" });
    }
};

export const updateUser = async () => {

}
