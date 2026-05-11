import { useRef, useState } from "react";
import {
  UploadCloud,
  Link,
  Database,
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function ConnectAnalyzeScreen({ onBack, addActivity }) {
  const fileInputRef = useRef(null);
  const [apiUrl, setApiUrl] = useState("");
  const [files, setFiles] = useState([]);
  const [connectionType, setConnectionType] = useState("api");
  const [status, setStatus] = useState("Ready to connect a data source");

  const handleFiles = (selectedFiles) => {
    const mappedFiles = Array.from(selectedFiles).map((file) => ({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type || "unknown",
      source: "Local Upload",
    }));

    setFiles((prev) => [...prev, ...mappedFiles]);
    setStatus(`${mappedFiles.length} file(s) added for analysis`);
    addActivity?.(`${mappedFiles.length} uploaded file(s) added for analysis`);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const handleApiConnect = () => {
    if (!apiUrl.trim()) {
      setStatus("Please enter a valid API link");
      return;
    }

    setFiles((prev) => [
      ...prev,
      {
        name: "External API Data Source",
        size: "Remote",
        type: "API Link",
        source: apiUrl,
      },
    ]);

    setStatus("API link registered successfully");
    addActivity?.(`API data source connected: ${apiUrl}`);
  };

  return (
    <section className="connect-page">
      <div className="connect-hero">
        <button className="connect-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>

        <div>
          <span className="connect-kicker">
            <Sparkles size={16} /> Enterprise Data Intake
          </span>
          <h2>Connect & Analyze Data Sources</h2>
          <p>
            Upload files, drag and drop datasets, or connect an external API
            endpoint for NAS analysis and AI-assisted inspection.
          </p>
        </div>
      </div>

      <div className="connect-grid">
        <div className="connect-main-card">
          <div className="connect-tabs">
            <button
              className={connectionType === "api" ? "active" : ""}
              onClick={() => setConnectionType("api")}
            >
              <Link size={18} /> API Link
            </button>

            <button
              className={connectionType === "upload" ? "active" : ""}
              onClick={() => setConnectionType("upload")}
            >
              <UploadCloud size={18} /> Upload Files
            </button>

            <button
              className={connectionType === "database" ? "active" : ""}
              onClick={() => setConnectionType("database")}
            >
              <Database size={18} /> Database Ready
            </button>
          </div>

          {connectionType === "api" && (
            <div className="connect-box">
              <div className="connect-box-title">
                <Link size={22} />
                <div>
                  <h3>Read Files From API</h3>
                  <p>Register an endpoint that returns file metadata or datasets.</p>
                </div>
              </div>

              <div className="api-row">
                <input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://example.com/files-api"
                />
                <button onClick={handleApiConnect}>
                  <Link size={16} /> Connect
                </button>
              </div>
            </div>
          )}

          {connectionType === "upload" && (
            <div
              className="drop-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={48} />
              <h3>Drag & Drop Files Here</h3>
              <p>or click to browse local files for analysis</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
          )}

          {connectionType === "database" && (
            <div className="connect-box">
              <div className="connect-box-title">
                <Database size={22} />
                <div>
                  <h3>Database Integration Ready</h3>
                  <p>
                    Prepared for PostgreSQL, MongoDB, MySQL, enterprise APIs, or
                    future NAS indexing services.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="connect-side-card">
          <h3>Connection Status</h3>
          <div className="analysis-status">
            {files.length > 0 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{status}</span>
          </div>

          <div className="connect-capability">
            <ShieldCheck size={18} />
            <span>Safe intake layer: no destructive operation runs automatically.</span>
          </div>

          <div className="connect-capability">
            <Database size={18} />
            <span>Ready for API, file upload, and database integration.</span>
          </div>
        </aside>
      </div>

      <section className="connected-files">
        <div className="connected-header">
          <h3>Connected Data Sources</h3>
          <span>{files.length} source(s)</span>
        </div>

        {files.length === 0 ? (
          <div className="empty-source">
            <FileText size={28} />
            <p>No files or sources connected yet.</p>
          </div>
        ) : (
          <div className="connected-list">
            {files.map((file, index) => (
              <div className="connected-item" key={`${file.name}-${index}`}>
                <FileText size={18} />
                <div>
                  <strong>{file.name}</strong>
                  <span>
                    {file.type} • {file.size} • {file.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default ConnectAnalyzeScreen;