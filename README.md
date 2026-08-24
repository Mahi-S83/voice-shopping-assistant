<div align="center">

# 🛒 Saathi
### Voice Command Shopping Assistant

*A voice-first grocery shopping assistant that lets you build and manage your shopping list hands-free — using natural language, in the way you'd actually speak it.*

[![Frontend](https://img.shields.io/badge/Frontend-Live-E8A33D?style=for-the-badge)](https://voice-shopping-assistant-lime.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-API-2F6B4F?style=for-the-badge)](https://saathi-backend-d416.onrender.com/api/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-8A9086?style=for-the-badge)](#-license)

[Live Demo](https://voice-shopping-assistant-lime.vercel.app/) · [Features](#-features) · [Architecture](#%EF%B8%8F-architecture) · [Setup](#%EF%B8%8F-setup-instructions) · [Example Commands](#-example-voice-commands)

</div>

<br>

## 📖 Overview

Typing out a shopping list is friction — especially mid-cook, mid-commute, or with your hands full. **Saathi** lets you speak naturally — *"add milk"*, *"I need apples"*, *"milk and bread"* — and understands you, rather than requiring rigid keyword commands. It parses intent with an LLM (not just regex), auto-categorizes what you add, and gives real-time visual + transcript feedback as you speak.

<br>

## ✨ Features

### 🎙️ Voice Commands
| Say this | Saathi does this |
|---|---|
| `"add milk"` | Adds 1 milk to your list |
| `"I need apples"` / `"I want to buy bananas"` | Understood as ADD_ITEM — not just rigid `add X` syntax |
| `"add 2 liters of milk"` | Adds with parsed quantity + unit |
| `"milk and bread"` / `"eggs, butter"` | Adds **multiple items** from one compound command |
| `"remove eggs"` | Removes an item |
| `"mark milk as bought"` | Marks an item as bought |
| `"clear list"` | Clears the whole list |
| `"show my list"` | Reads the current list back |

### 🔍 Voice-Activated Search
- **Natural language:** *"Find organic apples under ₹300"*
- **Brand filtering:** *"Find Amul milk"*
- **Price filtering:** *"Find milk under ₹50"*
- **Size filtering:** *"Find 500g rice"*
- **Organic filtering:** *"Find organic apples"*

### 🧠 Smart List Management
- Automatic categorization — Dairy, Produce, Staples, and more
- Quantity + unit parsing from natural speech
- Real-time visual feedback with a live transcript as you speak
- Instant list updates — no manual refresh needed

<br>

## 🏗️ Tech Stack

<div align="center">

| Layer | Technology |
|:---|:---|
| **Frontend** | React 18 · Vite · Tailwind CSS |
| **Backend** | Node.js · Express · TypeScript |
| **Voice Recognition** | Web Speech API |
| **NLP / Intent Parsing** | Groq AI (LLM) with regex fallback |
| **Search** | Fuse.js (fuzzy search) |
| **Deployment** | Vercel (frontend) · Render (backend) |

</div>

<br>

## 🏛️ Architecture

```
 🎙️  User speaks a voice command
         │
         ▼
 📱  Frontend (React) captures audio via the Web Speech API
         │
         ▼
 🌐  Backend (Express) receives the transcript via POST /api/parse
         │
         ▼
 🤖  Groq AI parses intent — ADD_ITEM · REMOVE_ITEM · MARK_BOUGHT · SEARCH_PRODUCT · …
         │
         ▼
 📋  Shopping list service updates in-memory state
         │
         ▼
 ✅  Real-time UI update with confirmation feedback
```

<br>

## 📂 Project Structure

```
voice-shopping-assistant/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── catalogService.ts    # Product catalog + search
│   │   │   ├── listService.ts       # Shopping list CRUD
│   │   │   ├── intentParser.ts      # Voice command NLP
│   │   │   └── searchParser.ts      # Voice search NLP
│   │   ├── routes/                  # API endpoints
│   │   ├── middleware/              # CORS, rate limiting, security
│   │   ├── app.ts
│   │   └── server.ts
│   ├── data/
│   │   └── catalog.json             # 42+ Indian grocery products
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── ListScreen.jsx
│   │   │   ├── SearchScreen.jsx
│   │   │   └── RecommendationsScreen.jsx
│   │   ├── components/
│   │   │   ├── MicButton.jsx
│   │   │   ├── TranscriptSheet.jsx
│   │   │   ├── ShoppingList.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── TabBar.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

<br>

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- A free-tier [Groq API key](https://console.groq.com)

### 1 · Clone the repository
```bash
git clone https://github.com/your-username/voice-shopping-assistant.git
cd voice-shopping-assistant
```

### 2 · Backend setup
```bash
cd backend
npm install
cp .env.example .env
# add your GROQ_API_KEY to .env
npm run dev
```

### 3 · Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
# set VITE_API_URL=http://localhost:5001
npm run dev
```

### 4 · Environment variables

| Variable | Purpose |
|:---|:---|
| `PORT` | Backend port (default: `5001`) |
| `GROQ_API_KEY` | Groq API key for LLM-based intent parsing |
| `VITE_API_URL` | Backend URL, used by the frontend |
| `CORS_ORIGIN` | Frontend URL, for backend CORS config |

<br>

## 🎯 Example Voice Commands

| Command | Expected result |
|:---|:---|
| `"add milk"` | Adds 1 milk to list |
| `"add 2 liters of milk"` | Adds 2L milk |
| `"I need apples"` | Adds apples |
| `"milk and bread"` | Adds both items |
| `"remove eggs"` | Removes eggs |
| `"mark milk as bought"` | ✅ Marks milk as bought |
| `"clear list"` | Clears all items |
| `"show my list"` | Reads the list back |
| `"find Amul milk"` | Shows Amul milk products |
| `"find milk under ₹50"` | Shows milk ≤ ₹50 |
| `"find organic apples"` | Shows organic apples |

<br>

## 🧪 Testing

The app is tested against these edge cases:

- **Multiple items:** `"milk and bread"`, `"eggs, butter"`
- **Quantities:** `"2 liters"`, `"500g"`, `"1 dozen"`
- **Natural language:** `"I need apples"`, `"I want to buy bananas"`
- **Voice search:** `"Find Amul milk under ₹50"`
- **Error handling:** unknown products, empty transcripts

<br>

## 🚀 Deployment

**Backend (Render)**
1. Connect the GitHub repo to Render
2. Set environment variables
3. Deploy with `npm start`

**Frontend (Vercel)**
1. Connect the GitHub repo to Vercel
2. Set `VITE_API_URL` to the deployed backend URL
3. Deploys automatically on push

<br>

## 📝 License

MIT

<br>

## 👤 Author

**Mahi Singh**
[GitHub](https://github.com/Mahi-S83) · [LinkedIn](https://linkedin.com/in/mahi-singh-ai)

<div align="center">
<sub>Built as a voice-first reimagining of the everyday shopping list.</sub>
</div>
