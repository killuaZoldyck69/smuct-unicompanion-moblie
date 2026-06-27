# 🎓 SMUCT UniCompanion

> **A comprehensive digital campus companion designed exclusively for Shanto-Mariam University of Creative Technology (SMUCT).**

![React Native](https://img.shields.io/badge/React%20Native-Expo-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Expo Router](https://img.shields.io/badge/Expo%20Router-File--Based%20Routing-black)
![Better Auth](https://img.shields.io/badge/Authentication-Better%20Auth-purple)
![Supabase](https://img.shields.io/badge/Supabase-Storage-3ECF8E?logo=supabase)

---

## 📖 Overview

**SMUCT UniCompanion** is a comprehensive, cross-platform mobile application built with **React Native** and **Expo**. Designed exclusively for **Shanto-Mariam University of Creative Technology (SMUCT)**, it bridges the gap between students, faculty members, and university administration by providing a unified digital campus experience.

Featuring a modern **Soft Campus Bento** design language, the application delivers role-based access control, real-time course hubs, campus utilities, student services, and administrative moderation tools in a single mobile platform.

---

# ✨ Key Features

## 🎓 Student Module

- 📚 Join course hubs using invite codes
- 📢 Receive announcements from instructors
- 📝 Submit assignments and coursework
- 📂 Download lecture materials
- 💬 Participate in course Q&A discussions
- 📅 View weekly class routines
- 📝 Check exam schedules
- 📊 Calculate CGPA instantly
- 🚌 Access live campus bus schedules
- 🎉 Explore upcoming campus events
- 📌 Read official university notices
- 👨‍🎓 Browse the alumni directory
- ⚽ Request campus field bookings
- 🩸 Request or volunteer for blood donations
- 🎫 Submit help & complaint tickets

---

## 👨‍🏫 Faculty Module (Teachers, TAs & CRs)

- 📚 Create and manage course hubs
- 📅 Schedule classes and examinations
- 📝 Publish assignments
- 📥 Review student submissions
- ⭐ Grade coursework
- 📢 Share announcements
- 📂 Upload learning resources
- 💬 Moderate class discussion forums

---

## 🛡️ Administrator Module

- 👥 Manage user accounts
- 🎓 Assign TA and CR roles
- 🛠 Moderate campus users
- 📋 Review complaint tickets
- ⚽ Approve or reject field bookings
- 💬 Moderate community forums
- 📂 Upload Academic Calendar data
- 🚌 Upload Bus Schedule data
- 🎉 Manage Campus Events
- 📄 Export complaint reports to PDF

---

# 🛠 Tech Stack

| Category             | Technology                  |
| -------------------- | --------------------------- |
| **Framework**        | React Native + Expo         |
| **Language**         | TypeScript                  |
| **Routing**          | Expo Router                 |
| **State Management** | TanStack React Query        |
| **HTTP Client**      | Axios                       |
| **Authentication**   | Better Auth                 |
| **Storage**          | Supabase                    |
| **Secure Storage**   | Expo SecureStore            |
| **Icons**            | Expo Vector Icons (Feather) |
| **Typography**       | Plus Jakarta Sans           |

---

# 📂 Project Structure

```text
.
├── app/
│   ├── (auth)/                 # Login, Register, Forgot Password
│   ├── (tabs)/                 # Bottom Tab Navigation
│   ├── admin/                  # Administrator Screens
│   ├── hub/                    # Course Hub Screens
│   └── ...                     # Other Feature Screens
│
├── src/
│   ├── assets/                 # Images & Icons
│   ├── components/             # Reusable Components
│   ├── data/                   # Static JSON Data
│   ├── services/               # API & Authentication
│   ├── theme/                  # Colors & Typography
│   └── utils/                  # Helper Functions
│
├── app.json
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js (v18 or later)
- npm or Yarn
- Expo Go (Android/iOS)

---

## Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/smuct-unicompanion-mobile.git
cd smuct-unicompanion-mobile
```

---

### 2️⃣ Install dependencies

```bash
npm install
```

---

### 3️⃣ Configure Environment Variables

Create a `.env` file in the project root.

```env
# Backend API
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:5000

# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

### 4️⃣ Start the development server

```bash
npx expo start
```

---

### 5️⃣ Run the application

**Physical Device**

- Open **Expo Go**
- Scan the QR code

**Android Emulator**

```text
Press "a"
```

**iOS Simulator**

```text
Press "i"
```

---

# 🎨 Design System

The application follows a custom **Soft Campus Bento** design language.

### 🎨 Color Palette

- Deep Navy (`#131B2E`)
- Pure White (`#FFFFFF`)
- Mint Green
- Rose Pink
- Sky Blue
- Soft Yellow

---

### ✍ Typography

- **Plus Jakarta Sans**

---

### 🧩 UI Components

- Bento-style Cards
- Rounded Corners (`32px`)
- Pill Buttons (`9999px`)
- Soft Shadows
- Minimal Icons
- Clean Spacing

---

# 📱 Core Modules

### Student

- Course Hubs
- Assignments
- CGPA Calculator
- Bus Schedule
- Events
- Noticeboard
- Alumni
- Blood Donation
- Complaint System

---

### Faculty

- Hub Management
- Assignment Management
- Grading
- Course Schedule
- Announcements
- Resource Sharing

---

### Administrator

- User Management
- Data Upload
- Complaint Moderation
- Field Booking
- PDF Export
- Campus Event Management

---

# 🚀 Highlights

- ✅ Role-Based Authentication
- ✅ Real-Time Course Hubs
- ✅ Smart Campus Utilities
- ✅ Complaint Management
- ✅ Academic Calendar
- ✅ Bus Tracking
- ✅ Alumni Network
- ✅ Blood Donation Portal
- ✅ PDF Report Generation
- ✅ Beautiful Bento UI

---

# 📷 Screenshots

> Add screenshots of your application here.

- Login Screen
- Home Dashboard
- Course Hub
- Bus Schedule
- Academic Calendar
- Complaint System
- Admin Dashboard
- Profile Screen

---

# 🤝 Contributing

Contributions are welcome!

If you'd like to improve this project:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

## ⭐ Support

If you found this project useful, please consider giving it a **⭐ Star** on GitHub.

It helps others discover the project and motivates future development.
