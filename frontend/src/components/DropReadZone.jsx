import { useRef, useState } from "react";
import { FileUp, UploadCloud } from "lucide-react";

export default function DropReadZone({ onFilesReady, addActivity }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList) => {
    const fileArray = Array.from(fileList || []);

    if (fileArray.length === 0) return;

    const items = fileArray.map((file) => ({
      name: file.name,
      type: file.type || "file",
      size: file.size,
      sizeBytes: file.size,
      path: `/LocalUpload/${file.name}`,
      modifiedDate: new Date(file.lastModified).toLocaleString(),
      source: "local_upload",
    }));

    addActivity?.(`Local upload prepared: ${items.length} file(s)`);
    onFilesReady?.(items, {
      type: "local_upload",
      label: "Local Drag & Drop",
    });
  };

  return (
    <div
      className={`dm-drop-zone ${isDragging ? "dragging" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(event) => handleFiles(event.target.files)}
      />

      <UploadCloud size={44} />
      <h3>Drag & Drop Files Here</h3>
      <p>or click to upload files for reading and analysis.</p>

      <button type="button">
        <FileUp size={16} />
        Choose Files
      </button>
    </div>
  );
}