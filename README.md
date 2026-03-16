# 🏥 MedEase Hospital Management System
### College Project — Full Stack

---

## 📁 Folder Structure
```
medease-full/
├── frontend/
│   └── index.html        ← Open this in browser for the website
│
├── backend/
│   ├── server.js         ← Main server file
│   ├── config/db.js      ← Database connection
│   ├── models/           ← Database tables
│   ├── routes/           ← API endpoints
│   ├── middleware/       ← Auth & role protection
│   ├── utils/seedData.js ← Demo data loader
│   ├── package.json
│   └── .env.example      ← Copy this to .env and fill credentials
│
└── README.md             ← This file
```

---

## 🚀 How to Run

### Frontend (No setup needed!)
Just open `frontend/index.html` in any browser. Done! ✅

### Backend Setup
1. Open Command Prompt inside the `backend` folder
2. Run: `npm install`
3. Run: `copy .env.example .env`
4. Run: `notepad .env` → fill in your Railway credentials
5. Run: `npm run seed` → loads demo data
6. Run: `npm start` → starts the server

---

## 🔑 Demo Login Credentials

| Role       | Username        | Password     |
|------------|-----------------|--------------|
| Admin      | admin           | admin123     |
| Doctor     | dr.kavitha.rao  | doc123       |
| Doctor     | dr.suresh.patel | doc123       |
| Doctor     | dr.ananya.nair  | doc123       |
| Patient    | P-1001          | patient123   |
| Patient    | P-1002          | patient123   |

---

## 🌐 Deployment
- **Frontend**: Upload `index.html` to Netlify (drag & drop)
- **Backend**: Push `backend/` folder to GitHub → deploy on Railway
- **Database**: Already set up on Railway ✅

---

## 🛠️ Tech Stack
- Frontend: HTML, CSS, JavaScript (Single file)
- Backend: Node.js + Express.js
- Database: MySQL (Railway cloud)
- Auth: JWT Tokens
- AI Chatbot: Claude API (Anthropic)
- Charts: Chart.js
- QR Code: qrcodejs
