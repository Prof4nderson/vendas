$ErrorActionPreference = "Stop"

$databaseUrl = if ($env:VENDAFLOW_DATABASE_URL) { $env:VENDAFLOW_DATABASE_URL } else { "postgresql://postgres:postgres@127.0.0.1:5432/banco1" }
if ($databaseUrl -notmatch '^postgres(?:ql)?://([^:]+):([^@]*)@([^:/]+)(?::(\d+))?/([^?]+)') {
  throw "VENDAFLOW_DATABASE_URL inválida. Use postgresql://usuario:senha@host:porta/banco"
}
$user = $Matches[1]
$host = $Matches[3]
$port = if ($Matches[4]) { $Matches[4] } else { "5432" }
$db = $Matches[5]

Write-Host "ATENÇÃO: isso apagará todas as tabelas e dados do banco $db em $host`:$port." -ForegroundColor Yellow
$confirmation = Read-Host "Digite RECRIAR para continuar"
if ($confirmation -ne "RECRIAR") { Write-Host "Operação cancelada."; exit 0 }

$env:PGPASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { Read-Host "Senha do PostgreSQL" -AsSecureString | ForEach-Object { [System.Net.NetworkCredential]::new('', $_).Password } }
psql -h $host -p $port -U $user -d $db -v ON_ERROR_STOP=1 -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
if ($LASTEXITCODE -ne 0) { throw "Não foi possível recriar o schema PostgreSQL." }
Write-Host "Schema recriado. Inicie o Spring Boot; ddl-auto=update criará as tabelas." -ForegroundColor Green
