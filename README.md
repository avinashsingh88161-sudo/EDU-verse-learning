# EduVerse - Full-Stack Institutional Learning Management System (LMS)

EduVerse is a modern, comprehensive, full-stack Learning Management System built for colleges, universities, and academic institutions. It provides role-based workspaces for **Students**, **Teachers / Faculty**, and **Admin / HODs** with real-time academic workflows, automated quiz evaluations, and PDF courseware delivery.

---

## 🔗 Quick Project Links

- 🌐 **Live Website Demo**: [https://edu-verse-learning.vercel.app](https://edu-verse-learning.vercel.app/)
- 📂 **GitHub Repository**: [https://github.com/avinashsingh88161-sudo/EDU-verse-learning](https://github.com/avinashsingh88161-sudo/EDU-verse-learning)
- 👨‍💻 **Developer / Author Profile**: [Avinash Singh (GitHub)](https://github.com/avinashsingh88161-sudo)

---

## 🌟 Core System Portals & Features

### 🎓 1. Student Portal
- **Dashboard & Progress Tracking**: Real-time overview of enrolled courses, active quizzes, submitted assignments, and overall grade analytics.
- **Course Exploration & Enrollment**: Search, filter, and enroll in department courses.
- **Lecture Notes & PDF Study Docs**: View, stream, and download faculty-uploaded lecture materials.
- **Interactive Quizzes**: Take timed multiple-choice assessments with instant automated scoring and answer reviews.
- **Assignment Submissions**: Upload deliverables (PDF and image documents) with submission timestamps and faculty grading feedback.

### 👨‍🏫 2. Faculty / Teacher Portal
- **Teacher Dashboard**: Live summary of total courses created, active students enrolled, pending assignment reviews, and quiz metrics.
- **Course Curriculum Management**: Create, update, and manage institutional course content.
- **Study Notes Upload**: Direct cloud document uploads with instant student accessibility.
- **Quiz Creation Engine**: Build 4-option multiple-choice quizzes with pass percentage thresholds and draft/publish controls.
- **Assignment & Submission Review**: Post assignments with deadlines and grade student submissions with custom remarks.

### 🛡️ 3. Admin / HOD Governance Panel
- **Institutional Oversight**: System-wide statistics on students, faculty members, courses, quizzes, and assignments.
- **Faculty Verification**: Review, approve, or reject new teacher registration requests before account activation.
- **User Directory**: Search and monitor active student and faculty profiles.
- **Live System Activity**: Audit feed of recent registrations, course creations, submissions, and quiz attempts.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router v7, Axios, Lucide Icons, Vanilla CSS Design System |
| **Backend API** | Node.js, Express.js, RESTful API architecture |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password encryption, Role-based Route Guards |
| **Cloud Storage** | Cloudinary integration for PDF lecture notes and assignment files |
| **Deployment** | Vercel (Frontend SPA) & Render (Backend Cloud Web Service) |

---

## 📁 Project Directory Structure

```
EDU-verse-learning/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection setup
│   │   └── cloudinary.js         # Cloud file storage configuration
│   ├── controllers/              # Business logic and request handlers
│   ├── middleware/               # Authentication & role protection
│   ├── models/                   # Database schemas (User, Course, Quiz, Assignment, Note)
│   ├── routes/                   # API endpoint definitions
│   ├── seed/                     # Seed scripts for initial setup
│   ├── server.js                 # Express server entry point
│   ├── .env.example              # Environment variables template
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── _redirects            # SPA client-side routing redirect
│   │   └── favicon.svg           # Educational graduation cap favicon
│   ├── src/
│   │   ├── api/axiosInstance.js  # Configured Axios client with pre-warming
│   │   ├── components/           # Reusable UI components (Sidebar, Topbar, StatCard, Modal)
│   │   ├── context/AuthContext.jsx # Global user authentication state
│   │   ├── pages/                # Role-specific portal views & dashboard pages
│   │   ├── App.jsx               # Application routing and protected route guards
│   │   ├── main.jsx              # Vite React DOM root
│   │   └── index.css             # Design tokens and theme variables
│   ├── vercel.json               # Vercel SPA rewrite routing config
│   ├── .env.example              # Frontend environment template
│   └── package.json
├── vercel.json                   # Root deployment rewrite rules
└── README.md                     # Comprehensive project documentation
```

---

## 🚀 Local Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/avinashsingh88161-sudo/EDU-verse-learning.git
cd EDU-verse-learning
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
The application will start locally at `http://localhost:5173`.

---

## 👨‍💻 Project Developer Information

- **Name**: Avinash Singh
- **GitHub Profile**: [avinashsingh88161-sudo](https://github.com/avinashsingh88161-sudo)
- **Repository**: [EDU-verse-learning](https://github.com/avinashsingh88161-sudo/EDU-verse-learning)
- **Live Application**: [https://edu-verse-learning.vercel.app](https://edu-verse-learning.vercel.app/)
