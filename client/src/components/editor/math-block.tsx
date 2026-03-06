import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState, useCallback } from "react";
import katex from "katex";
import type { NodeViewProps } from "@tiptap/react";

function MathBlockView({ node, updateAttributes, selected }: NodeViewProps) {
  const [editing, setEditing] = useState(!node.attrs.latex);
  const [draft, setDraft] = useState<string>(node.attrs.latex || "");

  const rendered = (() => {
    const src = node.attrs.latex || "";
    if (!src.trim()) return null;
    try {
      return katex.renderToString(src, { displayMode: true, throwOnError: false, output: "html" });
    } catch {
      return null;
    }
  })();

  const commit = useCallback(() => {
    updateAttributes({ latex: draft });
    setEditing(false);
  }, [draft, updateAttributes]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enter or Escape to commit
    if ((e.key === "Enter" && e.shiftKey) || e.key === "Escape") {
      e.preventDefault();
      commit();
    }
    // Prevent the editor from swallowing these keystrokes
    e.stopPropagation();
  };

  return (
    <NodeViewWrapper
      className={`math-block-wrapper my-3 rounded-lg border border-border overflow-hidden ${selected ? "ring-2 ring-ring" : ""}`}
      data-type="math-block"
    >
      {editing ? (
        <div className="flex flex-col gap-0">
          <div className="bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground font-mono border-b border-border flex items-center justify-between">
            <span>LaTeX equation</span>
            <span className="opacity-60">Shift+Enter to render • Esc to cancel</span>
          </div>
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            placeholder="e.g. E = mc^2 or \frac{-b \pm \sqrt{b^2-4ac}}{2a}"
            className="w-full resize-none bg-background font-mono text-sm p-3 outline-none min-h-[80px]"
            rows={3}
          />
        </div>
      ) : (
        <div
          className="px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => {
            setDraft(node.attrs.latex || "");
            setEditing(true);
          }}
          title="Click to edit equation"
        >
          {rendered ? (
            <div
              className="katex-display-wrapper overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: rendered }}
            />
          ) : (
            <div className="text-muted-foreground text-sm italic py-2">
              Click to enter a LaTeX equation…
            </div>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}

export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      latex: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="math-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ "data-type": "math-block" }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockView);
  },
});
