# TODO — VendaFlow

- [x] **Persistência e modelo comercial**
  - Criadas as tabelas `vendas` e `itens_vendas` com chaves estrangeiras para clientes, usuários e produtos.
  - Preservadas as entidades de autenticação e criadas as entidades comerciais `usuarios`, `clientes` e `produtos`.
  - Vendas mantêm status, data, cliente, itens, quantidades, valores unitários, subtotais e total calculado em transação.

- [x] **CRUD de cadastros**
  - Implementada listagem, cadastro, visualização, edição e exclusão de usuários, clientes e produtos.
  - CRUD protegido por sessão; usuários exigem permissão administrativa.
  - Senhas são armazenadas como hash e nunca retornadas pela API; edição vazia preserva a senha atual.
  - Feedbacks de carregamento, sucesso, erro, confirmação e ausência de dados estão implementados.

- [x] **CRUD de vendas**
  - Implementada inclusão, alteração e remoção de itens, quantidades, valores e cálculo do total.
  - Persistidos cabeçalho e itens em `vendas` e `itens_vendas` com transações.
  - Listagem com busca, filtro por status e visualização detalhada dos itens.

- [x] **Interface de operação**
  - Entregue frontend React Vite responsivo, integralmente em português do Brasil.
  - Menu principal em cards, atalhos rápidos e navegação lateral para usuários, clientes, produtos e vendas.
  - Ícones animados e microinterações coerentes com o estilo Painel Cinético.

- [x] **Integração e entrega**
  - Frontend conectado aos procedimentos tRPC do servidor e ao banco gerenciado.
  - Manifesto `manus-routes.json` sincronizado com as rotas da aplicação.
  - `pnpm check`, `pnpm test` e `pnpm build` concluídos com sucesso.

- [x] **Backend Spring Boot conforme o projeto original**
  - Criado `pom.xml` na raiz com Java 17, Spring Web, JPA, PostgreSQL, validação e OpenAPI.
  - Reimplementadas as entidades e rotas REST de usuários, clientes e produtos.
  - Adicionadas as entidades `vendas` e `itens_vendas`, com cálculo transacional de totais.
  - Disponibilizados CORS, hash BCrypt para senhas, tratamento de erros e `/api/health`.
  - `mvn test` e `mvn -DskipTests package` concluídos com sucesso.
