# Architecture – NAS Data Management Platform

## 📌 Overview
The system follows a layered architecture to ensure scalability and maintainability.

---

## 🧱 Layers

### 1. Frontend (React)
- UI rendering
- User interaction
- API calls

---

### 2. API Layer (Axios)
- Handles communication between frontend and backend

---

### 3. Backend (Node.js / Express)
- Processes requests
- Handles business logic

---

### 4. Services Layer
- FileService (file operations)
- AIService (command parsing)

---

## 🔄 Flow
User → Frontend → API → Backend → Service → Response → UI

---

## 🤖 AI Integration
- Parses natural language
- Returns structured commands

---

## 🔒 Safety Layer
- Confirmation modal
- Activity logging
- Error handling

---

## 📈 Future Architecture
- OpenAI API integration
- NAS SMB connection
- Database layer
- Microservices expansion

---

## 🎯 Design Principles
- Separation of concerns
- Clean architecture
- Scalability
- Maintainability