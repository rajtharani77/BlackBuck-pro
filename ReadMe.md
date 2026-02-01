# TaskHandler - Project Management System

TaskFlow is a production-grade, role-based project management application designed to streamline collaboration between Admins, Managers, and Employees. It features a secure authentication system, hierarchical permission handling, and an interactive Kanban board for task tracking.

This project was built as part of the Full Stack MERN Intern Assessment by Blackbuck Engineers Pvt Ltd.

## 🚀 Live Demo
**Frontend (Render):** https://blackbuck-pro.onrender.com
**Backend (Render):** https://taskhandler-api.onrender.com

---

## 🔑 Key Features & Roles

### 1. 👑 Super Admin
* **Credentials:** `Admin@BlackBuck.com` / `testPassAdmin77`
* **Capabilities:**
    * Full system control.
    * Create Projects and explicitly assign **Project Managers**.
    * View all projects and tasks across the entire organization.
    * Assign tasks to any user (Managers or Employees).
    * Manage Users (Register new Managers/Employees).

### 2. 💼 Manager
* **Credentials:** (Register a user with role 'MANAGER')
* **Capabilities:**
    * View only projects assigned to them or created by them.
    * Create new Projects (automatically becomes the Manager).
    * Create Tasks within their projects.
    * Assign tasks to Employees (Users).
    * Cannot assign tasks to Super Admins (Chain of Command logic).

### 3. 👤 User (Employee)
* **Credentials:** (Register a user with role 'USER')
* **Capabilities:**
    * **Read-Only View:** Can see projects they are assigned to.
    * **Task Management:** Can ONLY view and update the status (Todo -> In Progress -> Done) of tasks **specifically assigned to them**.
    * Cannot create projects or tasks.
    * Cannot delete or reassign tasks.

---

## 🛠️ Tech Stack

* **Frontend:** React.js (Vite), Redux Toolkit, React Router, Tailwind CSS (v4)
* **Backend:** Node.js, Express.js, JWT Authentication (HTTP-Only Cookies)
* **Database:** PostgreSQL (Hosted on Neon.tech), Prisma ORM
* **Deployment:** Vercel (Frontend), Render (Backend)

---

## 📂 Folder Architecture

The project follows a clean Monorepo-style structure separating concerns.

```bash
/blackbuck(mern)
├── /client                  # Frontend Application
│   ├── /src
│   │   ├── /app             # Redux Store Configuration
│   │   ├── /features        # Redux Slices (Auth, Project, Task logic)
│   │   ├── /pages           # Main Views (Login, Dashboard, ProjectBoard)
│   │   └── main.jsx         # Entry Point
│   ├── .env                 # Frontend Environment Variables
│   └── package.json
│
├── /server                  # Backend Application
│   ├── /controllers         # Logic for Auth, Projects, Tasks, Users
│   ├── /middleware          # Auth protection & Role verification
│   ├── /prisma              # Database Schema & Seed scripts
│   ├── /routes              # API Route definitions
│   ├── server.js            # Express Entry Point
│   └── package.json


⚙️ Local Setup Instructions
Follow these steps to run the project locally.

1. Backend Setup
Navigate to the server folder:

Bash
cd blackbuck(mern)
Install dependencies:

Bash
npm install
Create a .env file in this folder:

Code snippet
DATABASE_URL="postgresql://[YOUR_NEON_DB_URL]"
JWT_SECRET="your_super_secret_key"
PORT=5000
CLIENT_URL="http://localhost:5173"
Initialize Database:

Bash
npx prisma db push
node prisma/seed.js  # Creates the Admin account
Start Server:

Bash
node server.js
2. Frontend Setup
Open a new terminal and navigate to the client folder:

Bash
cd client/my-project
Install dependencies:

Bash
npm install
Create a .env file in client/my-project:

Code snippet
VITE_API_BASE_URL=http://localhost:5000/api
Start React:

Bash
npm run dev
🔄 Workflow Logic (Chain of Command)
The "Assign Manager" Feature
When an Admin creates a project, they see a special dropdown to "Assign Project Manager". This allows Admins to delegate ownership.

Managers creating a project do not see this; they are automatically assigned as the manager.

The "Task Board" Permissions
Board Visibility: Everyone sees the board (Todo, In Progress, Done).

Editing Rights:

Admin/Manager: Can drag/move ANY task.

Employee: Can only move tasks where assignedToId matches their own ID. Edit buttons are hidden for tasks assigned to others.

🛡️ Security Measures
HTTP-Only Cookies: JWT tokens are stored in cookies that JavaScript cannot access, preventing XSS attacks.

CORS Protection: The backend only accepts requests from the specific Frontend URL (Localhost or Vercel).

Middleware Guard: Every API route is protected by protect (verifies token) and authorize (verifies role)


