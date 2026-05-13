import {
  Bot,
  Database,
  FileText,
  FolderOpen,
  HardDrive,
  Loader2,
  Search,
  Send,
  Zap,
} from "lucide-react";

export default function ProChatPanel({
  currentPath,
  setCurrentPath,
  files,
  selectedFile,
  analysisData,
  chat,
  message,
  setMessage,
  sendingMessage,
  sendMessage,
  openConfirmModal,
  fixAllBadNames,
  addActivity,
}) {
  const riskCount = analysisData?.riskyCount || 0;

  const selectedSummary = selectedFile
    ? `${selectedFile.name} • ${selectedFile.type} • ${selectedFile.size}`
    : "No file selected";

  const analyzeSelectedFile = () => {
    if (!selectedFile) {
      addActivity("No selected file to analyze");
      return;
    }

    sendMessage(
      `Analyze selected file: ${selectedFile.name} at ${selectedFile.path}. Explain type, naming risk, suggested action, and safe rename if needed.`
    );
  };

  return (
    <section className="panel chat-panel pro-chat-panel">
      <div className="panel-title pro-chat-header">
        <div>
          <h2>AI Command Center</h2>
          <p className="pro-chat-subtitle">
            Ask, analyze paths, inspect selected files, and trigger safe NAS actions.
          </p>
        </div>

        <div className="pro-chat-status">
          <span className="online">Online</span>
          <span>Path: {currentPath}</span>
        </div>
      </div>

      <div className="pro-chat-metrics">
        <div>
          <span>Current Path</span>
          <strong>{currentPath}</strong>
        </div>

        <div>
          <span>Loaded Items</span>
          <strong>{files.length}</strong>
        </div>

        <div>
          <span>Selected File</span>
          <strong>{selectedFile ? "1" : "0"}</strong>
        </div>

        <div className={riskCount > 0 ? "metric-risk" : "metric-safe"}>
          <span>Risk Issues</span>
          <strong>{riskCount}</strong>
        </div>
      </div>

      <div className="pro-path-control">
        <div>
          <label>NAS Path</label>
          <input
            value={currentPath}
            onChange={(event) => setCurrentPath(event.target.value)}
            placeholder="/Work"
          />
        </div>

        <button
          onClick={() =>
            openConfirmModal({
              operation: "Load Files From AI Command Center",
              targetPath: currentPath,
              description:
                "This will load and analyze files from the current NAS path.",
              onConfirmAction: "load_files",
            })
          }
        >
          <HardDrive size={16} />
          Load Path
        </button>

        <button
          onClick={() =>
            sendMessage(
              `Analyze current NAS path ${currentPath}. Give risks, folder structure, naming issues, suggested fixes, and next action.`
            )
          }
        >
          <Bot size={16} />
          Analyze Path
        </button>
      </div>

      <div className="pro-selected-context">
        <FileText size={18} />

        <div>
          <span>Selected File Context</span>
          <strong>{selectedSummary}</strong>
          {selectedFile && <small>{selectedFile.path}</small>}
        </div>
      </div>

      <div className="chat-box pro-chat-box">
        {chat.map((item, index) => (
          <div key={index} className={`chat-message ${item.sender}`}>
            <p>{item.text}</p>
            <span>{item.time}</span>
          </div>
        ))}
      </div>

      <div className="quick-actions pro-quick-actions">
        <button onClick={() => sendMessage(`Show files in ${currentPath}`)}>
          <FolderOpen size={15} />
          Show Current Path
        </button>

        <button onClick={analyzeSelectedFile}>
          <Bot size={15} />
          Analyze Selected File
        </button>

        <button
          onClick={() =>
            sendMessage(
              `Analyze current loaded files. Count: ${files.length}. Current path: ${currentPath}. Give risks and suggested actions.`
            )
          }
        >
          <Database size={15} />
          Analyze Loaded Files
        </button>

        <button onClick={() => sendMessage("Find bad file names")}>
          <Search size={15} />
          Find Bad Names
        </button>

        <button onClick={fixAllBadNames}>
          <Zap size={15} />
          Fix All Bad Names
        </button>

        <button
          onClick={() =>
            sendMessage(
              `Generate a short technical report for current NAS path ${currentPath}. Include total files, risky names, selected file, and recommended next steps.`
            )
          }
        >
          <FileText size={15} />
          Generate Report
        </button>
      </div>

      <div className="chat-input pro-chat-input">
        <input
          placeholder={`Ask AI about ${currentPath}...`}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
        />

        <button onClick={() => sendMessage()} disabled={sendingMessage}>
          {sendingMessage ? <Loader2 className="spin" /> : <Send />}
        </button>
      </div>
    </section>
  );
}