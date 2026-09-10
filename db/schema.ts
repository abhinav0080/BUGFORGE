import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const learnerState=sqliteTable('learner_state',{userId:text('user_id').primaryKey(),data:text('data').notNull(),revision:integer('revision').notNull().default(0)});
