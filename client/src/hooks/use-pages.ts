import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { Page, InsertPage, UpdatePageRequest } from "@shared/schema";

export function usePages() {
  return useQuery({
    queryKey: [api.pages.list.path],
    queryFn: async () => {
      const res = await fetch(api.pages.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pages");
      const data = await res.json();
      return api.pages.list.responses[200].parse(data);
    },
  });
}

export function usePage(id: number | null) {
  return useQuery({
    queryKey: [api.pages.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.pages.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch page");
      const data = await res.json();
      return api.pages.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<InsertPage>) => {
      const res = await fetch(api.pages.create.path, {
        method: api.pages.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create page");
      return api.pages.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.pages.list.path] });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdatePageRequest) => {
      const url = buildUrl(api.pages.update.path, { id });
      const res = await fetch(url, {
        method: api.pages.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update page");
      return api.pages.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.pages.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.pages.get.path, data.id] });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.pages.delete.path, { id });
      const res = await fetch(url, { 
        method: api.pages.delete.method,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete page");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.pages.list.path] });
      toast({ title: "Page moved to trash" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useAskAi() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, prompt, context }: { id: number; prompt: string; context?: string }) => {
      const url = buildUrl(api.pages.askAi.path, { id });
      const res = await fetch(url, {
        method: api.pages.askAi.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("AI request failed");
      return api.pages.askAi.responses[200].parse(await res.json());
    },
    onError: (err) => {
      toast({ title: "AI Error", description: err.message, variant: "destructive" });
    },
  });
}
