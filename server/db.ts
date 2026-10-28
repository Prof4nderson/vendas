import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { clientes, itensVendas, produtos, users, usuarios, vendas, type InsertUser, type User } from "../drizzle/schema";
import { ENV } from "./_core/env";

let pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      pool = new Pool({ connectionString: process.env.DATABASE_URL });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export function requireDb(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) throw new Error("Banco de dados indisponível");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const adminExists = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
  const shouldPromote = user.openId === ENV.ownerOpenId || adminExists.length === 0;
  const values: InsertUser = { openId: user.openId, name: user.name, email: user.email, loginMethod: user.loginMethod, role: shouldPromote ? "admin" : (user.role ?? "user"), lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateValues = { name: values.name, email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn, ...(shouldPromote ? { role: "admin" as const } : {}) };
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateValues });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getLocalAuthUser(): Promise<User | undefined> {
  const db = requireDb(await getDb());
  const account = await db.select().from(usuarios).where(eq(usuarios.login, process.env.LOCAL_ADMIN_LOGIN || "admin")).limit(1);
  if (!account[0]) return undefined;
  const now = new Date();
  return { id: account[0].id, openId: "local-admin", name: account[0].nome, email: account[0].email, loginMethod: "local", role: "admin", createdAt: now, updatedAt: now, lastSignedIn: now };
}

const normalizeStatus = (status: string) => status.toLowerCase() as "aberta" | "concluida" | "cancelada";
const databaseStatus = (status: "aberta" | "concluida" | "cancelada") => status.toUpperCase() as "ABERTA" | "CONCLUIDA" | "CANCELADA";

export async function listVendas() {
  const db = requireDb(await getDb());
  const rows = await db.select({ id: vendas.id, clienteId: vendas.clienteId, usuarioId: vendas.usuarioId, dataVenda: vendas.dataVenda, status: vendas.status, total: vendas.total, observacoes: vendas.observacoes, clienteNome: clientes.nome }).from(vendas).leftJoin(clientes, eq(vendas.clienteId, clientes.id)).orderBy(desc(vendas.dataVenda));
  return rows.map(row => ({ ...row, status: normalizeStatus(row.status) }));
}

export async function getVenda(id: number) {
  const db = requireDb(await getDb());
  const header = await db.select({ id: vendas.id, clienteId: vendas.clienteId, usuarioId: vendas.usuarioId, dataVenda: vendas.dataVenda, status: vendas.status, total: vendas.total, observacoes: vendas.observacoes, clienteNome: clientes.nome }).from(vendas).leftJoin(clientes, eq(vendas.clienteId, clientes.id)).where(eq(vendas.id, id)).limit(1);
  if (!header[0]) return null;
  const items = await db.select({ id: itensVendas.id, vendaId: itensVendas.vendaId, produtoId: itensVendas.produtoId, quantidade: itensVendas.quantidade, valorUnitario: itensVendas.valorUnitario, subtotal: itensVendas.subtotal, produtoNome: produtos.nome }).from(itensVendas).leftJoin(produtos, eq(itensVendas.produtoId, produtos.id)).where(eq(itensVendas.vendaId, id));
  return { ...header[0], status: normalizeStatus(header[0].status), itens: items };
}

export async function saveVenda(input: { id?: number; clienteId: number; usuarioId?: number | null; status: "aberta" | "concluida" | "cancelada"; observacoes?: string | null; itens: Array<{ produtoId: number; quantidade: number; valorUnitario: number }> }) {
  const db = requireDb(await getDb());
  return db.transaction(async tx => {
    const total = input.itens.reduce((sum, item) => sum + item.quantidade * item.valorUnitario, 0);
    const headerValues = { clienteId: input.clienteId, usuarioId: input.usuarioId ?? null, status: databaseStatus(input.status), observacoes: input.observacoes ?? null, total: total.toFixed(2) };
    let vendaId = input.id;
    if (vendaId) {
      await tx.update(vendas).set(headerValues).where(eq(vendas.id, vendaId));
      await tx.delete(itensVendas).where(eq(itensVendas.vendaId, vendaId));
    } else {
      // O schema criado pelo Spring usa data_venda NOT NULL sem default.
      // Informar a data aqui mantém Node/tRPC compatível com JPA/PostgreSQL.
      const result = await tx.insert(vendas).values({ ...headerValues, dataVenda: new Date() }).returning({ id: vendas.id });
      vendaId = result[0]?.id;
    }
    if (!vendaId) throw new Error("Não foi possível identificar a venda");
    if (input.itens.length) await tx.insert(itensVendas).values(input.itens.map(item => ({ vendaId: vendaId!, produtoId: item.produtoId, quantidade: item.quantidade, valorUnitario: item.valorUnitario.toFixed(2), subtotal: (item.quantidade * item.valorUnitario).toFixed(2) })));
    return getVendaInTransaction(tx, vendaId);
  });
}

async function getVendaInTransaction(tx: any, id: number) {
  const header = await tx.select({ id: vendas.id, clienteId: vendas.clienteId, usuarioId: vendas.usuarioId, dataVenda: vendas.dataVenda, status: vendas.status, total: vendas.total, observacoes: vendas.observacoes, clienteNome: clientes.nome }).from(vendas).leftJoin(clientes, eq(vendas.clienteId, clientes.id)).where(eq(vendas.id, id)).limit(1);
  const items = await tx.select({ id: itensVendas.id, vendaId: itensVendas.vendaId, produtoId: itensVendas.produtoId, quantidade: itensVendas.quantidade, valorUnitario: itensVendas.valorUnitario, subtotal: itensVendas.subtotal, produtoNome: produtos.nome }).from(itensVendas).leftJoin(produtos, eq(itensVendas.produtoId, produtos.id)).where(eq(itensVendas.vendaId, id));
  return header[0] ? { ...header[0], status: normalizeStatus(header[0].status), itens: items } : null;
}

export async function deleteVenda(id: number) {
  const db = requireDb(await getDb());
  await db.transaction(async tx => { await tx.delete(itensVendas).where(eq(itensVendas.vendaId, id)); await tx.delete(vendas).where(eq(vendas.id, id)); });
}
