import {
  Bot,
  CheckCircle2,
  Database,
  FolderOpen,
  Server,
  ShieldCheck,
  X,
} from "lucide-react";

function StatusDetailsModal({ status, data, onClose }) {
  const item = status || data;

  if (!item) return null;

  const iconMap = {
    backend: <Server />,
    nas: <Database />,
    ai: <Bot />,
    path: <FolderOpen />,
  };

  const technicalMap = {
    backend: [
      "Node.js API expected on port 5000",
      "Used by /api/files, /api/chat, and rename operations",
      "Safe fallback keeps UI alive if a route is missing",
    ],
    nas: [
      "Current mode: Mock / SMB-ready",
      "Can be extended to SMB, API bridge, or cloud storage",
      "Read operations are separated from destructive operations",
    ],
    ai: [
      "Command parser is active",
      "Azure/OpenAI-ready architecture",
      "Fallback response protects demo stability",
    ],
    path: [
      "Current directory is controlled by File Explorer",
      "Breadcrumb and scan actions use this path",
      "Folder navigation can load nested paths",
    ],
  };

  return (
    <div className="modal-backdrop">
      <div className="confirm-modal status-details-modal premium-status-modal">
        <button className="close-btn" onClick={onClose}>
          <X />
        </button>

        <div className="modal-icon">{iconMap[item.type] || <ShieldCheck />}</div>

        <h2>{item.title}</h2>
        <p>{item.description}</p>

        <div className="status-detail-box">
          <strong>Current Value:</strong>
          <span>{item.value}</span>
        </div>

        <div className="status-tech-list">
          {(technicalMap[item.type] || []).map((text, index) => (
            <div key={index}>
              <CheckCircle2 size={16} />
              <span>{text}</span>
            </div>
          ))}
        </div>

        <div className="modal-actions one">
          <button className="primary" onClick={onClose}>
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusDetailsModal;