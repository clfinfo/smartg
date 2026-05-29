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

## Vercel Deployment
This repository is ready for Vercel deployment with a static frontend build.

1. Create a Vercel project connected to this GitHub repository.
2. Set the project root to the repository root.
3. Add the environment variable for the frontend backend URL:

```env
VITE_BACKEND_URL=https://your-backend.example.com
```

If you are deploying both frontend and backend separately, the backend must be hosted on a public URL and the frontend `VITE_BACKEND_URL` should point to it.

Vercel will build the frontend from `frontend/package.json` and output the production files to `frontend/dist`.
