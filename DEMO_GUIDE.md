<p align="center"><img src="frontend/public/brand/embeera-logo.svg" alt="Embeera Energy" width="320"></p>

# Production Demo Guide

## Requirements and first setup

Install Node.js 18+ (Node 20+ recommended), npm, and MySQL 8. Copy `backend/.env.example` to `backend/.env`, enter local database access values, and replace `JWT_SECRET` with a long random value. Never commit this file.

Run `Set-ExecutionPolicy -Scope Process Bypass`, then `./reset-demo.ps1` when you intentionally want to recreate demo data. This is destructive only to the database named by `DB_NAME`; it is never run automatically. In an Administrator PowerShell, run `./configure-firewall.ps1`. Start with `./start-demo.ps1`.

Find the host address with `ipconfig` and use the active Wi-Fi/Ethernet IPv4 address. Grader URL: `http://<HOST-IPV4>:5000`; health check: `http://<HOST-IPV4>:5000/api/health`.

## Demo accounts

| Role | Phone | Temporary password |
|---|---|---|
| Admin — Masaba Carl Michael | 0703188291 | Admin@123 |
| Member — Amina Nakato | 0772000001 | Member@123 |
| Ambassador — Sarah Namutebi | 0772000002 | Ambassador@123 |

Recommended workflow: sign in as member, inspect circles, record a sandbox contribution, complete lessons, view the certificate, and inspect delivery; sign in as ambassador to review/referral progress; sign in as admin for programme totals and recent activity. Sandbox payments only record demo data and never transfer real money.

## Troubleshooting and stopping

Confirm MySQL is running, `.env` matches it, port 5000 is unused, and both devices are on the same Private network. Keep the start terminal open; stop with Ctrl+C. Remove the firewall rule with `netsh advfirewall firewall delete rule name="Embeera Energy Demo"`.

Phase 2 integrations (real payments, SMS/USSD, PDF, cloud, audit/privacy controls, mobile app) are deliberately inactive and require production providers and governance.
