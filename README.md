# 🛒 SmartGrocery AI • Enterprise Retail & Quick-Commerce Platform
### *Powered by React 19, Node.js REST API & WebSockets, and Google Gemini AI*

---

## 🌟 Overview

SmartGrocery AI is a modern retail inventory, in-store POS, and quick-commerce ordering platform featuring:
1. **Google Gemini AI Assistant & Chef**: Interactive shopping assistant, custom recipe suggestions from cart items, and dietary meal planners.
2. **FEFO Inventory & Expiry Management**: First-Expired, First-Out batch picking with real-time color badges and automated markdown clearance.
3. **AI Demand Forecasting & Executive Briefs**: Automated 7-day demand projections and executive supply-chain recommendations.
4. **Omnichannel Storefront & In-Store POS**: Barcode SKU scanning, simulated UPI/Card/COD payments, and downloadable PDF tax invoices.
5. **Real-Time Stock Synchronization**: WebSocket (`Socket.IO`) events broadcast stock updates across all cashiers and customer screens instantly.

---

## 🚀 Quickstart (Local Development & Testing)

### Option 1: One-Click Startup (Windows)
Double-click `start.bat` in the root folder. It builds the frontend and launches the server at **`http://localhost:5000`**.

### Option 2: Manual Terminal Startup

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   node src/server.js
   ```

2. **Start Frontend Dev Server (Optional, for hot reloading)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🔑 Pre-Configured Demo Personas (1-Click Switcher in UI)

You can click any persona button on the top banner in the web interface to switch roles immediately:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| 👨‍💼 **Admin** | `admin@grocery.com` | `admin123` | Full Dashboard, Gemini Brief, POs, Staff RBAC, Audit Logs |
| 🧑‍🍳 **Staff / Cashier** | `staff@grocery.com` | `staff123` | In-store POS Barcode Billing, FEFO Batch Receiving |
| 🚚 **Delivery Agent** | `delivery@grocery.com` | `delivery123` | Dispatch routes, Mark order Out for Delivery / Delivered |
| 🛍️ **Customer** | `customer@gmail.com` | `customer123` | Storefront catalog, Gemini Assistant & Recipes, Cart Checkout |

---

## 🤖 Configuring Google Gemini AI

1. Obtain a free Gemini API Key from **[Google AI Studio](https://aistudio.google.com/)**.
2. Add it to `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
3. *Note: If no key is set, the application operates in Intelligent Simulation Mode, generating realistic AI responses without throwing errors.*

---

## ☁️ Deployment Instructions

### Option 1: Render.com (1-Click Blueprint — Free Tier Optimized)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Dhasweenkumar12/smart-grocery-ai)

Direct Link: **[Deploy to Render.com](https://render.com/deploy?repo=https://github.com/Dhasweenkumar12/smart-grocery-ai)**

1. Click the **Deploy to Render** button above.
2. Render detects `render.yaml` automatically.
3. Paste your `MONGODB_URI` (from free [MongoDB Atlas](https://www.mongodb.com/atlas)) and `GEMINI_API_KEY`.
4. Click **Apply** to deploy! Once deployed, your app will be live at `https://smart-grocery-platform.onrender.com`.

### Option 2: Docker / VPS Deployment
Run with Docker Compose:
```bash
docker compose up -d --build
```
The application will be live on `http://localhost:5000`.
