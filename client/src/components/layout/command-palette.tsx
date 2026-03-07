import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { FileText, Database, Plus, Star } from "lucide-react";
import { usePages, useCreatePage } from "@/hooks/use-pages";
import { useFavorites } from "@/hooks/use-favorites";
import type { Page } from "@shared/schema";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { data: pages = [] } = usePages();
  const [, setLocation] = useLocation();
  const createPage = useCreatePage();
  const { favorites } = useFavorites();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (page: Page) => {
    setOpen(false);
    setLocation(`/app/${page.id}`);
  };

  const handleCreate = () => {
    setOpen(false);
    createPage.mutate({ title: "Untitled" }, {
      onSuccess: (page) => setLocation(`/app/${page.id}`),
    });
  };

  const favPages = pages.filter((p) => favorites.includes(p.id));
  const otherPages = pages.filter((p) => !favorites.includes(p.id));

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages or type a command…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={handleCreate} value="new page create">
            <Plus className="w-4 h-4 mr-2" />
            New page
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+N</span>
          </CommandItem>
        </CommandGroup>

        {favPages.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Favorites">
              {favPages.map((page) => (
                <CommandItem
                  key={page.id}
                  onSelect={() => handleSelect(page)}
                  value={`fav-${page.title || "Untitled"}-${page.id}`}
                >
                  <Star className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" />
                  <span>{page.title || "Untitled"}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {otherPages.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Pages">
              {otherPages.map((page) => (
                <CommandItem
                  key={page.id}
                  onSelect={() => handleSelect(page)}
                  value={`page-${page.title || "Untitled"}-${page.id}`}
                >
                  {page.icon ? (
                    <span className="mr-2 text-sm">{page.icon}</span>
                  ) : page.isDatabase ? (
                    <Database className="w-4 h-4 mr-2 text-muted-foreground" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                  )}
                  <span>{page.title || "Untitled"}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
