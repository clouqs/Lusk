## Packages
@tiptap/react | Core React wrapper for TipTap editor
@tiptap/pm | ProseMirror library required by TipTap
@tiptap/starter-kit | Essential TipTap extensions
@tiptap/extension-placeholder | Placeholder support for TipTap
@tiptap/extension-floating-menu | Floating menu for slash commands
@tiptap/extension-bubble-menu | Bubble menu for text formatting
@tiptap/extension-task-list | Notion-like task lists
@tiptap/extension-task-item | Notion-like task items
@tiptap/extension-link | Link support for editor
@tiptap/extension-image | Image support for editor
date-fns | Date formatting for database view

## Notes
- Assumes `@shared/routes` and `@shared/schema` are properly exported.
- Implements a debounced auto-save using React's useEffect, no external debounce library needed.
- TipTap is used for the rich text editor to provide a block-like experience similar to Notion.
