function isBadName(fileName = "") {
  const lower = fileName.toLowerCase();

  return (
    lower.includes("final_final") ||
    lower.includes("copy") ||
    lower.includes("untitled") ||
    lower.includes("new folder") ||
    /v\d+.*v\d+/i.test(fileName)
  );
}

function suggestCleanName(fileName = "") {
  let clean = fileName;

  clean = clean.replace(/final_final/gi, "final");
  clean = clean.replace(/copy/gi, "");
  clean = clean.replace(/untitled/gi, "document");
  clean = clean.replace(/\s+/g, "_");
  clean = clean.replace(/__+/g, "_");

  return clean;
}

function analyzeFiles(files = []) {
  const totalItems = files.length;

  const folders = files.filter((file) => file.type === "folder");
  const normalFiles = files.filter((file) => file.type !== "folder");

  const riskyFiles = files
    .filter((file) => isBadName(file.name))
    .map((file) => ({
      ...file,
      risk: "Bad Name",
      suggestedName: suggestCleanName(file.name),
    }));

  const largestItem =
    [...files].sort((a, b) => parseSize(b.size) - parseSize(a.size))[0] ||
    null;

  const fileTypes = files.reduce((acc, file) => {
    const type = file.type || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return {
    totalItems,
    folders: folders.length,
    files: normalFiles.length,
    riskyCount: riskyFiles.length,
    riskyFiles,
    largestItem,
    fileTypes,
    insights: buildInsights({
      totalItems,
      folders,
      riskyFiles,
      largestItem,
      fileTypes,
    }),
  };
}

function parseSize(size = "0") {
  if (!size || size === "-") return 0;

  const value = parseFloat(String(size).replace(/[^\d.]/g, "")) || 0;
  const lower = String(size).toLowerCase();

  if (lower.includes("gb")) return value * 1024;
  if (lower.includes("mb")) return value;
  if (lower.includes("kb")) return value / 1024;

  return value;
}

function buildInsights({ totalItems, folders, riskyFiles, largestItem }) {
  const insights = [];

  insights.push(`This folder contains ${totalItems} item(s).`);

  if (folders.length > 0) {
    insights.push(`${folders.length} folder(s) detected in this location.`);
  }

  if (riskyFiles.length > 0) {
    insights.push(
      `${riskyFiles.length} risky file name(s) detected. Rename review is recommended.`
    );
  } else {
    insights.push("All visible file names look clean.");
  }

  if (largestItem) {
    insights.push(`Largest item detected: ${largestItem.name}.`);
  }

  return insights;
}

module.exports = {
  analyzeFiles,
  isBadName,
  suggestCleanName,
};