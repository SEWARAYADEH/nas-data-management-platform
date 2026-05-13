const AI_TYPES = {
  LIST_FILES: "list_files",
  FIX_ALL: "fix_all",
  ANALYSIS: "analysis",
  TEXT: "text",
  RENAME_SUGGESTION: "rename_suggestion",
  CONNECT_DATA: "connect_data",
  EMPTY: "empty",
};

function buildResponse(intent, override = {}) {
  const base = {
    success: true,
    type: intent.type || AI_TYPES.TEXT,
    path: intent.path || null,
    requiresConfirmation: Boolean(intent.requiresConfirmation),
    operation: null,
    reply: "",
  };

  switch (intent.type) {
    case AI_TYPES.LIST_FILES:
      return {
        ...base,
        operation: "Load Files Operation",
        reply: `Loading files from ${intent.path || "/"}...`,
        ...override,
      };

    case AI_TYPES.FIX_ALL:
      return {
        ...base,
        operation: "Bulk Rename Simulation",
        reply: "Applying bulk rename simulation to all risky files.",
        ...override,
      };

    case AI_TYPES.ANALYSIS:
      return {
        ...base,
        operation: "File Name Risk Analysis",
        reply: "Scanning for poorly named files.",
        ...override,
      };

    case AI_TYPES.RENAME_SUGGESTION:
      return {
        ...base,
        operation: "Preview Rename Simulation",
        reply:
          "I can suggest a safer file name and preview the rename before any action is applied.",
        ...override,
      };

    case AI_TYPES.CONNECT_DATA:
      return {
        ...base,
        operation: "Connect Data Source",
        reply:
          "The system is ready to connect API links, uploaded files, or database sources for analysis.",
        ...override,
      };

    case AI_TYPES.EMPTY:
      return {
        ...base,
        type: AI_TYPES.TEXT,
        reply: "Please enter a NAS command. Try: Show files in /Work",
        ...override,
      };

    default:
      return {
        ...base,
        type: AI_TYPES.TEXT,
        reply:
          "I can help you manage NAS files. Try: Show files in /Work, Find bad file names, or Fix all bad names.",
        ...override,
      };
  }
}

function buildAzureTextResponse(reply) {
  return {
    success: true,
    type: AI_TYPES.TEXT,
    path: null,
    requiresConfirmation: false,
    operation: "Azure AI Response",
    reply:
      reply ||
      "Azure AI returned an empty response, but the request was completed.",
  };
}

module.exports = {
  AI_TYPES,
  buildResponse,
  buildAzureTextResponse,
};