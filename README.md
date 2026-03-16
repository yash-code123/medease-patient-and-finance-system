<div align="center">

<img src="https://img.shields.io/badge/Status-Live%20%26%20Deployed-brightgreen?style=for-the-badge" />
<img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-orange?style=for-the-badge" />

# 🏥 MedEase
### Integrated Hospital Management System for Patient Services and Financial Operations

*A full-stack web application that digitizes the complete hospital workflow — from patient registration and appointment booking to doctor consultation, financial tracking and real-time analytics.*

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-medease--hospital--management--system.netlify.app-1a3a5c?style=for-the-badge)](https://medease-hospital-management-system.netlify.app)
[![API](https://img.shields.io/badge/⚙️%20Backend%20API-Railway-e8613a?style=for-the-badge)](https://medease-backend-production.up.railway.app)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Design](#-database-design)
- [API Endpoints](#-api-endpoints)
- [User Roles](#-user-roles)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Demo Credentials](#-demo-credentials)
- [Screenshots](#-screenshots)
- [Developer](#-developer)

---

## 📌 About the Project

**MedEase** is a comprehensive Hospital Management System built as a Final Year College Project. It provides a unified digital platform for managing patient services and hospital financial operations.

### Patient Services
- Self-registration with unique Patient ID
- Online appointment booking with **UPI payment** integration
- Auto-issued queue token — no manual waiting
- Personal health records — prescriptions, lab reports, bills
- 24/7 **Health Assistant Chatbot** for hospital guidance
- Direct messaging with assigned doctor

### Financial Operations
- Automatic bill generation on every patient transaction
- Real-time revenue tracking and analytics dashboard
- Department-wise financial performance reports
- Pharmacy inventory with low stock alerts
- Bed occupancy and hospital utilization stats
- Printable bills, receipts and prescriptions

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🌐 Frontend (Netlify) | https://medease-hospital-management-system.netlify.app |
| ⚙️ Backend API (Railway) | https://medease-backend-production.up.railway.app |
| 🗄️ Database | MySQL on Railway Cloud |

---

## ✨ Features

### 🧑‍⚕️ Patient Module
- ✅ Patient self-registration with auto-generated Patient ID (P-XXXX)
- ✅ 4-step appointment booking wizard with UPI payment gateway
- ✅ Live QR code generation for UPI payment
- ✅ Auto-issued queue token after payment confirmation
- ✅ My Records portal — Appointments, Bills, Prescriptions, Lab Results, Timeline
- ✅ Health Assistant Chatbot (rule-based, 100% free)
- ✅ Doctor-patient messaging system

### 💳 Financial Module
- ✅ Automatic bill creation on appointment booking
- ✅ UPI transaction tracking with TXN ID verification
- ✅ Revenue trend chart (last 7 days)
- ✅ Department-wise revenue and patient analytics
- ✅ Pharmacy stock management with expiry tracking
- ✅ Low stock alerts and restock management
- ✅ Printable bills with hospital header

### 🩺 Doctor Module
- ✅ Personal patient queue dashboard
- ✅ Call patient → record vitals (BP, Pulse, Temp, SpO₂, BMI auto-calc)
- ✅ Write prescriptions with multi-medicine rows
- ✅ Order lab tests directly from consultation
- ✅ Patient medical history and previous records
- ✅ Printable prescription with vitals and medicines

### 🔑 Admin Module
- ✅ Full hospital dashboard with 8 stat cards
- ✅ Add/manage doctors with auto-generated login credentials
- ✅ Patient registration and records management
- ✅ Queue and token management
- ✅ Bed management — 30 beds across 3 wards
- ✅ Analytics dashboard with Chart.js
- ✅ Export reports to PDF and CSV

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| HTML5 | Structure |
| CSS3 + CSS Variables | Styling & Theming |
| JavaScript (ES6+) | Application Logic |
| Chart.js 4.4.0 | Analytics Charts |
| qrcodejs | UPI QR Code Generation |
| Google Fonts | Typography (DM Sans + DM Serif) |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime Environment |
| Express.js 4 | REST API Framework |
| Sequelize 6 | MySQL ORM |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password Hashing |
| express-validator | Input Validation |
| cors | Cross-Origin Requests |

### Database & Hosting
| Service | Purpose |
|---------|---------|
| MySQL 8 | Relational Database |
| Railway.app | Backend + Database Hosting |
| Netlify | Frontend Hosting |
| GitHub | Version Control & Auto-Deploy |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                          │
│         index.html + style.css + app.js                 │
│         Hosted on Netlify (Global CDN)                  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS API Calls (fetch)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  EXPRESS SERVER                          │
│     medease-backend-production.up.railway.app:5000      │
│                                                         │
│  /api/auth  /api/patients  /api/appointments            │
│  /api/tokens  /api/prescriptions  /api/lab              │
│  /api/billing  /api/pharmacy  /api/beds                 │
└──────────────────────┬──────────────────────────────────┘
                       │ Sequelize ORM — SQL Queries
                       ▼
┌─────────────────────────────────────────────────────────┐
│                 MYSQL DATABASE                           │
│      Railway Cloud — mainline.proxy.rlwy.net:14044      │
│                                                         │
│  users │ patients │ doctors │ appointments │ tokens     │
│  prescriptions │ lab_orders │ bills │ medicines │ beds  │
└─────────────────────────────────────────────────────────┘
```

### Deployment Flow
```
Developer (Local)
      │
      │  git push origin main
      ▼
GitHub Repository
      │
      │  Auto-deploy trigger
      ▼
Railway.app (Backend + MySQL)          Netlify (Frontend)
medease-backend-production             medease-hospital-management
.up.railway.app                        -system.netlify.app
```

---

## 🗄️ Database Design

| Table | Description | Key Fields |
|-------|-------------|-----------|
| `users` | Login accounts for all roles | id, username, password_hash, role, ref_id |
| `patients` | Patient records | id (P-XXXX), fname, lname, dob, blood, phone, allergies |
| `doctors` | Doctor profiles | id (D-XXX), name, dept, qualification, fee, status |
| `appointments` | Booking records | id, patient_id, doctor_id, date, time, fee, pay_status |
| `tokens` | Queue tokens | id (T-XXX), appointment_id, patient_id, priority, status |
| `prescriptions` | Doctor prescriptions | id, patient_id, diagnosis, medicines (JSON), vitals (JSON) |
| `lab_orders` | Lab test orders | id, patient_id, test, priority, status, result |
| `bills` | Payment records | id, patient_id, amount, mode, txn_id, status |
| `medicines` | Pharmacy inventory | id, name, category, quantity, min_stock, expiry |
| `beds` | Ward bed status | id, ward, status, patient_id |

### Relationships
```
users.ref_id          ──→  patients.id / doctors.id
appointments.patient_id ──→  patients.id
appointments.doctor_id  ──→  doctors.id
tokens.appointment_id   ──→  appointments.id
prescriptions.patient_id ──→ patients.id
lab_orders.patient_id   ──→  patients.id
bills.appointment_id    ──→  appointments.id
beds.patient_id         ──→  patients.id
```

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login — returns JWT token |
| POST | `/api/auth/signup` | Public | Patient self-registration |
| GET | `/api/patients` | Admin/Doctor | All patient records |
| POST | `/api/patients` | Admin | Register new patient |
| GET | `/api/doctors` | All | All doctors |
| POST | `/api/doctors` | Admin | Add doctor + auto-create login |
| GET | `/api/appointments` | All | Appointments (role-filtered) |
| POST | `/api/appointments` | All | Book + token + bill auto-created |
| PATCH | `/api/appointments/:id/status` | Admin/Doctor | Update status |
| GET | `/api/tokens` | All | Queue tokens |
| PATCH | `/api/tokens/:id/status` | All | Update token status |
| GET | `/api/prescriptions` | All | Prescriptions (role-filtered) |
| POST | `/api/prescriptions` | Doctor/Admin | Save prescription |
| GET | `/api/lab` | All | Lab orders (role-filtered) |
| POST | `/api/lab` | Doctor/Admin | Order lab test |
| PATCH | `/api/lab/:id/result` | Admin | Upload lab result |
| GET | `/api/billing` | All | Bills (role-filtered) |
| POST | `/api/billing` | Admin | Create bill |
| GET | `/api/pharmacy` | All | Medicine inventory |
| PUT | `/api/pharmacy/:id` | Admin | Update medicine stock |
| GET | `/api/beds` | All | Bed status |
| PUT | `/api/beds/:id` | Admin | Update bed status |

> All protected routes require: `Authorization: Bearer <JWT_TOKEN>`

---

## 👥 User Roles

| Role | Access | Demo Login |
|------|--------|-----------|
| **Admin** | Full system — patients, doctors, finance, analytics | `admin` / `admin123` |
| **Doctor** | Patient queue, consultation, prescriptions, labs | `dr.kavitha.rao` / `doc123` |
| **Patient** | Appointments, health records, bills, chatbot | `P-1001` / `patient123` |

---

## 📁 Project Structure

```
medease-patient-and-finance-system/
│
├── 📁 frontend/
│   ├── index.html          # HTML structure (976 lines)
│   ├── style.css           # All CSS styles (36KB)
│   └── app.js              # All JavaScript logic (128KB+)
│
├── 📁 backend/
│   ├── server.js           # Express app entry point
│   ├── package.json        # Dependencies
│   ├── .env.example        # Environment variables template
│   ├── .gitignore
│   │
│   ├── 📁 config/
│   │   └── db.js           # MySQL + Sequelize connection
│   │
│   ├── 📁 models/          # Database table definitions
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── Token.js
│   │   ├── Prescription.js
│   │   ├── LabOrder.js
│   │   ├── Bill.js
│   │   ├── Medicine.js
│   │   └── Bed.js
│   │
│   ├── 📁 routes/          # API endpoint handlers
│   │   ├── auth.js
│   │   ├── patients.js
│   │   ├── doctors.js
│   │   ├── appointments.js
│   │   ├── tokens.js
│   │   ├── prescriptions.js
│   │   ├── lab.js
│   │   ├── billing.js
│   │   ├── pharmacy.js
│   │   └── beds.js
│   │
│   ├── 📁 middleware/
│   │   ├── auth.js         # JWT token verification
│   │   └── roleGuard.js    # Role-based access control
│   │
│   └── 📁 utils/
│       └── seedData.js     # Demo data loader
│
├── README.md
└── SETUP_STEPS.txt
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MySQL 8 (or Railway MySQL account)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yash-code123/medease-patient-and-finance-system.git
cd medease-patient-and-finance-system
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
```

### 3. Configure Environment Variables
Edit `.env` file:
```env
DB_HOST      = your_mysql_host
DB_PORT      = 3306
DB_NAME      = railway
DB_USER      = root
DB_PASS      = your_mysql_password
JWT_SECRET   = medease_secret_2024
PORT         = 5000
NODE_ENV     = development
FRONTEND_URL = *
```

### 4. Seed Demo Data
```bash
npm run seed
```

### 5. Start Backend Server
```bash
npm start
# Server runs at http://localhost:5000
```

### 6. Open Frontend
```bash
# Just open frontend/index.html in any browser
# No build step needed!
```

---

## ☁️ Deployment

### Frontend → Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `frontend` folder
3. Done ✅ — get free URL instantly

### Backend → Railway
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select this repository
4. Add environment variables in Railway dashboard
5. Generate domain in Settings → Networking
6. Done ✅ — auto-deploys on every git push

### Database → Railway MySQL
1. New Project → Add MySQL
2. Copy credentials from Variables tab
3. Add to backend `.env` file
4. Run `npm run seed` to initialize tables

---

## 🔑 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Super Admin | `superadmin` | `super@2024` |
| Doctor (Cardiology) | `dr.kavitha.rao` | `doc123` |
| Doctor (Neurology) | `dr.suresh.patel` | `doc123` |
| Doctor (Pediatrics) | `dr.ananya.nair` | `doc123` |
| Doctor (Orthopedics) | `dr.rajan.iyer` | `doc123` |
| Doctor (Gynecology) | `dr.meena.joshi` | `doc123` |
| Patient | `P-1001` | `patient123` |
| Patient | `P-1002` | `patient123` |
| Patient | `P-1003` | `patient123` |

---

## 👨‍💻 Developer

**Yash Bhirud**

[![GitHub](https://img.shields.io/badge/GitHub-yash--code123-181717?style=for-the-badge&logo=github)](https://github.com/yash-code123)

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**⭐ If you found this project helpful, please give it a star! ⭐**

Made with ❤️ by Yash Bhirud | Final Year College Project 2025-2026

</div>
