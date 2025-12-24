import { Router } from 'express';
import {
    searchUsers,
    getUserProfile,
    followUser,
    unfollowUser,
    checkIsFollowing,
    updateUser
} from '../controller/user.controller';

const router = Router();

router.get('/search', searchUsers);
router.get('/:clerkId', getUserProfile);
router.post('/:clerkId/follow', followUser);
router.delete('/:clerkId/follow', unfollowUser);
router.get('/:clerkId/is-following', checkIsFollowing);
router.patch('/', updateUser);

export default router;
