const { processAI } = require("./ai/aiEngine");

const AI_TYPES = {
  LIST_FILES: "list_files",
  FIX_ALL: "fix_all",
  ANALYSIS: "analysis",
  TEXT: "text",
  RENAME_SUGGESTION: "rename_suggestion",
  CONNECT_DATA: "connect_data",
};

function extractPath(message, fallback = "/") {
  const match = String(message || "").match(/\/[a-zA-Z0-9_./-]*/);
  return match ? match[0] : fallback;
}

function createAIResponse(type, reply, path = null, extra = {}) {
  return {
    type,
    path,
    reply,
    ...extra,
  };
}

function fallbackAI(message = "") {
  const lower = String(message || "").toLowerCase();

  if (!lower.trim()) {
    return createAIResponse(
      AI_TYPES.TEXT,
      "Please enter a NAS command. Try: Show files in /Work"
    );
  }

  if (lower.includes("show") && lower.includes("/")) {
    const path = extractPath(message);

    return createAIResponse(
      AI_TYPES.LIST_FILES,
      `Loading files from ${path}...`,
      path,
      {
        requiresConfirmation: true,
        operation: "Load Files Operation",
      }
    );
  }

  if (lower.includes("list")) {
    return createAIResponse(
      AI_TYPES.LIST_FILES,
      "Listing files in the root directory...",
      "/",
      {
        requiresConfirmation: true,
        operation: "Load Files Operation",
      }
    );
  }

  if (lower.includes("fix all bad names") || lower.includes("fix bad names")) {
    return createAIResponse(
      AI_TYPES.FIX_ALL,
      "Applying bulk rename simulation to all risky files.",
      null,
      {
        requiresConfirmation: true,
        operation: "Bulk Rename Simulation",
      }
    );
  }

  if (lower.includes("bad file") || lower.includes("bad name")) {
    return createAIResponse(
      AI_TYPES.ANALYSIS,
      "Scanning for poorly named files.",
      null,
      {
        requiresConfirmation: false,
        operation: "File Name Risk Analysis",
      }
    );
  }

  return createAIResponse(
    AI_TYPES.TEXT,
    "I can help you manage NAS files. Try: Show files in /Work"
  );
}

async function askAI(message) {
  try {
    const response = await processAI(message);

    if (!response || !response.reply) {
      return fallbackAI(message);
    }

    return {
      type: response.type || AI_TYPES.TEXT,
      path: response.path || null,
      reply: response.reply,
      requiresConfirmation: Boolean(response.requiresConfirmation),
      operation: response.operation || null,
    };
  } catch (error) {
    console.error("AI Service fallback:", error.message);
    return fallbackAI(message);
  }
}

module.exports = {
  askAI,
  AI_TYPES,
  extractPath,
  createAIResponse,
  fallbackAI,
};