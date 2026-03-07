import type { Editor } from "@tiptap/react";
import {
  Bold, Italic, Underline, Strikethrough, Code,
  Highlighter, Link2, Link2Off, AlignLeft, AlignCenter, AlignRight,
  Superscript, Subscript, Palette,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Green", value: "#22c55e" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
  { label: "Gray", value: "#6b7280" },
];

function ColorPicker({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-popover border border-border rounded-lg shadow-xl p-2 z-50 w-40"
    >
      <p className="text-xs text-muted-foreground mb-1.5 px-1">Text color</p>
      <div className="grid grid-cols-4 gap-1">
        {TEXT_COLORS.map(({ label, value }) => (
          <button
            key={label}
            title={label}
            onMouseDown={(e) => {
              e.preventDefault();
              if (value) {
                editor.chain().focus().setColor(value).run();
              } else {
                editor.chain().focus().unsetColor().run();
              }
              onClose();
            }}
            className="w-7 h-7 rounded-md border border-border hover:scale-110 transition-transform flex items-center justify-center"
            style={{ backgroundColor: value || "transparent" }}
          >
            {!value && <span className="text-xs text-foreground font-bold" style={{ textDecoration: "line-through", textDecorationColor: "#ef4444" }}>A</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BubbleToolbar({ editor }: { editor: Editor }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [linkMode, setLinkMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [colorMode, setColorMode] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const updateVisibility = () => {
      const { from, to } = editor.state.selection;
      if (from === to || (editor.state.selection as any).node) {
        setVisible(false);
        return;
      }
      try {
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        const midX = (start.left + end.left) / 2;
        setPos({ top: start.top - 52, left: midX });
        setVisible(true);
      } catch {
        setVisible(false);
      }
    };

    const hide = () => setVisible(false);

    editor.on("selectionUpdate", updateVisibility);
    editor.on("blur", hide);

    return () => {
      editor.off("selectionUpdate", updateVisibility);
      editor.off("blur", hide);
    };
  }, [editor]);

  const setLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().setLink({ href: url }).run();
    }
    setLinkMode(false);
    setLinkUrl("");
  };

  if (!visible) return null;

  const ac = "bg-accent text-accent-foreground";
  const btn = "p-1.5 rounded hover:bg-accent hover:text-accent-foreground transition-colors";

  return createPortal(
    <div
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9998, transform: "translateX(-50%)" }}
      className="relative flex items-center gap-0.5 bg-popover border border-border rounded-lg shadow-xl px-1.5 py-1"
      onMouseDown={(e) => e.preventDefault()}
    >
      {linkMode ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setLink();
              if (e.key === "Escape") { setLinkMode(false); setLinkUrl(""); }
            }}
            placeholder="https://example.com"
            className="text-sm bg-background border border-input rounded px-2 py-0.5 outline-none w-44"
          />
          <button className={`${btn} text-xs px-2`} onClick={setLink}>Apply</button>
          <button className={btn} onClick={() => { setLinkMode(false); setLinkUrl(""); }}></button>
        </div>
      ) : (
        <>
          <button className={`${btn} ${editor.isActive("bold") ? ac : ""}`} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button className={`${btn} ${editor.isActive("italic") ? ac : ""}`} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button className={`${btn} ${editor.isActive("underline") ? ac : ""}`} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button className={`${btn} ${editor.isActive("strike") ? ac : ""}`} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button className={`${btn} ${editor.isActive("code") ? ac : ""}`} onClick={() => editor.chain().focus().toggleCode().run()} title="Code">
            <Code className="w-3.5 h-3.5" />
          </button>
          <button className={`${btn} ${editor.isActive("highlight") ? ac : ""}`} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight">
            <Highlighter className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button className={`${btn} ${editor.isActive("superscript") ? ac : ""}`} onClick={() => editor.chain().focus().toggleSuperscript().run()} title="Superscript">
            <Superscript className="w-3.5 h-3.5" />
          </button>
          <button className={`${btn} ${editor.isActive("subscript") ? ac : ""}`} onClick={() => editor.chain().focus().toggleSubscript().run()} title="Subscript">
            <Subscript className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <div className="relative">
            <button className={`${btn} ${colorMode ? ac : ""}`} onClick={() => setColorMode((m) => !m)} title="Text color">
              <Palette className="w-3.5 h-3.5" />
            </button>
            {colorMode && <ColorPicker editor={editor} onClose={() => setColorMode(false)} />}
          </div>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button
            className={`${btn} ${editor.isActive("link") ? ac : ""}`}
            onClick={() => {
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              } else {
                setLinkUrl(editor.getAttributes("link").href || "");
                setLinkMode(true);
              }
            }}
            title="Link"
          >
            {editor.isActive("link") ? <Link2Off className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button className={`${btn} ${editor.isActive({ textAlign: "left" }) ? ac : ""}`} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Left">
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button className={`${btn} ${editor.isActive({ textAlign: "center" }) ? ac : ""}`} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Center">
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button className={`${btn} ${editor.isActive({ textAlign: "right" }) ? ac : ""}`} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Right">
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>,
    document.body
  );
}
