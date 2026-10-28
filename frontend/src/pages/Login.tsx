import { motion } from "framer-motion";
import { ArrowRight, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [login, setLogin] = useState("admin");
  const [senha, setSenha] = useState("");
  const utils = trpc.useUtils();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Login realizado com sucesso.");
    },
    onError: error => toast.error(error.message),
  });

  return <main className="login-page">
    <motion.section className="login-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="login-brand"><div className="brand-mark"><span>V</span><span>F</span></div><div><strong>Venda<span>Flow</span></strong><small>gestão comercial</small></div></div>
      <div className="login-copy"><span className="eyebrow">Acesso ao workspace</span><h1>Entre para vender em movimento.</h1><p>Use suas credenciais para acessar clientes, produtos, vendas e usuários.</p></div>
      <form className="login-form" onSubmit={event => { event.preventDefault(); loginMutation.mutate({ login, senha }); }}>
        <label className="form-field"><span>Usuário<b>*</b></span><div className="login-input"><UserRound size={17} /><input value={login} onChange={event => setLogin(event.target.value)} autoComplete="username" placeholder="admin" required /></div></label>
        <label className="form-field"><span>Senha<b>*</b></span><div className="login-input"><LockKeyhole size={17} /><input type="password" value={senha} onChange={event => setSenha(event.target.value)} autoComplete="current-password" placeholder="••••••" required /></div></label>
        <button className="button button-primary login-submit" type="submit" disabled={loginMutation.isPending}>{loginMutation.isPending ? "Entrando..." : <>Entrar no VendaFlow <ArrowRight size={17} /></>}</button>
      </form>
      <div className="login-note"><ShieldCheck size={16} /><span>Use as credenciais administrativas configuradas no ambiente do servidor.</span></div>
    </motion.section>
  </main>;
}
