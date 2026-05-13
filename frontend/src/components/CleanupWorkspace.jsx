import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  FileText,
  FolderOpen,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function CleanupWorkspace({
  files = [],
  currentPath = "/",
  analysisData = {},
  selectedFile,
  getFileStatus,
  getSuggestedName,
  onBack,
  onPreview,
  onRenamePreview,
  onFixAll,
}) {
  const riskyFiles =
    analysisData?.riskyFiles?.length > 0
      ? analysisData.riskyFiles
      : files.filter((file) => getFileStatus(file).includes("Risk"));

  const cleanFiles = Math.max(files.length - riskyFiles.length, 0);

  return (
    <section className="cleanup-workspace">
      <div className="cleanup-hero">
        <button onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>

        <div>
          <span>NAS Cleaning Workspace</span>
          <h2>Safe File Cleanup & Rename Review</h2>
          <p>
            Review risky names, inspect paths, preview changes, and apply safe
            cleanup actions after confirmation.
          </p>
        </div>
      </div>

      <div className="cleanup-summary">
        <div>
          <FolderOpen size={22} />
          <span>Current Path</span>
          <strong>{currentPath}</strong>
        </div>

        <div>
          <FileText size={22} />
          <span>Total Items</span>
          <strong>{files.length}</strong>
        </div>

        <div>
          <ShieldCheck size={22} />
          <span>Clean Items</span>
          <strong>{cleanFiles}</strong>
        </div>

        <div className={riskyFiles.length > 0 ? "cleanup-danger" : ""}>
          <AlertTriangle size={22} />
          <span>Risky Items</span>
          <strong>{riskyFiles.length}</strong>
        </div>
      </div>

      {selectedFile && (
        <div className="cleanup-selected">
          <strong>Selected File Context</strong>
          <span>{selectedFile.name}</span>
          <small>{selectedFile.path}</small>
        </div>
      )}

      <section className="panel cleanup-table-panel">
        <div className="panel-title">
          <h2>Rename Review Queue</h2>

          <button disabled={riskyFiles.length === 0} onClick={onFixAll}>
            <Zap size={16} /> Apply Bulk Fix
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Current Name</th>
                <th>Detected Issue</th>
                <th>Suggested Name</th>
                <th>Path</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {riskyFiles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No risky files detected. This directory is currently clean.
                  </td>
                </tr>
              ) : (
                riskyFiles.map((file, index) => {
                  const suggestedName =
                    file.suggestedName || getSuggestedName(file.name);

                  return (
                    <tr key={`${file.path}-${index}`}>
                      <td className="file-name">{file.name}</td>

                      <td>
                        <span className="risk">
                          {file.risk || "Bad Name"}
                        </span>
                      </td>

                      <td>
                        <strong>{suggestedName}</strong>
                      </td>

                      <td className="file-path-cell">{file.path}</td>

                      <td className="actions">
                        <button
                          title="Preview file"
                          onClick={() => onPreview(file)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          title="Preview rename"
                          onClick={() => onRenamePreview(file)}
                        >
                          <Zap size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}