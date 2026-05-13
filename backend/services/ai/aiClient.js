const DEFAULT_TIMEOUT_MS = 30000;

function getAzureConfig() {
  return {
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: process.env.AZURE_OPENAI_BASE_URL,
    model: process.env.AZURE_OPENAI_MODEL || "gpt-5.3-codex",
  };
}

function isAzureConfigured() {
  const { apiKey, baseURL } = getAzureConfig();
  return Boolean(apiKey && baseURL);
}

async function sendToAzureAI(message, options = {}) {
  const { apiKey, baseURL, model } = getAzureConfig();

  if (!apiKey || !baseURL) {
    throw new Error("Azure OpenAI configuration is missing in backend/.env");
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs || DEFAULT_TIMEOUT_MS
  );

  try {
    const response = await fetch(baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content:
              "You are a senior AI system inside the NAS Data Management Platform. You understand the full system: React dashboard, Node.js backend APIs, file explorer, AI chat commands, bad file name detection, rename simulation, confirmation dialogs, activity logs, API/upload/database data intake, UML architecture, and Phase 1 MVP goals. Always answer as part of this platform. Be specific, practical, concise, and explain the real system features without inventing unsupported functionality.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const details =
        data?.error?.message ||
        data?.message ||
        JSON.stringify(data) ||
        response.statusText;

      throw new Error(`Azure OpenAI HTTP ${response.status}: ${details}`);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function extractAzureText(response) {
  if (!response) return null;

  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const output = response.output || [];

  for (const item of output) {
    const content = item.content || [];

    for (const part of content) {
      if (typeof part.text === "string" && part.text.trim()) {
        return part.text.trim();
      }

      if (typeof part.content === "string" && part.content.trim()) {
        return part.content.trim();
      }
    }
  }

  return null;
}

module.exports = {
  getAzureConfig,
  isAzureConfigured,
  sendToAzureAI,
  extractAzureText,
};