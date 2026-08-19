# EduVerse LMS - Institutional Learning Management System

EduVerse is a full-stack, enterprise-grade Learning Management System (LMS) designed for academic institutions, universities, and colleges. It offers role-isolated portals for **Students**, **Faculty / Teachers**, and **Admin / HODs**, featuring real-time analytics, automated quiz evaluation, Cloudinary PDF/document storage, assignment submission & grading workflows, and live database metrics.

---

## 🌟 Key Features

### 🎓 Student Portal
- **Dashboard & Analytics**: Live tracking of enrolled courses, active quizzes, submitted deliverables, and evaluation progress charts.
- **Course Enrollment**: Search, filter, and enroll in faculty-managed courses.
- **Lecture Notes & Docs**: View, stream, and download course PDF materials uploaded to Cloudinary.
- **Interactive Quizzes**: Take multiple-choice tests with automatic server-side scoring, instant breakdown of correct/incorrect answers, and result persistence.
- **Assignment Submissions**: Submit PDF or image deliverables (PDF, JPG, JPEG, PNG) to Cloudinary with real-time grading and feedback tracking.

### 👩‍🏫 Faculty / Teacher Portal
- **Faculty Control Center**: Monitor course metrics, student enrollments, pending deliverable reviews, and active question banks.
- **Course Management**: Create, update, and manage curriculum offerings with dynamic instructor attribution.
- **Lecture PDF Upload**: Securely upload study materials directly to Cloudinary.
- **Quiz Engine**: Build custom 4-option multiple-choice quizzes, set passing thresholds, toggle publish/draft status, and view quiz analytics for owned courses.
- **Assignment & Deliverable Grading**: Create assignments with due dates and grade submitted student deliverables with custom feedback.

### 🛡️ Admin / HOD Control Center
- **Institutional Governance**: High-level monitoring of total faculty, students, courses, enrollments, quizzes, and assignment submissions.
- **Faculty & Student Directories**: Manage active status, approve or reject pending teacher registration requests, and view individual academic metrics.
- **System Activity Feeds**: Live audit stream of user registrations, course creations, quiz attempts, and deliverable submissions.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, React Router v7, Axios, Lucide React Icons, Vanilla CSS
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose ORM), JWT (JSON Web Tokens), bcryptjs
- **File Storage**: Cloudinary (with fallback to local disk storage for dev)
- **Deployment**: Render / Vercel ready

---

## 📁 Repository Structure

```
EDU-Learning/
├── backend/
│   ├── config/
│   │   ├── db.js                # MongoDB Atlas Connection
│   │   └── cloudinary.js        # Multer & Cloudinary Storage Config
│   ├── controllers/             # Express API Controllers
│   ├── middleware/              # Auth & Role Isolation Middleware
│   ├── models/                  # Mongoose Data Schemas
│   ├── routes/                  # Express API Route Definition
│   ├── seed/                    # Admin & Demo User Seed Scripts
│   ├── server.js                # Express App Entry & Health Endpoint
│   ├── .env.example             # Backend Environment Template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/axiosInstance.js # Centralized Axios HTTP Client
│   │   ├── components/          # Reusable UI Components
│   │   ├── context/AuthContext.jsx # JWT Session State
│   │   ├── pages/               # Student, Teacher & Admin Pages
│   │   ├── App.jsx              # Router & Route Guards
│   │   └── main.jsx
│   ├── .env.example             # Frontend Environment Template
│   └── package.json
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/eduverse?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Faculty: Use your own registered account
Student: Use your own registered account
Admin: Contact project administrator
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Running Locally

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Note: Default Admin and Demo User accounts (`ashutosh123@gmail.com`, `avinashsingh88161@gmail.com`, `admin@eduverse.com`) automatically seed into MongoDB Atlas upon server start.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 🔑 Pre-Configured Demo Credentials

| Role | Email Address | Password | Access Level |
|---|---|---|---|
| **Faculty / Teacher** | `avinashsingh88161@gmail.com` | `Avinash@123` | Full Teacher Portal |
| **Student** | `ashutosh123@gmail.com` | `Avinash@123` | Full Student Portal |
| **Admin HOD** | `admin@eduverse.com` | `Admin@123` | HOD Control Center |

---

## 📦 GitHub Publication Steps

Run the following commands in your workspace root to upload to GitHub:

```bash
git init
git add .
git commit -m "feat: complete EduVerse LMS platform release with role isolation and Cloudinary integration"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

---

## 🌐 Render Deployment Instructions

### 1. Backend Web Service (Render)
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `node server.js` (or `npm start`)
- **Root Directory**: `backend`
- **Environment Variables**: Add all variables specified in `backend/.env.example`.
- **Health Check Path**: `/api/health`

### 2. Frontend Static Site (Render / Vercel)
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Root Directory**: `frontend`
- **Environment Variable**: `VITE_API_URL=https://<your-backend-render-app>.onrender.com/api`
