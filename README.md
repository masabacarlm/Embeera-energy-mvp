<p align="center"><img src="frontend/public/brand/embeera-logo.svg" alt="Embeera Energy" width="360"></p>

# Embeera Energy

Embeera Energy helps Ugandan households transition from charcoal and firewood to LPG through community Oluganda Circles: **Join → Save → Transition → Earn**. Contributions in this production demo are sandbox records only; no real money moves.

## Roles and Phase One

- **Members** register, manage their profile, create or join circles, record sandbox contributions, track savings, complete five safety lessons, qualify for an Enkola Certificate, and request LPG delivery.
- **Ambassadors** register, refer existing member households, and track each referral's circle, lesson, savings, and certificate readiness.
- **Admins** sign in through seeded/managed accounts and monitor users, circles, contributions, certificates, referrals, and deliveries. Public admin registration is rejected.

Authentication uses bcrypt password hashes and short-lived JWTs sent in the Authorization header. Routes enforce current database identity and roles; browser-supplied ownership IDs are not trusted. Helmet, rate limiting, strict production CORS, parameterized SQL, bounded JSON bodies, and production-safe errors are enabled.

## Architecture

- React 18 and Vite frontend hosted by **Vercel** (`frontend`, output `dist`)
- Node.js and Express API hosted by **Render** (`backend`, `npm start`)
- One **Aiven MySQL** service using `mysql2/promise`
- One GitHub repository is the deployment source for both services

The browser calls the public Render API through `VITE_API_URL`. Vite proxies `/api` only during local development; production does not depend on localhost or Express static frontend hosting.

## Environment and commands

Copy the `.env.example` files only for local configuration; never commit real environment files.

Frontend requires `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api` in Vercel. Backend production requires `JWT_SECRET`, `NODE_ENV=production`, `HOST=0.0.0.0`, `FRONTEND_URL`/`FRONTEND_URLS`, and the Aiven `MYSQL_URL` or five separate `MYSQL_*` connection variables. Set `MYSQL_SSL=true` and provide `MYSQL_CA_CERT` for verified TLS.

```sh
cd frontend
npm install
npm run build

cd ../backend
npm install
npm run db:migrate
npm run db:seed-demo  # deliberate demo-data action only
npm start
```

The authoritative database files are `database/schema_production.sql` and `database/seed_demo.sql`; the executable entry points are `backend/scripts/migrate.js` and `backend/scripts/seedDemo.js`. The canonical tables are `users`, `circles`, `circle_members`, `contributions`, `lessons`, `lesson_completions`, `certificates`, `ambassador_referrals`, and `delivery_requests`. Migrations do not delete the database and seed data is not run automatically. Demo credentials are documented in `DEMO_GUIDE.md`, never displayed in the login UI.

## Phase Two preview

Real MTN MoMo, Airtel Money, SMS OTP, `*284*88#` USSD, PDF certificates, mobile apps, audit logs, privacy controls, and custom-domain deployment are marked **Coming Soon** and are not active in this demo.

See [VERCEL_RENDER_AIVEN_DEPLOYMENT.md](VERCEL_RENDER_AIVEN_DEPLOYMENT.md) for the exact deployment order.
