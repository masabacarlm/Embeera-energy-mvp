# Vercel + Render + Aiven deployment

## 1. Aiven MySQL

1. Create exactly one MySQL service in Aiven. Check the project first and do not create a duplicate service.
2. Obtain either the service URI (`MYSQL_URL`) or the separate host, port, user, password, and database values.
3. Download the service CA certificate. Store its contents only in the Render secret `MYSQL_CA_CERT`; never commit it.
4. Set `MYSQL_SSL=true`. The backend verifies the server certificate.

## 2. Render backend

1. Connect this GitHub repository and create exactly one web service (or apply the repository `render.yaml`). Do not create a Render database or frontend service.
2. Use Root Directory `backend`, Runtime `Node`, Build Command `npm install`, Start Command `npm start`, and Health Check `/api/health`.
3. Add `NODE_ENV=production`, `HOST=0.0.0.0`, and a securely generated `JWT_SECRET`.
4. Add the Aiven variables from step 1. Prefer `MYSQL_URL`; separate variables are `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_DATABASE`.
5. Deploy, then verify `https://YOUR-RENDER-SERVICE.onrender.com/api/health`.

## 3. Database initialization

From a backend environment configured with the confirmed Aiven service, run each command once and deliberately:

```sh
npm run db:migrate
npm run db:seed-demo
```

Migration uses `database/schema_production.sql`. Demo seeding uses the existing `backend/scripts/seedDemo.js` workflow and canonical `database/seed_demo.sql`. Never add migration or seeding to deployment or `npm start`, and never reset the production database.

## 4. Vercel frontend

1. Import the same GitHub repository into Vercel; do not create a duplicate project.
2. Set Root Directory `frontend`, Framework `Vite`, Build Command `npm run build`, and Output Directory `dist`.
3. Set `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api` and deploy.

The existing `frontend/vercel.json` supplies the SPA fallback.

## 5. CORS finalization

After Vercel deploys, set both `FRONTEND_URL` and `FRONTEND_URLS` on Render to the exact Vercel production origin, with no path or trailing slash. Redeploy Render and verify the health endpoint and browser API access.
