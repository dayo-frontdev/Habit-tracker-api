import type {Response} from 'express';
import {type AuthenticatedRequest } from '../middleware/auth.ts';
import {db} from '../db/connection.ts';
import { habits, habitTags, entries, tags } from '../db/schema.ts';
import {and, asc, desc, eq, like} from 'drizzle-orm';

export const createNewHabit = async (req: AuthenticatedRequest, res:Response) =>{
    try{
        const {name, description, frequency, targetCount, tagIds} = req.body;

        const result = await db.transaction(async(tx)=>{
            const [newHabit] = await tx.insert(habits).values({
                userId: req.user.id,
                name,
                description,
                frequency,
                targetCount,
            }).returning()

            if (tagIds && tagIds > 0){
                const habitValues = tagIds.map((tagId: string) =>({
                    habitId: newHabit.id,
                    tagId,
                }));

                await tx.insert(habitTags).values(habitValues);
            }

            return newHabit
        });
        return res.status(201).json({
            message: 'Habit created',
            habit: result,
        })
    } catch (e){
        console.error('Fail to create habit', e);
        res.status(500).json({message: 'Fail to create Habit'})
    }
}

export const getHabits = async (req: AuthenticatedRequest, res:Response) =>{
    try{
        const { search, limit, orderby  } = req.query;
        
        const habitWithTags = await db.query.habits.findMany({
                where: and(eq(habits.userId, req.user?.id),
                           search ? like( habits.name, `%${search}%`) : undefined
                        ),
                with: {
                    habitTags: {
                        with: { 
                            tag: true 
                        },
                    }, 
                },
                limit: Number(limit) || 20,
                orderBy: orderby === 'asc'? [asc(habits.createdAt)] : [desc(habits.createdAt)]
        })

        if (!habitWithTags){
            res.status(404).json({message: "Habits not found"})
        }

        const habitResult = habitWithTags.map(habit=>( {
            ...habit,
            tags: habit.habitTags.map(ht=> ht.tag),
            habitTags: undefined
        }))

        res.status(200).json({
            habits: habitResult
        })
        
    } catch (e){
        console.error('fail to get Habit', e);
        res.status(500).json({
            message: 'Failed to process'
        })
    }
}

export const updateHabbit = async (req: AuthenticatedRequest, res:Response) =>{
    try{
        const { id } = req.params;
        const userIds =  req.user?.id
        const { tagIds, updates} = req.body;

        const result = await db.transaction(async (tx)=>{

            const [updatedHabits] = await tx.update(habits)
            .set({...updates, updatedAt: new Date()})
            .where(and(eq(habits.id, id), eq(habits.userId, userIds)))
            .returning()

            if(!updatedHabits){
                throw new Error("Habit not found")
            }

            if(tagIds !== undefined){
                await tx.delete(habitTags).where( eq(habits.id, id))

                if( tagIds > 0 ){
                    const habitTagValue = tagIds.map(tagId=>({
                        habitId: id,
                        tagId
                    }))

                    await tx.insert(habitTags).values(habitTagValue);
                }
            }

            return updatedHabits
        })
        
        console.log("Result: ", result)

        res.status(200).json({
            message: "Update successful",
            habits: result
        })

    } catch(e){
        if( e.message === 'Habit not found'){
            return res.status(404).json({ message: e.message })
        }

        console.error('Unable to process update', e)
        res.status(500).json({
            message: "Fail to process habit update"
        })
    }
}

export const deleteHabit = async ( req: AuthenticatedRequest, res: Response) =>{
    try{

        const {id} = req.params;
        const userId = req.user?.id
        const [deleteResult] = await db.delete(habits)
        .where(and(eq(habits.id, id), eq(habits.userId, userId)))
        .returning()

        if(!deleteResult){
            return res.status(404).json({ message: 'Habit not Found' })
        };

        res.json({
            message: 'Habit deleted successfully',
            id: deleteResult.id,
            name: deleteResult.name
        });

    }catch(e) {

        console.error('Failed to delete habit', e);
        res.status(500).json({ message: ' Failed to process delete request' });
    }
}

export const createTags = async (req: AuthenticatedRequest, res: Response) => {
    try{
        const {name, color} = req.body;

        const newTag = await db.insert(tags).values({
            name,
            color
        }).returning();

        res.status(201).json({
            message: 'created successfully',
            tag: newTag
        })
    }catch(e){
        console.error('Unable to create Tag', e);
        res.status(500).json({message: 'Unable to create Tag'})
    }
};

export const logEntry = async (req: AuthenticatedRequest, res: Response) =>{
    try{
        const {habitId} = req.params;
        const userId = req.user?.id
        const {note} = req.body;

        const [habit] = await db
        .select()
        .from(habits)
        .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))

        if(!habit){
            return res.status(404).json({
                message: 'Habit not found'
            })
        };

        const newLog = await db.insert(entries).values({
            completion: new Date() ,
            note,
            habitId
        }).returning();

        res.status(201).json({
            message: 'Habit completion logged',
            log: newLog
        })        
    }catch(e){
        const message = 'Unable to process log'
        console.error(message, e);
        res.status(500).json({ message });
    }
};

export const completHabit = async (req: AuthenticatedRequest, res: Response) =>{
    try{
        const habitId = req.params;
        const {note} = req.body;
        const userId = req.user?.id;

        const [habit] = await db.select().from(habits)
        .where(and(eq( habits.id, habitId), eq(habits.userId, userId)))

        if( !habit ){
            return res.status(404).json({ message: "Habit not found"})
        };

        if( !habit.isActive ) {
            return res.status(401).json({message: "Can't complete inactive habit"})
        };

        const newEntry = await db.insert(entries).values({
            habitId: habit.id,
            completion: new Date(),
            note
        });

        res.status(201).json({
            message: "Habit completed successfully",
            log: newEntry
        });

    }catch(e){
        const message = "Unable to process completion";
        console.error(message, e);
        res.status(500).json({message})
    }
}
