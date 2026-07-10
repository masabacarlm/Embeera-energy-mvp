$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
foreach ($cmd in @("node", "npm.cmd")) { if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) { throw "$cmd is required." } }
foreach ($folder in @("backend", "frontend")) { if (-not (Test-Path (Join-Path $root $folder))) { throw "Missing $folder folder." } }
if (-not (Get-Command mysql -ErrorAction SilentlyContinue)) { Write-Warning "MySQL CLI not found. Ensure MySQL Server is running and backend/.env is configured." }
foreach ($folder in @("backend", "frontend")) { $path = Join-Path $root $folder; if (-not (Test-Path (Join-Path $path "node_modules"))) { Push-Location $path; try { & npm.cmd install; if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed in $folder." } } finally { Pop-Location } } }
Push-Location (Join-Path $root "frontend"); try { & npm.cmd run build; if ($LASTEXITCODE -ne 0) { throw "Frontend build failed." } } finally { Pop-Location }
$ip = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254*" -and $_.AddressState -eq "Preferred" } | Sort-Object { if ($_.InterfaceAlias -match "Wi-Fi|Ethernet") { 0 } else { 1 } } | Select-Object -First 1 -ExpandProperty IPAddress
Write-Host "Local: http://localhost:5000" -ForegroundColor Cyan; if ($ip) { Write-Host "Network: http://${ip}:5000" -ForegroundColor Cyan }; Write-Host "Health: http://localhost:5000/api/health"; Write-Host "Keep this terminal open. Press Ctrl+C to stop."
Push-Location (Join-Path $root "backend"); try { & node server.js; if ($LASTEXITCODE -ne 0) { throw "Server stopped with an error." } } finally { Pop-Location }
