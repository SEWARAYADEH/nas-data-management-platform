export function formatBytes(value) {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "string") return value;

  const bytes = Number(value);
  if (Number.isNaN(bytes)) return "-";
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, index);

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[index]}`;
}

export function detectFileType(name = "", type = "") {
  const value = `${name} ${type}`.toLowerCase();

  if (value.includes("folder")) return "folder";
  if (value.includes("pdf") || value.endsWith(".pdf")) return "pdf";
  if (value.includes("image") || /\.(png|jpg|jpeg|webp|gif)$/i.test(name)) return "image";
  if (value.includes("video") || /\.(mp4|mov|avi|mkv)$/i.test(name)) return "video";
  if (value.includes("json") || name.toLowerCase().endsWith(".json")) return "json";
  if (/\.(csv|xlsx|xls)$/i.test(name)) return "data";
  if (/\.(js|jsx|ts|tsx|py|php|java|cpp|cs)$/i.test(name)) return "code";
  if (/\.(doc|docx|txt|md)$/i.test(name)) return "document";

  return type || "file";
}

export function getSuggestedCleanName(fileName = "") {
  if (!fileName) return "clean_file";

  const lastDot = fileName.lastIndexOf(".");
  const hasExtension = lastDot > 0;
  const base = hasExtension ? fileName.slice(0, lastDot) : fileName;
  const ext = hasExtension ? fileName.slice(lastDot) : "";

  let cleanBase = base
    .replace(/final_final/gi, "final")
    .replace(/untitled/gi, "named_file")
    .replace(/copy\s*\(\d+\)/gi, "")
    .replace(/\s+-\s+copy/gi, "")
    .replace(/\s+/g, "_")
    .replace(/__+/g, "_")
    .replace(/--+/g, "-")
    .replace(/^[_-]+|[_-]+$/g, "");

  if (!cleanBase) cleanBase = "clean_file";

  return `${cleanBase}${ext}`;
}

export function detectRisk(fileName = "") {
  const lower = fileName.toLowerCase();

  if (lower.includes("final_final")) {
    return {
      isRisk: true,
      risk: "Bad Name",
      suggestedName: getSuggestedCleanName(fileName),
    };
  }

  if (lower.includes("untitled")) {
    return {
      isRisk: true,
      risk: "Untitled File",
      suggestedName: getSuggestedCleanName(fileName),
    };
  }

  if (lower.includes("copy") || lower.includes("نسخة")) {
    return {
      isRisk: true,
      risk: "Duplicate Copy Name",
      suggestedName: getSuggestedCleanName(fileName),
    };
  }

  if (fileName.length > 75) {
    return {
      isRisk: true,
      risk: "Very Long Name",
      suggestedName: getSuggestedCleanName(fileName.slice(0, 65)),
    };
  }

  return {
    isRisk: false,
    risk: "Safe",
    suggestedName: fileName,
  };
}

export function normalizeConnectedFile(item = {}, sourceMeta = {}) {
  const name =
    item.name ||
    item.filename ||
    item.fileName ||
    item.title ||
    item.id ||
    "connected_item.json";

  const type = detectFileType(name, item.type || item.mimeType || item.kind || "file");
  const sizeBytes = typeof item.size === "number" ? item.size : Number(item.sizeBytes || 0);

  const path =
    item.path ||
    item.url ||
    `/${sourceMeta.type || "Source"}/${String(name).replaceAll(" ", "_")}`;

  const risk = detectRisk(String(name));

  return {
    name: String(name),
    type,
    size: item.size || formatBytes(sizeBytes),
    sizeBytes,
    path,
    modifiedDate:
      item.modifiedDate ||
      item.modifiedAt ||
      item.lastModified ||
      new Date().toLocaleString(),
    source: sourceMeta.type || item.source || "connected",
    status: risk.isRisk ? `Risk: ${risk.risk}` : "Safe",
    risk: risk.risk,
    suggestedName: risk.suggestedName,
    content: item.content || item,
  };
}

export function analyzeConnectedFiles(items = [], sourceMeta = {}) {
  const files = items.map((item) => normalizeConnectedFile(item, sourceMeta));

  const riskyFiles = files
    .filter((file) => file.status.includes("Risk"))
    .map((file) => ({
      name: file.name,
      path: file.path,
      risk: file.risk,
      suggestedName: file.suggestedName,
    }));

  const fileTypes = files.reduce((acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + 1;
    return acc;
  }, {});

  const largestItem =
    files.length > 0
      ? [...files].sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0))[0]
      : null;

  const folders = files.filter((file) => file.type === "folder").length;

  return {
    files,
    analysis: {
      totalItems: files.length,
      folders,
      files: files.length - folders,
      riskyCount: riskyFiles.length,
      riskyFiles,
      fileTypes,
      largestItem,
      insights: [
        `Connected source contains ${files.length} item(s).`,
        `${folders} folder(s) detected.`,
        `${riskyFiles.length} risky naming issue(s) detected.`,
        largestItem ? `Largest item detected: ${largestItem.name}.` : "No largest item yet.",
      ],
    },
  };
}