Embeera Energy
===============

Embeera Energy is a React Web/Vite + Node.js/Express + MySQL MVP for a controlled Ugandan clean-cooking savings pilot. It supports member, ambassador, and admin dashboards, Oluganda Circle household savings records, LPG transition learning, and Enkola Certificate readiness.

This pilot build is not connected to real mobile money, SMS OTP, or live production infrastructure.

Project Structure
-----------------

```text
embeera-energy-mvp/
  backend/      Node.js + Express API
  frontend/     React Web + Vite app
  database/     MySQL schema and seed data
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

Create `backend/.env` with local values:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=embeera_energy
```

Do not commit real credentials.

Database Setup
--------------

For a fresh local database, run:

```powershell
Get-Content ..\database\schema.sql | mysql -u root -p
Get-Content ..\database\seed.sql | mysql -u root -p
```

The current pilot intentionally avoids a risky full migration. Existing mixed old/new tables can remain, but the `users` table must have `phone_number`, `user_type`, and `password` columns.

Run The Backend
---------------

```bash
cd backend
npm start
```

The API runs at:

```text
http://localhost:5000
```

On startup, the backend ensures the controlled-pilot admin account exists and has a bcrypt-hashed password.

Run The Frontend
----------------

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite runs at:

```text
http://localhost:5173
```

Build The Frontend
------------------

```bash
cd frontend
npm run build
```

Pilot Login Setup
-----------------

Admin account:

```text
Full name: Masaba Carl Michael
Phone number: 0703188291
Email: masabacarl8@gmail.com
Role: admin
```

The temporary local pilot admin PIN/password is configured server-side and stored as a bcrypt hash. Do not display it in the frontend.

Members and ambassadors register from the frontend with:

- full name
- phone number
- location
- role: member or ambassador
- secure PIN, minimum 4 characters

Frontend registration must not create admin users.

Authentication
--------------

Sign in requires:

- phone number
- PIN/password

Successful login routes users by role:

- admin: Admin Dashboard
- member: Member Dashboard
- ambassador: Ambassador Dashboard

Dashboards require a valid backend session token. Admin APIs require the admin role.

Payments
--------

Payments are sandbox records only. The UI and API label successful contribution recording as:

```text
Sandbox payment recorded
```

No real MTN MoMo or Airtel Money credentials are included, and no real money moves.

Production Phase Items
----------------------

These are still required before a real production launch:

- real SMS OTP or another verified second-factor flow
- real MTN MoMo and Airtel Money integrations with provider credentials stored securely
- JWT or server-side session hardening with expiry and revocation
- formal database migration scripts and backups
- HTTPS deployment, production CORS origins, logging, monitoring, and incident handling
- full security review and user acceptance testing
