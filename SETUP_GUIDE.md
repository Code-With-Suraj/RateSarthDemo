# RateSarthi — Complete Setup & Deployment Guide

This guide details how to deploy **RateSarthi** (Google Apps Script REST Backend + Google Sheets Relational Database + Tailwind CSS Admin & Vendor Frontend).

---

## 1. Google Apps Script Setup

1. Open [script.google.com](https://script.google.com) and create a **New Project**.
2. Name your project `RateSarthi Backend`.
3. Create the following `.gs` files in the Apps Script editor and paste the corresponding code from the `backend/` folder:
   - `Config.gs`
   - `Utils.gs`
   - `Database.gs`
   - `Auth.gs`
   - `Vendors.gs`
   - `Categories.gs`
   - `Items.gs`
   - `Assignments.gs`
   - `RateRequests.gs`
   - `VendorRates.gs`
   - `Comparison.gs`
   - `History.gs`
   - `AuditLog.gs`
   - `Router.gs`
   - `Main.gs`

4. Run `initDatabase()`:
   - In the Apps Script toolbar, select `initDatabase` from the function dropdown.
   - Click **Run**.
   - Review and accept the permission modal.
   - Check the Execution Logs. A new Google Sheet named `RateSarthi_DB` will be automatically generated with all 10 relational tables initialized and seeded with default data (including admin login credentials: `admin@ratesarthi.com` / `admin123`).

---

## 2. Deploy Web App

1. In Google Apps Script editor, click **Deploy** > **New deployment**.
2. Click the gear icon next to *Select type* and select **Web app**.
3. Configure deployment options:
   - **Description**: `RateSarthi Production API v1`
   - **Execute as**: `Me` (*your Google Account*)
   - **Who has access**: `Anyone` (*Required for CORS REST API access*)
4. Click **Deploy**.
5. Copy the generated **Web App URL** (ends with `/exec`).

---

## 3. Frontend Configuration

1. Open `frontend/js/config.js` in your local project.
2. Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL` with your copied Web App URL:
   ```javascript
   const CONFIG = {
     API_BASE_URL: 'https://script.google.com/macros/s/.../exec',
     APP_TITLE: 'RateSarthi',
     VERSION: '1.0.0'
   };
   ```

---

## 4. Deploying Frontend to Vercel

1. Install Vercel CLI (or push codebase to GitHub):
   ```bash
   npm i -g vercel
   vercel
   ```
2. Follow the prompts. The included `vercel.json` will automatically route static assets and clean URLs.
3. Access your Vercel deployment URL (or test locally by serving `frontend/index.html` with a static server).

---

## 5. System Access Summary

| Module | URL Path | Credentials / Access Method |
| :--- | :--- | :--- |
| **Admin Login** | `/login` or `/frontend/login.html` | `admin@ratesarthi.com` / `admin123` |
| **Procurement Dashboard** | `/admin/dashboard.html` | Requires Admin Session |
| **Vendor Rate Portal** | `/vendor/portal.html?t=<TOKEN>&req=<REQ_ID>` | Token-based URL (Generated in Vendors Master) |
