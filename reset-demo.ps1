$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location (Join-Path $root "backend")
try { & node scripts/resetDemo.js; if ($LASTEXITCODE -ne 0) { throw "Database reset failed." }; Write-Host "Embeera Energy demo data is ready." -ForegroundColor Green } finally { Pop-Location }
