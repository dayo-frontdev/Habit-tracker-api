import type {Request, Response, NextFunction} from 'express';
import {type JwtPayload, verifyToken} from '../utils/jwt.ts';

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload
}

export const authenticateToken = async (req: AuthenticatedRequest, res:Response, next:NextFunction ) =>{
    try{
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(" ")[1]

        if(!token){
            return res.status(401).json({
                message: "Bad Request"
            })
        }

        const payload = await verifyToken(token);
        req.user = payload
        next();
    } catch(e){
        console.error('Bad Request', e);
        return res.status(403).json({error: 'Forbidden'});
    }
}
