import {
  Bot,
  Eye,
  FileText,
  FolderOpen,
  HardDrive,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export default function FileDecisionPanel({
  selectedFile,
  currentPath,
  analysisData,
  onPreview,
  onRenamePreview,
  onAnalyzeFile,
  onOpenChat,
  onOpenCleanup,
  onFixAll,
}) {
  const riskyFiles = analysisData?.riskyFiles || [];
  const hasRisk = riskyFiles.length > 0;

  return (
    <section className="panel decision-panel">
      <div className="decision-header">
        <div>
          <span className="decision-kicker">
            <Sparkles size={14} /> AI File Decision Layer
          </span>
          <h2>File Control Center</h2>
          <p>
            Select files, inspect paths, preview details, analyze risk, and move to a
            dedicated cleanup workspace.
          </p>
        </div>

        <span className={hasRisk ? "decision-risk" : "decision-safe"}>
          {hasRisk ? "Action Needed" : "Clean"}
        </span>
      </div>

      <div className="decision-grid">
        <div className="decision-tile">
          <HardDrive size={18} />
          <span>Current Path</span>
          <strong>{currentPath}</strong>
        </div>

        <div className="decision-tile">
          <FolderOpen size={18} />
          <span>Loaded Items</span>
          <strong>{analysisData?.totalItems ?? 0}</strong>
        </div>

        <div className="decision-tile">
          <ShieldCheck size={18} />
          <span>Risky Files</span>
          <strong>{analysisData?.riskyCount ?? 0}</strong>
        </div>
      </div>

      <div className="decision-selected">
        <FileText size={20} />
        <div>
          <span>Selected File Context</span>
          {selectedFile ? (
            <>
              <strong>
                {selectedFile.name} • {selectedFile.type} • {selectedFile.size}
              </strong>
              <small>{selectedFile.path}</small>
            </>
          ) : (
            <>
              <strong>No file selected</strong>
              <small>Select a row from the File Explorer first.</small>
            </>
          )}
        </div>
      </div>

      <div className="decision-actions">
        <button disabled={!selectedFile} onClick={() => onPreview(selectedFile)}>
          <Eye size={16} /> Preview
        </button>

        <button disabled={!selectedFile} onClick={() => onRenamePreview(selectedFile)}>
          <Zap size={16} /> Rename Preview
        </button>

        <button disabled={!selectedFile} onClick={() => onAnalyzeFile(selectedFile)}>
          <Bot size={16} /> Analyze File
        </button>

        <button onClick={onOpenChat}>
          <MessageSquare size={16} /> Open AI Chat
        </button>

        <button onClick={onOpenCleanup}>
          <ShieldCheck size={16} /> Cleanup Workspace
        </button>

        {hasRisk && (
          <button className="danger-action" onClick={onFixAll}>
            <Zap size={16} /> Fix All Risks
          </button>
        )}
      </div>
    </section>
  );
}