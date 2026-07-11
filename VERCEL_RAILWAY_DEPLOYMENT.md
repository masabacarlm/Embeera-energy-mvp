# Vercel + Railway deployment

## A. Railway backend

1. Create a Railway project and add a service from this GitHub repository.
2. Set **Root Directory** to `/backend` and **Start Command** to `npm start` if Railway does not detect it.
3. Add a Railway MySQL service in the same project.
4. Add the variable references below plus `JWT_SECRET`, `NODE_ENV=production`, and `HOST=0.0.0.0` to the backend service.
5. Generate a public Railway domain, redeploy, then open `https://YOUR-DOMAIN/api/health`.

## B. Railway database variables

```env
MYSQL_URL=${{MySQL.MYSQL_URL}}
MYSQLHOST=${{MySQL.MYSQLHOST}}
MYSQLPORT=${{MySQL.MYSQLPORT}}
MYSQLUSER=${{MySQL.MYSQLUSER}}
MYSQLPASSWORD=${{MySQL.MYSQLPASSWORD}}
MYSQLDATABASE=${{MySQL.MYSQLDATABASE}}
```

`MySQL` must exactly match the database service name in Railway. `MYSQL_URL` is preferred; the individual values are supported as a fallback.

## C. Vercel frontend

1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`, framework to **Vite**, build command to `npm run build`, and output directory to `dist`.
3. Add `VITE_API_URL=https://YOUR-RAILWAY-DOMAIN/api` and deploy.
4. Copy the final Vercel production URL.

## D. Final backend CORS

Set both `FRONTEND_URL` and `FRONTEND_URLS` on Railway to the exact Vercel origin (no path), then redeploy the backend. For multiple approved origins, make `FRONTEND_URLS` comma-separated. Test registration, login, dashboards, circles, contributions, lessons, certificates, referrals, and deliveries.

## E. Database initialization

Run deliberately from the backend service environment (Railway shell or a one-off command):

```sh
npm run db:migrate
npm run db:seed-demo
```

Migration reads `database/schema_production.sql`, creates missing canonical tables, and does not delete data. Demo seeding follows `database/seed_demo.sql` through `backend/scripts/seedDemo.js`; it is never run at server startup and should only be invoked when grading data is wanted.

## F. Updates

Push to the GitHub branch connected to each service. Vercel rebuilds `frontend`; Railway rebuilds `backend`. Confirm health and the critical journey after schema-affecting updates.
