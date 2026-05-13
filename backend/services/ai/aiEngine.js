const {
  isAzureConfigured,
  sendToAzureAI,
  extractAzureText,
} = require("./aiClient");

const { parseIntent } = require("./intentParser");
const { buildResponse, buildAzureTextResponse } = require("./aiActionBuilder");

async function processAI(message) {
  const intent = parseIntent(message);

  if (intent.type !== "text") {
    return buildResponse(intent);
  }

  if (!isAzureConfigured()) {
    console.warn("AI Engine: Azure is not configured. Using safe fallback.");
    return buildResponse(intent);
  }

  try {
    console.log("AI Engine: sending request to Azure GPT...");

    const azureResponse = await sendToAzureAI(message);
    const reply = extractAzureText(azureResponse);

    console.log("AI Engine: Azure response received.");

    return buildAzureTextResponse(reply);
  } catch (error) {
    console.error("AI Engine Azure error:", error.message);

    return {
      ...buildResponse(intent),
      debug: process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
}

module.exports = {
  processAI,
};