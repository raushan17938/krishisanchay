# Deployment Guide: Krishi Sanchay

This guide will walk you through deploying your **Node.js/Express Backend on Render** and your **React/Vite Frontend on Vercel**.

---

## Part 1: Backend Deployment (Render)

1.  **Sign Up/Login**: Go to [render.com](https://render.com) and log in (you can use your GitHub account).
2.  **New Web Service**:
    *   Click the **"New +"** button and select **"Web Service"**.
    *   Connect your GitHub repository: `raushan17938/Krishisanchay`.
3.  **Configure Service**:
    *   **Name**: `krishi-sanchay-backend` (or similar).
    *   **Region**: Choose the one closest to you (e.g., Singapore or Frankfurt).
    *   **Branch**: `main`.
    *   **Root Directory**: `backend` (Important! Your backend code is in this folder).
    *   **Runtime**: `Node`.
    *   **Build Command**: `npm install`.
    *   **Start Command**: `node server.js`.
4.  **Environment Variables**:
    *   Scroll down to **"Environment Variables"** and click **"Add Environment Variable"**. Add the keys from your local `.env` file:
        *   `NODE_ENV`: `production`
        *   `MONGO_URI`: (Your MongoDB Connection String)
        *   `JWT_SECRET`: (Your Secret Key)
        *   `FRONTEND_URL`: `https://krishi-sanchay.vercel.app` (This will be your Vercel URL, you can update this later if unsure).
        *   `CLOUDINARY_*` keys (Cloud Name, API Key, API Secret).
        *   `SMTP_*` keys (Host, User, Pass).
        *   `GOOGLE_CLIENT_*` keys.
        *   `GITHUB_CLIENT_*` keys.
5.  **Deploy**: Click **"Create Web Service"**.
    *   Wait for the deployment to finish. Render will give you a URL like `https://krishi-sanchay-backend.onrender.com`. **Copy this URL.**

---

## Part 2: Frontend Deployment (Vercel)

1.  **Sign Up/Login**: Go to [vercel.com](https://vercel.com) and log in with GitHub.
2.  **Add New Project**:
    *   Click **"Add New..."** -> **"Project"**.
    *   Import your `Krishisanchay` repository.
3.  **Configure Project**:
    *   **Framework Preset**: Select **Vite**.
    *   **Root Directory**: Click "Edit" and select `frontend`.
4.  **Environment Variables**:
    *   Click **"Environment Variables"** to expand the section.
    *   Add:
        *   `VITE_API_URL`: Paste your Render Backend URL here (e.g., `https://krishi-sanchay-backend.onrender.com/api`).
5.  **Deploy**: Click **"Deploy"**.
    *   Vercel will build your site. Once done, it will give you a domain like `krishi-sanchay.vercel.app`.

---

## Part 3: Final Connection Check

1.  **Update Backend**: Go back to your Render Dashboard -> Environment Variables.
    *   Ensure `FRONTEND_URL` matches your new Vercel domain exactly (no trailing slash).
    *   Save changes. Render will redeploy automatically.
2.  **Update OAuth**:
    *   Go to **Google Cloud Console** and **GitHub Developer Settings**.
    *   Update "Authorized Redirect URIs" to use your new Render Backend domain:
        *   `https://krishi-sanchay-backend.onrender.com/api/auth/google/callback`
        *   `https://krishi-sanchay-backend.onrender.com/api/auth/github/callback`

**Success!** Your app should now be live and fully connected.
