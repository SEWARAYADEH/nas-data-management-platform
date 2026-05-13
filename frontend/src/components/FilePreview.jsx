import { FileText, FileVideo, Folder, Image, X } from "lucide-react";

function getPreviewType(file) {
  if (!file) return "unknown";

  const name = file.name?.toLowerCase() || "";
  const type = file.type?.toLowerCase() || "";

  if (type === "folder") return "folder";
  if (type.includes("image") || name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image";
  if (type.includes("video") || name.endsWith(".mp4")) return "video";
  if (type.includes("pdf") || name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".json")) return "json";

  return "unknown";
}

export default function FilePreview({ file, onClose }) {
  if (!file) return null;

  const previewType = getPreviewType(file);

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>

        <div className="preview-header">
          <div>
            <h2>{file.name}</h2>
            <p>{file.type} • {file.size}</p>
          </div>

          <button className="preview-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="preview-content">

          {previewType === "folder" && (
            <div className="preview-placeholder">
              <Folder size={44} />
              <h3>Folder</h3>
              <p>Open this folder from explorer to view contents.</p>
            </div>
          )}

          {previewType === "image" && (
            <div className="preview-placeholder">
              <Image size={44} />
              <h3>Image Preview Ready</h3>
              <p>Connect real image URL in Phase 2.</p>
            </div>
          )}

          {previewType === "video" && (
            <div className="preview-placeholder">
              <FileVideo size={44} />
              <h3>Video File</h3>
              <p>Streaming will be enabled later.</p>
            </div>
          )}

          {previewType === "pdf" && (
            <iframe
              title="PDF Preview"
              src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
              className="preview-frame"
            />
          )}

          {previewType === "json" && (
            <pre className="json-preview">
{JSON.stringify(file, null, 2)}
            </pre>
          )}

          {previewType === "unknown" && (
            <div className="preview-placeholder">
              <FileText size={44} />
              <h3>No Preview</h3>
              <p>This file type supports metadata only.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}