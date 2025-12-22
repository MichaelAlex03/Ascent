import { Router } from 'express'
import { getClimbs, addClimb } from '../controller/journal.controller';

const router = Router();

router.route('/')
    .get(getClimbs)
    .post(addClimb)


export default router;