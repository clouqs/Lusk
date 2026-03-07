import { Link, useLocation } from "wouter";
import { Plus, FileText, Database, Home, Settings, LogOut, ChevronRight, ChevronDown, MoreHorizontal, Trash2, Sun, Moon, Star, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { usePages, useCreatePage, useDeletePage, useDuplicatePage } from "@/hooks/use-pages";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import type { Page } from "@shared/schema";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { data: pages = [] } = usePages();
  const createPage = useCreatePage();
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { favorites, isFavorite } = useFavorites();

  const handleCreatePage = (parentId?: number, isDatabase = false) => {
    createPage.mutate({ parentId, isDatabase, title: "Untitled" }, {
      onSuccess: (newPage) => {
        setLocation(`/app/${newPage.id}`);
      }
    });
  };

  // Build a tree of pages
  const pageTree = useMemo(() => {
    const map = new Map<number, Page & { children: Page[] }>();
    const roots: (Page & { children: Page[] })[] = [];
    
    pages.forEach(p => map.set(p.id, { ...p, children: [] }));
    
    pages.forEach(p => {
      if (p.parentId && map.has(p.parentId)) {
        map.get(p.parentId)!.children.push(map.get(p.id)!);
      } else {
        roots.push(map.get(p.id)!);
      }
    });
    return roots;
  }, [pages]);

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-2 py-1.5 h-auto text-sm font-semibold hover:bg-sidebar-accent">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <span className="truncate">{user?.firstName || user?.email}'s desk</span>
                <ChevronDown className="w-4 h-4 ml-auto opacity-50" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[240px]">
            <DropdownMenuItem className="text-sm text-muted-foreground">{user?.email}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Home">
                  <Link href="/app" className={location === "/app" ? "bg-sidebar-accent" : ""}>
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link href="/app/settings" className={location === "/app/settings" ? "bg-sidebar-accent" : ""}>
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Favorites section */}
        {favorites.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span>Favorites</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pages
                  .filter((p) => isFavorite(p.id))
                  .map((page) => (
                    <SidebarMenuItem key={page.id}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={`/app/${page.id}`}
                          className={location === `/app/${page.id}` ? "bg-sidebar-accent font-medium" : ""}
                        >
                          {page.icon ? (
                            <span className="text-sm">{page.icon}</span>
                          ) : page.isDatabase ? (
                            <Database className="w-4 h-4 opacity-70" />
                          ) : (
                            <FileText className="w-4 h-4 opacity-70" />
                          )}
                          <span className="truncate">{page.title || "Untitled"}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between group/label">
            <span>Private</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 opacity-0 group-hover/label:opacity-100 transition-opacity"
              onClick={() => handleCreatePage()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {pageTree.map(page => (
                <PageTreeItem key={page.id} page={page} depth={0} onCreateChild={handleCreatePage} activeId={location.replace('/app/', '')} />
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => handleCreatePage()} className="text-muted-foreground hover:text-foreground">
                  <Plus className="w-4 h-4" />
                  <span>Add a page</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-2 text-muted-foreground hover:text-foreground"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="text-sm">Sign out</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function PageTreeItem({ 
  page, 
  depth, 
  onCreateChild, 
  activeId 
}: { 
  page: Page & { children: Page[] }; 
  depth: number;
  onCreateChild: (parentId: number, isDatabase: boolean) => void;
  activeId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const deletePage = useDeletePage();
  const duplicatePage = useDuplicatePage();
  const [location, setLocation] = useLocation();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const isActive = activeId === page.id.toString();
  const faved = isFavorite(page.id);

  return (
    <SidebarMenuItem>
      <div className={`group flex items-center w-full rounded-md hover:bg-sidebar-accent ${isActive ? 'bg-sidebar-accent font-medium' : ''}`}>
        <button 
          className="p-1 opacity-50 hover:opacity-100 hover:bg-sidebar-accent rounded-sm ml-1"
          onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
        >
          {page.children.length > 0 ? (
            expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="w-4 h-4" /> // Spacing
          )}
        </button>
        
        <Link 
          href={`/app/${page.id}`} 
          className="flex-1 flex items-center gap-2 py-1.5 px-2 text-sm text-sidebar-foreground truncate"
        >
          {page.icon ? (
            <span className="text-sm">{page.icon}</span>
          ) : (
            page.isDatabase ? <Database className="w-4 h-4 opacity-70" /> : <FileText className="w-4 h-4 opacity-70" />
          )}
          <span className="truncate">{page.title || "Untitled"}</span>
        </Link>

        <div className="opacity-0 group-hover:opacity-100 flex items-center pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-sm">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toggleFavorite(page.id)}>
                <Star className={`w-4 h-4 mr-2 ${faved ? "text-yellow-500 fill-yellow-500" : ""}`} />
                {faved ? "Remove from Favorites" : "Add to Favorites"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicatePage.mutate(page.id)}>
                <Copy className="w-4 h-4 mr-2" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onCreateChild(page.id, false)}>
                <FileText className="w-4 h-4 mr-2" /> Add sub-page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateChild(page.id, true)}>
                <Database className="w-4 h-4 mr-2" /> Add database
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => deletePage.mutate(page.id)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button 
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-sm"
            onClick={() => onCreateChild(page.id, false)}
          >
            <Plus className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {expanded && page.children.length > 0 && (
        <SidebarMenuSub className="mr-0 pr-0 border-l border-sidebar-border/50 ml-3 pl-1">
          {page.children.map(child => (
            <PageTreeItem 
              key={child.id} 
              page={child as any} 
              depth={depth + 1} 
              onCreateChild={onCreateChild} 
              activeId={activeId} 
            />
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}
