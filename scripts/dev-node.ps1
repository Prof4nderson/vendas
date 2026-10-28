$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
$env:NODE_ENV = "development"
$env:LOCAL_DEV_AUTH = "true"
$env:LOCAL_DEV_OPEN_ID = "local-admin"
pnpm run dev:node
