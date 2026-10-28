import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Boxes,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  CirclePlus,
  ClipboardList,
  Eye,
  FileText,
  Home as HomeIcon,
  LayoutDashboard,
  Loader2,
  ImagePlus,
  Menu,
  MoonStar,
  Package,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Settings2,
  ShoppingCart,
  Sparkles,
  SunMedium,
  Trash2,
  UserRound,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";

const money = (value: unknown) => `R$ ${Number(value ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
const dateTime = (value: unknown) => value ? new Date(value as string).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const onlyDigits = (value: string) => value.replace(/\D/g, "");

type ViewKey = "dashboard" | "usuarios" | "clientes" | "produtos" | "vendas";
type FormType = "usuario" | "cliente" | "produto";
type ModalState = { type: FormType; item?: any } | null;

type SaleItem = { produtoId: string; quantidade: number; valorUnitario: number };

type IconType = typeof Users;

const navItems: Array<{ key: ViewKey; label: string; icon: IconType }> = [
  { key: "dashboard", label: "Visão geral", icon: LayoutDashboard },
  { key: "usuarios", label: "Usuários", icon: UserRound },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "produtos", label: "Produtos", icon: Package },
  { key: "vendas", label: "Vendas", icon: ShoppingCart },
];

const defaults = {
  usuario: { nome: "", cpf: "", login: "", senha: "", email: "" },
  cliente: { nome: "", cpf: "", telefone: "", endereco: "", cep: "", cidade: "", uf: "", email: "", foto: null },
  produto: { nome: "", fabricante: "", valor: "", foto: null },
};

function EmptyState({ icon: Icon, title, description, action }: { icon: IconType; title: string; description: string; action?: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={22} /></div>
      <strong>{title}</strong>
      <span>{description}</span>
      {action && <button className="button button-primary button-small" onClick={action}><Plus size={15} /> Adicionar primeiro</button>}
    </div>
  );
}

function LoadingRows() {
  return <div className="loading-rows">{[1, 2, 3].map(index => <div className="skeleton-row" key={index}><span /><span /><span /><span /></div>)}</div>;
}

function InlineError({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="inline-error"><CircleAlert size={17} /><span>{message}</span>{retry && <button onClick={retry}>Tentar novamente</button>}</div>;
}

function StatusPill({ status }: { status: string }) {
  const labels: Record<string, string> = { aberta: "Em aberto", concluida: "Concluída", cancelada: "Cancelada" };
  return <span className={`status-pill ${status}`}><span className="status-dot" />{labels[status] ?? status}</span>;
}

function StatCard({ label, value, detail, icon: Icon, tone, onClick }: { label: string; value: string | number; detail: string; icon: IconType; tone: string; onClick: () => void }) {
  return <motion.button className={`stat-card ${tone}`} onClick={onClick} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
    <div className="stat-card-top"><span>{label}</span><span className="icon-bubble"><Icon size={18} /></span></div>
    <strong>{value}</strong>
    <div className="stat-card-bottom"><span>{detail}</span><ArrowUpRight size={16} /></div>
  </motion.button>;
}

function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function FormField({ label, value, onChange, placeholder, type = "text", required = true, wide = false, hint }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean; wide?: boolean; hint?: React.ReactNode }) {
  return <label className={`form-field ${wide ? "field-wide" : ""}`}><span>{label}{required && <b>*</b>}</span><input type={type} value={value ?? ""} placeholder={placeholder} onChange={event => onChange(event.target.value)} required={required} />{hint && <small className="field-hint">{hint}</small>}</label>;
}

function PhotoField({ label, value, onChange }: { label: string; value?: string | null; onChange: (value: string | null) => void }) {
  function readPhoto(file?: File) {
    if (!file) return;
    if (file.size > 1_000_000) { toast.error("Escolha uma foto de até 1 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }
  return <div className="photo-field field-wide"><span className="photo-label">{label}<small>Opcional · até 1 MB</small></span><div className="photo-picker"><div className="photo-preview">{value ? <img src={value} alt="Pré-visualização" /> : <ImagePlus size={22} />}</div><label className="button button-ghost button-small photo-button"><ImagePlus size={15} /> {value ? "Trocar foto" : "Selecionar foto"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => readPhoto(event.target.files?.[0])} /></label>{value && <button type="button" className="text-button photo-remove" onClick={() => onChange(null)}>Remover</button>}</div></div>;
}

function Modal({ title, description, children, onClose, onSubmit, saving }: { title: string; description: string; children: React.ReactNode; onClose: () => void; onSubmit: () => void; saving: boolean }) {
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <motion.div className="modal-card" initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
      <div className="modal-head"><div><span className="eyebrow">Cadastro</span><h2>{title}</h2><p>{description}</p></div><button className="icon-button" onClick={onClose}><X size={19} /></button></div>
      <form onSubmit={event => { event.preventDefault(); onSubmit(); }}><div className="form-grid">{children}</div><div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancelar</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? <Loader2 className="spin" size={16} /> : <Check size={16} />} {saving ? "Salvando" : "Salvar registro"}</button></div></form>
    </motion.div>
  </div>;
}

function SaleModal({ saleForm, setSaleForm, saleItems, setSaleItems, clients, products, saving, editing, onClose, onSubmit }: { saleForm: any; setSaleForm: (value: any) => void; saleItems: SaleItem[]; setSaleItems: (value: SaleItem[]) => void; clients: any[]; products: any[]; saving: boolean; editing: boolean; onClose: () => void; onSubmit: () => void }) {
  const total = saleItems.reduce((sum, item) => sum + item.quantidade * Number(item.valorUnitario), 0);
  const updateItem = (index: number, patch: Partial<SaleItem>) => setSaleItems(saleItems.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const addItem = () => setSaleItems([...saleItems, { produtoId: products[0]?.id ? String(products[0].id) : "", quantidade: 1, valorUnitario: Number(products[0]?.valor ?? 0) }]);
  const onProductChange = (index: number, value: string) => {
    const product = products.find(item => String(item.id) === value);
    updateItem(index, { produtoId: value, valorUnitario: Number(product?.valor ?? 0) });
  };
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <motion.div className="modal-card modal-wide" initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
      <div className="modal-head"><div><span className="eyebrow">Operação comercial</span><h2>{editing ? "Editar venda" : "Nova venda"}</h2><p>Monte os itens, confira o total e acompanhe o status.</p></div><button className="icon-button" onClick={onClose}><X size={19} /></button></div>
      <form onSubmit={event => { event.preventDefault(); onSubmit(); }}>
        <div className="form-grid sale-head-form">
          <label className="form-field"><span>Cliente<b>*</b></span><select value={saleForm.clienteId} onChange={event => setSaleForm({ ...saleForm, clienteId: event.target.value })} required><option value="">Selecione um cliente</option>{clients.map(client => <option key={client.id} value={client.id}>{client.nome}</option>)}</select></label>
          <label className="form-field"><span>Status<b>*</b></span><select value={saleForm.status} onChange={event => setSaleForm({ ...saleForm, status: event.target.value })}><option value="aberta">Em aberto</option><option value="concluida">Concluída</option><option value="cancelada">Cancelada</option></select></label>
          <label className="form-field field-wide"><span>Observações</span><input value={saleForm.observacoes} placeholder="Ex.: entrega até sexta-feira" onChange={event => setSaleForm({ ...saleForm, observacoes: event.target.value })} /></label>
        </div>
        <div className="items-heading"><div><span className="eyebrow">Composição</span><h3>Itens da venda</h3></div><button type="button" className="button button-ghost button-small" onClick={addItem} disabled={!products.length}><Plus size={15} /> Adicionar item</button></div>
        <div className="sale-items">{saleItems.length ? saleItems.map((item, index) => <div className="sale-item-row" key={`${index}-${item.produtoId}`}>
          <select value={item.produtoId} onChange={event => onProductChange(index, event.target.value)} required><option value="">Produto</option>{products.map(product => <option key={product.id} value={product.id}>{product.nome}</option>)}</select>
          <input type="number" min="1" step="1" value={item.quantidade} onChange={event => updateItem(index, { quantidade: Math.max(1, Number(event.target.value)) })} aria-label="Quantidade" />
          <div className="currency-input"><span>R$</span><input type="number" min="0.01" step="0.01" value={item.valorUnitario} onChange={event => updateItem(index, { valorUnitario: Number(event.target.value) })} aria-label="Valor unitário" /></div>
          <strong>{money(item.quantidade * item.valorUnitario)}</strong><button type="button" className="icon-button danger" onClick={() => setSaleItems(saleItems.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16} /></button>
        </div>) : <div className="sale-empty"><ShoppingCart size={20} /><span>Adicione pelo menos um produto para começar.</span><button type="button" onClick={addItem}>Adicionar item</button></div>}</div>
        <div className="sale-total"><span>Total da venda</span><strong>{money(total)}</strong></div>
        <div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancelar</button><button type="submit" className="button button-primary" disabled={saving || !saleForm.clienteId || !saleItems.length}>{saving ? <Loader2 className="spin" size={16} /> : <Check size={16} />} {saving ? "Salvando" : editing ? "Atualizar venda" : "Finalizar venda"}</button></div>
      </form>
    </motion.div>
  </div>;
}

function Dashboard({ stats, sales, loading, onNavigate, onNewSale }: { stats: { users: number; clients: number; products: number; sales: number }; sales: any[]; loading: boolean; onNavigate: (view: ViewKey) => void; onNewSale: () => void }) {
  return <div className="dashboard-content">
    <SectionHeading eyebrow="Painel de controle" title="Venda em movimento." description="Escolha uma operação e mantenha o ritmo do seu negócio." action={<button className="button button-primary" onClick={onNewSale}><CirclePlus size={17} /> Nova venda</button>} />
    <div className="stat-grid"><StatCard label="Vendas no período" value={loading ? "—" : stats.sales} detail="Acessar vendas" icon={ShoppingCart} tone="stat-blue" onClick={() => onNavigate("vendas")} /><StatCard label="Clientes ativos" value={loading ? "—" : stats.clients} detail="Ver carteira" icon={Users} tone="stat-orange" onClick={() => onNavigate("clientes")} /><StatCard label="Produtos cadastrados" value={loading ? "—" : stats.products} detail="Gerenciar catálogo" icon={Package} tone="stat-dark" onClick={() => onNavigate("produtos")} /><StatCard label="Usuários do sistema" value={loading ? "—" : stats.users} detail="Acessar equipe" icon={UserRound} tone="stat-lilac" onClick={() => onNavigate("usuarios")} /></div>
    <div className="dashboard-lower"><section className="panel recent-panel"><div className="panel-head"><div><span className="eyebrow">Acompanhe de perto</span><h2>Vendas recentes</h2></div><button className="text-button" onClick={() => onNavigate("vendas")}>Ver todas <ArrowUpRight size={15} /></button></div>{sales.length ? <div className="recent-list">{sales.slice(0, 5).map(sale => <div className="recent-row" key={sale.id}><div className="sale-avatar"><ReceiptText size={16} /></div><div className="recent-main"><strong>Venda #{String(sale.id).padStart(4, "0")}</strong><span>{sale.clienteNome ?? "Cliente não informado"} · {dateTime(sale.dataVenda)}</span></div><StatusPill status={sale.status} /><strong className="recent-price">{money(sale.total)}</strong></div>)}</div> : <EmptyState icon={ReceiptText} title="Ainda não há vendas" description="Crie a primeira venda para acompanhar seu ritmo por aqui." action={onNewSale} />}</section><section className="panel quick-panel"><div className="panel-head"><div><span className="eyebrow">Atalhos</span><h2>Operações rápidas</h2></div><Zap className="panel-spark" size={20} /></div><div className="quick-grid"><button onClick={() => onNavigate("clientes")}><Users size={18} /><span>Novo cliente</span><Plus size={14} /></button><button onClick={() => onNavigate("produtos")}><Package size={18} /><span>Cadastrar produto</span><Plus size={14} /></button><button onClick={() => onNavigate("usuarios")}><UserRound size={18} /><span>Convidar usuário</span><Plus size={14} /></button><button onClick={onNewSale}><ShoppingCart size={18} /><span>Registrar venda</span><Plus size={14} /></button></div><div className="mini-banner"><Sparkles size={18} /><div><strong>VendaFlow Insights</strong><span>Organize a operação em um só lugar.</span></div></div></section></div>
  </div>;
}

export default function Home() {
  const [activeView, setActiveView] = useState<ViewKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [salesFilter, setSalesFilter] = useState<"todos" | "aberta" | "concluida" | "cancelada">("todos");
  const [modal, setModal] = useState<ModalState>(null);
  const [formData, setFormData] = useState<any>({});
  const [detail, setDetail] = useState<any>(null);
  const [saleModal, setSaleModal] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [saleForm, setSaleForm] = useState({ clienteId: "", status: "aberta", observacoes: "" });
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [hydratedSaleId, setHydratedSaleId] = useState<number | null>(null);
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const auth = useAuth();
  const { theme, themeLabel, toggleTheme } = useTheme();
  const hasSession = Boolean(auth.user);
  const canManageUsers = auth.user?.role === "admin";
  const utils = trpc.useUtils();
  const usersQuery = trpc.usuarios.list.useQuery(undefined, { enabled: hasSession && canManageUsers, retry: false });
  const clientsQuery = trpc.clientes.list.useQuery(undefined, { enabled: hasSession, retry: false });
  const productsQuery = trpc.produtos.list.useQuery(undefined, { enabled: hasSession, retry: false });
  const salesQuery = trpc.vendas.list.useQuery(undefined, { enabled: hasSession, retry: false });
  const saleDetailQuery = trpc.vendas.get.useQuery({ id: selectedSaleId ?? 0 }, { enabled: hasSession && selectedSaleId !== null, retry: false });
  const saleViewDetailQuery = trpc.vendas.get.useQuery({ id: detail?.item?.id ?? 0 }, { enabled: hasSession && detail?.type === "venda", retry: false });
  const userCreate = trpc.usuarios.create.useMutation({ onSuccess: () => { toast.success("Usuário criado com sucesso."); utils.usuarios.list.invalidate(); closeModal(); }, onError: error => toast.error(error.message) });
  const userUpdate = trpc.usuarios.update.useMutation({ onSuccess: () => { toast.success("Usuário atualizado."); utils.usuarios.list.invalidate(); closeModal(); }, onError: error => toast.error(error.message) });
  const userDelete = trpc.usuarios.delete.useMutation({ onSuccess: () => { toast.success("Usuário removido."); utils.usuarios.list.invalidate(); }, onError: error => toast.error(error.message) });
  const clientCreate = trpc.clientes.create.useMutation({ onSuccess: () => { toast.success("Cliente criado com sucesso."); utils.clientes.list.invalidate(); closeModal(); }, onError: error => toast.error(error.message) });
  const clientUpdate = trpc.clientes.update.useMutation({ onSuccess: () => { toast.success("Cliente atualizado."); utils.clientes.list.invalidate(); closeModal(); }, onError: error => toast.error(error.message) });
  const clientDelete = trpc.clientes.delete.useMutation({ onSuccess: () => { toast.success("Cliente removido."); utils.clientes.list.invalidate(); }, onError: error => toast.error(error.message) });
  const productCreate = trpc.produtos.create.useMutation({ onSuccess: () => { toast.success("Produto criado com sucesso."); utils.produtos.list.invalidate(); closeModal(); }, onError: error => toast.error(error.message) });
  const productUpdate = trpc.produtos.update.useMutation({ onSuccess: () => { toast.success("Produto atualizado."); utils.produtos.list.invalidate(); closeModal(); }, onError: error => toast.error(error.message) });
  const productDelete = trpc.produtos.delete.useMutation({ onSuccess: () => { toast.success("Produto removido."); utils.produtos.list.invalidate(); }, onError: error => toast.error(error.message) });
  const saleCreate = trpc.vendas.create.useMutation({ onSuccess: () => { toast.success("Venda registrada com sucesso."); utils.vendas.list.invalidate(); closeSaleModal(); }, onError: error => toast.error(error.message) });
  const saleUpdate = trpc.vendas.update.useMutation({ onSuccess: () => { toast.success("Venda atualizada."); utils.vendas.list.invalidate(); closeSaleModal(); }, onError: error => toast.error(error.message) });
  const saleDelete = trpc.vendas.delete.useMutation({ onSuccess: () => { toast.success("Venda removida."); utils.vendas.list.invalidate(); }, onError: error => toast.error(error.message) });

  useEffect(() => {
    if (modal?.type !== "cliente") { setCepStatus("idle"); return; }
    const cep = onlyDigits(String(formData.cep ?? ""));
    if (cep.length !== 8) { setCepStatus("idle"); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setCepStatus("loading");
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: controller.signal });
        if (!response.ok) throw new Error("Falha na consulta");
        const data = await response.json();
        if (data.erro) throw new Error("CEP não encontrado");
        setFormData((current: any) => ({ ...current, endereco: data.logradouro || current.endereco, cidade: data.localidade || current.cidade, uf: data.uf || current.uf }));
        setCepStatus("success");
      } catch (error) {
        if ((error as Error).name !== "AbortError") setCepStatus("error");
      }
    }, 350);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [modal?.type, formData.cep]);

  const users = usersQuery.data ?? [];
  const clients = clientsQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const sales = salesQuery.data ?? [];
  const isLoading = usersQuery.isLoading || clientsQuery.isLoading || productsQuery.isLoading || salesQuery.isLoading;

  function closeModal() { setModal(null); setDetail(null); setFormData({}); }
  function closeSaleModal() { setSaleModal(false); setSelectedSaleId(null); setHydratedSaleId(null); setSaleItems([]); setSaleForm({ clienteId: "", status: "aberta", observacoes: "" }); }
  function navigate(view: ViewKey) { setActiveView(view); setSearch(""); if (view !== "vendas") setSalesFilter("todos"); setSidebarOpen(false); }
  function openCreate(type: FormType) { setModal({ type }); setFormData({ ...defaults[type] }); setDetail(null); }
  function openEdit(type: FormType, item: any) { setModal({ type, item }); setFormData({ ...item, senha: "" }); setDetail(null); }
  function openDetail(item: any, type: FormType) { setDetail({ item, type }); }
  function updateField(field: string, value: string) { setFormData((current: any) => ({ ...current, [field]: value })); }
  function confirmDelete(kind: "usuario" | "cliente" | "produto" | "venda", id: number) {
    if (!window.confirm("Tem certeza que deseja remover este registro? Essa ação não pode ser desfeita.")) return;
    if (kind === "usuario") userDelete.mutate({ id: Number(id) });
    if (kind === "cliente") clientDelete.mutate({ id: Number(id) });
    if (kind === "produto") productDelete.mutate({ id: Number(id) });
    if (kind === "venda") saleDelete.mutate({ id: Number(id) });
  }
  function saveForm() {
    if (!modal) return;
    if (modal.type === "usuario") { const base = { nome: formData.nome, cpf: onlyDigits(formData.cpf), login: formData.login, email: formData.email }; modal.item ? userUpdate.mutate({ id: Number(modal.item.id), ...base, ...(formData.senha ? { senha: formData.senha } : {}) }) : userCreate.mutate({ ...base, senha: formData.senha }); }
    if (modal.type === "cliente") { const payload = { nome: formData.nome, cpf: onlyDigits(formData.cpf), telefone: formData.telefone, endereco: formData.endereco, cep: onlyDigits(formData.cep), cidade: formData.cidade, uf: formData.uf.toUpperCase(), email: formData.email, foto: formData.foto ?? null }; modal.item ? clientUpdate.mutate({ id: Number(modal.item.id), ...payload }) : clientCreate.mutate(payload); }
    if (modal.type === "produto") { const payload = { nome: formData.nome, fabricante: formData.fabricante, valor: Number(formData.valor), foto: formData.foto ?? null }; modal.item ? productUpdate.mutate({ id: Number(modal.item.id), ...payload }) : productCreate.mutate(payload); }
  }
  function openNewSale() { setSelectedSaleId(null); setSaleForm({ clienteId: clients[0]?.id ? String(clients[0].id) : "", status: "aberta", observacoes: "" }); setSaleItems(products[0]?.id ? [{ produtoId: String(products[0].id), quantidade: 1, valorUnitario: Number(products[0].valor) }] : []); setSaleModal(true); }
  function openEditSale(sale: any) { setSelectedSaleId(Number(sale.id)); setHydratedSaleId(null); setSaleModal(true); }
  function saveSale() { const payload = { clienteId: Number(saleForm.clienteId), status: saleForm.status as "aberta" | "concluida" | "cancelada", observacoes: saleForm.observacoes || null, itens: saleItems.map(item => ({ produtoId: Number(item.produtoId), quantidade: Number(item.quantidade), valorUnitario: Number(item.valorUnitario) })) }; selectedSaleId ? saleUpdate.mutate({ id: selectedSaleId, ...payload }) : saleCreate.mutate(payload); }
  useEffect(() => { if (saleDetailQuery.data && selectedSaleId && hydratedSaleId !== selectedSaleId) { const sale = saleDetailQuery.data; setSaleForm({ clienteId: String(sale.clienteId), status: sale.status, observacoes: sale.observacoes ?? "" }); setSaleItems(sale.itens.map(item => ({ produtoId: String(item.produtoId), quantidade: item.quantidade, valorUnitario: Number(item.valorUnitario) }))); setHydratedSaleId(selectedSaleId); } }, [saleDetailQuery.data, selectedSaleId, hydratedSaleId]);

  const mutationSaving = userCreate.isPending || userUpdate.isPending || clientCreate.isPending || clientUpdate.isPending || productCreate.isPending || productUpdate.isPending;
  const saleSaving = saleCreate.isPending || saleUpdate.isPending;
  const currentData = activeView === "usuarios" ? users : activeView === "clientes" ? clients : activeView === "produtos" ? products : sales;
  const filteredData = useMemo(() => {
    const query = search.toLowerCase().trim();
    return currentData.filter((item: any) => {
      const matchesSearch = !query || JSON.stringify(item).toLowerCase().includes(query);
      const matchesStatus = activeView !== "vendas" || salesFilter === "todos" || item.status === salesFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activeView, currentData, salesFilter, search]);
  const queryError = clientsQuery.error || productsQuery.error || salesQuery.error;
  const permissionError = activeView === "usuarios" && hasSession && !canManageUsers;

  const titleByView: Record<ViewKey, string> = { dashboard: "Visão geral", usuarios: "Usuários", clientes: "Clientes", produtos: "Produtos", vendas: "Vendas" };
  const subtitleByView: Record<ViewKey, string> = { dashboard: "Resumo da operação", usuarios: "Equipe e acessos", clientes: "Carteira de clientes", produtos: "Catálogo comercial", vendas: "Pedidos e faturamento" };
  const formTypeByView: Partial<Record<ViewKey, FormType>> = { usuarios: "usuario", clientes: "cliente", produtos: "produto" };
  const activeIcon = navItems.find(item => item.key === activeView)?.icon ?? HomeIcon;

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><span>V</span><span>F</span></div><div><strong>Venda<span>Flow</span></strong><small>gestão comercial</small></div><button className="mobile-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button></div>
      <div className="sidebar-label">Workspace</div>
      <nav>{navItems.map(({ key, label, icon: Icon }) => <button key={key} className={`nav-item ${activeView === key ? "active" : ""}`} onClick={() => navigate(key)}><Icon size={18} /><span>{label}</span>{key === "vendas" && <span className="nav-count">{sales.length || ""}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-label">Sistema</div><button className="nav-item"><Settings2 size={18} /><span>Configurações</span></button><div className="operator-card"><div className="operator-avatar">OP</div><div><strong>Operação</strong><span>Administrador</span></div><ChevronDown size={15} /></div></div>
    </aside>
    {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><ChevronDown size={14} /><strong>{titleByView[activeView]}</strong></div><div className="topbar-actions"><div className="date-chip"><CalendarDays size={16} />{new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</div><button className="theme-toggle" title={`Alternar para ${theme === "holographic" ? "dark cyberpunk" : "claro holográfico"}`} onClick={toggleTheme}>{theme === "holographic" ? <MoonStar size={16} /> : <SunMedium size={16} />}<span>{themeLabel}</span></button><button className="top-icon"><BellDot /></button><div className="user-chip"><div className="avatar">OP</div><div><strong>Operação</strong><span>Admin</span></div></div></div></header>
      <div className="page-content">
        <AnimatePresence mode="wait"><motion.div key={activeView} className="view-transition" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: "easeOut" }}><div className="view-transition-inner">{activeView === "dashboard" ? <Dashboard stats={{ users: users.length, clients: clients.length, products: products.length, sales: sales.length }} sales={sales} loading={isLoading} onNavigate={navigate} onNewSale={openNewSale} /> : <section className="entity-section"><SectionHeading eyebrow={subtitleByView[activeView]} title={titleByView[activeView]} description={activeView === "vendas" ? "Registre, edite e acompanhe suas vendas em um só fluxo." : "Mantenha os dados organizados para a operação acontecer sem atrito."} action={activeView === "usuarios" && !canManageUsers ? <span className="permission-note">Acesso exclusivo de administradores</span> : <button className="button button-primary" onClick={() => activeView === "vendas" ? openNewSale() : formTypeByView[activeView] && openCreate(formTypeByView[activeView]!)}><Plus size={17} /> {activeView === "vendas" ? "Nova venda" : "Novo registro"}</button>} />
          <div className="toolbar"><div className="search-box"><Search size={17} /><input placeholder={`Buscar em ${titleByView[activeView].toLowerCase()}...`} value={search} onChange={event => setSearch(event.target.value)} /></div>{activeView === "vendas" ? <label className="filter-select"><ClipboardList size={16} /><select value={salesFilter} onChange={event => setSalesFilter(event.target.value as typeof salesFilter)}><option value="todos">Todos os status</option><option value="aberta">Em aberto</option><option value="concluida">Concluídas</option><option value="cancelada">Canceladas</option></select><ChevronDown size={15} /></label> : <span className="filter-button muted-filter"><ClipboardList size={16} /> Busca rápida</span>}<span className="result-count">{filteredData.length} registros</span></div>
          <div className="panel table-panel">{permissionError ? <InlineError message="A gestão de usuários está disponível somente para administradores." /> : queryError ? <InlineError message="Não foi possível carregar os registros." retry={() => { clientsQuery.refetch(); productsQuery.refetch(); salesQuery.refetch(); }} /> : isLoading ? <LoadingRows /> : activeView === "usuarios" ? <UsersTable data={filteredData} onEdit={(item: any) => openEdit("usuario", item)} onView={(item: any) => openDetail(item, "usuario")} onDelete={(id: number) => confirmDelete("usuario", id)} /> : activeView === "clientes" ? <ClientsTable data={filteredData} onEdit={(item: any) => openEdit("cliente", item)} onView={(item: any) => openDetail(item, "cliente")} onDelete={(id: number) => confirmDelete("cliente", id)} /> : activeView === "produtos" ? <ProductsTable data={filteredData} onEdit={(item: any) => openEdit("produto", item)} onView={(item: any) => openDetail(item, "produto")} onDelete={(id: number) => confirmDelete("produto", id)} /> : <SalesTable data={filteredData} onEdit={openEditSale} onView={(item: any) => setDetail({ type: "venda", item })} onDelete={(id: number) => confirmDelete("venda", id)} />}</div>
        </section>}</div></motion.div></AnimatePresence>
      </div>
    </main>
    <AnimatePresence>{modal && <Modal title={modal.item ? `Editar ${modal.type}` : `Novo ${modal.type}`} description="Preencha os campos abaixo para manter a base em movimento." onClose={closeModal} onSubmit={saveForm} saving={mutationSaving}>{modal.type === "usuario" && <><FormField label="Nome completo" value={formData.nome} onChange={value => updateField("nome", value)} placeholder="Ex.: Marina Costa" /><FormField label="CPF" value={formData.cpf} onChange={value => updateField("cpf", value)} placeholder="Somente números" /><FormField label="Login" value={formData.login} onChange={value => updateField("login", value)} placeholder="marina.costa" /><FormField label="Senha" value={formData.senha} onChange={value => updateField("senha", value)} placeholder={modal.item ? "Deixe em branco para manter" : "Mínimo de 4 caracteres"} type="password" required={!modal.item} /><FormField label="E-mail" value={formData.email} onChange={value => updateField("email", value)} placeholder="nome@empresa.com" type="email" wide /></>}{modal.type === "cliente" && <><FormField label="Nome completo" value={formData.nome} onChange={value => updateField("nome", value)} placeholder="Ex.: Rafael Oliveira" /><FormField label="CPF" value={formData.cpf} onChange={value => updateField("cpf", value)} placeholder="Somente números" /><FormField label="Telefone" value={formData.telefone} onChange={value => updateField("telefone", value)} placeholder="(11) 99999-9999" /><FormField label="CEP" value={formData.cep} onChange={value => updateField("cep", onlyDigits(value).slice(0, 8))} placeholder="00000000" hint={cepStatus === "loading" ? "Consultando endereço..." : cepStatus === "success" ? "Endereço preenchido pela ViaCEP." : cepStatus === "error" ? "CEP não encontrado. Confira os números." : "Digite 8 números para buscar."} /><PhotoField label="Foto do cliente" value={formData.foto} onChange={value => updateField("foto", value as string)} /><FormField label="Endereço" value={formData.endereco} onChange={value => updateField("endereco", value)} placeholder="Rua, número e complemento" wide /><FormField label="Cidade" value={formData.cidade} onChange={value => updateField("cidade", value)} placeholder="São Paulo" /><FormField label="UF" value={formData.uf} onChange={value => updateField("uf", value)} placeholder="SP" /><FormField label="E-mail" value={formData.email} onChange={value => updateField("email", value)} placeholder="cliente@email.com" type="email" wide /></>}{modal.type === "produto" && <><FormField label="Nome do produto" value={formData.nome} onChange={value => updateField("nome", value)} placeholder="Ex.: Kit escritório" /><FormField label="Fabricante" value={formData.fabricante} onChange={value => updateField("fabricante", value)} placeholder="Ex.: Papelaria Nova" /><FormField label="Valor de venda" value={String(formData.valor ?? "")} onChange={value => updateField("valor", value)} placeholder="0,00" type="number" /><PhotoField label="Foto do produto" value={formData.foto} onChange={value => updateField("foto", value as string)} /></>}</Modal>}</AnimatePresence>
    {saleModal && <SaleModal saleForm={saleForm} setSaleForm={setSaleForm} saleItems={saleItems} setSaleItems={setSaleItems} clients={clients} products={products} saving={saleSaving} editing={selectedSaleId !== null} onClose={closeSaleModal} onSubmit={saveSale} />}
    {detail && <DetailModal detail={saleViewDetailQuery.data ? { ...detail, item: saleViewDetailQuery.data } : detail} onClose={() => setDetail(null)} />}
  </div>;
}

function BellDot() { return <span className="bell-dot"><span /></span>; }

function TableActions({ item, onEdit, onView, onDelete }: { item: any; onEdit: (item: any) => void; onView: (item: any) => void; onDelete: (id: number) => void }) { return <div className="table-actions"><button title="Visualizar" onClick={() => onView(item)}><Eye size={16} /></button><button title="Editar" onClick={() => onEdit(item)}><Pencil size={16} /></button><button title="Excluir" className="danger" onClick={() => onDelete(item.id)}><Trash2 size={16} /></button></div>; }
function TableEmpty({ icon, title }: { icon: IconType; title: string }) { return <EmptyState icon={icon} title={`Nenhum ${title} encontrado`} description="Ajuste sua busca ou crie um novo registro." />; }
function UsersTable({ data, onEdit, onView, onDelete }: any) { return data.length ? <><div className="data-table table-users"><div className="table-row table-header"><span>Usuário</span><span>Login</span><span>E-mail</span><span>Cadastro</span><span /></div>{data.map((item: any) => <div className="table-row" key={item.id}><div className="person-cell"><div className="row-avatar blue">{item.nome?.slice(0, 2).toUpperCase()}</div><div><strong>{item.nome}</strong><span>CPF {item.cpf}</span></div></div><span className="muted-cell">@{item.login}</span><span className="muted-cell">{item.email}</span><span className="muted-cell">{dateTime(item.createdAt)}</span><TableActions item={item} onEdit={onEdit} onView={onView} onDelete={onDelete} /></div>)}</div></> : <TableEmpty icon={UserRound} title="usuário" />; }
function ClientsTable({ data, onEdit, onView, onDelete }: any) { return data.length ? <div className="data-table"><div className="table-row table-header"><span>Cliente</span><span>Contato</span><span>Localização</span><span>Cadastro</span><span /></div>{data.map((item: any) => <div className="table-row" key={item.id}><div className="person-cell"><div className="row-avatar orange">{item.foto ? <img src={item.foto} alt="" /> : item.nome?.slice(0, 2).toUpperCase()}</div><div><strong>{item.nome}</strong><span>CPF {item.cpf}</span></div></div><div className="stack-cell"><strong>{item.telefone}</strong><span>{item.email}</span></div><span className="muted-cell">{item.cidade} · {item.uf}</span><span className="muted-cell">{dateTime(item.createdAt)}</span><TableActions item={item} onEdit={onEdit} onView={onView} onDelete={onDelete} /></div>)}</div> : <TableEmpty icon={Users} title="cliente" />; }
function ProductsTable({ data, onEdit, onView, onDelete }: any) { return data.length ? <div className="data-table"><div className="table-row table-header"><span>Produto</span><span>Fabricante</span><span>Preço de venda</span><span>Cadastro</span><span /></div>{data.map((item: any) => <div className="table-row" key={item.id}><div className="person-cell"><div className="row-avatar dark">{item.foto ? <img src={item.foto} alt="" /> : <Package size={17} />}</div><div><strong>{item.nome}</strong><span>Código #{String(item.id).padStart(4, "0")}</span></div></div><span className="muted-cell">{item.fabricante}</span><strong className="price-cell">{money(item.valor)}</strong><span className="muted-cell">{dateTime(item.createdAt)}</span><TableActions item={item} onEdit={onEdit} onView={onView} onDelete={onDelete} /></div>)}</div> : <TableEmpty icon={Package} title="produto" />; }
function SalesTable({ data, onEdit, onView, onDelete }: any) { return data.length ? <div className="data-table"><div className="table-row table-header"><span>Venda</span><span>Cliente</span><span>Status</span><span>Total</span><span /></div>{data.map((item: any) => <div className="table-row" key={item.id}><div className="person-cell"><div className="row-avatar blue"><ReceiptText size={17} /></div><div><strong>Venda #{String(item.id).padStart(4, "0")}</strong><span>{dateTime(item.dataVenda)}</span></div></div><span className="muted-cell">{item.clienteNome ?? "Cliente não informado"}</span><StatusPill status={item.status} /><strong className="price-cell">{money(item.total)}</strong><TableActions item={item} onEdit={onEdit} onView={onView} onDelete={onDelete} /></div>)}</div> : <TableEmpty icon={ShoppingCart} title="venda" />; }

function DetailModal({ detail, onClose }: { detail: { type: string; item: any }; onClose: () => void }) {
  const item = detail.item;
  const labels: Record<string, string> = { usuario: "Usuário", cliente: "Cliente", produto: "Produto", venda: "Venda" };
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><motion.div className="modal-card detail-modal" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}><div className="modal-head"><div><span className="eyebrow">Visualização</span><h2>{labels[detail.type]}</h2><p>Detalhes do registro selecionado.</p></div><button className="icon-button" onClick={onClose}><X size={19} /></button></div><div className="detail-list">{Object.entries(item).filter(([key]) => !["id", "createdAt", "updatedAt", "itens"].includes(key)).map(([key, value]) => <div key={key}><span>{key.replace(/([A-Z])/g, " $1").replace(/^./, char => char.toUpperCase())}</span><strong>{key === "total" || key === "valor" ? money(value) : key === "status" ? <StatusPill status={String(value)} /> : String(value ?? "—")}</strong></div>)}</div>{item.itens?.length ? <div className="detail-items"><span className="eyebrow">Itens</span>{item.itens.map((saleItem: any) => <div key={saleItem.id}><span>{saleItem.produtoNome} × {saleItem.quantidade}</span><strong>{money(saleItem.subtotal)}</strong></div>)}</div> : null}<div className="modal-actions"><button className="button button-primary" onClick={onClose}>Fechar</button></div></motion.div></div>;
}
