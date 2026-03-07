import { AppLayout } from "@/components/layout/app-layout";
import { FileText, Plus, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreatePage, usePages } from "@/hooks/use-pages";
import { useLocation } from "wouter";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const createPage = useCreatePage();
  const [_, setLocation] = useLocation();
  const { data: pages = [] } = usePages();

  const handleCreate = () => {
    createPage.mutate({ title: "Untitled" }, {
      onSuccess: (page) => setLocation(`/app/${page.id}`)
    });
  };

  const recentPages = [...pages]
    .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())
    .slice(0, 6);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-10 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Your workspace at a glance</p>
          </div>
          <Button
            onClick={handleCreate}
            disabled={createPage.isPending}
            className="bg-foreground text-background hover:bg-foreground/90 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            New page
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Pages */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Recent pages
            </h2>
            {recentPages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No pages yet. Create your first one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentPages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setLocation(`/app/${p.id}`)}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card hover:bg-accent text-left transition-colors p-4 group"
                  >
                    <div className="text-2xl leading-none mt-0.5 flex-shrink-0">
                      {p.icon || <FileText className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-accent-foreground">
                        {p.title || "Untitled"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.updatedAt ? formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true }) : "—"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Stats strip */}
            <div className="mt-4 rounded-xl border border-border bg-card p-4 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                <span><span className="font-semibold text-foreground">{pages.length}</span> pages</span>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Calendar
            </h2>
            <CalendarView />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
