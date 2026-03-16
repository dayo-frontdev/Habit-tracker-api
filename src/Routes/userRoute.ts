import { Router } from 'express';
import z from "zod";
import { validateBody } from "../middleware/validation.ts";
import {  authenticateToken } from "../middleware/auth.ts";

const router = Router();
const validateSchema = z.object({
    name: z.string()
})
router.use(authenticateToken)

router.post('/user',  (req, res)=>{
    res.json({ message: 'sucessful'});
})

export default router;
