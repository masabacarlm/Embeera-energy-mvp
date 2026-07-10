$ErrorActionPreference = "Stop"
$name = "Embeera Energy Demo"
$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $admin) { throw "Run PowerShell as Administrator, then run this script again." }
if (-not (Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue)) { New-NetFirewallRule -DisplayName $name -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5000 -Profile Private | Out-Null }
Write-Host "Private-network inbound TCP port 5000 is allowed." -ForegroundColor Green
Write-Host 'Removal: netsh advfirewall firewall delete rule name="Embeera Energy Demo"'
