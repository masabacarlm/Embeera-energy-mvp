Embeera Energy
===============

Embeera Energy is a React Web/Vite + Node.js/Express + MySQL production-demo app for a Ugandan clean-cooking savings pilot. It supports member, ambassador, and admin dashboards, Oluganda Circle household savings, LPG transition lessons, Enkola Certificate readiness, and certificate-gated LPG delivery requests.

Payments are sandbox records only. No real MTN MoMo, Airtel Money, SMS OTP, USSD, deployment, or PDF certificate integration is included in this phase.

Project Structure
-----------------

```text
embeera-energy-mvp/
  backend/      Node.js + Express API
  frontend/     React Web + Vite app
  database/     MySQL schema and demo seed data
  docs/         Project notes
```

Requirements
------------

- Node.js and npm
- MySQL Server
- Backend `.env` with local database settings

Backend Setup
-------------

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=embeera_energy
AUTH_TOKEN_SECRET=replace_for_local_demo
```

Do not commit real credentials.

Rebuild Database
----------------

This creates a clean demo database with only the production-demo tables.

```powershell
Get-Content .\database\schema_demo_production.sql | mysql -u root -p
Get-Content .\database\seed_demo_production.sql | mysql -u root -p
```

Alternative bcrypt seed path:

```powershell
Get-Content .\database\schema_demo_production.sql | mysql -u root -p
cd backend
npm run seed:demo
```

Run Backend
-----------

```bash
cd backend
npm start
```

API base URL:

```text
http://localhost:5000
```

Run Frontend
------------

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Build Frontend
--------------

```bash
cd frontend
npm run build
```

Demo Users
----------

Use phone number + PIN/password at sign in:

```text
Admin:      0703188291 / admin123
Member:     0772000001 / member123
Ambassador: 0772000002 / ambassador123
```

The frontend does not display demo credentials, quick login buttons, or admin registration. Admin access is seeded only.

Implemented API
---------------

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/admin/overview`
- `POST /api/circles`
- `GET /api/circles/my`
- `POST /api/circles/join`
- `GET /api/circles/:circleId`
- `GET /api/circles/:circleId/members`
- `POST /api/circles/:circleId/contributions`
- `GET /api/circles/:circleId/contributions`
- `GET /api/circles/:circleId/contributions/me`
- `GET /api/lessons`
- `POST /api/lessons/:lessonId/complete`
- `GET /api/lessons/progress/me`
- `GET /api/circles/:circleId/certificate/status`
- `POST /api/circles/:circleId/certificate/generate`
- `GET /api/circles/:circleId/certificate`
- `POST /api/ambassador/referrals`
- `GET /api/ambassador/referrals`
- `POST /api/deliveries`
- `GET /api/deliveries/my`
- `GET /api/health`

Phase 2
-------

- Real SMS OTP
- Real MTN MoMo and Airtel Money APIs
- USSD integration
- Production deployment, monitoring, and hardened auth/session expiry
- PDF Enkola Certificate generation
- Formal migrations and backup/restore process
