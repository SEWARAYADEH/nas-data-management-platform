# Demo Script – NAS Data Management Platform (Phase 1)

## 🎯 Introduction
Hello, this is our project:
**NAS Data Management Platform – Phase 1**

The goal of this system is to provide a smart and safe way to manage NAS files using a modern dashboard and AI-assisted commands.

---

## ⚙️ Running the System

First, we start the backend:

```bash
cd backend
npm start
Then we start the frontend:

cd frontend
npm run dev
Now the system is running on:
http://localhost:5173

🖥️ Dashboard Overview
This is the main dashboard.

It includes:

File Explorer

AI Assistant

Activity Log

File Details Panel

The layout is designed for clarity and fast interaction.

📂 File Explorer
Here we can load files from the NAS simulation.

Click Load Files.

The system retrieves files and displays:

Name

Type

Size

Path

Status

🤖 AI Assistant
Now we test the AI assistant.

We enter:
"Show files in /Work"

The AI processes the message and returns a structured command.

Then the system automatically loads files from that path.

This demonstrates how natural language is converted into real actions.

⚠️ Risk Detection
The system detects bad file names.

Example:
"final_final_v2.mp4"

It is marked as a risky name.

✏️ Rename / Fix Operation
We click Fix Bad Names.

Before execution, a confirmation modal appears.

This ensures no operation is executed without user approval.

✅ Confirmation Flow
The system shows:

Operation name

Target path

Description

User can:

Confirm → execute

Cancel → stop

This is a key safety feature.

📊 Activity Log
Every action is recorded here:

Load files

AI commands

Rename operations

This ensures traceability and monitoring.

🔌 Connect & Analyze
We can:

Upload files

Connect API

Prepare for database integration

This makes the system scalable for future development.

🧩 UML & Architecture
We designed:

Use Case Diagram

Component Diagram

Class Diagram

Sequence Diagrams

State Diagram

These diagrams define system structure and behavior clearly.

🔒 Safety Design
All operations follow:

Confirmation step

Controlled execution

Activity logging

This prevents accidental or harmful actions.

🚀 Conclusion
This project demonstrates:

Clean architecture

AI-assisted workflows

Safe operation design

Scalable system structure

Thank you.