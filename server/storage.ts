import { pages, type Page, type InsertPage, type UpdatePageRequest } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getPages(userId: string): Promise<Page[]>;
  getPage(id: number, userId: string): Promise<Page | undefined>;
  createPage(page: InsertPage & { authorId: string }): Promise<Page>;
  updatePage(id: number, userId: string, updates: UpdatePageRequest): Promise<Page>;
  deletePage(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getPages(userId: string): Promise<Page[]> {
    return await db.select().from(pages).where(eq(pages.authorId, userId));
  }

  async getPage(id: number, userId: string): Promise<Page | undefined> {
    const [page] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.id, id), eq(pages.authorId, userId)));
    return page;
  }

  async createPage(insertPage: InsertPage & { authorId: string }): Promise<Page> {
    const [page] = await db
      .insert(pages)
      .values(insertPage)
      .returning();
    return page;
  }

  async updatePage(id: number, userId: string, updates: UpdatePageRequest): Promise<Page> {
    const [page] = await db
      .update(pages)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(pages.id, id), eq(pages.authorId, userId)))
      .returning();
    
    if (!page) {
        throw new Error("Page not found");
    }
    return page;
  }

  async deletePage(id: number, userId: string): Promise<void> {
    await db
      .delete(pages)
      .where(and(eq(pages.id, id), eq(pages.authorId, userId)));
  }
}

export const storage = new DatabaseStorage();
