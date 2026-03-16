# 🏥 MedEase Hospital — Backend API

Node.js + Express + MySQL (Sequelize) backend for the MedEase Hospital Management System.

## 🚀 Quick Start (Local)

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment
```bash
cp .env.example .env
# Edit .env with your Railway MySQL credentials
```

### 3. Seed the database
```bash
npm run seed
```

### 4. Start the server
```bash
npm run dev        # development (with auto-reload)
npm start          # production
```

Server runs at: `http://localhost:5000`

---

## 🌐 Deploy to Railway

### Step 1 — Create Railway MySQL Database
1. Go to [railway.app](https://railway.app) → Sign up free
2. New Project → **Add MySQL**
3. Click the MySQL service → **Variables** tab
4. Copy: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`

### Step 2 — Deploy Backend
1. New Project → **Deploy from GitHub repo**
2. Select your repo
3. Railway auto-detects Node.js and runs `npm start`
4. Go to **Variables** tab → add all `.env` values:

```
DB_HOST       = your MYSQL_HOST from Railway
DB_PORT       = 3306
DB_NAME       = railway (or your db name)
DB_USER       = your MYSQLUSER
DB_PASS       = your MYSQLPASSWORD
JWT_SECRET    = any_random_long_string_here
NODE_ENV      = production
FRONTEND_URL  = *
PORT           = 5000
```

5. After deploy, go to **Settings → Generate Domain**
6. Your API will be live at: `https://your-app.up.railway.app`

### Step 3 — Seed Database
```bash
# Locally, pointing to Railway DB:
# Set .env with Railway credentials, then:
npm run seed
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/auth/signup` | ❌ | Patient register |
| GET | `/api/patients` | Admin/Doctor | All patients |
| POST | `/api/patients` | Admin | Register patient |
| GET | `/api/doctors` | All | All doctors |
| POST | `/api/doctors` | Admin | Add doctor |
| GET | `/api/appointments` | All | List appointments |
| POST | `/api/appointments` | All | Book appointment |
| PATCH | `/api/appointments/:id/status` | Admin/Doctor | Update status |
| GET | `/api/tokens` | All | Queue tokens |
| PATCH | `/api/tokens/:id/status` | All | Update token |
| GET | `/api/prescriptions` | All | Prescriptions |
| POST | `/api/prescriptions` | Doctor/Admin | Save Rx |
| GET | `/api/lab` | All | Lab orders |
| POST | `/api/lab` | Doctor/Admin | Order test |
| PATCH | `/api/lab/:id/result` | Admin | Add result |
| GET | `/api/billing` | All | Bills |
| GET | `/api/pharmacy` | All | Medicines |
| GET | `/api/beds` | All | Bed status |

---

## 🔑 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Doctor | `dr.kavitha.rao` | `doc123` |
| Patient | `P-1001` | `patient123` |

---

## 🛠️ Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **ORM**: Sequelize 6
- **Database**: MySQL 8
- **Auth**: JWT + bcryptjs
- **Hosting**: Railway.app (free tier)
