import { AppLayout } from "@/components/layout/app-layout";
import { PageEditor } from "@/components/editor/page-editor";
import { DatabaseView } from "@/components/database/database-view";
import { usePage } from "@/hooks/use-pages";
import { useRoute } from "wouter";
import { Loader2, FileX } from "lucide-react";

export default function PageView() {
  const [match, params] = useRoute("/app/:id");
  const pageId = match && params?.id ? parseInt(params.id) : null;
  const { data: page, isLoading, error } = usePage(pageId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (error || !page) {
    return (
      <AppLayout>
        <div className="flex flex-col h-full items-center justify-center text-center px-4">
          <FileX className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Page not found</h2>
          <p className="text-muted-foreground">The page you're looking for doesn't exist or has been deleted.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full pb-32">
        {page.isDatabase ? (
          <DatabaseView page={page} />
        ) : (
          <PageEditor page={page} />
        )}
      </div>
    </AppLayout>
  );
}
