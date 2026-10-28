$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
mvn spring-boot:run
