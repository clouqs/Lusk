type TipTapNode = {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
};

function renderText(node: TipTapNode): string {
  if (!node.text) return "";
  let text = node.text;
  const marks = node.marks || [];

  // Code mark gets priority (no nested styling inside code)
  if (marks.some((m) => m.type === "code")) return `\`${text}\``;

  if (marks.some((m) => m.type === "bold")) text = `**${text}**`;
  if (marks.some((m) => m.type === "italic")) text = `_${text}_`;
  if (marks.some((m) => m.type === "strike")) text = `~~${text}~~`;
  if (marks.some((m) => m.type === "underline")) text = `<u>${text}</u>`;
  if (marks.some((m) => m.type === "superscript")) text = `<sup>${text}</sup>`;
  if (marks.some((m) => m.type === "subscript")) text = `<sub>${text}</sub>`;

  const link = marks.find((m) => m.type === "link");
  if (link) text = `[${text}](${link.attrs?.href || ""})`;

  return text;
}

function renderNodes(nodes: TipTapNode[] = []): string {
  return nodes.map(renderNode).join("");
}

function renderNode(node: TipTapNode): string {
  switch (node.type) {
    case "doc":
      return renderNodes(node.content);

    case "text":
      return renderText(node);

    case "paragraph":
      return renderNodes(node.content) + "\n\n";

    case "heading": {
      const level = node.attrs?.level || 1;
      const prefix = "#".repeat(level) + " ";
      return prefix + renderNodes(node.content) + "\n\n";
    }

    case "bulletList":
      return (
        (node.content?.map((item) => "- " + renderNodes(item.content).replace(/\n+$/, "") + "\n").join("") || "") +
        "\n"
      );

    case "orderedList":
      return (
        (node.content?.map((item, i) => `${i + 1}. ` + renderNodes(item.content).replace(/\n+$/, "") + "\n").join("") || "") +
        "\n"
      );

    case "listItem":
      return renderNodes(node.content);

    case "taskList":
      return (
        (node.content?.map((item) => {
          const checked = item.attrs?.checked ? "[x]" : "[ ]";
          return `- ${checked} ` + renderNodes(item.content).replace(/\n+$/, "") + "\n";
        }).join("") || "") + "\n"
      );

    case "taskItem":
      return renderNodes(node.content);

    case "blockquote":
      return (
        renderNodes(node.content)
          .split("\n")
          .map((l) => (l ? `> ${l}` : ">"))
          .join("\n") + "\n"
      );

    case "codeBlock": {
      const lang = node.attrs?.language || "";
      const code = node.content?.map((n) => n.text || "").join("") || "";
      return `\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
    }

    case "mathBlock":
      return `$$\n${node.attrs?.latex || ""}\n$$\n\n`;

    case "inlineMath":
      return `$${node.attrs?.latex || ""}$`;

    case "image":
      return `![${node.attrs?.alt || ""}](${node.attrs?.src || ""})\n\n`;

    case "horizontalRule":
      return `---\n\n`;

    case "hardBreak":
      return "  \n";

    case "table": {
      const rows = node.content || [];
      if (rows.length === 0) return "";
      const firstRow = rows[0].content || [];
      const header =
        "| " + firstRow.map((cell) => renderNodes(cell.content).replace(/\n+/g, " ").trim()).join(" | ") + " |";
      const sep = "| " + firstRow.map(() => "---").join(" | ") + " |";
      const body = rows
        .slice(1)
        .map((row) => {
          const cells = row.content || [];
          return "| " + cells.map((cell) => renderNodes(cell.content).replace(/\n+/g, " ").trim()).join(" | ") + " |";
        })
        .join("\n");
      return [header, sep, body].filter(Boolean).join("\n") + "\n\n";
    }

    default:
      return renderNodes(node.content);
  }
}

export function tiptapToMarkdown(doc: unknown): string {
  return renderNode(doc as TipTapNode).trimEnd();
}
