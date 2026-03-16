import {Router} from 'express';
import { createNewHabit, deleteHabit, getHabits, updateHabbit } from '../controllers/habitController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { validateBody } from '../middleware/validation.ts';
import z from 'zod';

const createHabitSchema = z.object({
    name: z.string(),
    targetCount: z.number(),
    frequency: z.string(),
    description: z.string().optional(),
    tagIds: z.array(z.string()).optional(),
})

const updateHabbitSchema = z.object({
   updates: createHabitSchema.partial().strict(),
   tagIds: z.array(z.string()).optional()
}).strict();

const router = Router();

router.use(authenticateToken)

router.post('/create', validateBody(createHabitSchema), createNewHabit)
router.get('/:id', getHabits)
router.patch('/update/:id', validateBody(updateHabbitSchema), updateHabbit)
router.delete('/delete/:id', deleteHabit)

export default router
