require("dotenv").config();
const chatRoutes = require("./routes/chat");
const fileRoutes = require("./routes/files");
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "NAS Data Management Platform backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
app.use("/api/files", fileRoutes);
app.use("/api/chat", chatRoutes);