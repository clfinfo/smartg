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

### 3. Production backend configuration
If you deploy the frontend separately from the backend (for example, using Vercel), set the deployed backend base URL in `frontend/.env` or in your deployment environment variables:

```env
VITE_BACKEND_URL=https://your-backend.example.com
```

A sample file is provided at `frontend/.env.example`.

In local development, the frontend will continue to proxy `/api` requests to `http://127.0.0.1:5000`.
