function normalizeMessage(message = "") {
  return String(message || "").trim();
}

function extractPath(message, fallback = "/") {
  const cleanMessage = normalizeMessage(message);
  const match = cleanMessage.match(/\/[a-zA-Z0-9_./-]*/);
  return match ? match[0] : fallback;
}

function parseIntent(message = "") {
  const cleanMessage = normalizeMessage(message);
  const lower = cleanMessage.toLowerCase();

  if (!cleanMessage) {
    return {
      type: "empty",
      path: null,
      originalMessage: cleanMessage,
      requiresConfirmation: false,
    };
  }

  if (
    (lower.includes("show") || lower.includes("open") || lower.includes("load")) &&
    lower.includes("/")
  ) {
    return {
      type: "list_files",
      path: extractPath(cleanMessage),
      originalMessage: cleanMessage,
      requiresConfirmation: true,
    };
  }

  if (
    lower.includes("list all folders") ||
    lower.includes("list folders") ||
    lower === "list" ||
    lower.includes("list files")
  ) {
    return {
      type: "list_files",
      path: extractPath(cleanMessage, "/"),
      originalMessage: cleanMessage,
      requiresConfirmation: true,
    };
  }

  if (
    lower.includes("fix all bad names") ||
    lower.includes("fix bad names") ||
    lower.includes("bulk fix")
  ) {
    return {
      type: "fix_all",
      path: null,
      originalMessage: cleanMessage,
      requiresConfirmation: true,
    };
  }

  if (
    lower.includes("find bad file") ||
    lower.includes("bad file") ||
    lower.includes("bad name") ||
    lower.includes("scan names")
  ) {
    return {
      type: "analysis",
      path: null,
      originalMessage: cleanMessage,
      requiresConfirmation: false,
    };
  }

  if (
    lower.includes("rename") ||
    lower.includes("suggest name") ||
    lower.includes("suggest rename")
  ) {
    return {
      type: "rename_suggestion",
      path: extractPath(cleanMessage, null),
      originalMessage: cleanMessage,
      requiresConfirmation: true,
    };
  }

  if (
    lower.includes("connect api") ||
    lower.includes("api link") ||
    lower.includes("upload") ||
    lower.includes("database")
  ) {
    return {
      type: "connect_data",
      path: null,
      originalMessage: cleanMessage,
      requiresConfirmation: false,
    };
  }

  return {
    type: "text",
    path: null,
    originalMessage: cleanMessage,
    requiresConfirmation: false,
  };
}

module.exports = {
  normalizeMessage,
  extractPath,
  parseIntent,
};