import { pgTable,
    varchar, 
    text, 
    integer, 
    timestamp,
    uuid,
    boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {createInsertSchema, createSelectSchema} from 'drizzle-zod'

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email').notNull().unique(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    password: varchar('password', { length: 250 }).notNull(),
    firstName: varchar('first_name').notNull(),
    lastName: varchar('last_name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const habits = pgTable('habits', { 
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(()=> users.id, { onDelete: 'cascade'}).notNull(),
    name: varchar('name').notNull(),
    description: text('description'),
    frequency: varchar('frequency', { length: 20 }).notNull(),
    targetCount: integer('target_count').default(1),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp( 'updated_at' ).defaultNow().notNull(),
})

export const entries = pgTable('entries', { 
    id: uuid('id').primaryKey().defaultRandom(),
    habitId: uuid('habit_id').references(()=> habits.id, { onDelete: 'cascade' }).notNull(),
    completion: timestamp('completion').defaultNow().notNull(),
    note: text('note'),
    createdAt: timestamp('created_at').defaultNow().notNull()
})

export const tags = pgTable('tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', {length: 50}).notNull().unique(),
    color: varchar('color', { length: 7 }).default('#6B7280'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const  habitTags = pgTable('habit_tags', { 
    id: uuid('id').primaryKey().defaultRandom(),
    habitId: uuid( 'habit_id').references(()=> habits.id, { onDelete: 'cascade' }).notNull(),
    tagId: uuid('tag_id').references(()=> tags.id, { onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userRelation = relations(users, ({many}) => ({ habits: many(habits)}));

export const habitsRelation = relations(habits, ({one, many}) =>({ 
    user: one(users, {
        fields: [habits.userId],
        references: [users.id], 
    }),

    entries: many(entries),

    habitTags: many(habitTags),
})
);

export const entriesRelation = relations( entries, ({one}) => ({
    habit: one(habits, {
        fields: [entries.habitId],
        references:[ habits.id ]
    })
}))

export const tagsRelation = relations(tags, ({many}) => ({ 
    habitTag: many(habitTags)
}))

export const habitTagsRelation = relations(habitTags, ({one}) => ({
    habit: one(habits, {
        fields: [habitTags.habitId],
        references: [habits.id]
    }),

    tag: one(tags, {
        fields: [habitTags.tagId],
        references: [tags.id]
    })
})
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type habit = typeof habits.$inferSelect;
export type entry = typeof entries.$inferSelect;
export type tag = typeof tags.$inferSelect;
export type habittag = typeof habittags.$inferSelect;

export const createUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const createHabbitSchema = createInsertSchema(habits);
export const selectHabbitSchema = createSelectSchema(habits);

export const createTagSchema = createInsertSchema(tags);
export const selectTagSchema = createSelectSchema(tags);

export const createEntryschema = createInsertSchema(entries);
export const selectEntrySchema = createSelectSchema(entries);

export const createHabitsTagSchema = createInsertSchema(habitTags);
export const selectHabbitsTagSchema = createSelectSchema(habitTags);

