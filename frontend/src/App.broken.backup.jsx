import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

import FilePreview from "./components/FilePreview";
import ContextMenu from "./components/ContextMenu";
import ConnectAnalyzeScreen from "./screens/ConnectAnalyzeScreen";
import StatusDetailsModal from "./components/StatusDetailsModal";

import logo from "./assets/logo.png";

import {
  CheckSquare,
  Square,
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  Database,
  Eye,
  FileText,
  FileVideo,
  Folder,
  FolderOpen,
  HardDrive,
  Loader2,
  Menu,
  MoreVertical,
  RefreshCw,
  Search,
  Send,
  Server,
  Settings,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./App.css";
const API_BASE_URL = "http://localhost:5000";

const SCREENS = {
  CONNECT: "connect" ,
  OVERVIEW: "overview",
  FILES: "files",
  AI: "ai",
  OPERATIONS: "operations",
  REPORTS: "reports",
  SETTINGS: "settings",
  AUDIT: "audit",
  
};
const [analysisData, setAnalysisData] = useState({});
const INITIAL_CHAT = [
  {
    sender: "ai",
    text: "Hello! I am your NAS assistant. Try: Show files in /Work",
    time: "Ready",
  },
];

const INITIAL_LOGS = [
  "System initialized",
  "Frontend dashboard loaded",
  "Backend connection ready",
];

function getCurrentTime() {
  return new Date().toLocaleTimeString();
}

function normalizeFile(file) {
  return {
    name: file.name || "Unknown",
    type: file.type || "file",
    size: file.size || "-",
    path: file.path || "/",
    modifiedDate: file.modifiedDate || file.modifiedAt || "-",
  };
}

function getFileStatus(file) {
  if (!file) return "Unknown";
  const name = file.name?.toLowerCase() || "";

  if (name.includes("final_final") || name.includes("untitled")) {
    return "Risk: Bad Name";
  }

  return "Safe";
}

function getSuggestedAction(file) {
  if (!file) return "No action selected.";

  if (getFileStatus(file).includes("Risk")) {
    return "Rename recommended";
  }

  if (file.type?.toLowerCase() === "folder") {
    return "Folder structure looks valid";
  }

  return "No action required";
}

function getSuggestedName(fileName) {
  if (!fileName) return "";

  return fileName
    .replace(/final_final/gi, "final")
    .replace(/untitled/gi, "named_file")
    .replace(/__+/g, "_")
    .replace(/--+/g, "-");
}

function App() {
  const [statusModal, setStatusModal] = useState(null);
const [previousScreen, setPreviousScreen] = useState(SCREENS.OVERVIEW);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeScreen, setActiveScreen] = useState(SCREENS.OVERVIEW);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("/");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState(INITIAL_CHAT);
  const [activityLog, setActivityLog] = useState(INITIAL_LOGS);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");

  const addActivity = (text) => {
    setActivityLog((prev) => [`${getCurrentTime()} — ${text}`, ...prev]);
  };
const goToScreen = (screen) => {
  setPreviousScreen(activeScreen);
  setActiveScreen(screen);
};

const openStatusDetails = (type) => {
  const data = {
    backend: {
      type: "backend",
      title: "Backend Service",
      value: "Online",
      description: "Node.js backend is running and responding on port 5000.",
    },
    nas: {
      type: "nas",
      title: "NAS Mode",
      value: "Mock / SMB Ready",
      description:
        "Current mode uses mock NAS data. The architecture is ready for SMB or external NAS APIs.",
    },
    ai: {
      type: "ai",
      title: "AI Assistant",
      value: "Active",
      description:
        "AI command parsing is active with fallback mode to keep the system stable.",
    },
    path: {
      type: "path",
      title: "Current Path",
      value: currentPath,
      description: "This is the current directory path used by file operations.",
    },
  };

  setStatusModal(data[type]);
};
  const openConfirmModal = ({
    operation,
    targetPath = currentPath,
    description = "This operation will read folder contents only.",
    onConfirmAction = "load_files",
  }) => {
    setModal({
      operation,
      targetPath,
      description,
      onConfirmAction,
    });
  };

  const loadFiles = async (path = currentPath) => {
    setLoadingFiles(true);
    setError("");

    try {
      const response = await axios.get(`${API_BASE_URL}/api/files`, {
        params: { path },
      });

      const loadedFiles = (response.data.data || []).map(normalizeFile);

      setFiles(loadedFiles);
      setCurrentPath(path);
      setSelectedFile(loadedFiles[0] || null);

      addActivity(`Files loaded from ${path} successfully (${loadedFiles.length} items)`);
    } catch (err) {
      setError("Unable to load files. Please make sure the backend server is running.");
      addActivity("Error: failed to load files");
    } finally {
      setLoadingFiles(false);
    }
  };

  const confirmOperation = async () => {
  if (!modal) return;

  addActivity(`Confirmation accepted: ${modal.operation} for ${modal.targetPath}`);

  try {
    // 🔹 Load Files
    if (modal.onConfirmAction === "load_files") {
      await loadFiles(modal.targetPath);
    }

    // 🔥 Rename الحقيقي
    if (modal.onConfirmAction === "rename_file") {
      if (!selectedFile) {
        addActivity("No file selected");
        return;
      }

      const newName = getSuggestedName(selectedFile.name);

      // API CALL
      await axios.post(`${API_BASE_URL}/api/files/rename`, {
        oldPath: modal.targetPath,
        newName,
      });

      // Update UI
      const updatedFiles = files.map((file) => {
        if (file.path === modal.targetPath) {
          const newPath = file.path.replace(file.name, newName);
          return {
            ...file,
            name: newName,
            path: newPath,
          };
        }
        return file;
      });

      setFiles(updatedFiles);

      setSelectedFile({
        ...selectedFile,
        name: newName,
        path: modal.targetPath.replace(selectedFile.name, newName),
      });

      addActivity(`File renamed: ${selectedFile.name} → ${newName}`);
    }

  } catch (err) {
    console.error(err);
    addActivity("Operation failed");
  } finally {
    setModal(null);
  }
};

 
  const fixAllBadNames = () => {
    const riskyFiles = files.filter((file) => getFileStatus(file).includes("Risk"));

    if (riskyFiles.length === 0) {
      addActivity("No risky file names found");
      return;
    }

    const updatedFiles = files.map((file) => {
      if (getFileStatus(file).includes("Risk")) {
        const newName = getSuggestedName(file.name);

        return {
          ...file,
          name: newName,
          path: file.path.replace(file.name, newName),
        };
      }

      return file;
    });

    setFiles(updatedFiles);

    if (selectedFile) {
      const updatedSelectedFile = updatedFiles.find(
        (file) =>
          file.path ===
          selectedFile.path.replace(selectedFile.name, getSuggestedName(selectedFile.name))
      );

      setSelectedFile(updatedSelectedFile || selectedFile);
    }

    addActivity(`AI Bulk Rename simulation applied to ${riskyFiles.length} risky file(s)`);
  };

 const handleAIAction = (aiResponse) => {
  const { type, path } = aiResponse;

  switch (type) {
    // case "list_files":
    //   openConfirmModal({
    //     operation: "AI Load Files Operation",
    //     targetPath: path || currentPath,
    //     description:
    //       "AI requested to load files from this path. Confirm to proceed.",
    //     onConfirmAction: "load_files",
    //   });
    //   break;
case "list_files":
  loadFiles(path || currentPath);
  addActivity(`AI auto-loaded files from ${path || currentPath}`);
  break;
    case "fix_all":
      fixAllBadNames();
      break;

    case "analysis":
      addActivity("AI analysis triggered");
      break;

    default:
      // text فقط
      break;
  }
};

const sendMessage = async (customMessage) => {
  const userMessage = (customMessage || message).trim();
  if (!userMessage) return;

  setSendingMessage(true);

  setChat((prev) => [
    ...prev,
    {
      sender: "user",
      text: userMessage,
      time: new Date().toLocaleTimeString(),
    },
  ]);

  try {
    const response = await axios.post(`${API_BASE_URL}/api/chat`, {
      message: userMessage,
    });

    const aiData = response.data;

    setChat((prev) => [
      ...prev,
      {
        sender: "ai",
        text: aiData.reply,
        time: new Date().toLocaleTimeString(),
      },
    ]);

    addActivity(`AI command: ${aiData.type}`);

    // 🔥 هنا الذكاء الحقيقي
    handleAIAction(aiData);

  } catch (err) {
    setChat((prev) => [
      ...prev,
      {
        sender: "ai",
        text: "AI service unavailable.",
        time: new Date().toLocaleTimeString(),
      },
    ]);

    addActivity("AI error");
  } finally {
    setSendingMessage(false);
    setMessage("");
  }
};

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || file.type.toLowerCase() === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [files, searchTerm, typeFilter]);

  const stats = useMemo(() => {
    const folders = files.filter((file) => file.type.toLowerCase() === "folder").length;
    const riskyFiles = files.filter((file) => getFileStatus(file).includes("Risk")).length;

    return {
      totalItems: files.length,
      folders,
      storage: "245 MB",
      aiCommands: chat.filter((item) => item.sender === "user").length,
      riskyFiles,
    };
  }, [files, chat]);

  const insights = useMemo(() => {
    return {
      riskyCount: stats.riskyFiles,
      message:
        stats.riskyFiles > 0
          ? `${stats.riskyFiles} risky file(s) detected`
          : "All file names look clean",
      recommendation:
        stats.riskyFiles > 0
          ? "Run Bulk Fix to clean naming issues"
          : "No action needed",
    };
  }, [stats.riskyFiles]);

  const renderStats = () => (
    <>
      <section className="stats-grid">
        <div className="stat-card">
          <FolderOpen />
          <div>
            <span>Total Items</span>
            <strong>{stats.totalItems}</strong>
          </div>
        </div>

        <div className="stat-card">
          <Folder />
          <div>
            <span>Folders</span>
            <strong>{stats.folders}</strong>
          </div>
        </div>

        <div className="stat-card">
          <Database />
          <div>
            <span>Storage Scanned</span>
            <strong>{stats.storage}</strong>
          </div>
        </div>

        <div className="stat-card">
          <Bot />
          <div>
            <span>AI Commands</span>
            <strong>{stats.aiCommands}</strong>
          </div>
        </div>
      </section>

      <section className="panel insight-banner">
        <div>
          <h3>AI Insights</h3>
          <p>
            <strong>Status:</strong> {insights.message}
          </p>
          <p>
            <strong>Recommendation:</strong> {insights.recommendation}
          </p>
        </div>

        {insights.riskyCount > 0 && (
          <button onClick={fixAllBadNames}>
            <Zap size={16} /> Apply Fix Automatically
          </button>
        )}
      </section>
    </>
  );

  const renderFileExplorer = () => (
    <section className="panel file-panel">
      <div className="panel-title">
        <h2>File Explorer</h2>

        <div className="panel-actions">
          <button
            onClick={() =>
              openConfirmModal({
                operation: "Load Files Operation",
                targetPath: currentPath,
                onConfirmAction: "load_files",
              })
            }
          >
            <RefreshCw size={16} /> Load Files
          </button>

          <button onClick={fixAllBadNames}>
            <Zap size={16} /> Fix All Bad Names
          </button>
        </div>
      </div>

      <div className="toolbar">
        <input value={currentPath} onChange={(e) => setCurrentPath(e.target.value)} />

        <button
          onClick={() =>
            openConfirmModal({
              operation: "Scan Directory",
              targetPath: currentPath,
              description:
                "This operation will scan the selected directory for files and folders.",
              onConfirmAction: "load_files",
            })
          }
        >
          <HardDrive size={16} /> Scan Directory
        </button>

        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="folder">Folders</option>
          <option value="video">Videos</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Path</th>
              <th>Modified</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loadingFiles ? (
              <tr>
                <td colSpan="7" className="loading-cell">
                  <Loader2 className="spin" /> Loading files...
                </td>
              </tr>
            ) : filteredFiles.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-cell">
                  No files loaded yet. Click Load Files.
                </td>
              </tr>
            ) : (
              filteredFiles.map((file, index) => {
                const status = getFileStatus(file);
                const isRisk = status.includes("Risk");

                return (
                  <tr
                    key={`${file.name}-${index}`}
                    className={selectedFile?.path === file.path ? "selected-row" : ""}
                    onClick={() => setSelectedFile(file)}
                  >
                    <td className="file-name">
                      {file.type.toLowerCase() === "folder" ? <Folder /> : <FileVideo />}
                      {file.name}
                    </td>
                    <td>{file.type}</td>
                    <td>{file.size}</td>
                    <td>{file.path}</td>
                    <td>{file.modifiedDate}</td>
                    <td>
                      <span
                        className={isRisk ? "risk" : "safe"}
                        title={isRisk ? "Poor naming detected" : "Safe file"}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file);
                        }}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file);
                          openConfirmModal({
                            operation: "Preview Rename Simulation",
                            targetPath: file.path,
                            description:
                              "This preview will simulate renaming the selected file. No real NAS file will be modified.",
                          onConfirmAction: "rename_file",
                          });
                        }}
                      >
                        <MoreVertical size={16} />
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
  );
const renderChatPanel = () => {
  const riskCount = analysisData?.riskyCount || 0;

  const selectedSummary = selectedFile
    ? `${selectedFile.name} • ${selectedFile.type} • ${selectedFile.size}`
    : "No file selected";

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
          <span>Selected</span>
          <strong>{selectedPaths.length}</strong>
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
            onChange={(e) => setCurrentPath(e.target.value)}
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

        <button
          onClick={() =>
            selectedFile
              ? sendMessage(
                  `Analyze selected file: ${selectedFile.name} at ${selectedFile.path}. Explain type, naming risk, suggested action, and safe rename if needed.`
                )
              : addActivity("No selected file to analyze")
          }
        >
          <Bot size={15} />
          Analyze Selected File
        </button>

        <button
          onClick={() =>
            sendMessage(
              `Analyze selected files count: ${selectedPaths.length}. Current path: ${currentPath}. Give risks and suggested actions.`
            )
          }
        >
          <Database size={15} />
          Analyze Selected Group
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
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={() => sendMessage()} disabled={sendingMessage}>
          {sendingMessage ? <Loader2 className="spin" /> : <Send />}
        </button>
      </div>
    </section>
  );
};

  const renderFileDetails = () => (
    <section className="panel details-panel">
      <h2>File Details</h2>

      {selectedFile ? (
        <>
          <div className="details-header">
            {selectedFile.type.toLowerCase() === "folder" ? <Folder /> : <FileText />}
            <strong>{selectedFile.name}</strong>
          </div>

          <p>
            <span>Type:</span> {selectedFile.type}
          </p>
          <p>
            <span>Size:</span> {selectedFile.size}
          </p>
          <p>
            <span>Path:</span> {selectedFile.path}
          </p>
          <p>
            <span>Modified:</span> {selectedFile.modifiedDate}
          </p>

          <p>
            <span>Status:</span>
            <strong
              className={
                getFileStatus(selectedFile).includes("Risk")
                  ? "details-risk"
                  : "details-safe"
              }
            >
              {getFileStatus(selectedFile)}
            </strong>
          </p>

          <p>
            <span>Suggested Action:</span>
            <strong>{getSuggestedAction(selectedFile)}</strong>
          </p>

          {getFileStatus(selectedFile).includes("Risk") && (
            <div className="insight-box">
              <strong>AI Insight</strong>
              <p>Poor naming pattern detected.</p>
              <p>
                Suggested Name: <strong>{getSuggestedName(selectedFile.name)}</strong>
              </p>
            </div>
          )}

          <button
            className="full-btn"
            onClick={() =>
              openConfirmModal({
                operation: "Preview Rename Simulation",
                targetPath: selectedFile.path,
                description:
                  "This operation simulates the suggested rename and does not modify real NAS files.",
               onConfirmAction: "rename_file",
              })
            }
          >
            Preview Rename Simulation
          </button>
        </>
      ) : (
        <p className="muted">Select a file to view details.</p>
      )}
    </section>
  );

  const renderActivityLog = () => (
    <section className="panel log-panel">
      <div className="panel-title">
        <h2>Activity Log</h2>
        <button onClick={() => setActivityLog([])}>Clear</button>
      </div>

      <div className="log-list">
        {activityLog.map((item, index) => (
          <div key={index} className="log-item">
            <span></span>
            {item}
          </div>
        ))}
      </div>
    </section>
  );

  const renderOperationsScreen = () => (
    <section className="screen-stack">
      <section className="panel screen-panel">
        <h2>Operations Center</h2>
        <p>
          Manage safe file operations through preview, confirmation, and simulation.
        </p>

        <div className="operation-grid">
          <button onClick={fixAllBadNames}>
            <Zap size={18} /> Bulk Fix Bad Names
          </button>
          <button
            onClick={() =>
              openConfirmModal({
                operation: "Scan Directory",
                targetPath: currentPath,
                description: "Scan the current NAS path for files and folders.",
                onConfirmAction: "load_files",
              })
            }
          >
            <HardDrive size={18} /> Scan Current Path
          </button>
          <button
            onClick={() =>
              selectedFile
                ? openConfirmModal({
                    operation: "Preview Rename Simulation",
                    targetPath: selectedFile.path,
                    description: "Preview safe rename simulation for the selected file.",
                    onConfirmAction: "preview_only",
                  })
                : addActivity("No file selected for preview operation")
            }
          >
            <FileText size={18} /> Preview Selected File
          </button>
        </div>
      </section>

      {renderActivityLog()}
    </section>
  );

  const renderReportsScreen = () => (
    <section className="screen-stack">
      <section className="panel screen-panel">
        <h2>Reports</h2>
        <div className="report-grid">
          <div>
            <strong>Total Items</strong>
            <span>{stats.totalItems}</span>
          </div>
          <div>
            <strong>Folders</strong>
            <span>{stats.folders}</span>
          </div>
          <div>
            <strong>Risky Files</strong>
            <span>{stats.riskyFiles}</span>
          </div>
          <div>
            <strong>AI Commands</strong>
            <span>{stats.aiCommands}</span>
          </div>
        </div>
      </section>

      {renderActivityLog()}
    </section>
  );

  const renderSettingsScreen = () => (
    <section className="panel screen-panel">
      <h2>Settings</h2>

      <div className="settings-grid">
        <div>
          <strong>Backend API</strong>
          <span>{API_BASE_URL}</span>
        </div>
        <div>
          <strong>NAS Mode</strong>
          <span>Mock / SMB Ready</span>
        </div>
        <div>
          <strong>AI Mode</strong>
          <span>Safe fallback + command engine</span>
        </div>
        <div>
          <strong>Current Path</strong>
          <span>{currentPath}</span>
        </div>
      </div>
    </section>
  );

 const renderMainContent = () => {
  if (activeScreen === SCREENS.FILES) {
    return (
      <div className="content-grid">
        {renderFileExplorer()}
        <aside className="right-column">{renderFileDetails()}</aside>
      </div>
    );
  }

  if (activeScreen === SCREENS.AI) {
    return (
      <div className="content-grid">
        {renderChatPanel()}
        <aside className="right-column">{renderFileDetails()}</aside>
      </div>
    );
  }

  if (activeScreen === SCREENS.OPERATIONS) {
    return renderOperationsScreen();
  }

  if (activeScreen === SCREENS.REPORTS) {
    return renderReportsScreen();
  }

  if (activeScreen === SCREENS.SETTINGS) {
    return renderSettingsScreen();
  }

  if (activeScreen === SCREENS.AUDIT) {
    return renderActivityLog();
  }

  if (activeScreen === SCREENS.CONNECT) {
    return (
      <ConnectAnalyzeScreen
        onBack={() => setActiveScreen(previousScreen)}
        addActivity={addActivity}
      />
    );
  }

  return (
    <>
      {renderStats()}

      {error && (
        <div className="error-box">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div className="overview-layout">
        <div className="overview-left">
          {renderFileExplorer()}
          {renderActivityLog()}
        </div>

        <aside className="overview-right">
          {renderChatPanel()}
          {renderFileDetails()}
        </aside>
      </div>
    </>
  );
};
  return (
   <div className={`app-shell ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
     <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="brand">
          <Menu size={22} onClick={() => setSidebarOpen(!sidebarOpen)} />
          <div>
         <img src={logo} alt="NAS Logo" className="logo-img" />
            {/* <span>Command Center</span> */}
          </div>
        </div>

<nav className="nav-menu">

  <button
    title="Overview"
    className={activeScreen === SCREENS.OVERVIEW ? "active" : ""}
    onClick={() =>  goToScreen(SCREENS.OVERVIEW)}
  >
    <BarChart3 size={18} />
    <span>Overview</span>
  </button>

  <button
    title="File Explorer"
    className={activeScreen === SCREENS.FILES ? "active" : ""}
    onClick={() =>  goToScreen(SCREENS.FILES)}
  >
    <Folder size={18} />
    <span>File Explorer</span>
  </button>

  <button
    title="AI Assistant"
    className={activeScreen === SCREENS.AI ? "active" : ""}
    onClick={() =>  goToScreen(SCREENS.AI)}
  >
    <Bot size={18} />
    <span>AI Assistant</span>
  </button>

  <button
    title="Operations"
    className={activeScreen === SCREENS.OPERATIONS ? "active" : ""}
    onClick={() => goToScreen(SCREENS.OPERATIONS)}
  >
    <Zap size={18} />
    <span>Operations</span>
  </button>

  <button
    title="Reports"
    className={activeScreen === SCREENS.REPORTS ? "active" : ""}
    onClick={() => goToScreen(SCREENS.REPORTS)}
  >
    <Activity size={18} />
    <span>Reports</span>
  </button>

  <button
    title="Settings"
    className={activeScreen === SCREENS.SETTINGS ? "active" : ""}
    onClick={() => goToScreen(SCREENS.SETTINGS)}
  >
    <Settings size={18} />
    <span>Settings</span>
  </button>

  <button
    title="Audit Log"
    className={activeScreen === SCREENS.AUDIT ? "active" : ""}
    onClick={() => goToScreen(SCREENS.AUDIT)}
  >
    <ShieldCheck size={18} />
    <span>Audit Log</span>
  </button>
<button
  title="Connect Data"
  className={activeScreen === SCREENS.CONNECT ? "active" : ""}
  onClick={() => goToScreen(SCREENS.CONNECT)}
>
  <Database size={18} />
  <span>Connect Data</span>
</button>
</nav>
        <div className="side-card">
          <h4>Storage Overview</h4>
          <div className="storage-circle">32%</div>
          <p>245.6 GB / 768 GB</p>
        </div>

        <div className="side-card small">
          <h4>NAS Connection</h4>
          <p>
            <span className="dot green"></span> Connected
          </p>
          <p>Protocol: SMB</p>
          <p>Mode: Mock</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>NAS Data Management Platform</h1>
            <p>AI-Powered File Operations Command Center</p>
          </div>

          <div className="status-row">
            <span>
              <CheckCircle2 size={16} /> Backend: Online
            </span>
            <span>
              <Server size={16} /> NAS Mode: Mock
            </span>
            <span>
              <Bot size={16} /> AI: Active
            </span>
            <span>
              <FolderOpen size={16} /> Path: {currentPath}
            </span>
          </div>
        </header>

        {renderMainContent()}
      </main>

      {modal && (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <button className="close-btn" onClick={() => setModal(null)}>
              <X />
            </button>

            <div className="modal-icon">?</div>

            <h2>Confirm Operation</h2>
            <p>
              <strong>Operation:</strong> {modal.operation}
            </p>
            <p>
              <strong>Target Path:</strong> {modal.targetPath}
            </p>
            <p>{modal.description}</p>

            <div className="modal-actions">
              <button onClick={() => setModal(null)}>Cancel</button>
              <button className="primary" onClick={confirmOperation}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;