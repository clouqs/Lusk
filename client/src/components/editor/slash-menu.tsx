import { Editor } from "@tiptap/react";
import { FloatingMenu } from "@tiptap/extension-floating-menu";
import { Type, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Sparkles } from "lucide-react";
import { useState } from "react";

export function SlashMenu({ editor, onAiClick }: { editor: Editor; onAiClick: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!editor) return null;

  return (
    <FloatingMenu 
      editor={editor} 
      tippyOptions={{ duration: 100, placement: 'bottom-start' }}
      shouldShow={({ state }) => {
        const { $from } = state.selection;
        const currentLineText = $from.nodeBefore?.textContent;
        return currentLineText === '/';
      }}
    >
      <div className="bg-popover border border-border shadow-lg rounded-xl overflow-hidden flex flex-col w-64 p-1 z-50">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Basic Blocks
        </div>
        
        <MenuButton 
          icon={<Type className="w-4 h-4" />} 
          label="Text" 
          description="Just start typing with plain text."
          onClick={() => {
            editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).setParagraph().run();
          }} 
        />
        <MenuButton 
          icon={<Heading1 className="w-4 h-4" />} 
          label="Heading 1" 
          description="Big section heading."
          onClick={() => {
            editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).setHeading({ level: 1 }).run();
          }} 
        />
        <MenuButton 
          icon={<Heading2 className="w-4 h-4" />} 
          label="Heading 2" 
          description="Medium section heading."
          onClick={() => {
            editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).setHeading({ level: 2 }).run();
          }} 
        />
        <MenuButton 
          icon={<List className="w-4 h-4" />} 
          label="Bullet List" 
          description="Create a simple bulleted list."
          onClick={() => {
            editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleBulletList().run();
          }} 
        />
        <MenuButton 
          icon={<CheckSquare className="w-4 h-4" />} 
          label="To-do List" 
          description="Track tasks with a to-do list."
          onClick={() => {
            editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleTaskList().run();
          }} 
        />
        <div className="h-px bg-border my-1 mx-2" />
        <MenuButton 
          icon={<Sparkles className="w-4 h-4 text-purple-500" />} 
          label="Ask AI" 
          description="Generate text with AI."
          onClick={() => {
            editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).run();
            onAiClick();
          }} 
        />
      </div>
    </FloatingMenu>
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
