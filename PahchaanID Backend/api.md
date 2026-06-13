# API Documentation

Base URL: `/api/v1`

## Auth

### POST /auth/register

Create user and send OTP.

**Body:**

```json
{ "name": "John", "email": "john@example.com", "phone": "+919876543210" }
```

**201:** `{ "message": "OTP sent to your phone", "userId": "uuid", "otp": "123456" }`
**409:** Email or phone already exists

---

### POST /auth/login

Login user and send OTP.

**Body:**

```json
{ "email": "john@example.com" }
```
OR
```json
{ "phone": "+919876543210" }
```

**200:** `{ "message": "OTP sent to your phone", "userId": "uuid", "otp": "123456" }`
**404:** User not found

---

### POST /auth/verify-otp

Verify OTP and get JWT token.

**Body:**

```json
{ "userId": "uuid", "otp": "123456" }
```

**200:** `{ "message": "OTP verified", "token": "jwt-token" }`
**400:** Invalid or expired OTP

---

### POST /auth/hotel 🔒

Add hotel details. Requires `Authorization: Bearer <token>`.

**Body:**

```json
{
  "name": "Hotel Sunrise",
  "regnNo": "HR-12345",
  "phone": "+911234567890",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "latitude": 19.076,
  "longitude": 72.8777
}
```

Required: `name`, `regnNo`, `latitude`, `longitude`

**201:** `{ "message": "Hotel added", "hotel": { ... } }`
**409:** Hotel already registered for this user

---

### POST /auth/plan 🔒

Select subscription plan. Payment is bypassed (dummy).

**Body:**

```json
{ "plan": "BASIC" }
```

Values: `BASIC`, `STANDARD`, `PREMIUM`

**201:** `{ "message": "Plan activated", "subscription": { ... } }`
**404:** Hotel not registered yet

---

### GET /auth/me 🔒

Get current user with hotel and active subscription.

**200:** `{ "user": { "id", "name", "email", "phone", "hotel": { ..., "subscriptions": [...] } } }`
**404:** User not found

---

## Lookup

### POST /lookup 🔒

Mock ID verification. Requires `Authorization: Bearer <token>`.

**Body:**

```json
{
  "idType": "AADHAAR",
  "idNumber": "123456789012",
  "latitude": 19.076,
  "longitude": 72.8777
}
```

Values for `idType`: `AADHAAR`, `PAN`, `VOTER_ID`, `PASSPORT`, `DRIVING_LICENSE`

**200 (Success):**

```json
{
  "found": true,
  "data": {
    "name": "John Doe",
    "dob": "1990-01-01"
  },
  "lookupId": "uuid"
}
```

**200 (Not Found):**

```json
{
  "found": false,
  "message": "ID not found",
  "lookupId": "uuid"
}
```

---

## Check-In

### POST /check-in 🔒

Check-in a guest. Requires `Authorization: Bearer <token>`.

**Body:**

```json
{
  "guestName": "Jane Smith",
  "guestAddress": "123 Street, City",
  "idType": "AADHAAR",
  "idNumber": "1234-5678-9012",
  "roomNumber": "101",
  "adults": 2,
  "children": 1,
  "lookupId": "optional-lookup-uuid"
}
```

**201:** `{ "message": "Checked in", "data": { ... } }`

---

### GET /check-in 🔒

Get all check-ins for the current hotel (with pagination).

**Query Params:** `limit` (default 10), `cursor` (ID of last item)

**200:** `{ "data": [...], "nextCursor": "uuid" }`

---

### PATCH /check-in/:id/checkout 🔒

Check-out a guest.

**200:** `{ "message": "Checked out", "data": { ... } }`
