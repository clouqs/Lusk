import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAskAi } from "@/hooks/use-pages";

export function AiDialog({ 
  isOpen, 
  onClose, 
  pageId, 
  onInsert 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  pageId: number;
  onInsert: (text: string) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const askAi = useAskAi();

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    askAi.mutate({ id: pageId, prompt }, {
      onSuccess: (data) => {
        onInsert(data.text);
        setPrompt("");
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Ask AI to write
          </DialogTitle>
          <DialogDescription>
            Provide a prompt and AI will generate content directly into your page.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea 
            placeholder="Write a blog post about..." 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none border-input focus-visible:ring-purple-500/20"
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={askAi.isPending}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!prompt.trim() || askAi.isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-lg hover:shadow-purple-500/30"
          >
            {askAi.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              "Generate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
