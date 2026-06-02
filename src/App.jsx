// src/App.jsx — v3.5
// Correção do loop infinito no useEffect de detecção de lotes vencidos.
// Usa useRef para garantir execução única por sessão.

import { useState, useEffect, useRef, useMemo } from "react";
import Layout        from "./components/Layout";
import LoginScreen   from "./pages/LoginScreen";
import Dashboard     from "./pages/Dashboard";
import Estoque       from "./pages/Estoque";
import Lotes         from "./pages/Lotes";
import Entradas      from "./pages/Entradas";
import Saidas        from "./pages/Saidas";
import Produtos      from "./pages/Produtos";
import Pedidos       from "./pages/Pedidos";
import Financeiro    from "./pages/Financeiro";
import Graficos      from "./pages/Graficos";
import Alertas       from "./pages/Alertas";
import Configuracoes from "./pages/Configuracoes";

import { INGREDIENTES_INIT }           from "./data/ingredientes";
import { LOTES_INIT }                  from "./data/lotes";
import { MOVIMENTOS_INIT }             from "./data/movimentos";
import { PRODUTOS_INIT }               from "./data/produtos";
import { PEDIDOS_INIT, PRAZOS_PADRAO } from "./data/pedidos";
import { FINANCEIRO_INIT }             from "./data/financeiro";
import { useAlertas }                  from "./hooks/useAlertas";
import { buildTheme }                  from "./theme";
import { hoje, fmtDataHora }           from "./utils/helpers";

// ── localStorage helpers ──────────────────────────────────────────────────────
const LS = {
  ingredientes: "barto_ingredientes",
  lotes:        "barto_lotes",
  movimentos:   "barto_movimentos",
  produtos:     "barto_produtos",
  pedidos:      "barto_pedidos",
  financeiro:   "barto_financeiro",
  retiradas:    "barto_retiradas",
  config:       "barto_config",
  prefs:        "barto_prefs",
};

function lsGet(key, fallback) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function usePersistedState(key, fallback) {
  const [state, setState] = useState(() => lsGet(key, fallback));
  useEffect(() => { lsSet(key, state); }, [key, state]);
  return [state, setState];
}

const PREFS_PADRAO  = { tema:"dark", corPrimaria:"gold", modoDashboard:"both", tipoGrafico:"bar", animacoes:true, densidadeVisual:"normal" };
const CONFIG_PADRAO = { diasAviso:3, prazosCategoria:{ ...PRAZOS_PADRAO } };

export default function App() {
  const [user,   setUser]   = useState(null);
  const [active, setActive] = useState("dashboard");

  const [ingredientes, setIngredientes] = usePersistedState(LS.ingredientes, INGREDIENTES_INIT);
  const [lotes,        setLotes]        = usePersistedState(LS.lotes,        LOTES_INIT);
  const [movimentos,   setMovimentos]   = usePersistedState(LS.movimentos,   MOVIMENTOS_INIT);
  const [produtos,     setProdutos]     = usePersistedState(LS.produtos,     PRODUTOS_INIT);
  const [pedidos,      setPedidos]      = usePersistedState(LS.pedidos,      PEDIDOS_INIT);
  const [financeiro,   setFinanceiro]   = usePersistedState(LS.financeiro,   FINANCEIRO_INIT);
  const [retiradas,    setRetiradas]    = usePersistedState(LS.retiradas,    []);
  const [config,       setConfig]       = usePersistedState(LS.config,       CONFIG_PADRAO);
  const [prefs,        setPrefs]        = usePersistedState(LS.prefs,        PREFS_PADRAO);

  const t      = useMemo(() => buildTheme(prefs), [prefs]);
  const setPref = (key, value) => setPrefs(prev => ({ ...prev, [key]: value }));

  // ── Ref: garante que a detecção de vencidos roda UMA VEZ por login ────────
  const verificacaoFeita = useRef(false);

  useEffect(() => {
    // Só roda quando o usuário acaba de logar E ainda não foi verificado
    if (!user || verificacaoFeita.current) return;
    verificacaoFeita.current = true;

    const hoje_ = hoje();
    const jaCriados = new Set(retiradas.map(r => r.loteId));
    const novosAvisos   = [];
    const novosDescartes = [];
    const lotesAtualizados = lotes.map(l => {
      // Pula se: não venceu, sem estoque, ou já processado
      if (l.quantidadeRestante <= 0 || l.dataValidade >= hoje_ || jaCriados.has(l.id)) return l;

      const ing = ingredientes.find(i => i.id === l.ingredienteId);
      const agora = fmtDataHora();

      // Aviso de retirada física
      novosAvisos.push({
        id:               "RET" + l.id,
        loteId:           l.id,
        loteNumero:       l.numero,
        ingredienteId:    l.ingredienteId,
        ingredienteNome:  ing?.nome  || "—",
        ingredienteEmoji: ing?.emoji || "📦",
        quantidade:       l.quantidadeRestante,
        unidade:          ing?.unidade || "un",
        dataDescarte:     agora,
        confirmado:       false,
      });

      // Movimentação de descarte (acumula fora do setState)
      novosDescartes.push({
        id:            "MOV_DESC_" + l.id,
        tipo:          "descarte",
        loteId:        l.id,
        ingredienteId: l.ingredienteId,
        quantidade:    l.quantidadeRestante,
        data:          agora,
        usuario:       "Sistema",
        motivo:        "Vencimento automático — descarte do sistema",
        pedidoId:      null,
      });

      return { ...l, quantidadeRestante: 0 };
    });

    // Aplica tudo de uma vez — sem setState encadeado dentro do loop
    if (novosAvisos.length > 0) {
      setLotes(lotesAtualizados);
      setMovimentos(prev => [...novosDescartes, ...prev]);
      setRetiradas(prev => [...novosAvisos, ...prev]);
    }
  }, [user]); // ← SOMENTE user — roda uma vez ao logar

  // Reset ao fazer logout — permite nova verificação no próximo login
  const handleLogout = () => {
    verificacaoFeita.current = false;
    setUser(null);
  };

  const resetarDados = () => {
    Object.values(LS).forEach(key => { try { localStorage.removeItem(key); } catch {} });
    setIngredientes(INGREDIENTES_INIT);
    setLotes(LOTES_INIT);
    setMovimentos(MOVIMENTOS_INIT);
    setProdutos(PRODUTOS_INIT);
    setPedidos(PEDIDOS_INIT);
    setFinanceiro(FINANCEIRO_INIT);
    setRetiradas([]);
    setConfig(CONFIG_PADRAO);
  };

  const confirmarRetirada       = (id) => setRetiradas(prev => prev.map(r => r.id === id ? { ...r, confirmado: true } : r));
  const confirmarTodasRetiradas = ()   => setRetiradas(prev => prev.map(r => ({ ...r, confirmado: true })));

  const alertas            = useAlertas(lotes, ingredientes, config.diasAviso);
  const retiradasPendentes = retiradas.filter(r => !r.confirmado);

  if (!user) return <LoginScreen onLogin={setUser} />;

  const shared = {
    ingredientes, setIngredientes,
    lotes,        setLotes,
    movimentos,   setMovimentos,
    produtos,     setProdutos,
    pedidos,      setPedidos,
    financeiro,   setFinanceiro,
    retiradas,    setRetiradas,
    confirmarRetirada,
    confirmarTodasRetiradas,
    retiradasPendentes,
    user, alertas, setActive,
    config, setConfig,
    prefs, setPrefs, setPref,
    resetarDados,
    t,
  };

  const renderPage = () => {
    switch (active) {
      case "dashboard":  return <Dashboard     {...shared} />;
      case "estoque":    return <Estoque       {...shared} />;
      case "lotes":      return <Lotes         {...shared} />;
      case "entradas":   return <Entradas      {...shared} />;
      case "saidas":     return <Saidas        {...shared} />;
      case "produtos":   return <Produtos      {...shared} />;
      case "pedidos":    return <Pedidos       {...shared} />;
      case "financeiro": return <Financeiro    {...shared} />;
      case "graficos":   return <Graficos      {...shared} />;
      case "alertas":    return <Alertas       {...shared} />;
      case "config":     return <Configuracoes {...shared} />;
      default: return null;
    }
  };

  return (
    <Layout
      active={active} setActive={setActive}
      user={user} onLogout={handleLogout}
      alertCount={alertas.length + retiradasPendentes.length}
      retiradasPendentes={retiradasPendentes.length}
      t={t}
    >
      {renderPage()}
    </Layout>
  );
}