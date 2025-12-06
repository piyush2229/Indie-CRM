# 🚀 IndieCRM – AI-Powered Lead Management System

IndieCRM is a full-stack, production-ready CRM that automatically syncs Gmail, extracts leads, classifies intent using AI, assigns scores, and helps individuals/teams manage client conversations efficiently.

This project uses:
- 🧠 **Gemini AI** for lead scoring, urgency classification & intent detection  
- 📬 **Gmail OAuth2** for secure inbox syncing  
- 🧵 **BullMQ + Redis** for background workers (email ingestion + AI tasks)  
- ⚛️ **React + Tailwind** for a fast, intuitive dashboard  
- 🟦 **Node.js + Express + MongoDB** for backend APIs  
- 🔐 **JWT Auth**, role management & secure processing  
- 🐳 Optional **Docker support** for deployment  

---

## 🌟 Features

### 🔄 **Automated Gmail Sync**
- OAuth2 login with Google  
- Fetches emails in batches  
- Ignores user’s own sent emails  
- Detects promotional emails + filters  

### 🤖 **AI-Powered Lead Intelligence**
- AI classifies urgency (low/medium/high)  
- Generates a 25-word summary  
- Assigns lead score (0–100)  
- Extracts intent tags  
- Uses key-rotation across multiple Gemini keys  

### ⚙️ **Workers & Background Jobs**
- Email ingestion worker  
- AI classification worker  
- Redis-based job queuing  
- Rate limiting & crash-safe tasks  

### 📊 **CRM Dashboard**
- Lead list with filters  
- Mark lead as completed / promotional  
- Lead detail view  
- Bulk delete promotions  
- Auto-follow-up indicators  

---

## 🏗️ Tech Stack

### **Frontend**
- React + Vite  
- TailwindCSS  
- React Router  
- Axios  
- Lucide Icons  

### **Backend**
- Node.js  
- Express  
- MongoDB + Mongoose  
- BullMQ + Redis  
- Google OAuth  
- Gemini API  
