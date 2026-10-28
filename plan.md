# Plano — VendaFlow

## Implementação
O VendaFlow será uma aplicação web gerenciada em React + Vite no cliente, Express + tRPC no servidor e Drizzle ORM com MySQL gerenciado. O backend será adaptado a partir do domínio do projeto2.zip: usuários, clientes e produtos, acrescentando vendas e itens_vendas com relações entre venda, cliente e produto. Cada entidade terá procedimentos tRPC para listar, obter, criar, atualizar e excluir; vendas terão operações transacionais para criar a venda com seus itens, atualizar cabeçalho/itens e excluir a venda.

A interface terá navegação por cards e telas de operação no mesmo shell, usando estado de rota com wouter, filtros, tabelas compactas, formulários em diálogos e feedback de sucesso/erro. O usuário poderá alternar entre visão geral, usuários, clientes, produtos e vendas. A experiência será responsiva, com foco em uso operacional e estados vazios, carregamento e confirmação.

## Estrutura
- `drizzle/schema.ts`: tabelas `users`, `clientes`, `produtos`, `vendas` e `itens_vendas`, tipos e relações.
- `server/db.ts`: conexão Drizzle e consultas/repositórios das entidades.
- `server/routers.ts`: procedimentos tRPC CRUD e transações de vendas.
- `frontend/src/App.tsx`: shell, rotas e navegação.
- `frontend/src/pages/Home.tsx`: dashboard, cards de operação e CRUDs em painel.
- `frontend/src/index.css`: sistema visual, responsividade e animações.
- `frontend/public/manus-routes.json`: manifesto das páginas.

## Design — Painel Cinético
- **Design Movement:** dashboard operacional cinético, com cards assimétricos, contraste forte e microinterações energéticas.
- **Core Principles:** leitura imediata, hierarquia por blocos, ação em poucos cliques e feedback contínuo.
- **Color Philosophy:** azul elétrico para confiança/controle, laranja para ação e destaque, superfícies claras e grafite para contraste.
- **Layout Paradigm:** navegação lateral persistente e conteúdo em faixas com cards de pesos diferentes, evitando um painel central monótono.
- **Signature Elements:** marca “VF” em bloco azul, cartões com bordas inclinadas/acentos laterais e ícones que pulsam ao interagir.
- **Interaction Philosophy:** cada ação responde com movimento curto, estado visual e mensagem clara; exclusões pedem confirmação.
- **Animation:** entrada escalonada dos cards, flutuação suave em ícones de métricas, rotação curta em carregamento e feedback de sucesso com escala.
- **Typography System:** Sora para títulos e números; Inter para conteúdo e formulários.
- **Brand Essence:** operação comercial sem atrito para equipes que precisam vender e acompanhar o dia; direto, veloz, confiável.
- **Brand Voice:** “Venda em movimento.” e “Escolha uma operação e mantenha o ritmo.”
- **Wordmark & Logo:** monograma VF com duas barras ascendentes sugerindo fluxo e crescimento.
- **Signature Brand Color:** azul elétrico `#1D4ED8`.

## Escopo obrigatório
- Tabelas `vendas` e `itens_vendas`.
- CRUD completo de usuários, clientes, produtos e vendas.
- Menu principal em cards.
- Frontend React Vite em português do Brasil.
- Ícones animados e estados visuais de carregamento, sucesso, erro, confirmação e ausência de dados.
