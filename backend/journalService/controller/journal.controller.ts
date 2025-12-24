import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { addClimbService, getClimbsService } from '../services/journal.services';
import { CreateClimbSchema } from '../schemas/climb.schema';
import { CreateClimb } from '../types/app';

export const addClimb = async (req: Request, res: Response) => {
    const auth = getAuth(req);

    if (!auth.isAuthenticated) {
        return res.status(401).json({ "message": "user is not authenticated" });
    }

    const validation = CreateClimbSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            "message": "Invalid input",
            "errors": validation.error
        });
    }

    try {
        const climbData: CreateClimb = {
            ...validation.data,
            clerk_id: auth.userId
        };

        await addClimbService(auth.getToken(), climbData);

        return res.status(201).json({ "message": "climb added successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ "message": "Failed to add climb" });
    }
};

export const getClimbs = async (req: Request, res: Response) => {
    const auth = getAuth(req);

    if (!auth.isAuthenticated) {
        return res.status(401).json({ "message": "user is not authenticated" });
    }

    try {
        const climbs = await getClimbsService(auth.getToken());

        return res.status(200).json(climbs);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ "message": "Failed to get climbs" });
    }
};