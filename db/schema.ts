import { pgTable, uuid, boolean, timestamp } from 'drizzle-orm/pg-core';
export const gameVisitors = pgTable('game_visitors', {
  id: uuid().primaryKey(),
  snowNoticeSeen: boolean('snow_notice_seen').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
