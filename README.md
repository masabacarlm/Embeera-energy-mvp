Embeera Energy
===============

Embeera Energy is a local MVP for a Ugandan clean-energy savings product. It lets a household register, join an Oluganda Circle, make an internal mock savings payment, track savings progress, complete LPG learning, view rewards and certificate status, and request LPG delivery.

This project is local-only. It does not include real MTN MoMo, Airtel Money, live USSD, GPS tracking, or deployment.

Project Structure
-----------------

```text
embeera-energy-mvp/
  backend/      Node.js + Express API
  frontend/     React Native Expo app
  database/     MySQL schema and seed data
  docs/         Project notes
```

Requirements
------------

- Node.js and npm
- MySQL Server
- Expo CLI through `npm start` in the frontend project

Backend Setup
-------------

1. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create a local backend environment file:

   ```bash
   copy .env.example .env
   ```

   On macOS or Linux:

   ```bash
   cp .env.example .env
   ```

3. Edit `backend/.env` with your own local MySQL details:

   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=embeera_energy
   ```

   Keep real passwords only in `backend/.env`. Do not commit them.

Database Setup
--------------

Run these from the `backend` folder after MySQL is running.

Windows PowerShell:

```powershell
Get-Content ..\database\schema.sql | mysql -u root -p
Get-Content ..\database\seed.sql | mysql -u root -p
```

macOS, Linux, or Git Bash:

```bash
mysql -u root -p < ../database/schema.sql
mysql -u root -p < ../database/seed.sql
```

The schema creates the `embeera_energy` database. The seed file adds demo users, groups, savings transactions, learning progress, rewards, ambassadors, referrals, deliveries, and certificates.

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

Run The Frontend
----------------

Open a second terminal:

```bash
cd frontend
npm install
npm start
```

For local web testing, open the Expo web option and keep the backend running on port `5000`.

MVP API Routes
--------------

These routes are backed by MySQL:

- `POST /api/users/register`
- `POST /api/groups/join`
- `POST /api/payments/mock`
- `GET /api/savings/progress/:user_id`
- `POST /api/learning/update`
- `GET /api/rewards/:user_id`
- `POST /api/deliveries/request`

Mock Payment Behavior
---------------------

`POST /api/payments/mock` is an internal simulation only. It does not call MTN MoMo or Airtel Money. A successful mock payment:

- saves a row in `savings_transactions`
- marks the transaction as `successful`
- updates the selected group's `current_amount`
- lets the frontend reload savings progress from MySQL

Frontend Flow
-------------

The Expo app in `frontend/App.js` calls the backend for:

- household registration
- joining an Oluganda Circle
- mock savings payment
- savings progress reload
- learning progress update
- rewards and Enkola Certificate status
- LPG delivery request

The app starts with seeded demo user `1`, so it shows data immediately after running `seed.sql`. After registering a new household, the app switches to that new user for group joining, payment, learning, rewards, and delivery requests.
