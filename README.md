# 🌸 AURA Notes — Aesthetic Study Notes & Gemini AI Doubt Solver

A modern, distraction-free study space designed for learners who love aesthetic typography, organized notes, and real-time AI assistance powered by **Google Gemini**.

---

## ✨ Features

### 1. 📖 Aesthetic Notes Management
- **Editorial Typography**: Styled with *Newsreader* serif and *Plus Jakarta Sans* for comfortable long-form reading.
- **Markdown & Math Support**: Write notes in standard Markdown with headers, bold/italic, code blocks, bullet lists, checkboxes, and LaTeX formulas.
- **Organization by Notebook & Tag**: Categorize notes (Computer Science, Physics, Astronomy, Philosophy, Mathematics, etc.) and filter by `#tags`.
- **Pin & Star Favorites**: Keep your most critical exam summaries or formulas pinned at the top.
- **Multiple Aesthetic Themes**:
  - 📄 **Clean Paper**: Minimalist light theme.
  - 🌙 **Obsidian Night**: Deep, sleek dark theme.
  - ☕ **Warm Book / Sepia**: Soothing warm amber tones for late-night reading.
- **Data Portability**: Export any individual note to `.md`, or export/import full JSON backups with zero data loss.

### 2. ⚡ Integrated Gemini AI Doubt Solver
- **Context-Aware Assistance**: Ask doubts directly from any note. Aura automatically passes the note title and content to Gemini so the AI knows exactly what you're working on.
- **1-Click Quick Study Prompts**:
  - 🧠 *"Explain difficult concepts simply with an analogy"*
  - ❓ *"Generate 3 practice questions with answers"*
  - ⚡ *"Summarize into high-yield flashcards"*
  - 🔍 *"Spot gaps or misconceptions in my understanding"*
- **Instant Integration**:
  - **Append to Note**: 1-click adds Gemini's explanation directly into your active note.
  - **Save as New Note**: Turn any AI doubt resolution into a brand new note in your library.
- **Interactive Preview Mode**: Works out of the box even without an API key with simulated academic responses.
- **Official Google Gemini 2.5 Flash**: Enter your free API key in **Settings** to chat live with Google's state-of-the-art model.

### 3. 🧘 Zen Study Focus (Pomodoro)
- Built-in 25-minute Pomodoro timer in the sidebar to maintain deep study flow without distracting tabs.

---

## 🚀 Getting Started

### 1. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Connect Your Free Google Gemini API Key
1. Open the website at `http://localhost:3000`.
2. Click the ⚙️ **Settings** button in the top right.
3. Paste your Gemini API key (get one for free at [Google AI Studio](https://aistudio.google.com/app/apikey)).
4. Click **Save**. Your key is stored securely inside your browser's `localStorage` and is never sent to any third-party backend.

