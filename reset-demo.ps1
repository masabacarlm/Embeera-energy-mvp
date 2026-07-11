$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location (Join-Path $root "backend")
try {
  & npm run db:migrate
  if ($LASTEXITCODE -ne 0) { throw "Database migration failed." }
  & npm run db:seed-demo
  if ($LASTEXITCODE -ne 0) { throw "Demo seed failed." }
  Write-Host "Embeera Energy demo data is ready." -ForegroundColor Green
} finally { Pop-Location }
