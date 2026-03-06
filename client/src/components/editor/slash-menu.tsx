import { Editor } from "@tiptap/react";
import { Type, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function SlashMenu({ editor, onAiClick }: { editor: Editor; onAiClick: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    const handleTransaction = () => {
      const { state } = editor;
      const { $from } = state.selection;
      const currentLineText = $from.nodeBefore?.textContent;
      const shouldShow = currentLineText === '/';

      if (shouldShow) {
        const coords = editor.view.coordsAtPos(state.selection.from);
        setPosition((prev) => {
          if (prev.top === coords.bottom && prev.left === coords.left) return prev;
          return { top: coords.bottom, left: coords.left };
        });
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    editor.on('transaction', handleTransaction);
    return () => {
      editor.off('transaction', handleTransaction);
    };
  }, [editor]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const { from } = editor.state.selection;
        editor.chain().focus().deleteRange({ from: from - 1, to: from }).run();
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, editor]);

  if (!editor || !isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 50 }}
      className="bg-popover border border-border shadow-lg rounded-xl overflow-hidden flex flex-col w-64 p-1"
    >
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Basic Blocks
      </div>
      
      <MenuButton 
        icon={<Type className="w-4 h-4" />} 
        label="Text" 
        description="Just start typing with plain text."
        onClick={() => {
          editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).setParagraph().run();
          setIsOpen(false);
        }} 
      />
      <MenuButton 
        icon={<Heading1 className="w-4 h-4" />} 
        label="Heading 1" 
        description="Big section heading."
        onClick={() => {
          editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).setHeading({ level: 1 }).run();
          setIsOpen(false);
        }} 
      />
      <MenuButton 
        icon={<Heading2 className="w-4 h-4" />} 
        label="Heading 2" 
        description="Medium section heading."
        onClick={() => {
          editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).setHeading({ level: 2 }).run();
          setIsOpen(false);
        }} 
      />
      <MenuButton 
        icon={<List className="w-4 h-4" />} 
        label="Bullet List" 
        description="Create a simple bulleted list."
        onClick={() => {
          editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleBulletList().run();
          setIsOpen(false);
        }} 
      />
      <MenuButton 
        icon={<CheckSquare className="w-4 h-4" />} 
        label="To-do List" 
        description="Track tasks with a to-do list."
        onClick={() => {
          editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleTaskList().run();
          setIsOpen(false);
        }} 
      />
      <div className="h-px bg-border my-1 mx-2" />
      <MenuButton 
        icon={<Sparkles className="w-4 h-4 text-purple-500" />} 
        label="Ask AI" 
        description="Generate text with AI."
        onClick={() => {
          editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).run();
          setIsOpen(false);
          onAiClick();
        }} 
      />
    </div>,
    document.body
  );
}

function MenuButton({ icon, label, description, onClick }: { icon: React.ReactNode, label: string, description: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 px-2 py-2 hover:bg-accent hover:text-accent-foreground text-left rounded-md transition-colors"
    >
      <div className="bg-background border border-border p-1.5 rounded-md flex-shrink-0 text-foreground">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground truncate w-40">{description}</span>
      </div>
    </button>
  );
}
