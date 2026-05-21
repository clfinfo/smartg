# Smart-G Project

This project has been restructured to cleanly separate the frontend and backend into two distinct directories. The Node.js backend has also been refactored into an organized MVC pattern.

## Project Structure
- `/frontend`: Contains all React/Vite code, components, and pages.
- `/backend`: Contains all the MVC Express/Node.js backend code (`routes`, `controllers`, `models`, `config`).
- `/data`: Contains uploaded images and local development database files.

## How to Run

You will need two separate terminal windows.

### 1. Start the Backend
Open a terminal in the project root and run:
```cmd
cd backend
npm run dev
```

### 2. Start the Frontend
Open a new, separate terminal in the project root and run:
```cmd
cd frontend
npm run dev
```
