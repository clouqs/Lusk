import { useState } from "react";
import type { Page } from "@shared/schema";
import { useUpdatePage } from "@/hooks/use-pages";
import { Plus, GripVertical, Type, Calendar, CheckSquare, AlignLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DatabaseView({ page }: { page: Page }) {
  const [title, setTitle] = useState(page.title || "Untitled Database");
  const updatePage = useUpdatePage();
  const [search, setSearch] = useState("");

  // Safely parse properties or default to an empty array
  const properties = Array.isArray(page.properties) ? page.properties : [];
  
  // A notion database usually consists of child pages
  // For simplicity, we just render the generic property editor here,
  // representing a simple table of data.
  // In a full implementation, each row would be a child Page.
  
  const [rows, setRows] = useState<any[]>(
    Array.isArray(page.content) ? page.content : [{ id: '1', title: 'First Item', tags: 'Idea', done: false }]
  );

  const saveDatabase = (newRows: any[]) => {
    setRows(newRows);
    updatePage.mutate({ id: page.id, content: newRows as any });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    updatePage.mutate({ id: page.id, title: e.target.value });
  };

  const addRow = () => {
    saveDatabase([...rows, { id: Date.now().toString(), title: '', tags: '', done: false }]);
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-8 md:px-12 pt-24 pb-32">
      <Input
        value={title}
        onChange={handleTitleChange}
        className="text-4xl md:text-5xl font-bold bg-transparent border-none shadow-none h-auto px-0 rounded-none focus-visible:ring-0 mb-8"
        placeholder="Untitled Database"
      />

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button size="sm" onClick={addRow} className="ml-auto">
          <Plus className="w-4 h-4 mr-2" /> New
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground">
            <tr>
              <th className="font-normal py-2 px-4 w-[40px]"></th>
              <th className="font-normal py-2 px-4 w-[300px]">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4" /> Name
                </div>
              </th>
              <th className="font-normal py-2 px-4 w-[200px]">
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4" /> Tags
                </div>
              </th>
              <th className="font-normal py-2 px-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" /> Done
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.filter(r => r.title.toLowerCase().includes(search.toLowerCase())).map((row, index) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30 group">
                <td className="py-2 px-4 text-muted-foreground/30 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
                <td className="py-2 px-4 font-medium text-foreground">
                  <input 
                    className="bg-transparent border-none outline-none w-full"
                    value={row.title}
                    placeholder="Empty"
                    onChange={e => {
                      const newRows = [...rows];
                      newRows[index].title = e.target.value;
                      saveDatabase(newRows);
                    }}
                  />
                </td>
                <td className="py-2 px-4">
                  <input 
                    className="bg-transparent border-none outline-none w-full text-muted-foreground"
                    value={row.tags}
                    placeholder="Empty"
                    onChange={e => {
                      const newRows = [...rows];
                      newRows[index].tags = e.target.value;
                      saveDatabase(newRows);
                    }}
                  />
                </td>
                <td className="py-2 px-4">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    checked={row.done}
                    onChange={e => {
                      const newRows = [...rows];
                      newRows[index].done = e.target.checked;
                      saveDatabase(newRows);
                    }}
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4">
        <Button variant="ghost" size="sm" onClick={addRow} className="text-muted-foreground hover:text-foreground">
          <Plus className="w-4 h-4 mr-2" /> Add row
        </Button>
      </div>
    </div>
  );
}
