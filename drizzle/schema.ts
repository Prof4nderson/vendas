import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin"]);
export const vendaStatus = pgEnum("venda_status", ["ABERTA", "CONCLUIDA", "CANCELADA"]);

/** Tabela opcional de sessões OAuth do starter Manus. */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: userRole("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

/** Tabelas do projeto Spring Boot original, preservando os nomes existentes. */
export const usuarios = pgTable("tb_usuarios", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  cpf: varchar("cpf", { length: 11 }).notNull().unique(),
  login: varchar("login", { length: 50 }).notNull().unique(),
  senha: varchar("senha", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
});

export const clientes = pgTable("tb_clientes", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  cpf: varchar("cpf", { length: 11 }).notNull().unique(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  endereco: varchar("endereco", { length: 150 }).notNull(),
  cep: varchar("cep", { length: 8 }).notNull(),
  cidade: varchar("cidade", { length: 80 }).notNull(),
  uf: varchar("uf", { length: 2 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  foto: text("foto"),
});

export const produtos = pgTable("tb_produtos", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 120 }).notNull(),
  fabricante: varchar("fabricante", { length: 80 }).notNull().unique(),
  valor: numeric("valor", { precision: 12, scale: 2 }).notNull(),
  foto: text("foto"),
});

export const vendas = pgTable("vendas", {
  id: serial("id").primaryKey(),
  clienteId: integer("cliente_id").notNull().references(() => clientes.id, { onDelete: "restrict" }),
  usuarioId: integer("usuario_id").references(() => usuarios.id, { onDelete: "set null" }),
  dataVenda: timestamp("data_venda").defaultNow().notNull(),
  status: vendaStatus("status").default("ABERTA").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).default("0.00").notNull(),
  observacoes: text("observacoes"),
}, table => ({ clienteIdx: index("vendas_cliente_idx").on(table.clienteId), statusIdx: index("vendas_status_idx").on(table.status) }));

export const itensVendas = pgTable("itens_vendas", {
  id: serial("id").primaryKey(),
  vendaId: integer("venda_id").notNull().references(() => vendas.id, { onDelete: "cascade" }),
  produtoId: integer("produto_id").notNull().references(() => produtos.id, { onDelete: "restrict" }),
  quantidade: integer("quantidade").notNull(),
  valorUnitario: numeric("valor_unitario", { precision: 12, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
}, table => ({ vendaIdx: index("itens_vendas_venda_idx").on(table.vendaId), produtoIdx: index("itens_vendas_produto_idx").on(table.produtoId) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Usuario = typeof usuarios.$inferSelect;
export type InsertUsuario = typeof usuarios.$inferInsert;
export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;
export type Produto = typeof produtos.$inferSelect;
export type InsertProduto = typeof produtos.$inferInsert;
export type Venda = typeof vendas.$inferSelect;
export type InsertVenda = typeof vendas.$inferInsert;
export type ItemVenda = typeof itensVendas.$inferSelect;
export type InsertItemVenda = typeof itensVendas.$inferInsert;
