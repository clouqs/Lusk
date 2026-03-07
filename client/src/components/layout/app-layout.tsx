import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { CommandPalette } from "./command-palette";
import { useAuth } from "@/hooks/use-auth";
import { FavoritesContext, useFavoritesProvider } from "@/hooks/use-favorites";
import { Redirect } from "wouter";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <AppLayoutInner>{children}</AppLayoutInner>;
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const favoritesValue = useFavoritesProvider();

  // Define sidebar sizing using custom properties as per best practices
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <FavoritesContext.Provider value={favoritesValue}>
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex h-12 items-center px-4 shrink-0 transition-opacity sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            <SidebarTrigger className="hover:bg-secondary rounded-md p-2 -ml-2 text-muted-foreground" />
            <div className="ml-2 flex flex-1 items-center gap-2 overflow-hidden">
              {/* Breadcrumbs could go here */}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
              title="Quick Find (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Find</span>
              <kbd className="hidden sm:inline text-xs bg-muted border border-border rounded px-1">Ctrl+K</kbd>
            </Button>
          </header>
          <main className="flex-1 overflow-y-auto pb-32">
            {children}
          </main>
        </div>
      </div>
      <CommandPalette />
    </SidebarProvider>
    </FavoritesContext.Provider>
  );
}
