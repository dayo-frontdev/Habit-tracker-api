import { Router } from 'express';
import validateBody from '../middleware/validation.ts';
import {createUserSchema} from '../db/schema.ts'
import {login, register} from '../controllers/authcontroller.ts';
import {z} from 'zod';

const router = Router();
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
})
router.post('/register', validateBody(createUserSchema), register);

router.post('/login', validateBody(loginSchema), login);

export default router;


