const express = require("express");
const router = express.Router();

const { listMockFiles } = require("../services/mockFileService");
const { analyzeFiles, suggestCleanName } = require("../services/fileBrain");

function buildNewPath(oldPath, newName) {
  const pathParts = oldPath.split("/");
  pathParts.pop();

  const basePath = pathParts.join("/");

  if (!basePath || basePath === "") {
    return `/${newName}`;
  }

  return `${basePath}/${newName}`;
}

router.get("/", (req, res) => {
  try {
    const path = req.query.path || "/";
    const files = listMockFiles(path);
    const analysis = analyzeFiles(files);

    return res.json({
      success: true,
      path,
      data: files,
      analysis,
    });
  } catch (error) {
    console.error("List files error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to list files",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/analysis", (req, res) => {
  try {
    const path = req.query.path || "/";
    const files = listMockFiles(path);
    const analysis = analyzeFiles(files);

    return res.json({
      success: true,
      path,
      analysis,
    });
  } catch (error) {
    console.error("File analysis error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to analyze files",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/rename", (req, res) => {
  try {
    const { oldPath, newName } = req.body;

    if (!oldPath || !newName) {
      return res.status(400).json({
        success: false,
        message: "Missing oldPath or newName",
      });
    }

    const safeNewName = String(newName).trim();

    if (!safeNewName) {
      return res.status(400).json({
        success: false,
        message: "New file name cannot be empty",
      });
    }

    const newPath = buildNewPath(oldPath, safeNewName);

    return res.json({
      success: true,
      type: "rename",
      oldPath,
      newName: safeNewName,
      newPath,
      message: "File renamed successfully (mock)",
      operation: "Rename File",
      mode: "mock",
    });
  } catch (error) {
    console.error("Rename error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Rename failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/suggest-rename", (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: "Missing fileName",
      });
    }

    const suggestedName = suggestCleanName(fileName);

    return res.json({
      success: true,
      fileName,
      suggestedName,
      message: "Rename suggestion generated successfully",
    });
  } catch (error) {
    console.error("Suggest rename error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to suggest rename",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;