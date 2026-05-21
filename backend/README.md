# Smart Reporting System — Node.js Express Backend

This directory contains the highly robust, production-grade **Node.js Express** backend integration supporting local relational database tracking using **SQLite3**, multi-part secure file uploads using **Multer**, session token handling via **JSON Web Tokens (JWT)**, and dynamic **AI computer vision keywords heuristics**.

---

## 📂 Folder Layout

```text
backend/
├── server.js            # Express routes setup, API mappings, DB autoseeder, AI simulation
├── package.json         # Package definitions tree
├── .env                 # Server configuration and embedded Google Maps Key
└── ../data/uploads      # Shared upload storage for images and local data files
```

---

## 🚀 Quick Setup Instructions

### 1. Install Node Dependencies
Open your IDE built-in terminal or Windows command line inside the `backend/` path and run:
```bash
cd "backend"
npm install
```

### 2. Verify `.env` Setup
Your `.env` file automatically injects your real provided Google Maps credential securely:
```env
MAPS_API_KEY=AIzaSyBua0Isk6ej8qYS4pOd2jNQAUSRFtFBito
```

### 3. Launch Server Live
Run the server cleanly. On first start, it seamlessly generates a relational file database (`smart_reporting.db`) and automatically seeds initial testing Accounts (Citizen + Admin) and Active municipal workers out-of-the-box:
```bash
npm start
```
Server broadcasts endpoints actively at: **`http://localhost:5000`**

---

## 🔗 Integrating with React Frontend

If your Vite React app is set to proxy requests directly to `/api`, configure your root `vite.config.js` to target this local Node backend address smoothly:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

---

## 🔑 Pre-Seeded Default Login Accounts
You can log in directly using these out-of-the-box accounts:
* **Citizen View**: `citizen@karnataka.gov.in` | Password: `demo1234`
* **Admin Dashboard**: `admin@karnataka.gov.in` | Password: `admin1234`
