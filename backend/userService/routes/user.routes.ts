import { Router } from 'express';
import { handleAddUser } from '../controller/user.controller';

const router = Router();

router.route('/')
    .post(handleAddUser)


export default router;