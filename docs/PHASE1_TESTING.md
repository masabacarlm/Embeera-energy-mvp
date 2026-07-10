# Phase 1 Controlled Demo Testing Checklist

Run these tests against a local-only backend and frontend before any LAN exposure.

## Auth

- [ ] Member registration requires full name, phone number, location, role, and PIN/password.
- [ ] Ambassador registration requires full name, phone number, location, role, and PIN/password.
- [ ] Registration rejects `admin` as a submitted role.
- [ ] Duplicate phone registration returns HTTP 409.
- [ ] Duplicate non-null email registration returns HTTP 409.
- [ ] Invalid login returns HTTP 401 and does not create a user.
- [ ] Phone-number-only login is rejected.
- [ ] Admin login reaches only the admin dashboard.
- [ ] Member login reaches only the member dashboard.
- [ ] Ambassador login reaches only the ambassador dashboard.
- [ ] Logout clears stored user and token.

## Access Control

- [ ] Unauthenticated `/api/admin/overview` returns HTTP 401.
- [ ] Member token cannot access `/api/admin/overview`.
- [ ] Ambassador token cannot access `/api/admin/overview`.
- [ ] Admin token cannot access member-only delivery creation.
- [ ] Admin token cannot access ambassador referral endpoints.
- [ ] Manual browser URL changes do not reveal another dashboard.

## Circles

- [ ] Create circle succeeds with name and target amount greater than zero.
- [ ] Create circle ignores any submitted `created_by` and uses the authenticated user.
- [ ] Create circle auto-adds creator to `circle_members`.
- [ ] Join circle rejects an invalid invite code.
- [ ] Join circle succeeds with a valid invite code.
- [ ] Duplicate join returns HTTP 409.
- [ ] My Circles returns only circles joined by the logged-in user.
- [ ] Circle dashboard rejects users outside the circle unless admin.
- [ ] Circle totals count only successful contributions.
- [ ] Progress percentage is capped at 100%.

## Contributions

- [ ] Valid contribution records successfully for an active joined circle.
- [ ] UI message says exactly `Sandbox payment recorded`.
- [ ] Invalid contribution amount is rejected.
- [ ] Invalid payment method is rejected.
- [ ] Contribution to a circle the user has not joined is rejected.
- [ ] Contribution to a closed/completed circle is rejected.
- [ ] Response returns updated `total_saved` and `progress_percentage`.

## Lessons

- [ ] Lesson completion succeeds for an existing lesson.
- [ ] Duplicate lesson completion does not crash or create duplicate rows.
- [ ] Invalid lesson ID returns HTTP 404.
- [ ] Progress shows total lessons, completed lessons, and percentage completed.
- [ ] Repeated clicks are disabled or handled safely.

## Certificates

- [ ] Certificate before savings eligibility returns `Circle savings target has not been reached`.
- [ ] Certificate before lesson eligibility returns `All active members must complete all transition lessons`.
- [ ] Certificate after eligibility creates one certificate for the circle.
- [ ] Repeated certificate generation returns the existing certificate.
- [ ] Users outside the circle cannot view or generate the certificate unless admin.
- [ ] Summary text matches real circle savings data.

## Ambassador

- [ ] Ambassador referral succeeds only when referred phone belongs to an existing member.
- [ ] Self-referral returns HTTP 409.
- [ ] Duplicate referral returns HTTP 409.
- [ ] Ambassador dashboard shows only the logged-in ambassador's referrals.
- [ ] Referral progress reflects circle membership, total saved, target amount, and certificate status.

## Delivery

- [ ] Delivery before certificate is rejected.
- [ ] Delivery after certificate is issued succeeds for a member of the circle.
- [ ] Duplicate active delivery request returns HTTP 409.
- [ ] Delivery location is required.
- [ ] Member sees only their own delivery requests.
- [ ] Admin can list all delivery requests.
- [ ] Status values are limited to `pending`, `scheduled`, `delivered`, and `cancelled`.

## Admin

- [ ] Admin overview counts total users, members, ambassadors, circles, successful contributions, issued certificates, and pending deliveries.
- [ ] Admin overview includes recent users, recent contributions, and recent referrals.
- [ ] Admin responses do not include password, password hash, session token, or environment values.

## Smoke Command

```bash
cd backend
npm run smoke
```

## Legacy Tables

The active backend routes should not depend on these legacy tables: `oluganda_groups`, `group_members`, `savings_transactions`, `learning_progress`, `referrals`, `ambassadors`, `deliveries`, `rewards`, and `otp_requests`. Existing database instances may still contain them for historical data; do not drop them automatically during Phase 1.
