# Vercel Deployment Guide for Smart Reporting System

This project is now fully configured as a **monorepo** containing a **Vite React frontend** and an **Express.js backend**. It is prepared to be deployed as a single application on Vercel, with the frontend served statically and the Express backend running as a Serverless Function.

---

## 📂 Project Structure Changes
To support Vercel's architecture, the following files were added/modified:
1. **`package.json` (Root)**: Automatically manages dependencies for both `frontend` and `backend` using npm workspaces. It orchestrates a unified build script that compiles the Vite frontend and outputs it to the root `dist` folder.
2. **`vercel.json` (Root)**: Configures Vercel's edge routing. It routes `/api/*` requests to the backend serverless function and redirects all frontend pages to `index.html` (supporting SPA React Router routing).
3. **`api/index.js` (Root)**: Acts as the serverless function handler that exports the Express app so Vercel can execute it dynamically on demand.
4. **`backend/server.js`**: Adjusted to conditionally run `server.listen()` only when run locally (non-Vercel environment). It now exports the Express `app` callback to interface cleanly with Vercel's Serverless environment.

---

## ⚡ Deployment Instructions

### Step 1: Upload / Push your code
Push this project to a GitHub repository (including the new root files: `package.json`, `vercel.json`, `api/index.js`, and the modified `backend/server.js`).
*(Note: A pre-compressed zip file `smart_g_vercel_ready.zip` has also been generated in the project root if you want to upload it manually).*

### Step 2: Import into Vercel
1. Go to your **Vercel Dashboard** (https://vercel.com) and click **Add New** > **Project**.
2. Import your GitHub repository.

### Step 3: Project Configuration
1. **Root Directory**: Ensure this is set to `./` (the root directory of the repository). **Do NOT** set it to `frontend` or `backend`.
2. **Build & Development Settings**:
   - **Build Command**: Leave as default (`npm run build`). Vercel will automatically run the workspace build script.
   - **Output Directory**: Leave as default or make sure it is `dist`.
3. **Environment Variables**: Add your backend environment variables in the project settings:
   - `MONGODB_URI`: Your MongoDB database connection string (e.g. `mongodb+srv://...`).
   - `MAPS_API_KEY`: Your Google Maps API Key.
   - `VITE_BACKEND_URL`: If your backend is deployed separately, set this to its public URL.
   - Any other keys (e.g. `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `EMAIL_TO`, etc.).

---
## SSH Access Setup
Because pushing to `vishwa4296/smartg` requires GitHub access via SSH, you must add the local public key to your GitHub account.

1. Copy the public key from `C:\Users\DELL\.ssh\id_ed25519.pub`.
2. Go to GitHub > Settings > SSH and GPG keys > New SSH key.
3. Paste the key and save it.
4. Confirm that the remote `vishwa` is configured as `git@github.com:vishwa4296/smartg.git`.

Once the key is added, run:
```bash
cd "c:\Users\DELL\Desktop\smart g"
git push vishwa main
```

If the push still fails, verify that the GitHub account associated with this SSH key has access to `vishwa4296/smartg`.

---

## ℹ️ Important: Socket.IO & WebSockets Note
* **Serverless Behavior**: Vercel runs backends in a **Serverless Function** environment. Serverless functions are ephemeral—they spin up to handle a request and spin down immediately after.
* **Socket.IO limitation**: Because serverless functions are not persistent, **Socket.IO WebSocket connections cannot remain open**.
* **Impact**: Real-time notifications pushed instantly via WebSocket will not work on Vercel out-of-the-box.
* **Solution**: The rest of your app (login, registration, creating complaints, notifications lists, maps integration) will work **perfectly** using standard HTTP REST API endpoints. If real-time instant notifications are required in production, you can:
  1. Deploy the backend to a persistent server host (such as **Render** using the included `render.yaml`, **Railway**, or **Fly.io**).
  2. Or, use a third-party real-time pub/sub service like **Pusher** or **Ably** inside your serverless backend.
