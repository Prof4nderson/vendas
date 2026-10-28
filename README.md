# VendaFlow

Monorepo React/Vite + Express/tRPC/Drizzle + Spring Boot, baseado no projeto2 original.

## Estrutura

- `server/`, `drizzle/` e `shared/`: backend de Preview em Node, API tRPC, persistência e contratos compartilhados.
- `pom.xml` e `src/main/java/com/example/projeto2/`: backend Spring Boot na raiz, compatível com o projeto original.
- `frontend/`: aplicação React/Vite, páginas, componentes, estilos e arquivos públicos.
- `vite.config.ts`: integra o servidor Express com o frontend dentro do monorepo.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

Os scripts usam `cross-env`, portanto `pnpm dev` e `pnpm start` funcionam no PowerShell/cmd do Windows, além de Linux e macOS.

### Execução no PowerShell

Abra o PowerShell na pasta do projeto e execute:

```powershell
pnpm install
pnpm dev
```

Para configurar as variáveis sem digitá-las na sessão, copie o modelo:

```powershell
Copy-Item .env.example .env
notepad .env
```

Esse comando inicia o backend Node/tRPC e o frontend integrado em `http://localhost:3000`. Para executar o backend Spring Boot separadamente, abra uma segunda janela do PowerShell e use:

```powershell
pnpm run dev:spring
```

Para executar a cópia baixada localmente sem credenciais OAuth do Manus, use o modo de desenvolvimento local:

```powershell
.\scripts\setup-local.ps1
```

Esse script aponta `DATABASE_URL` para o PostgreSQL existente e inicia o servidor sem recriar nem migrar as tabelas. Defina `VENDAFLOW_DATABASE_URL` antes de executá-lo se a conexão não for `postgresql://postgres:postgres@127.0.0.1:5432/banco1`.

O modo local cria o usuário `admin` com senha `123456` na primeira tentativa de login. O backend Node/tRPC e o backend Spring Boot usam PostgreSQL e as tabelas `tb_usuarios`, `tb_clientes`, `tb_produtos`, `vendas` e `itens_vendas`. O Spring Boot está configurado com `spring.jpa.hibernate.ddl-auto=update`, criando e atualizando tabelas sem apagar os dados.

Se for realmente necessário apagar e recriar tudo, use o script destrutivo somente após confirmar:

```powershell
.\scripts\reset-postgres.ps1
```

Ele exige que você digite `RECRIAR` e depois o `ddl-auto=update` reconstrói as tabelas ao iniciar o Spring Boot.

As permissões do painel são alinhadas com o backend: login é público, clientes, produtos e vendas exigem sessão autenticada, e o CRUD de usuários exige `role=admin`. No modo local, o usuário `admin` recebe essa role; no OAuth, ela vem da sessão persistida no backend.

Também estão disponíveis os scripts equivalentes `./scripts/dev-node.ps1` e `./scripts/dev-spring.ps1`. Se a política de execução bloquear scripts locais, execute uma vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

Para alterar a porta do backend Node no PowerShell:

```powershell
$env:PORT = "3100"
pnpm dev
```

## Deploy no VPS

O build de produção do frontend integrado com Node/tRPC usa a porta externa `3038`. O domínio planejado é `vendaflow.professor-anderson.com`. O Spring Boot permanece na porta interna `8080` e o PostgreSQL é persistido em volume Docker.

Para publicar no VPS:

```bash
cp .env.vps.example .env.vps
# edite .env.vps e troque as senhas/secrets
docker compose --env-file .env.vps -f docker-compose.vps.yml up -d --build
curl http://127.0.0.1:3038/api/health
```

O `docker-compose.yml` padrão também possui os serviços com `build:`. Portanto, para construir sem informar um arquivo adicional, use:

```bash
docker compose build
docker compose up -d
```

Para produção com as credenciais do VPS, prefira `--env-file .env.vps -f docker-compose.vps.yml`.

Configure o DNS `A` do domínio para o IP do VPS e use `deploy/nginx/vendaflow.professor-anderson.com.conf` como proxy reverso. O passo a passo completo está em [`deploy/README.md`](deploy/README.md).

O login local de produção é controlado por `LOCAL_LOGIN_ENABLED=true`. Configure `LOCAL_ADMIN_LOGIN` e `LOCAL_ADMIN_PASSWORD` no `.env.vps`; o usuário administrativo é criado automaticamente no primeiro login se ainda não existir, ou tem a senha sincronizada com o ambiente quando já existe. OAuth Manus pode ser usado como alternativa quando suas variáveis de integração estiverem configuradas.

Para configurar o Spring Boot:

```powershell
$env:SERVER_PORT = "8080"
$env:DB_URL = "jdbc:postgresql://localhost:5432/banco1"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "sua-senha"
pnpm run dev:spring
```

## Backend Spring Boot

O backend Java usa Java 17, Spring Web, Spring Data JPA, PostgreSQL e validação. Para executar:

```bash
mvn spring-boot:run
```

Para gerar o artefato:

```bash
mvn -DskipTests package
java -jar target/vendaflow-backend-1.0.0.jar
```

Por padrão, a API usa `http://localhost:8080` e o banco `banco1`. É possível configurar `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `SERVER_PORT` e `JPA_DDL_AUTO` por variáveis de ambiente. Os endpoints REST são `/api/usuarios`, `/api/clientes`, `/api/produtos`, `/api/vendas`, `/api/itens-vendas` e `/api/health`; a documentação OpenAPI fica em `/swagger-ui.html`.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.

### Fotos opcionais

Clientes e produtos aceitam foto opcional em PNG, JPEG ou WebP de até 1 MB. A imagem é armazenada como texto Base64 na coluna `foto`. Como o projeto usa `spring.jpa.hibernate.ddl-auto=update`, inicie o Spring Boot uma vez para adicionar automaticamente as colunas `foto` em `tb_clientes` e `tb_produtos` antes de usar o CRUD Node.
