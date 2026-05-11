const express = require("express");
const router = express.Router();

const { askAI } = require("../services/aiService");

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      success: false,
      reply: "Message is required.",
    });
  }

try {
  const aiResponse = await askAI(message.trim());

  return res.status(200).json({
    success: true,
    type: aiResponse.type || "text",
    path: aiResponse.path || null,
    reply: aiResponse.reply || "AI response received.",
  });
} catch (error) {
  console.error("Chat route error:", error.message);

  return res.status(200).json({
    success: true,
    type: "text",
    path: null,
    reply:
      "AI assistant is running in safe mode. I can help you list NAS files. Try: Show files in /Work",
  });
}
});

module.exports = router;