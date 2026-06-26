# Dhrumil Shah Portfolio — Backend API

Node.js + Express + NeonDB (PostgreSQL) backend for the Dhrumil Shah devotional music portfolio.

---

## Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Runtime     | Node.js 18+                       |
| Framework   | Express 4                         |
| Database    | NeonDB (PostgreSQL via `pg`)      |
| Auth        | JWT + 4-digit Admin PIN           |
| Security    | Helmet, CORS, Rate Limiting       |

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start the server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

On startup, the server **automatically**:
1. Runs all database migrations (creates tables if they don't exist)
2. Seeds default services + 3 sample media items (only if tables are empty)

---

## Environment Variables

| Variable         | Description                                 | Default                |
|------------------|---------------------------------------------|------------------------|
| `DATABASE_URL`   | NeonDB PostgreSQL connection string         | (required)             |
| `PORT`           | Server port                                 | `3000`                 |
| `ADMIN_PIN`      | 4-digit admin PIN                           | `1234`                 |
| `JWT_SECRET`     | Secret key for JWT signing                  | (required in prod)     |
| `JWT_EXPIRES_IN` | Token expiry duration                       | `24h`                  |
| `FRONTEND_URL`   | Frontend URL for CORS allow-list            | (optional)             |

---

## API Reference

### Auth
| Method | Endpoint              | Auth   | Description            |
|--------|-----------------------|--------|------------------------|
| POST   | `/api/auth/verify-pin`| Public | Validate PIN, get JWT  |

**Request body:**
```json
{ "pin": "1234" }
```
**Response:**
```json
{ "success": true, "token": "<jwt>" }
```

---

### Media Gallery
| Method | Endpoint         | Auth   | Description        |
|--------|------------------|--------|--------------------|
| GET    | `/api/media`     | Public | Get all media      |
| GET    | `/api/media/:id` | Public | Get single item    |
| POST   | `/api/media`     | Admin  | Create media item  |
| PUT    | `/api/media/:id` | Admin  | Update media item  |
| DELETE | `/api/media/:id` | Admin  | Delete media item  |

**Media Item shape (frontend-compatible):**
```json
{
  "id": "uuid",
  "title": "string",
  "gujaratiTitle": "string",
  "type": "youtube | image | file_image | file_video | instagram",
  "url": "string",
  "images": ["string"],
  "description": "string",
  "category": "Image | Video",
  "timestamp": 1700000000000
}
```

---

### Services
| Method | Endpoint             | Auth   | Description          |
|--------|----------------------|--------|----------------------|
| GET    | `/api/services`      | Public | Get all services     |
| GET    | `/api/services/:id`  | Public | Get single service   |
| POST   | `/api/services`      | Admin  | Create service       |
| PUT    | `/api/services/:id`  | Admin  | Update service       |
| DELETE | `/api/services/:id`  | Admin  | Delete service       |

**Service Item shape:**
```json
{
  "id": "uuid",
  "icon": "fa-hands-praying",
  "name": "Prabhu Bhakti",
  "gujarati": "પ્રભુ ભક્તિ",
  "desc": "string",
  "timestamp": 1700000000000
}
```

---

### Booking / Inquiry
| Method | Endpoint                   | Auth   | Description             |
|--------|----------------------------|--------|-------------------------|
| POST   | `/api/booking`             | Public | Submit visitor inquiry  |
| GET    | `/api/booking`             | Admin  | List all inquiries      |
| PATCH  | `/api/booking/:id/status`  | Admin  | Update inquiry status   |

**Booking request body:**
```json
{
  "name": "Visitor Name",
  "phone": "+919876543210",
  "service": "Prabhu Bhakti",
  "eventDate": "2024-12-15",
  "message": "Optional message"
}
```

**Status values:** `pending` | `read` | `replied`

---

### Health Check
```
GET /health  →  { "status": "ok", "timestamp": "...", "version": "1.0.0" }
```

---

## Database Schema

```sql
-- Media Gallery
media_gallery (id UUID PK, title, gujarati_title, type, url, images TEXT[],
               description, category, created_at, updated_at)

-- Religious Services
services (id UUID PK, icon, name, gujarati, description, sort_order,
          created_at, updated_at)

-- Visitor Inquiries
bookings (id UUID PK, name, phone, service, event_date, message,
          status, created_at, updated_at)

-- Migration tracker
schema_migrations (id TEXT PK, applied_at)
```

---

## Admin Auth Flow

1. Admin enters PIN in the frontend
2. Frontend calls `POST /api/auth/verify-pin` with `{ "pin": "1234" }`
3. Backend validates PIN against `ADMIN_PIN` env variable
4. On success, returns a JWT
5. Frontend stores token in `localStorage` as `admin_token`
6. All admin API calls automatically include `Authorization: Bearer <token>`

---

## Frontend Integration

Update the frontend `.env`:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

The existing `src/services/api.ts` is already wired to call this backend with no changes needed.

**Services API** — add to `src/services/api.ts`:
```typescript
export const servicesApi = {
  getAll: (): Promise<ServiceItem[]> =>
    api.get('/services').then((r) => r.data),
  create: (item: Omit<ServiceItem, 'id' | 'timestamp'>): Promise<ServiceItem> =>
    api.post('/services', { ...item, desc: item.desc }).then((r) => r.data),
  update: (id: string, item: Partial<ServiceItem>): Promise<ServiceItem> =>
    api.put(`/services/${id}`, item).then((r) => r.data),
  delete: (id: string): Promise<void> =>
    api.delete(`/services/${id}`).then((r) => r.data),
};
```
