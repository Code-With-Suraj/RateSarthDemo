# RateSarthi — API & Architecture Reference

All API calls are dispatched through the action-based router via HTTP `POST` requests to `Router.gs` using `doPost(e)` (or fallback `doGet(e)` for CORS preflights).

---

## Request Format

```json
{
  "action": "ACTION_NAME",
  "payload": { ... },
  "token": "ADMIN_SESSION_TOKEN_OR_VENDOR_PORTAL_TOKEN"
}
```

---

## Standard Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": 1756024800000
}
```

---

## Action Route Reference

### 1. Authentication Actions
- `adminLogin`: Validates email and password, returns session token.
- `verifySession`: Validates active admin session token.

### 2. Vendor Master Actions (`backend/Vendors.gs`)
- `getVendors`: List all procurement vendors.
- `createVendor`: Add a new vendor and automatically generate a 32-character URL portal token.
- `updateVendor`: Update vendor details or status (`ACTIVE`/`INACTIVE`).

### 3. Category Master Actions (`backend/Categories.gs`)
- `getCategories`: List item categories.
- `createCategory`: Add a category.
- `updateCategory`: Edit category details.

### 4. Items Master Actions (`backend/Items.gs`)
- `getItems`: Fetch catalog items (optional `categoryId` filter).
- `createItem`: Add item with specification and unit of measurement.
- `updateItem`: Edit item details.

### 5. Vendor-Item Mapping Actions (`backend/Assignments.gs`)
- `getAssignments`: Get mapping matrix for a vendor.
- `saveAssignments`: Overwrite item mappings for a vendor.

### 6. Rate Request Workflow Actions (`backend/RateRequests.gs`)
- `getRateRequests`: List rate collection campaigns with completion stats.
- `createRateRequest`: Publish a multi-step request to selected items and vendors.

### 7. Vendor Portal Actions (`backend/VendorRates.gs`)
- `getVendorRequest`: Authenticates vendor token, retrieves assigned items for the request.
- `saveVendorRate`: Saves draft rate entry (rate, MOQ, brand, validity, remarks).
- `submitVendorRates`: Final submission locked via `LockService`.

### 8. Comparison Engine Actions (`backend/Comparison.gs`)
- `getComparison`: Generates side-by-side vendor matrix, identifies lowest rates, calculates savings.

### 9. History Actions (`backend/History.gs`)
- `getRateHistory`: Retrieves price revision audit logs.
