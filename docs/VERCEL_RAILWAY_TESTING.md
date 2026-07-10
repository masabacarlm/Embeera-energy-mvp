# Production-demo test checklist

## Frontend

- [ ] `npm run build` succeeds and creates `dist/index.html` and `dist/assets/`.
- [ ] Vercel deployment succeeds; logo and all local illustrations load.
- [ ] `/login`, `/register`, `/admin`, `/member`, `/ambassador`, `/circles`, `/lessons`, `/certificate`, and `/phase-two` refresh to the SPA.
- [ ] Desktop, tablet, and phone layouts are usable and accessible.
- [ ] `VITE_API_URL` points to the public Railway API; production bundles contain no localhost URL.

## Backend

- [ ] Railway deploys, binds to `process.env.PORT`, and its public `/api/health` returns healthy.
- [ ] Production errors omit stack traces and SQL details.
- [ ] CORS accepts the exact Vercel origin and rejects an unknown browser origin.

## Database

- [ ] MySQL connects; `npm run db:migrate` and deliberate `npm run db:seed-demo` succeed.
- [ ] Data survives backend redeployment; user passwords are bcrypt hashes.

## Features

- [ ] Member and ambassador registration/login; admin registration rejected; `/auth/me`; logout.
- [ ] Role guards and admin overview/lists.
- [ ] Circle create/join/detail; sandbox contribution and savings progress.
- [ ] Lessons, completion, certificate eligibility/issuance, and delivery request.
- [ ] Ambassador referral ownership, household progress, and certificate readiness.
