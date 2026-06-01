// src/App.jsx — v3.2 — rota "graficos" adicionada

import { useState, useEffect, useMemo } from "react";
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

const PREFS_PADRAO = {
  tema: "dark", corPrimaria: "gold",
  modoDashboard: "both", tipoGrafico: "bar",
  animacoes: true, densidadeVisual: "normal",
};

export default function App() {
  const [user,   setUser]   = useState(null);
  const [active, setActive] = useState("dashboard");

  const [ingredientes, setIngredientes] = useState(INGREDIENTES_INIT);
  const [lotes,        setLotes]        = useState(LOTES_INIT);
  const [movimentos,   setMovimentos]   = useState(MOVIMENTOS_INIT);
  const [produtos,     setProdutos]     = useState(PRODUTOS_INIT);
  const [pedidos,      setPedidos]      = useState(PEDIDOS_INIT);
  const [financeiro,   setFinanceiro]   = useState(FINANCEIRO_INIT);

  const [config, setConfig] = useState({
    diasAviso: 3,
    prazosCategoria: { ...PRAZOS_PADRAO },
  });

  const [prefs, setPrefs] = useState(() => {
    try { const s = localStorage.getItem("barto_prefs"); return s ? { ...PREFS_PADRAO, ...JSON.parse(s) } : PREFS_PADRAO; }
    catch { return PREFS_PADRAO; }
  });

  useEffect(() => {
    try { localStorage.setItem("barto_prefs", JSON.stringify(prefs)); } catch {}
  }, [prefs]);

  const t = useMemo(() => buildTheme(prefs), [prefs]);
  const setPref = (key, value) => setPrefs(prev => ({ ...prev, [key]: value }));
  const alertas = useAlertas(lotes, ingredientes, config.diasAviso);

  if (!user) return <LoginScreen onLogin={setUser} />;

  const shared = {
    ingredientes, setIngredientes, lotes, setLotes,
    movimentos, setMovimentos, produtos, setProdutos,
    pedidos, setPedidos, financeiro, setFinanceiro,
    user, alertas, setActive, config, setConfig,
    prefs, setPrefs, setPref, t,
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
    <Layout active={active} setActive={setActive} user={user}
      onLogout={() => setUser(null)} alertCount={alertas.length} t={t}>
      {renderPage()}
    </Layout>
  );
}