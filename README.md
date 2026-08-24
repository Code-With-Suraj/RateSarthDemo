# RateSarthi — Vendor Rate Management & Comparison System

**RateSarthi** is a production-ready procurement and rate collection platform designed for purchase managers to collect item-wise rates from vendors and perform automated side-by-side comparisons.

---

## Key Features

- **Google Sheets Relational Database Engine**: 10 relational tables (Users, Vendors, Categories, Items, Mapping, Requests, RequestItems, RequestVendors, Rates, History) with primary/foreign keys and audit logging.
- **Google Apps Script REST Backend**: Action-based API router supporting session auth, SHA-256 password hashing, and `LockService` concurrency protection.
- **Tailwind CSS Admin Suite**: Clean, high-contrast UI with glassmorphism, responsive sidebar navigation, interactive data tables, modals, and toasts.
- **Token-Based Vendor Portal**: Dedicated mobile-first portal (`/vendor/portal.html?t=<token>`) requiring no vendor passwords. Supports live draft auto-saves, unit prices, MOQ, brand names, and validity terms.
- **Rate Comparison & Analysis Engine**: Automatic lowest-rate green cell highlighting, variance percentage calculations, overall best vendor recommendation, and 1-click Excel/CSV export.
- **Historical Rate Tracking**: Full price revision audit log tracking rate changes over time.

---

## Directory Layout

```
RateSarthi/
├── backend/                  # Google Apps Script Source Files (.gs)
│   ├── Config.gs
│   ├── Utils.gs
│   ├── Database.gs
│   ├── Auth.gs
│   ├── Vendors.gs
│   ├── Categories.gs
│   ├── Items.gs
│   ├── Assignments.gs
│   ├── RateRequests.gs
│   ├── VendorRates.gs
│   ├── Comparison.gs
│   ├── History.gs
│   ├── AuditLog.gs
│   ├── Router.gs
│   └── Main.gs
├── frontend/                 # Vercel / Web App Static Assets
│   ├── css/
│   │   ├── style.css
│   │   └── vendor.css
│   ├── js/
│   │   ├── config.js
│   │   ├── utils.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── components.js
│   │   ├── vendors.js
│   │   ├── categories.js
│   │   ├── items.js
│   │   ├── assignments.js
│   │   ├── requests.js
│   │   ├── create-request.js
│   │   ├── vendorPortal.js
│   │   ├── comparison.js
│   │   ├── history.js
│   │   └── dashboard.js
│   ├── admin/
│   │   ├── dashboard.html
│   │   ├── vendors.html
│   │   ├── categories.html
│   │   ├── items.html
│   │   ├── assignments.html
│   │   ├── requests.html
│   │   ├── create-request.html
│   │   ├── comparison.html
│   │   └── history.html
│   ├── vendor/
│   │   └── portal.html
│   ├── login.html
│   └── index.html
├── vercel.json
├── SETUP_GUIDE.md
├── API_DOCUMENTATION.md
└── README.md
```

---

## Getting Started

Refer to [SETUP_GUIDE.md](file:///g:/My%20Drive/Google%20App%20Scripts/RateSarthi/SETUP_GUIDE.md) for step-by-step instructions on deploying the Google Apps Script backend and connecting the Tailwind frontend.
