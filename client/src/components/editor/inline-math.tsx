import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";
import katex from "katex";
import type { NodeViewProps } from "@tiptap/react";

function InlineMathView({ node, updateAttributes, selected }: NodeViewProps) {
  const [editing, setEditing] = useState(!node.attrs.latex);
  const [draft, setDraft] = useState<string>(node.attrs.latex || "");

  const rendered = (() => {
    const src = node.attrs.latex || "";
    if (!src.trim()) return null;
    try {
      return katex.renderToString(src, { displayMode: false, throwOnError: false, output: "html" });
    } catch {
      return null;
    }
  })();

  const commit = () => {
    updateAttributes({ latex: draft });
    setEditing(false);
  };

  if (editing) {
    return (
      <NodeViewWrapper as="span" className="inline-math-edit">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              commit();
            }
          }}
          onBlur={commit}
          placeholder="e.g. E=mc^2"
          className="inline-math-input font-mono text-sm bg-muted border border-border rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-ring"
          style={{ width: Math.max(draft.length * 8 + 40, 100) + "px" }}
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      as="span"
      className={`inline-math cursor-pointer rounded px-0.5 hover:bg-muted/50 transition-colors ${selected ? "ring-1 ring-ring" : ""}`}
      onClick={() => {
        setDraft(node.attrs.latex || "");
        setEditing(true);
      }}
      title="Click to edit inline equation"
    >
      {rendered ? (
        <span dangerouslySetInnerHTML={{ __html: rendered }} />
      ) : (
        <span className="text-muted-foreground italic text-sm">$…$</span>
      )}
    </NodeViewWrapper>
  );
}

export const InlineMath = Node.create({
  name: "inlineMath",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="inline-math"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes({ "data-type": "inline-math" }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineMathView);
  },

  // Typing $$E=mc^2$$ auto-converts to an inline math node
  addInputRules() {
    return [
      nodeInputRule({
        find: /\$\$([^\$\n]+)\$\$$/,
        type: this.type,
        getAttributes: (match) => ({ latex: match[1] }),
      }),
    ];
  },
});
