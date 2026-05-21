# Smart Reporting System — Complete Python Flask Backend

This folder contains the robust, feature-complete production-ready backend designed with **Python Flask**, **Flask-SQLAlchemy** (supporting SQLite out-of-the-box or external MySQL/Firebase configuration), **Flask-JWT-Extended** for session security, and **REST API JSON mapping architecture**.

---

## 📂 Folder Structure

```text
backend/
├── app.py               # Main Flask application, AI Detection simulation, REST Routes
├── config.py            # Environment configurations loader
├── models.py            # Database tables mapping (Users, Complaints, Workers, Notifications)
├── requirements.txt     # Python application dependency tree
├── .env                 # API keys (Google Maps API Key) and settings
└── static/uploads/      # Secure user uploaded files destination
```

---

## 🛠️ Quick Start Setup

### 1. Create a Virtual Environment & Install Dependencies
Open your command terminal inside the `backend/` directory and execute:

```bash
# Navigate inside the backend folder
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate
# Activate virtual environment (Mac/Linux)
# source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

### 2. Verify `.env` Configuration
Your `.env` file is pre-configured with default JWT secrets and standard SQLite mappings so it runs completely self-contained. It also embeds your exact Google Maps Key mapping:
```env
MAPS_API_KEY=AIzaSyBua0Isk6ej8qYS4pOd2jNQAUSRFtFBito
```
*(To switch to an external **MySQL** database, simply update the `DATABASE_URL` mapping string inside `.env`)*.

### 3. Start the Server
Run the application directly. It automatically seeds default Citizen/Admin testing users along with initial Active field workers:

```bash
python app.py
```
Server runs on: **`http://localhost:5000`**

---

## 🧪 Example API Testing Methods

You can test these endpoints easily using tools like **Postman** or via standard command-line `curl`.

### 1. Register a New User
```bash
curl -X POST http://localhost:5000/register \
     -H "Content-Type: application/json" \
     -d '{"name": "Priya Nair", "email": "priya@gmail.com", "password": "password123", "role": "citizen"}'
```

### 2. Login to receive JWT access token
```bash
curl -X POST http://localhost:5000/login \
     -H "Content-Type: application/json" \
     -d '{"email": "citizen@karnataka.gov.in", "password": "demo1234"}'
```
*(Copy the `"token"` string from the returned response for testing protected endpoints below)*.

### 3. Upload a Complaint Report (with simulated automated AI Detection)
You can upload an image file along with civic form attributes. The server automatically classifies standard Garbage/Pothole images using intelligent keywords heuristics to demonstrate computer vision integration seamlessly.

```bash
curl -X POST http://localhost:5000/upload-report \
     -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
     -F "type=Garbage Overflow" \
     -F "description=Heap of uncollected trash near street pole" \
     -F "severity=High" \
     -F "location_str=BTM Layout 2nd Stage" \
     -F "image=@/path/to/test_garbage_photo.jpg"
```

### 4. Admin API — View All Complaints
```bash
curl -X GET http://localhost:5000/all-complaints?status=Pending \
     -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

### 5. Admin API — Assign Worker
```bash
curl -X POST http://localhost:5000/assign-worker \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
     -d '{"complaint_id": 1, "worker_id": 1}'
```

---

## 🔗 Frontend Connection Instructions

To connect your existing React frontend application to this live backend directly, follow these steps:

### Option A: Direct Axios Configuration
In your React code source (`src/context/ComplaintsContext.jsx` or API client utilities), set up standard base URLs targeting `http://localhost:5000`:

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor helper to append JWT Token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecosmart_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Option B: Seamless Vite Proxy Integration
Alternatively, to bypass browser preflight CORS checks cleanly during local testing, append a backend server proxy mapping inside your root `vite.config.js`:

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
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```
With the proxy configured, your UI can call endpoints like `fetch('/api/my-complaints')` natively.

---

## ✨ Features Summary
- **100% Automated Complaint Handling**: Custom sequence generation (`CMP-1001`), validation tracking, status mapping state flow.
- **24/7 Monitoring Support**: Secure JWT session verification tracking across user tiers.
- **Google Maps API Ready**: Exposed securely inside `config.py` for client dynamic map component loading.
