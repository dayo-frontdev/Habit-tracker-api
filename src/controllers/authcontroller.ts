import type { Request, Response} from 'express';
import {db} from '../db/connection.ts'
import { users, type NewUser } from '../db/schema.ts';
import {hashpassword, comparePassword} from '../utils/password.ts';
import {generateToken} from '../utils/jwt.ts';
import {eq} from 'drizzle-orm';

export const register = async (req: Request<any, any, NewUser>, res: Response) =>{
    try{
        const password = await hashpassword(req.body.password);

        const [user] = await db.insert(users).values({
            ...req.body,
            password: password,
        }).returning({
            id: users.id,
            email: users.email,
            username: users.username,
            firstName: users.firstName,
            lastName: users.lastName,
            createdAt: users.createdAt
        });

        const token = await generateToken({
            id: user.id,
            email: user.email,
            username: user.username
        });

        return res.status(201).json({
            message: 'User succesfully created',
            user,
            token,
        });
    }catch (e){
        console.error('Registration failed', e)
        res.status(500).json({message: "failed to create user"})
    }
};

export const login = async (req:Request, res:Response) =>{
    try{
        const {email, password} = req.body;
        const user = await db.query.users.findFirst({
            where:eq(users.email, email),
        });
        if(!user){
            return res.status(401).json({message:"invalid details"})
        }

        if(!comparePassword(password, user.password)){
            return res.status(401).json({
                message: "invalid details"
            })
        }

        const token = await generateToken({
            id: user.id,
            email: user.email,
            username: user.username
        });

        return res.status(201).json({
            message: 'login success',
            profile: {
                email:user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.firstName,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            token,
        })
    }catch(e){
    console.error('failed to process login', e)
    res.status(500).json({
    message: 'Unable to process'
    })
    }
}
