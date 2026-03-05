import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export { users }; // Re-export auth users

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Untitled"),
  icon: text("icon"), // emoji or lucide icon name
  coverImage: text("cover_image"),
  content: jsonb("content"), // Editor.js or TipTap JSON structure
  properties: jsonb("properties"), // For database-like table views (tags, dates, etc.)
  parentId: integer("parent_id"), // Self-referential for nesting
  authorId: text("author_id").notNull().references(() => users.id),
  isDatabase: boolean("is_database").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Self-referential relation for nested pages
export const pageRelations = relations(pages, ({ one, many }) => ({
  parent: one(pages, {
    fields: [pages.parentId],
    references: [pages.id],
    relationName: "children"
  }),
  children: many(pages, { relationName: "children" }),
  author: one(users, {
    fields: [pages.authorId],
    references: [users.id]
  })
}));

// Base schema for insertion
export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  authorId: true, // Will be set by the backend using auth session
});

// Explicit API Contract Types
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type CreatePageRequest = InsertPage;
export type UpdatePageRequest = Partial<InsertPage>;

export type PageResponse = Page;
export type PagesListResponse = Page[];
