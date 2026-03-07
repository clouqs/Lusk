import { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { common, createLowlight } from "lowlight";
import { useUpdatePage } from "@/hooks/use-pages";
import { useDebounce } from "@/hooks/use-debounce";
import { SlashMenu } from "./slash-menu";
import { BubbleToolbar } from "./bubble-toolbar";
import { MathBlock } from "./math-block";
import { InlineMath } from "./inline-math";
import { AiDialog } from "./ai-dialog";
import { tiptapToMarkdown } from "@/lib/markdown-export";
import type { Page } from "@shared/schema";
import { ImageIcon, Smile, Hash, Maximize2, Minimize2, Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "./emoji-picker";

const lowlight = createLowlight(common);

export function PageEditor({ page }: { page: Page }) {
  const [title, setTitle] = useState(page.title || "");
  const [icon, setIcon] = useState(page.icon || "");
  const [coverImage, setCoverImage] = useState(page.coverImage || "");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [focusMode, setFocusMode] = useState(false);

  // Keyboard shortcut: Escape to exit focus mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && focusMode) setFocusMode(false);
      if (e.key === "F11" || (e.key === "." && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setFocusMode((f) => !f);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [focusMode]);

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const updatePage = useUpdatePage();
  const debouncedUpdate = useDebounce((updates: Partial<Page>) => {
    updatePage.mutate({ id: page.id, ...updates } as any);
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
      StarterKit.configure({
        // Disable the default code block since we're using lowlight
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands",
        emptyEditorClass: 'is-editor-empty',
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: true, HTMLAttributes: { class: "editor-link" } }),
      Image.configure({ HTMLAttributes: { class: "editor-image" } }),
      CodeBlockLowlight.configure({ lowlight, HTMLAttributes: { class: "code-block" } }),
      MathBlock,
      InlineMath,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Superscript,
      Subscript,
    ],
    content: page.content as any || "",
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      debouncedUpdate({ content: editor.getJSON() });
    },
  });

  const exportMarkdown = useCallback(() => {
    if (!editor) return;
    const md = tiptapToMarkdown(editor.getJSON());
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "untitled"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [editor, title]);

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
    <div className={focusMode ? "fixed inset-0 z-50 bg-background overflow-y-auto" : ""}>
    <div className="max-w-4xl mx-auto w-full group/page">
      {/* Focus mode / export toolbar */}
      <div className="flex items-center justify-end gap-1 px-8 md:px-24 pt-3 opacity-0 group-hover/page:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={exportMarkdown}
          className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs gap-1"
          title="Export as Markdown"
        >
          <Download className="w-3.5 h-3.5" />
          Export .md
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFocusMode((f) => !f)}
          className="text-muted-foreground hover:text-foreground h-7 w-7"
          title={focusMode ? "Exit focus mode (Esc)" : "Focus mode (Ctrl+.)"}
        >
          {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </Button>
      </div>
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
            <EmojiPicker
              value={icon}
              onChange={(newIcon) => {
                setIcon(newIcon);
                updatePage.mutate({ id: page.id, icon: newIcon || null });
              }}
            >
              <button className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 shadow-sm opacity-0 group-hover/icon:opacity-100 transition-opacity">
                <Smile className="w-3 h-3 text-muted-foreground" />
              </button>
            </EmojiPicker>
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
          {editor && <BubbleToolbar editor={editor} />}
          <EditorContent editor={editor} />
        </div>

        {/* Word count + reading time */}
        {wordCount > 0 && (
          <div className="flex items-center gap-3 mt-2 pb-4 text-xs text-muted-foreground/60">
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{readingTime} min read</span>
            </div>
          </div>
        )}
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
    </div>
  );
}
