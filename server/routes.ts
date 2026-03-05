import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./replit_integrations/auth/replitAuth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use("/api/pages", isAuthenticated);

  app.get(api.pages.list.path, async (req, res) => {
    try {
      const userId = req.session.userId as string;
      const userPages = await storage.getPages(userId);
      res.json(userPages);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.pages.get.path, async (req, res) => {
    try {
      const userId = req.session.userId as string;
      const pageId = Number(req.params.id);
      const page = await storage.getPage(pageId, userId);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.pages.create.path, async (req, res) => {
    try {
      const userId = req.session.userId as string;
      const input = api.pages.create.input.parse(req.body);
      const newPage = await storage.createPage({ ...input, authorId: userId });
      res.status(201).json(newPage);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.pages.update.path, async (req, res) => {
    try {
      const userId = req.session.userId as string;
      const pageId = Number(req.params.id);
      const input = api.pages.update.input.parse(req.body);
      const updatedPage = await storage.updatePage(pageId, userId, input);
      res.json(updatedPage);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.pages.delete.path, async (req, res) => {
    try {
      const userId = req.session.userId as string;
      const pageId = Number(req.params.id);
      await storage.deletePage(pageId, userId);
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.pages.askAi.path, async (req, res) => {
    try {
      const userId = req.session.userId as string;
      const pageId = Number(req.params.id);
      const page = await storage.getPage(pageId, userId);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      const input = api.pages.askAi.input.parse(req.body);
      let systemPrompt =
        "You are a helpful AI writing assistant embedded in a Notion-like text editor. Help the user write, edit, or brainstorm content.";
      if (input.context) {
        systemPrompt += ` Here is some context from the document: ${input.context}`;
      }
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.prompt },
        ],
      });
      const text = response.choices[0]?.message?.content || "";
      res.json({ text });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
