$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$env:DATABASE_URL = if ($env:VENDAFLOW_DATABASE_URL) { $env:VENDAFLOW_DATABASE_URL } else { "postgresql://postgres:postgres@127.0.0.1:5432/banco1" }
$env:NODE_ENV = "development"
$env:LOCAL_DEV_AUTH = "true"
$env:LOCAL_DEV_OPEN_ID = "local-admin"

Write-Host "Usando PostgreSQL em $env:DATABASE_URL" -ForegroundColor Cyan
Write-Host "Iniciando o VendaFlow sem alterar as tabelas existentes..." -ForegroundColor Green
pnpm dev
