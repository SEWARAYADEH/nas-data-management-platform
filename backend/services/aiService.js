const OpenAI = require("openai");

const AI_TYPES = {
  LIST_FILES: "list_files",
  FIX_ALL: "fix_all",
  ANALYSIS: "analysis",
  TEXT: "text",
};

function extractPath(message, fallback = "/") {
  const match = message.match(/\/[a-zA-Z0-9_/-]*/);
  return match ? match[0] : fallback;
}

function createAIResponse(type, reply, path = null) {
  return {
    type,
    path,
    reply,
  };
}

function fallbackAI(message) {
  const lower = message.toLowerCase();

  if (lower.includes("show") && lower.includes("/")) {
    const path = extractPath(message);

    return createAIResponse(
      AI_TYPES.LIST_FILES,
      `Loading files from ${path}...`,
      path
    );
  }

  if (lower.includes("list")) {
    return createAIResponse(
      AI_TYPES.LIST_FILES,
      "Listing files in the root directory...",
      "/"
    );
  }

  if (lower.includes("fix all bad names")) {
    return createAIResponse(
      AI_TYPES.FIX_ALL,
      "Applying bulk rename simulation to all risky files."
    );
  }

  if (lower.includes("bad file") || lower.includes("bad name")) {
    return createAIResponse(
      AI_TYPES.ANALYSIS,
      "Scanning for poorly named files."
    );
  }

  return createAIResponse(
    AI_TYPES.TEXT,
    "I can help you manage NAS files. Try: Show files in /Work"
  );
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null;

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

async function askOpenAI(message) {
  const client = getOpenAIClient();

  if (!client) {
    return fallbackAI(message);
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a NAS file assistant. If the user asks to show/list files, respond as a file-management assistant. Keep replies short.",
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return createAIResponse(
    AI_TYPES.TEXT,
    response.choices[0].message.content
  );
}

async function askAI(message) {
  try {
    const lower = message.toLowerCase();

    if (
      lower.includes("show") ||
      lower.includes("list") ||
      lower.includes("fix all bad names") ||
      lower.includes("bad file") ||
      lower.includes("bad name")
    ) {
      return fallbackAI(message);
    }

    return await askOpenAI(message);
  } catch (error) {
    console.error("AI service fallback:", error.message);
    return fallbackAI(message);
  }
}

module.exports = {
  askAI,
  AI_TYPES,
};