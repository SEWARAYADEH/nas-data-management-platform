import { X, Server, Bot, FolderOpen, Database } from "lucide-react";

function StatusDetailsModal({ status, onClose }) {
  if (!status) return null;

  const iconMap = {
    backend: <Server />,
    nas: <Database />,
    ai: <Bot />,
    path: <FolderOpen />,
  };

  return (
    <div className="modal-backdrop">
      <div className="confirm-modal status-details-modal">
        <button className="close-btn" onClick={onClose}>
          <X />
        </button>

        <div className="modal-icon">{iconMap[status.type]}</div>

        <h2>{status.title}</h2>
        <p>{status.description}</p>

        <div className="status-detail-box">
          <strong>Status:</strong>
          <span>{status.value}</span>
        </div>

        <div className="modal-actions one">
          <button className="primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusDetailsModal;