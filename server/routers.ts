import { TRPCError } from "@trpc/server";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { clientes, itensVendas, produtos, usuarios, vendas } from "../drizzle/schema";
import { deleteVenda, getDb, getVenda, listVendas, requireDb, saveVenda } from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { desc, eq } from "drizzle-orm";

const idInput = z.object({ id: z.number().int().positive() });
const usuarioInput = z.object({ nome: z.string().min(2), cpf: z.string().min(11).max(11), login: z.string().min(3), senha: z.string().min(4), email: z.string().email() });
const usuarioUpdateInput = idInput.merge(usuarioInput.extend({ senha: z.string().min(4).optional() }));
const fotoInput = z.string().max(1_500_000).nullable().optional();
const clienteInput = z.object({ nome: z.string().min(2), cpf: z.string().min(11).max(11), telefone: z.string().min(8), endereco: z.string().min(3), cep: z.string().min(8).max(8), cidade: z.string().min(2), uf: z.string().length(2), email: z.string().email(), foto: fotoInput });
const produtoInput = z.object({ nome: z.string().min(2), fabricante: z.string().min(2), valor: z.coerce.number().positive(), foto: fotoInput });
const vendaItemInput = z.object({ produtoId: z.number().int().positive(), quantidade: z.number().int().positive(), valorUnitario: z.coerce.number().positive() });
const vendaInput = z.object({ clienteId: z.number().int().positive(), usuarioId: z.number().int().positive().nullable().optional(), status: z.enum(["aberta", "concluida", "cancelada"]), observacoes: z.string().nullable().optional(), itens: z.array(vendaItemInput).min(1) });
const localLoginInput = z.object({ login: z.string().min(1), senha: z.string().min(1) });

async function database() {
  if (!process.env.DATABASE_URL) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco não configurado. Execute .\\scripts\\setup-local.ps1 no PowerShell ou defina DATABASE_URL." });
  }
  try { return requireDb(await getDb()); }
  catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível no momento." }); }
}

const hashPassword = (password: string) => bcrypt.hashSync(password, 10);
const passwordMatches = (password: string, stored: string) => stored.startsWith("$2") ? bcrypt.compareSync(password, stored) : createHash("sha256").update(password).digest("hex") === stored;
const safeUser = (user: { id: number; nome: string; cpf: string; login: string; email: string }) => user;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure.input(localLoginInput).mutation(async ({ input, ctx }) => {
      if (process.env.NODE_ENV === "production" || process.env.MANUS_OAUTH_API_URL) {
        throw new TRPCError({ code: "FORBIDDEN", message: "O login local está disponível somente no desenvolvimento." });
      }
      const db = await database();
      const adminPassword = hashPassword("123456");
      const existing = await db.select().from(usuarios).where(eq(usuarios.login, "admin")).limit(1);
      if (!existing[0]) {
        await db.insert(usuarios).values({ nome: "Administrador", cpf: "00000000000", login: "admin", senha: adminPassword, email: "admin@localhost" });
      }
      const account = await db.select().from(usuarios).where(eq(usuarios.login, input.login)).limit(1);
      if (!account[0] || !passwordMatches(input.senha, account[0].senha)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Login ou senha inválidos." });
      }
      const token = await sdk.createSessionToken("local-admin", { name: account[0].nome });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), secure: false, sameSite: "lax" });
      return { success: true, user: { nome: account[0].nome, login: account[0].login } };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  usuarios: router({
    list: adminProcedure.query(async () => (await database()).select({ id: usuarios.id, nome: usuarios.nome, cpf: usuarios.cpf, login: usuarios.login, email: usuarios.email }).from(usuarios).orderBy(desc(usuarios.id))),
    get: adminProcedure.input(idInput).query(async ({ input }) => (await database()).select({ id: usuarios.id, nome: usuarios.nome, cpf: usuarios.cpf, login: usuarios.login, email: usuarios.email }).from(usuarios).where(eq(usuarios.id, input.id)).limit(1).then(rows => rows[0] ?? null)),
    create: adminProcedure.input(usuarioInput).mutation(async ({ input }) => { const db = await database(); const result = await db.insert(usuarios).values({ ...input, senha: hashPassword(input.senha) }).returning({ id: usuarios.id }); return safeUser({ id: result[0].id, ...input }); }),
    update: adminProcedure.input(usuarioUpdateInput).mutation(async ({ input }) => { const db = await database(); await db.update(usuarios).set({ nome: input.nome, cpf: input.cpf, login: input.login, email: input.email, ...(input.senha ? { senha: hashPassword(input.senha) } : {}) }).where(eq(usuarios.id, input.id)); return safeUser({ id: input.id, nome: input.nome, cpf: input.cpf, login: input.login, email: input.email }); }),
    delete: adminProcedure.input(idInput).mutation(async ({ input }) => { await (await database()).delete(usuarios).where(eq(usuarios.id, input.id)); return { success: true }; }),
  }),
  clientes: router({
    list: protectedProcedure.query(async () => (await database()).select().from(clientes).orderBy(desc(clientes.id))),
    get: protectedProcedure.input(idInput).query(async ({ input }) => (await database()).select().from(clientes).where(eq(clientes.id, input.id)).limit(1).then(rows => rows[0] ?? null)),
    create: protectedProcedure.input(clienteInput).mutation(async ({ input }) => { const db = await database(); const result = await db.insert(clientes).values(input).returning({ id: clientes.id }); return { id: result[0].id, ...input }; }),
    update: protectedProcedure.input(idInput.merge(clienteInput)).mutation(async ({ input }) => { const db = await database(); await db.update(clientes).set({ nome: input.nome, cpf: input.cpf, telefone: input.telefone, endereco: input.endereco, cep: input.cep, cidade: input.cidade, uf: input.uf, email: input.email, foto: input.foto ?? null }).where(eq(clientes.id, input.id)); return input; }),
    delete: protectedProcedure.input(idInput).mutation(async ({ input }) => { await (await database()).delete(clientes).where(eq(clientes.id, input.id)); return { success: true }; }),
  }),
  produtos: router({
    list: protectedProcedure.query(async () => (await database()).select().from(produtos).orderBy(desc(produtos.id))),
    get: protectedProcedure.input(idInput).query(async ({ input }) => (await database()).select().from(produtos).where(eq(produtos.id, input.id)).limit(1).then(rows => rows[0] ?? null)),
    create: protectedProcedure.input(produtoInput).mutation(async ({ input }) => { const db = await database(); const result = await db.insert(produtos).values({ ...input, valor: input.valor.toFixed(2) }).returning({ id: produtos.id }); return { id: result[0].id, ...input }; }),
    update: protectedProcedure.input(idInput.merge(produtoInput)).mutation(async ({ input }) => { const db = await database(); await db.update(produtos).set({ nome: input.nome, fabricante: input.fabricante, valor: input.valor.toFixed(2), foto: input.foto ?? null }).where(eq(produtos.id, input.id)); return input; }),
    delete: protectedProcedure.input(idInput).mutation(async ({ input }) => { await (await database()).delete(produtos).where(eq(produtos.id, input.id)); return { success: true }; }),
  }),
  vendas: router({
    list: protectedProcedure.query(() => listVendas()),
    get: protectedProcedure.input(idInput).query(({ input }) => getVenda(input.id)),
    create: protectedProcedure.input(vendaInput).mutation(({ input }) => saveVenda(input)),
    update: protectedProcedure.input(idInput.merge(vendaInput)).mutation(({ input }) => saveVenda({ ...input, id: input.id })),
    delete: protectedProcedure.input(idInput).mutation(({ input }) => deleteVenda(input.id).then(() => ({ success: true }))),
  }),
});

export type AppRouter = typeof appRouter;
