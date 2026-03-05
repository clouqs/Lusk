import { AppLayout } from "@/components/layout/app-layout";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreatePage } from "@/hooks/use-pages";
import { useLocation } from "wouter";

export default function Dashboard() {
  const createPage = useCreatePage();
  const [_, setLocation] = useLocation();

  const handleCreate = () => {
    createPage.mutate({ title: "Untitled" }, {
      onSuccess: (page) => setLocation(`/app/${page.id}`)
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center px-4">
        <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <FileText className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome to your workspace</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Create a new page to start writing, or select an existing one from the sidebar. You can also create databases to organize information.
        </p>
        <Button 
          onClick={handleCreate} 
          disabled={createPage.isPending}
          className="bg-foreground text-background hover:bg-foreground/90 shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create your first page
        </Button>
      </div>
    </AppLayout>
  );
}
