import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useUpdatePage } from "@/hooks/use-pages";
import { useDebounce } from "@/hooks/use-debounce";
import { SlashMenu } from "./slash-menu";
import { AiDialog } from "./ai-dialog";
import type { Page } from "@shared/schema";
import { ImageIcon, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageEditor({ page }: { page: Page }) {
  const [title, setTitle] = useState(page.title || "");
  const [icon, setIcon] = useState(page.icon || "");
  const [coverImage, setCoverImage] = useState(page.coverImage || "");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  
  const updatePage = useUpdatePage();
  const debouncedUpdate = useDebounce((updates: Partial<Page>) => {
    updatePage.mutate({ id: page.id, ...updates });
  }, 1000);

  // Update local state when page prop changes (e.g. navigation to new page)
  useEffect(() => {
    setTitle(page.title || "");
    setIcon(page.icon || "");
    setCoverImage(page.coverImage || "");
    
    // Only update editor content if it's completely different to avoid cursor jumps
    if (editor && JSON.stringify(page.content) !== JSON.stringify(editor.getJSON())) {
      editor.commands.setContent(page.content as any || "");
    }
  }, [page.id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTitle(val);
    debouncedUpdate({ title: val });
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Type '/' for commands",
        emptyEditorClass: 'is-editor-empty',
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: page.content as any || "",
    onUpdate: ({ editor }) => {
      debouncedUpdate({ content: editor.getJSON() });
    },
  });

  const addCover = () => {
    const defaultCover = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop";
    setCoverImage(defaultCover);
    updatePage.mutate({ id: page.id, coverImage: defaultCover });
  };

  const addIcon = () => {
    const defaultIcon = "📝";
    setIcon(defaultIcon);
    updatePage.mutate({ id: page.id, icon: defaultIcon });
  };

  return (
    <div className="max-w-4xl mx-auto w-full group/page">
      {/* Cover Image */}
      {coverImage && (
        <div className="w-full h-48 md:h-64 relative overflow-hidden bg-muted group/cover">
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          <Button 
            variant="secondary" 
            size="sm"
            className="absolute bottom-4 right-4 opacity-0 group-hover/cover:opacity-100 transition-opacity shadow-md"
            onClick={() => {
              setCoverImage("");
              updatePage.mutate({ id: page.id, coverImage: null });
            }}
          >
            Remove Cover
          </Button>
        </div>
      )}

      <div className={`px-8 md:px-24 ${coverImage ? 'pt-8' : 'pt-24'}`}>
        {/* Page Actions (Add Icon/Cover) */}
        <div className="flex items-center gap-2 mb-4 opacity-0 group-hover/page:opacity-100 transition-opacity">
          {!icon && (
            <Button variant="ghost" size="sm" onClick={addIcon} className="text-muted-foreground hover:text-foreground">
              <Smile className="w-4 h-4 mr-2" /> Add icon
            </Button>
          )}
          {!coverImage && (
            <Button variant="ghost" size="sm" onClick={addCover} className="text-muted-foreground hover:text-foreground">
              <ImageIcon className="w-4 h-4 mr-2" /> Add cover
            </Button>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div className="relative group/icon inline-block mb-4">
            <span className="text-6xl md:text-7xl">{icon}</span>
            <button 
              className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 shadow-sm opacity-0 group-hover/icon:opacity-100 transition-opacity"
              onClick={() => {
                const newIcon = prompt("Enter an emoji:", icon);
                if (newIcon) {
                  setIcon(newIcon);
                  updatePage.mutate({ id: page.id, icon: newIcon });
                }
              }}
            >
              <Smile className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Title */}
        <textarea
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="w-full text-4xl md:text-5xl font-bold bg-transparent border-none outline-none resize-none overflow-hidden text-foreground placeholder:text-muted-foreground/50 mb-8 block"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              editor?.commands.focus('start');
            }
          }}
        />

        {/* Editor */}
        <div className="prose prose-stone dark:prose-invert max-w-none pb-32">
          {editor && <SlashMenu editor={editor} onAiClick={() => setAiDialogOpen(true)} />}
          <EditorContent editor={editor} />
        </div>
      </div>

      <AiDialog 
        isOpen={aiDialogOpen} 
        onClose={() => setAiDialogOpen(false)} 
        pageId={page.id} 
        onInsert={(text) => {
          editor?.commands.insertContent(text);
          debouncedUpdate({ content: editor?.getJSON() });
        }}
      />
    </div>
  );
}
