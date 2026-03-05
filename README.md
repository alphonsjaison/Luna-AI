# 🌙 Luna AI

> An AI assistant built for clarity, honesty, and real conversations.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-luna--ai--plum.vercel.app-blueviolet?style=for-the-badge&logo=vercel)](https://luna-ai-plum.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-94.7%25-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)

---

## ✨ Overview

Luna AI is a conversational AI web application powered by Google's Gemini API. Designed with a focus on truthfulness and helpfulness, Luna provides direct, accurate, and thoughtful responses in a clean, modern interface.

---

## 🚀 Live Demo

👉 [luna-ai-plum.vercel.app](https://luna-ai-plum.vercel.app)

---

## 🛠️ Tech Stack

| Technology | Role |
|---|---|
| **React + TypeScript** | Frontend framework |
| **Vite** | Build tool & dev server |
| **Google Gemini API** | AI language model |
| **Vercel** | Deployment & hosting |

---

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alphonsjaison/Luna-AI.git
   cd Luna-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your API key**

   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

---

## 📁 Project Structure

```
Luna-AI/
├── components/        # Reusable UI components
├── services/          # API service layer (Gemini integration)
├── App.tsx            # Root application component
├── index.tsx          # Entry point
├── index.html         # HTML template
├── types.ts           # TypeScript type definitions
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Project dependencies
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key (required) |

---

## 🌐 Deployment

This project is deployed on **Vercel**. To deploy your own instance:

1. Fork this repository
2. Import the project into [Vercel](https://vercel.com)
3. Add `GEMINI_API_KEY` as an environment variable in Vercel's project settings
4. Deploy!

---

## 👤 Author

**Alphons Jaison**

- GitHub: [@alphonsjaison](https://github.com/alphonsjaison)

---

## 📄 License

This project is open source. Feel free to use and modify it for your own purposes.

---

<p align="center">Made with ❤️ by Alphons Jaison</p>
