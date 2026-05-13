import { useMemo, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Database,
  Eye,
  FileText,
  Link2,
  Loader2,
  UploadCloud,
  Zap,
} from "lucide-react";

import DropReadZone from "../components/DropReadZone";
import ApiLinkPanel from "../components/ApiLinkPanel";
import DatabaseLinkPanel from "../components/DatabaseLinkPanel";
import AIProviderPanel from "../components/AIProviderPanel";
import { analyzeConnectedFiles } from "../utils/fileAnalysis";

const API_BASE_URL = "http://localhost:5000";

export default function ConnectAnalyzeScreen({ onBack, addActivity }) {
  const [activeSource, setActiveSource] = useState("files");
  const [connectedFiles, setConnectedFiles] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [sourceLabel, setSourceLabel] = useState("No source connected");

  const riskScore = useMemo(() => {
    if (!analysisData?.totalItems) return 0;
    return Math.round(((analysisData.riskyCount || 0) / analysisData.totalItems) * 100);
  }, [analysisData]);

  const acceptSourceItems = (items, meta = {}) => {
    const result = analyzeConnectedFiles(items, meta);

    setConnectedFiles(result.files);
    setAnalysisData(result.analysis);
    setSelectedFile(result.files[0] || null);
    setSourceLabel(meta.label || meta.type || "Connected Source");

    addActivity?.(
      `Source analyzed: ${result.files.length} item(s), ${result.analysis.riskyCount} risky item(s)`
    );
  };

  const askAIToAnalyze = async () => {
    if (connectedFiles.length === 0) {
      setAiSummary("Connect files, API, database, or AI provider first.");
      return;
    }

    setAiLoading(true);
    setAiSummary("");

    const sampleNames = connectedFiles.slice(0, 10).map((file) => file.name).join(", ");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: `Analyze these connected source files and give improvement suggestions: ${sampleNames}`,
      });

      setAiSummary(response.data?.reply || "AI analysis completed.");
      addActivity?.("AI source analysis completed.");
    } catch {
      const localSummary =
        analysisData?.riskyCount > 0
          ? `Local AI fallback: ${analysisData.riskyCount} risky name(s) detected. Start by renaming: ${analysisData.riskyFiles
              .map((file) => `${file.name} → ${file.suggestedName}`)
              .join(", ")}`
          : "Local AI fallback: source looks clean. No risky names detected.";

      setAiSummary(localSummary);
      addActivity?.("AI fallback analysis completed locally.");
    } finally {
      setAiLoading(false);
    }
  };

  const sourceTabs = [
    { key: "files", label: "Upload / Drop", icon: <UploadCloud size={17} /> },
    { key: "api", label: "API Link", icon: <Link2 size={17} /> },
    { key: "database", label: "Database", icon: <Database size={17} /> },
    { key: "ai", label: "AI Provider", icon: <Bot size={17} /> },
  ];

  return (
    <section className="dm-connect-page">
      <div className="dm-connect-hero">
        <button className="dm-back-btn" onClick={onBack}>
          <ArrowLeft size={17} />
          Back
        </button>

        <div>
          <span className="dm-kicker">
            <Zap size={14} />
            Enterprise Source Intake
          </span>
          <h2>Connect, Read, Upload, Drag & Analyze</h2>
          <p>
            One professional page for local files, API links, database bridge, and AI provider readiness.
            Built as separate modules so the old dashboard stays safe.
          </p>
        </div>
      </div>

      <div className="dm-connect-layout">
        <div className="dm-connect-main">
          <div className="dm-tabs">
            {sourceTabs.map((tab) => (
              <button
                key={tab.key}
                className={activeSource === tab.key ? "active" : ""}
                onClick={() => setActiveSource(tab.key)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {activeSource === "files" && (
            <DropReadZone onFilesReady={acceptSourceItems} addActivity={addActivity} />
          )}

          {activeSource === "api" && (
            <ApiLinkPanel
              apiBaseUrl={API_BASE_URL}
              onItemsReady={acceptSourceItems}
              addActivity={addActivity}
            />
          )}

          {activeSource === "database" && (
            <DatabaseLinkPanel
              apiBaseUrl={API_BASE_URL}
              onItemsReady={acceptSourceItems}
              addActivity={addActivity}
            />
          )}

          {activeSource === "ai" && (
            <AIProviderPanel
              apiBaseUrl={API_BASE_URL}
              onItemsReady={acceptSourceItems}
              addActivity={addActivity}
            />
          )}

          <div className="dm-connected-panel">
            <div className="dm-panel-head">
              <div>
                <h3>Connected Source Files</h3>
                <p>{sourceLabel}</p>
              </div>

              <button onClick={askAIToAnalyze} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="spin" size={16} /> : <Bot size={16} />}
                Ask AI to Analyze
              </button>
            </div>

            {connectedFiles.length === 0 ? (
              <div className="dm-empty-source">
                <FileText size={34} />
                <p>No connected files yet. Upload, drag, connect API, or prepare database.</p>
              </div>
            ) : (
              <div className="dm-source-table-wrap">
                <table className="dm-source-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {connectedFiles.map((file, index) => (
                      <tr
                        key={`${file.path}-${index}`}
                        className={selectedFile?.path === file.path ? "selected-row" : ""}
                        onClick={() => setSelectedFile(file)}
                      >
                        <td>{file.name}</td>
                        <td>{file.type}</td>
                        <td>{file.size}</td>
                        <td>
                          <span className={file.status.includes("Risk") ? "risk" : "safe"}>
                            {file.status}
                          </span>
                        </td>
                        <td>
                          <button className="dm-mini-btn" onClick={() => setSelectedFile(file)}>
                            <Eye size={15} />
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {aiSummary && (
              <div className="dm-ai-summary">
                <Bot size={18} />
                <p>{aiSummary}</p>
              </div>
            )}
          </div>
        </div>

        <aside className="dm-connect-side">
          <div className="dm-summary-card">
            <h3>Analysis Snapshot</h3>

            <div className="dm-summary-grid">
              <div>
                <span>Total</span>
                <strong>{analysisData?.totalItems || 0}</strong>
              </div>

              <div>
                <span>Risk</span>
                <strong>{riskScore}%</strong>
              </div>

              <div>
                <span>Issues</span>
                <strong>{analysisData?.riskyCount || 0}</strong>
              </div>
            </div>

            {riskScore > 0 ? (
              <div className="dm-warning-box">
                <AlertTriangle size={18} />
                <p>Risky file names detected. Rename suggestions are ready.</p>
              </div>
            ) : (
              <div className="dm-success-box">
                <CheckCircle2 size={18} />
                <p>Source is clean or waiting for input.</p>
              </div>
            )}
          </div>

          <div className="dm-summary-card">
            <h3>Selected Item</h3>

            {selectedFile ? (
              <div className="dm-detail-list">
                <p>
                  <span>Name</span>
                  <strong>{selectedFile.name}</strong>
                </p>
                <p>
                  <span>Type</span>
                  <strong>{selectedFile.type}</strong>
                </p>
                <p>
                  <span>Path</span>
                  <strong>{selectedFile.path}</strong>
                </p>
                <p>
                  <span>Suggested</span>
                  <strong>{selectedFile.suggestedName}</strong>
                </p>
              </div>
            ) : (
              <p className="muted">Select an item to view details.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}