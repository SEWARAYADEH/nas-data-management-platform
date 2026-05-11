# Backend – NAS Data Management Platform (Phase 1)

## 📌 Overview
The backend is built using Node.js and Express.  
It provides APIs for file management and AI-based command processing.

---

## 🧠 Responsibilities
- Handle file operations (load, rename simulation)
- Process AI chat commands
- Return structured responses to frontend
- Log system activities

---

## ⚙️ Tech Stack
- Node.js
- Express.js
- REST API
- CORS
- Body Parser

---

## 📂 Project Structure
backend/
├── routes/
│ ├── files.js
│ ├── chat.js
├── services/
│ ├── fileService.js
│ ├── aiService.js
├── app.js
├── server.js


---

## 🔌 API Endpoints

### GET /api/files
Load files from a given path

Query:
?path=/Work


Response:
{
success: true,
files: [...]
}


---

### POST /api/chat
Send message to AI assistant

Body:
{
message: "Show files in /Work"
}


Response:
{
success: true,
type: "list_files",
path: "/Work",
reply: "Loading files..."
}


---

## 🤖 AI Logic
- Parses user commands
- Detects file-related intents
- Falls back to safe mode if AI fails

---

## ⚠️ Error Handling
- Safe fallback responses
- Prevents crashes on invalid inputs
- Logs errors in console

---

## ▶️ Run Backend
cd backend
npm install
npm start


---

## 🔒 Safety Features
- No destructive operations executed directly
- All actions require confirmation on frontend

---

## 📈 Future Improvements
- OpenAI integration
- Real NAS (SMB) connection
- Database logging