import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const EMOJIS: Record<string, string[]> = {
  "📝 Notes": ["📝", "📄", "📃", "📋", "📑", "🗒️", "🗓️", "📅", "📆", "🗑️"],
  "💡 Ideas": ["💡", "🧠", "✨", "🔮", "🎯", "🚀", "⚡", "🌟", "🔥", "💫"],
  "📚 Study": ["📚", "📖", "🎓", "✏️", "🖊️", "📐", "📏", "🔬", "🔭", "🧮"],
  "💼 Work": ["💼", "🏢", "📊", "📈", "📉", "💰", "🤝", "📧", "📞", "🖥️"],
  "🎨 Creative": ["🎨", "🎭", "🎬", "🎵", "🎸", "🎹", "🖌️", "✍️", "🎤", "📸"],
  "🌿 Nature": ["🌿", "🌱", "🍀", "🌸", "🌺", "🌊", "⛰️", "🌙", "☀️", "🌈"],
  "❤️ Feelings": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "😊", "🙏"],
  "🛠️ Tools": ["🛠️", "⚙️", "🔑", "🔒", "🔓", "📌", "📎", "🗂️", "💾", "🖨️"],
  "🍕 Food": ["🍕", "🍔", "☕", "🍵", "🧃", "🍎", "🍇", "🎂", "🍜", "🥗"],
  "🏃 Health": ["🏃", "🏋️", "🧘", "🚴", "⚽", "🏊", "💊", "🩺", "🏥", "💪"],
};

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  children: React.ReactNode;
}

export function EmojiPicker({ value, onChange, children }: EmojiPickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const allEmojis = Object.values(EMOJIS).flat();
  const filtered = search
    ? allEmojis.filter((e) => {
        const term = search.toLowerCase();
        // Match against the section name
        const category = Object.entries(EMOJIS).find(([, arr]) => arr.includes(e))?.[0] || "";
        return category.toLowerCase().includes(term);
      })
    : null;

  const handleSelect = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <Input
          placeholder="Search emoji…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 text-xs mb-2"
          autoFocus
        />
        <div className="max-h-64 overflow-y-auto space-y-2">
          {filtered ? (
            <div className="flex flex-wrap gap-1">
              {filtered.map((e) => (
                <button
                  key={e}
                  onClick={() => handleSelect(e)}
                  className="text-xl p-1 rounded hover:bg-accent transition-colors"
                >
                  {e}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">No results</p>
              )}
            </div>
          ) : (
            Object.entries(EMOJIS).map(([category, emojis]) => (
              <div key={category}>
                <p className="text-xs text-muted-foreground mb-1 px-1">{category}</p>
                <div className="flex flex-wrap gap-0.5">
                  {emojis.map((e) => (
                    <button
                      key={e}
                      onClick={() => handleSelect(e)}
                      className={`text-xl p-1 rounded hover:bg-accent transition-colors ${e === value ? "bg-accent" : ""}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        {value && (
          <div className="pt-2 border-t border-border mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Current: {value}</span>
            <button
              onClick={() => handleSelect("")}
              className="text-xs text-destructive hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
