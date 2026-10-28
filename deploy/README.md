# Deploy do VendaFlow no VPS

## 1. DNS

Crie um registro `A` para `vendaflow.professor-anderson.com` apontando para o IP público do VPS. Aguarde a propagação.

## 2. Configuração

Na raiz do projeto:

```bash
cp .env.vps.example .env.vps
nano .env.vps
```

Defina uma senha forte para `POSTGRES_PASSWORD`, o mesmo valor em `DB_PASSWORD` e um `MANUS_JWT_SECRET` longo.
Defina também `LOCAL_LOGIN_ENABLED=true`, `LOCAL_ADMIN_LOGIN` e `LOCAL_ADMIN_PASSWORD`. Após subir os containers, acesse `https://vendaflow.professor-anderson.com` e use essas credenciais. Se o usuário ainda não existir na tabela `tb_usuarios`, ele será criado no primeiro login; se já existir, a senha configurada será aplicada quando o primeiro login usar o valor do ambiente.

Não use `123456` em produção e não versione o arquivo `.env.vps`.

## 3. Build e execução

```bash
docker compose --env-file .env.vps -f docker-compose.vps.yml up -d --build
docker compose --env-file .env.vps -f docker-compose.vps.yml ps
curl http://127.0.0.1:3038/api/health
curl http://127.0.0.1:8080/api/health
```

O frontend/API Node fica publicado em `0.0.0.0:3038`. O Spring Boot fica somente em `127.0.0.1:8080` no host; dentro da rede Docker ele atende em `spring:8080`.

## 4. Domínio com Nginx e HTTPS

```bash
sudo cp deploy/nginx/vendaflow.professor-anderson.com.conf /etc/nginx/sites-available/vendaflow
sudo ln -s /etc/nginx/sites-available/vendaflow /etc/nginx/sites-enabled/vendaflow
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d vendaflow.professor-anderson.com
```

Depois disso, acesse `https://vendaflow.professor-anderson.com`.

## Atualizações

```bash
git pull

docker compose --env-file .env.vps -f docker-compose.vps.yml up -d --build
```

O volume `vendaflow_postgres_data` preserva os dados. Não use `docker compose down -v` em produção.
