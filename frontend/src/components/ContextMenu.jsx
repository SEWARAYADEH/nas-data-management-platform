import { Bot, Edit3, Eye, Trash2 } from "lucide-react";

export default function ContextMenu({
  menu,
  onClose,
  onOpen,
  onRename,
  onAnalyze,
  onDelete,
}) {
  if (!menu?.visible) return null;

  return (
    <div
      className="context-menu"
      style={{ top: menu.y, left: menu.x }}
      onMouseLeave={onClose}
    >
      <button onClick={onOpen}>
        <Eye size={15} /> Open Preview
      </button>

      <button onClick={onRename}>
        <Edit3 size={15} /> Rename with AI
      </button>

      <button onClick={onAnalyze}>
        <Bot size={15} /> Analyze File
      </button>

      <button className="danger-menu" onClick={onDelete}>
        <Trash2 size={15} /> Delete Mock
      </button>
    </div>
  );
}