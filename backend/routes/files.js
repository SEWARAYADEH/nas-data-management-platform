const express = require("express");
const router = express.Router();

const { listMockFiles } = require("../services/mockFileService");

router.get("/", (req, res) => {
  try {
    const path = req.query.path || "/";
    const files = listMockFiles(path);

    res.json({
      success: true,
      path,
      data: files,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to list files",
    });
  }
});
// 🔹 Rename File
router.post("/rename", (req, res) => {
  try {
    const { oldPath, newName } = req.body;

    if (!oldPath || !newName) {
      return res.status(400).json({
        success: false,
        message: "Missing oldPath or newName",
      });
    }

    // 🧠 استخراج المسار الجديد
    const pathParts = oldPath.split("/");
    pathParts.pop(); // remove old name
    const newPath = [...pathParts, newName].join("/");

    // 🔥 حاليا mock (بدون FS حقيقي)
    return res.json({
      success: true,
      oldPath,
      newPath,
      message: "File renamed successfully (mock)",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Rename failed",
    });
  }
});
module.exports = router;