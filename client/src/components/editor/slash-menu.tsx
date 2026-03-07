import { Editor } from "@tiptap/react";
import {
  Type, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare,
  Sparkles, Code2, Quote, Minus, Image as ImageIcon, Sigma, Table2,
  AlertCircle,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface SlashItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  keywords?: string[];
  action: (editor: Editor) => void;
}

function buildItems(onAiClick: () => void): SlashItem[] {
  return [
    {
      icon: <Type className="w-4 h-4" />,
      label: "Text",
      description: "Start typing with plain text.",
      keywords: ["paragraph", "text", "p"],
      action: (e) => e.chain().focus().setParagraph().run(),
    },
    {
      icon: <Heading1 className="w-4 h-4" />,
      label: "Heading 1",
      description: "Big section heading.",
      keywords: ["h1", "heading", "title"],
      action: (e) => e.chain().focus().setHeading({ level: 1 }).run(),
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      label: "Heading 2",
      description: "Medium section heading.",
      keywords: ["h2", "heading", "subtitle"],
      action: (e) => e.chain().focus().setHeading({ level: 2 }).run(),
    },
    {
      icon: <Heading3 className="w-4 h-4" />,
      label: "Heading 3",
      description: "Small section heading.",
      keywords: ["h3", "heading"],
      action: (e) => e.chain().focus().setHeading({ level: 3 }).run(),
    },
    {
      icon: <List className="w-4 h-4" />,
      label: "Bullet List",
      description: "Create a bulleted list.",
      keywords: ["ul", "unordered", "list", "bullet"],
      action: (e) => e.chain().focus().toggleBulletList().run(),
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      label: "Numbered List",
      description: "Create a numbered list.",
      keywords: ["ol", "ordered", "list", "number"],
      action: (e) => e.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: <CheckSquare className="w-4 h-4" />,
      label: "To-do List",
      description: "Track tasks with checkboxes.",
      keywords: ["todo", "task", "check", "checkbox"],
      action: (e) => e.chain().focus().toggleTaskList().run(),
    },
    {
      icon: <Quote className="w-4 h-4" />,
      label: "Quote",
      description: "Capture a quote or callout.",
      keywords: ["blockquote", "quote", "cite"],
      action: (e) => e.chain().focus().setBlockquote().run(),
    },
    {
      icon: <Code2 className="w-4 h-4" />,
      label: "Code Block",
      description: "Code with syntax highlighting.",
      keywords: ["code", "pre", "syntax", "snippet"],
      action: (e) => e.chain().focus().setCodeBlock().run(),
    },
    {
      icon: <Sigma className="w-4 h-4" />,
      label: "Math Equation",
      description: "Insert a LaTeX math block.",
      keywords: ["math", "latex", "equation", "formula", "katex", "block"],
      action: (e) =>
        e.chain().focus().insertContent({ type: "mathBlock", attrs: { latex: "" } }).run(),
    },
    {
      icon: <span className="w-4 h-4 font-serif font-bold text-xs flex items-center justify-center">∑</span>,
      label: "Inline Math",
      description: "Insert an inline LaTeX formula.",
      keywords: ["math", "latex", "inline", "formula", "katex", "equation"],
      action: (e) =>
        e.chain().focus().insertContent({ type: "inlineMath", attrs: { latex: "" } }).run(),
    },
    {
      icon: <Table2 className="w-4 h-4" />,
      label: "Table",
      description: "Insert a table with rows and columns.",
      keywords: ["table", "grid", "spreadsheet", "rows", "columns"],
      action: (e) =>
        e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      icon: <ImageIcon className="w-4 h-4" />,
      label: "Image",
      description: "Embed an image from a URL.",
      keywords: ["image", "img", "photo", "picture"],
      action: (e) => {
        const url = window.prompt("Paste an image URL:");
        if (url) e.chain().focus().setImage({ src: url }).run();
      },
    },
    {
      icon: <Minus className="w-4 h-4" />,
      label: "Divider",
      description: "Insert a horizontal rule.",
      keywords: ["hr", "divider", "rule", "separator", "line"],
      action: (e) => e.chain().focus().setHorizontalRule().run(),
    },
    {
      icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
      label: "Callout",
      description: "Highlight important information.",
      keywords: ["callout", "info", "note", "warning", "alert"],
      action: (e) =>
        e.chain().focus().setBlockquote().run(),
    },
    {
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      label: "Ask AI",
      description: "Generate text with AI.",
      keywords: ["ai", "gpt", "generate", "assistant"],
      action: (_e) => onAiClick(),
    },
  ];
}

export function SlashMenu({ editor, onAiClick }: { editor: Editor; onAiClick: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef("");

  const items = buildItems(onAiClick);

  const filtered = query.trim()
    ? items.filter((it) => {
        const q = query.toLowerCase();
        return (
          it.label.toLowerCase().includes(q) ||
          it.description.toLowerCase().includes(q) ||
          it.keywords?.some((k) => k.toLowerCase().includes(q))
        );
      })
    : items;

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    queryRef.current = "";
    setActiveIndex(0);
  }, []);

  // Delete the slash + typed query from the editor before executing
  const deleteSlashQuery = useCallback(() => {
    const { from } = editor.state.selection;
    const removeLen = queryRef.current.length + 1; // +1 for "/"
    editor.chain().focus().deleteRange({ from: from - removeLen, to: from }).run();
  }, [editor]);

  const executeItem = useCallback((item: SlashItem) => {
    deleteSlashQuery();
    item.action(editor);
    close();
  }, [deleteSlashQuery, editor, close]);

  useEffect(() => {
    if (!editor) return;

    const handleTransaction = () => {
      const { state } = editor;
      const { $from } = state.selection;
      const textBefore = $from.nodeBefore?.textContent || "";

      const slashIdx = textBefore.lastIndexOf("/");
      if (slashIdx === -1) {
        if (isOpen) close();
        return;
      }

      const afterSlash = textBefore.slice(slashIdx + 1);
      if (afterSlash.includes(" ")) {
        if (isOpen) close();
        return;
      }

      queryRef.current = afterSlash;
      setQuery(afterSlash);
      setActiveIndex(0);

      if (!isOpen) {
        const coords = editor.view.coordsAtPos(state.selection.from);
        setPosition({ top: coords.bottom + 8, left: coords.left });
        setIsOpen(true);
      }
    };

    editor.on("transaction", handleTransaction);
    return () => { editor.off("transaction", handleTransaction); };
  }, [editor, isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[activeIndex]) executeItem(filtered[activeIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        deleteSlashQuery();
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => { document.removeEventListener("keydown", handleKeyDown, true); };
  }, [isOpen, filtered, activeIndex, executeItem, deleteSlashQuery, close]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        deleteSlashQuery();
        close();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [isOpen, deleteSlashQuery, close]);

  useEffect(() => {
    if (!menuRef.current) return;
    const activeEl = menuRef.current.querySelector("[data-active='true']");
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!editor || !isOpen) return null;

  const groups = [
    { label: "Basic Blocks", keys: ["Text", "Heading 1", "Heading 2", "Heading 3", "Bullet List", "Numbered List", "To-do List"] },
    { label: "Content", keys: ["Quote", "Code Block", "Math Equation", "Inline Math", "Table", "Image", "Divider", "Callout"] },
    { label: "AI", keys: ["Ask AI"] },
  ];

  const groupedItems = query.trim()
    ? [{ label: "Results", items: filtered }]
    : groups
        .map((g) => ({ label: g.label, items: filtered.filter((it) => g.keys.includes(it.label)) }))
        .filter((g) => g.items.length > 0);

  return createPortal(
    <div
      ref={menuRef}
      style={{ position: "fixed", top: position.top, left: position.left, zIndex: 9999 }}
      className="bg-popover border border-border shadow-xl rounded-xl overflow-hidden flex flex-col w-72 max-h-96 overflow-y-auto p-1"
    >
      {groupedItems.map((group) => (
        <div key={group.label}>
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {group.label}
          </div>
          {group.items.map((item) => {
            const idx = filtered.indexOf(item);
            return (
              <MenuButton
                key={item.label}
                icon={item.icon}
                label={item.label}
                description={item.description}
                isActive={idx === activeIndex}
                onClick={() => executeItem(item)}
              />
            );
          })}
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="px-3 py-4 text-sm text-muted-foreground text-center">
          No results for "{query}"
        </div>
      )}
    </div>,
    document.body
  );
}

function MenuButton({
  icon,
  label,
  description,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      data-active={isActive ? "true" : "false"}
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-2 py-2 hover:bg-accent hover:text-accent-foreground text-left rounded-md transition-colors ${isActive ? "bg-accent text-accent-foreground" : ""}`}
    >
      <div className="bg-background border border-border p-1.5 rounded-md flex-shrink-0 text-foreground">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground truncate">{description}</span>
      </div>
    </button>
  );
}
