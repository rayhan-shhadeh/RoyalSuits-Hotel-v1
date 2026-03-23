# Deployment Guide — RoyalSuits Hotel Backend

## Prerequisites

- Node.js 20 LTS installed locally
- `npm install` run inside the `backend/` directory
- A PostgreSQL database (Railway or Render free tier)

---

## Railway

### 1. Provision PostgreSQL

1. Go to [railway.app](https://railway.app) and create a new project.
2. Click **+ New** → **Database** → **PostgreSQL**.
3. Click the PostgreSQL service → **Variables** → copy `DATABASE_URL`.

### 2. Deploy the backend service

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set PORT=3000
railway variables set NODE_ENV=production
railway variables set ALLOWED_ORIGIN=https://your-frontend.vercel.app
railway variables set TWILIO_ACCOUNT_SID=ACxxxxxxxx
railway variables set TWILIO_AUTH_TOKEN=xxxxxxxx
railway variables set TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
railway variables set HOTEL_WHATSAPP_NUMBER="whatsapp:+970593999999"
# Optional:
railway variables set RESEND_API_KEY=re_xxxxxxxx

# Deploy
railway up
```

### 3. Run migrations and seed

```bash
# Run in Railway shell (or as a one-off command)
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

### 4. Verify

```bash
curl https://your-service.railway.app/api/health
# Expected: {"status":"ok","db":"connected"}
```

---

## Render

### 1. Provision PostgreSQL

1. Go to [render.com](https://render.com) and create a new **PostgreSQL** instance (free tier).
2. Copy the **External Database URL**.

### 2. Create a Web Service

1. Click **New** → **Web Service** → connect your GitHub repo.
2. Set **Root Directory** to `backend`.
3. Set **Build Command**: `npm ci && npx prisma generate && npm run build`
4. Set **Start Command**: `npm start`

### 3. Set Environment Variables

In the Render dashboard → Environment tab, add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | (from step 1) |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGIN` | `https://your-frontend.vercel.app` |
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | `xxxxxxxx` |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` |
| `HOTEL_WHATSAPP_NUMBER` | `whatsapp:+970593999999` |
| `RESEND_API_KEY` | `re_xxxxxxxx` (optional) |

### 4. Run migrations and seed

In **Render Shell** (or as a one-off job):

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 5. Verify

```bash
curl https://your-service.onrender.com/api/health
# Expected: {"status":"ok","db":"connected"}
```

---

## Local Development

```bash
cd backend
cp .env.example .env
# Fill in .env values

npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

---

## curl Test Commands

### Check availability (valid)
```bash
curl -X POST http://localhost:3000/api/check-availability \
  -H "Content-Type: application/json" \
  -d '{"checkIn":"2026-04-01T00:00:00.000Z","checkOut":"2026-04-03T00:00:00.000Z","guests":2}'
```

### Check availability (invalid — checkIn after checkOut → 422)
```bash
curl -X POST http://localhost:3000/api/check-availability \
  -H "Content-Type: application/json" \
  -d '{"checkIn":"2026-04-05T00:00:00.000Z","checkOut":"2026-04-01T00:00:00.000Z","guests":2}'
```

### Check availability (bad date format → 400)
```bash
curl -X POST http://localhost:3000/api/check-availability \
  -H "Content-Type: application/json" \
  -d '{"checkIn":"not-a-date","checkOut":"2026-04-03T00:00:00.000Z","guests":2}'
```

### Book a room (success)
```bash
curl -X POST http://localhost:3000/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "checkIn": "2026-04-01T00:00:00.000Z",
    "checkOut": "2026-04-03T00:00:00.000Z",
    "guests": 2,
    "roomId": "<ROOM_ID_FROM_SEED>",
    "customer": {
      "name": "Ahmad Hassan",
      "email": "ahmad@example.com",
      "phone": "+970591234567"
    }
  }'
```

### Book a room (double-book → 409)
```bash
# Run the same curl command again with the same roomId and overlapping dates
```

### Get booking by ID (found)
```bash
curl http://localhost:3000/api/booking/<BOOKING_ID>
```

### Get booking by ID (not found → 404)
```bash
curl http://localhost:3000/api/booking/nonexistent-id-12345
```

### Health check
```bash
curl http://localhost:3000/api/health
```

---

## Postman Collection (import as raw JSON)

```json
{
  "info": { "name": "RoyalSuits Hotel API", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
  "variable": [{ "key": "base_url", "value": "http://localhost:3000" }],
  "item": [
    {
      "name": "Health Check",
      "request": { "method": "GET", "url": "{{base_url}}/api/health" }
    },
    {
      "name": "Check Availability",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/check-availability",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": { "mode": "raw", "raw": "{\"checkIn\":\"2026-04-01T00:00:00.000Z\",\"checkOut\":\"2026-04-03T00:00:00.000Z\",\"guests\":2}" }
      }
    },
    {
      "name": "Book a Room",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/book",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": { "mode": "raw", "raw": "{\"checkIn\":\"2026-04-01T00:00:00.000Z\",\"checkOut\":\"2026-04-03T00:00:00.000Z\",\"guests\":2,\"roomId\":\"REPLACE_WITH_ROOM_ID\",\"customer\":{\"name\":\"Ahmad Hassan\",\"email\":\"ahmad@example.com\",\"phone\":\"+970591234567\"}}" }
      }
    },
    {
      "name": "Get Booking by ID",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/booking/REPLACE_WITH_BOOKING_ID"
      }
    }
  ]
}
```

---

## Frontend Integration Guide

### 1. Vite env variable

In your frontend `.env`:
```
VITE_API_URL=https://your-backend.railway.app
```

### 2. Typed API client (`src/lib/api.ts`)

```typescript
const BASE = import.meta.env.VITE_API_URL as string;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data as T;
}

export interface Room {
  id: string;
  name: string;
  type: 'STANDARD' | 'DELUXE' | 'SUITE';
  capacity: number;
  pricePerNight: number;
  amenities: string[];
}

export interface BookingConfirmation {
  bookingId: string;
  status: 'CONFIRMED';
  room: { name: string; type: string };
  customer: { name: string; email: string };
  checkIn: string;
  checkOut: string;
  totalPrice: number;
}

export const api = {
  checkAvailability: (checkIn: string, checkOut: string, guests: number) =>
    apiFetch<{ availableRooms: Room[] }>('/api/check-availability', {
      method: 'POST',
      body: JSON.stringify({ checkIn, checkOut, guests }),
    }),

  book: (payload: {
    checkIn: string;
    checkOut: string;
    guests: number;
    roomId: string;
    customer: { name: string; email: string; phone?: string };
  }) =>
    apiFetch<BookingConfirmation>('/api/book', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getBooking: (bookingId: string) =>
    apiFetch<BookingConfirmation & { guests: number; createdAt: string }>(
      `/api/booking/${bookingId}`,
    ),
};
```

### 3. Handle 409 Conflict in the booking form

```typescript
try {
  const confirmation = await api.book(payload);
  // Show confirmation UI with confirmation.bookingId
  navigate(`/confirmation?id=${confirmation.bookingId}`);
} catch (err) {
  const error = err as { status: number; error: string };
  if (error.status === 409) {
    toast.error('This room was just booked. Please choose different dates or another room.');
    // Re-run availability check to refresh the room list
    await refreshAvailability();
  } else {
    toast.error('Booking failed. Please try again.');
  }
}
```

### 4. Display booking confirmation

Use `confirmation.bookingId` as the reference number shown to the guest in the success screen.
```
