import {db} from "./connection.ts";
import { users, habits, tags, entries, habitTags } from "./schema.ts";

const seed = async () =>{
    console.log("🌱Starting database seed.....");

    try{
        console.log("Deleting existing data");

        await db.delete(users);
        await db.delete(habits);
        await db.delete(entries);
        await db.delete(tags);
        await db.delete(habitTags);

        console.log("Creating user demo");

        const [demoUser] = await db.insert(users).values({
            email: "demo@demo.com",
            password: "password",
            username: "demo",
            firstName: "demo",
            lastName: "demo",
        }).returning();

        console.log("Creating demo tags");

        const [healthTag] = await db.insert(tags).values({
            name: 'healt',
            color: '#f0f0f0',
        }).returning()

        console.log('Creating exercise habits');

        const [exerciseHabit] = await db.insert(habits).values({
            userId: demoUser.id,
            name: 'exercise',
            description: 'Daily workout',
            frequency: 'daily',
            targetCount: 1,
        }).returning()

        await db.insert(habitTags).values({
            habitId: exerciseHabit.id,
            tagId: healthTag.id,
        })

        console.log('Creating entry....')

        const today = new Date();
        today.setHours(12, 0, 0, 0);

        for( let i=0; i < 7; i++){

            const date = new Date(today);
            date.setDate(date.getDate() - i);

            await db.insert(entries).values({
                habitId: exerciseHabit.id,
                completion: date,
            })
        }

        console.log('✅DB seeded sucessfully');
        console.log('user credentials:');
        console.log(`email: ${demoUser.email}`);
        console.log(`username: ${demoUser.username}`);
        console.log(`password: ${demoUser.password}`);

    } catch(e) {
        console.log(`❌seed faild ${e}`);
        process.exit(1);
    }
}

if( import.meta.url === `file://${process.argv[1]}` ){
    seed()
    .then(()=>process.exit(0))
    .catch((e)=> process.exit(1))
};

export default seed;
