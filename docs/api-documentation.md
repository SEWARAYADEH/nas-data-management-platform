# API Documentation – NAS Data Management Platform

## 📌 Base URL

http://localhost:5000/api


---

## 📂 GET /files

### Description
Retrieve files from a given path

### Request

GET /files?path=/Work


### Response

{
success: true,
files: [
{
name: "file.txt",
path: "/Work/file.txt",
size: "2MB",
type: "file"
}
]
}


---

## 🤖 POST /chat

### Description
Send a message to AI assistant

### Request

POST /chat
{
"message": "Show files in /Work"
}


### Response

{
success: true,
type: "list_files",
path: "/Work",
reply: "Loading files..."
}


---

## ⚠️ Error Response

{
success: false,
error: "Something went wrong"
}


---

## 🔒 Security
- No direct file modification without confirmation
- Safe fallback AI responses