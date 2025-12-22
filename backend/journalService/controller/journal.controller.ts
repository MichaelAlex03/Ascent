import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';


export const addClimb = async (req: Request, res: Response) => {
    const auth = getAuth(req)

    if (!auth.isAuthenticated) {
        return res.status(401).json({ "message": "user is not authenticated" })
    }
    
    return res.sendStatus(200);
}

export const getClimbs = async (req: Request, res: Response) => {
    const auth = getAuth(req)

    if (!auth.isAuthenticated) {
        return res.status(401).json({ "message": "user is not authenticated" })
    }

    return res.sendStatus(200);
}