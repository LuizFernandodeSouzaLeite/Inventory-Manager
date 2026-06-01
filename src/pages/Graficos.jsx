// src/pages/Graficos.jsx
// Página central de gráficos — todos os dados visuais do sistema em um lugar.
// Gráficos configuráveis pelo tipo definido em prefs.tipoGrafico.
// SVG puro, zero dependências externas.

import { useState, useMemo } from "react";
import Icon, { icons } from "../components/Icon";
import { Card } from "../components/UI";
import { calcEstoque } from "../utils/estoque";
import { addDias, hoje, diasAte } from "../utils/helpers";

// ── Período ───────────────────────────────────────────────────────────────────
const PERIODOS = [
  { id: "7d",  label: "7d",   dias: 7  },
  { id: "14d", label: "14d",  dias: 14 },
  { id: "30d", label: "30d",  dias: 30 },
];

function filtrarPorPeriodo(lista, dias) {
  const agora = new Date();
  return lista.filter(item => {
    const diff = (agora - new Date(item.data)) / (1000 * 60 * 60 * 24);
    return diff <= dias;
  });
}

// ── Paleta fixa de séries ─────────────────────────────────────────────────────
const SERIE_CORES = ["#C9A84C", "#4ADE80", "#F87171", "#60A5FA", "#A78BFA", "#FBBF24", "#FB923C"];

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE DE GRÁFICOS — renderiza bar | line | area | pie | radial via SVG puro
// ═══════════════════════════════════════════════════════════════════════════════

function GraficoUniversal({ tipo, series, labels, altura = 160, accent = "#C9A84C", bgCard = "#0F0F0F", border = "#1E1E1E" }) {
  switch (tipo) {
    case "line":   return <GraficoLinha   series={series} labels={labels} altura={altura} accent={accent} border={border} />;
    case "area":   return <GraficoArea    series={series} labels={labels} altura={altura} accent={accent} border={border} bgCard={bgCard} />;
    case "pie":    return <GraficoPizza   series={series} labels={labels} altura={altura} />;
    case "radial": return <GraficoRadial  series={series} labels={labels} altura={altura} accent={accent} />;
    default:       return <GraficoBarra   series={series} labels={labels} altura={altura} accent={accent} border={border} />;
  }
}

// ── Barras ────────────────────────────────────────────────────────────────────
function GraficoBarra({ series, labels, altura, accent, border }) {
  const allVals = series.flatMap(s => s.dados);
  const max = Math.max(...allVals, 1);
  const n = labels.length;
  const W = 500;
  const pad = 32;
  const plotW = W - pad;
  const plotH = altura - 24;
  const grupoW = plotW / n;
  const barW = Math.max(6, (grupoW / series.length) - 4);

  return (
    <svg viewBox={`0 0 ${W} ${altura}`} style={{ width: "100%", height: altura, display: "block" }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={pad} x2={W} y1={plotH * (1 - f)} y2={plotH * (1 - f)}
          stroke={border} strokeWidth={0.5} />
      ))}
      {/* Barras */}
      {labels.map((lbl, i) => (
        <g key={i}>
          {series.map((s, si) => {
            const v = s.dados[i] || 0;
            const h = Math.max(2, (v / max) * plotH);
            const x = pad + i * grupoW + si * (barW + 3) + 4;
            const cor = s.cor || SERIE_CORES[si % SERIE_CORES.length];
            return (
              <g key={si}>
                <rect x={x} y={plotH - h} width={barW} height={h}
                  fill={cor} opacity={0.8} rx={3} />
                <rect x={x} y={plotH - h} width={barW} height={Math.min(h, 3)}
                  fill={cor} opacity={1} rx={3} />
              </g>
            );
          })}
          <text x={pad + i * grupoW + grupoW / 2} y={altura - 4}
            textAnchor="middle" fill="#333" fontSize={8} fontFamily="'DM Mono', monospace">
            {lbl}
          </text>
        </g>
      ))}
      {/* Eixo Y labels */}
      {[0, 0.5, 1].map(f => (
        <text key={f} x={pad - 4} y={plotH * (1 - f) + 4}
          textAnchor="end" fill="#2A2A2A" fontSize={7} fontFamily="'DM Mono', monospace">
          {Math.round(max * f)}
        </text>
      ))}
    </svg>
  );
}

// ── Linha ─────────────────────────────────────────────────────────────────────
function GraficoLinha({ series, labels, altura, accent, border }) {
  const allVals = series.flatMap(s => s.dados);
  const max = Math.max(...allVals, 1);
  const min = 0;
  const range = max - min || 1;
  const n = labels.length;
  const W = 500; const pad = 32;
  const plotW = W - pad; const plotH = altura - 24;
  const stepX = plotW / Math.max(n - 1, 1);

  const toY = v => plotH - ((v - min) / range) * plotH;
  const toX = i => pad + i * stepX;

  return (
    <svg viewBox={`0 0 ${W} ${altura}`} style={{ width: "100%", height: altura, display: "block" }}>
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={pad} x2={W} y1={plotH * (1 - f)} y2={plotH * (1 - f)}
          stroke={border} strokeWidth={0.5} />
      ))}
      {series.map((s, si) => {
        const cor = s.cor || SERIE_CORES[si % SERIE_CORES.length];
        const pts = s.dados.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
        return (
          <g key={si}>
            <polyline points={pts} fill="none" stroke={cor} strokeWidth={2}
              strokeLinejoin="round" strokeLinecap="round" opacity={0.9} />
            {s.dados.map((v, i) => (
              <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill={cor} opacity={0.9} />
            ))}
          </g>
        );
      })}
      {labels.map((lbl, i) => (
        <text key={i} x={toX(i)} y={altura - 4}
          textAnchor="middle" fill="#333" fontSize={8} fontFamily="'DM Mono', monospace">
          {lbl}
        </text>
      ))}
      {[0, 0.5, 1].map(f => (
        <text key={f} x={pad - 4} y={plotH * (1 - f) + 4}
          textAnchor="end" fill="#2A2A2A" fontSize={7} fontFamily="'DM Mono', monospace">
          {Math.round(max * f)}
        </text>
      ))}
    </svg>
  );
}

// ── Área ──────────────────────────────────────────────────────────────────────
function GraficoArea({ series, labels, altura, accent, border, bgCard }) {
  const allVals = series.flatMap(s => s.dados);
  const max = Math.max(...allVals, 1);
  const n = labels.length;
  const W = 500; const pad = 32;
  const plotW = W - pad; const plotH = altura - 24;
  const stepX = plotW / Math.max(n - 1, 1);
  const toY = v => plotH - (v / max) * plotH;
  const toX = i => pad + i * stepX;

  return (
    <svg viewBox={`0 0 ${W} ${altura}`} style={{ width: "100%", height: altura, display: "block" }}>
      <defs>
        {series.map((s, si) => {
          const cor = s.cor || SERIE_CORES[si % SERIE_CORES.length];
          return (
            <linearGradient key={si} id={`areaGrad${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={cor} stopOpacity={0.02} />
            </linearGradient>
          );
        })}
      </defs>
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={pad} x2={W} y1={plotH * (1 - f)} y2={plotH * (1 - f)}
          stroke={border} strokeWidth={0.5} />
      ))}
      {series.map((s, si) => {
        const cor = s.cor || SERIE_CORES[si % SERIE_CORES.length];
        const linePts = s.dados.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
        const areaPts = `${toX(0)},${plotH} ` + s.dados.map((v, i) => `${toX(i)},${toY(v)}`).join(" ") + ` ${toX(n - 1)},${plotH}`;
        return (
          <g key={si}>
            <polygon points={areaPts} fill={`url(#areaGrad${si})`} />
            <polyline points={linePts} fill="none" stroke={cor} strokeWidth={2}
              strokeLinejoin="round" strokeLinecap="round" />
          </g>
        );
      })}
      {labels.map((lbl, i) => (
        <text key={i} x={toX(i)} y={altura - 4}
          textAnchor="middle" fill="#333" fontSize={8} fontFamily="'DM Mono', monospace">
          {lbl}
        </text>
      ))}
    </svg>
  );
}

// ── Pizza ─────────────────────────────────────────────────────────────────────
function GraficoPizza({ series, labels, altura }) {
  // Para pizza: cada série é um fatia, usa o primeiro valor de cada
  const dados = series.map((s, i) => ({
    label: s.nome,
    valor: s.dados.reduce((a, b) => a + b, 0),
    cor: s.cor || SERIE_CORES[i % SERIE_CORES.length],
  })).filter(d => d.valor > 0);

  const total = dados.reduce((s, d) => s + d.valor, 0) || 1;
  const cx = 100; const cy = altura / 2; const r = Math.min(cy - 10, 70);
  let anguloAtual = -Math.PI / 2;

  const fatias = dados.map(d => {
    const angulo = (d.valor / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(anguloAtual);
    const y1 = cy + r * Math.sin(anguloAtual);
    anguloAtual += angulo;
    const x2 = cx + r * Math.cos(anguloAtual);
    const y2 = cy + r * Math.sin(anguloAtual);
    const large = angulo > Math.PI ? 1 : 0;
    return { ...d, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, angulo };
  });

  return (
    <svg viewBox={`0 0 500 ${altura}`} style={{ width: "100%", height: altura, display: "block" }}>
      {fatias.map((f, i) => (
        <path key={i} d={f.path} fill={f.cor} opacity={0.85} stroke="#080808" strokeWidth={1.5} />
      ))}
      {/* Legenda à direita */}
      {dados.map((d, i) => (
        <g key={i}>
          <rect x={220} y={10 + i * 22} width={10} height={10} fill={d.cor} rx={2} />
          <text x={236} y={20 + i * 22} fill="#888" fontSize={10} fontFamily="'DM Sans', sans-serif">
            {d.label}
          </text>
          <text x={490} y={20 + i * 22} fill={d.cor} fontSize={10}
            fontFamily="'DM Mono', monospace" textAnchor="end" fontWeight="600">
            {((d.valor / total) * 100).toFixed(1)}%
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Radial ────────────────────────────────────────────────────────────────────
function GraficoRadial({ series, labels, altura, accent }) {
  const dados = series.map((s, i) => ({
    label: s.nome,
    valor: s.dados.reduce((a, b) => a + b, 0),
    max: Math.max(...s.dados, 1) * s.dados.length,
    cor: s.cor || SERIE_CORES[i % SERIE_CORES.length],
  }));
  const cx = 120; const cy = altura / 2;
  const rMax = Math.min(cy - 12, 80);
  const rMin = rMax * 0.25;
  const total = dados.reduce((s, d) => s + d.valor, 0) || 1;

  return (
    <svg viewBox={`0 0 500 ${altura}`} style={{ width: "100%", height: altura, display: "block" }}>
      {/* Círculos de referência */}
      {[0.33, 0.66, 1].map(f => (
        <circle key={f} cx={cx} cy={cy} r={rMin + (rMax - rMin) * f}
          fill="none" stroke="#1A1A1A" strokeWidth={1} />
      ))}
      {/* Arcos */}
      {dados.map((d, i) => {
        const pct = d.valor / total;
        const r = rMin + (rMax - rMin) * 0.8;
        const thickness = Math.max(6, (rMax - rMin) / dados.length - 4);
        const rAtual = rMin + (rMax - rMin) * ((i + 1) / dados.length);
        const angulo = pct * 2 * Math.PI;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + angulo;
        const x1 = cx + rAtual * Math.cos(startAngle);
        const y1 = cy + rAtual * Math.sin(startAngle);
        const x2 = cx + rAtual * Math.cos(endAngle);
        const y2 = cy + rAtual * Math.sin(endAngle);
        const large = angulo > Math.PI ? 1 : 0;

        return (
          <g key={i}>
            {/* Track */}
            <circle cx={cx} cy={cy} r={rAtual} fill="none"
              stroke={d.cor + "20"} strokeWidth={thickness} />
            {/* Arco preenchido */}
            <path
              d={`M${x1},${y1} A${rAtual},${rAtual} 0 ${large},1 ${x2},${y2}`}
              fill="none" stroke={d.cor} strokeWidth={thickness}
              strokeLinecap="round" opacity={0.9}
            />
          </g>
        );
      })}
      {/* Legenda */}
      {dados.map((d, i) => (
        <g key={i}>
          <rect x={220} y={10 + i * 24} width={10} height={10} fill={d.cor} rx={2} />
          <text x={236} y={20 + i * 24} fill="#888" fontSize={10} fontFamily="'DM Sans', sans-serif">
            {d.label}
          </text>
          <text x={490} y={20 + i * 24} fill={d.cor} fontSize={11}
            fontFamily="'DM Mono', monospace" textAnchor="end" fontWeight="600">
            {((d.valor / total) * 100).toFixed(1)}%
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Seletor de tipo de gráfico ────────────────────────────────────────────────
const TIPOS = [
  { id: "bar",    label: "Barras",  icon: icons.barChart },
  { id: "line",   label: "Linha",   icon: icons.activity },
  { id: "area",   label: "Área",    icon: icons.trending },
  { id: "pie",    label: "Pizza",   icon: icons.pieChart },
  { id: "radial", label: "Radial",  icon: icons.repeat   },
];

function SeletorTipo({ tipo, onChange, accent, accentDim, accentBorder, border, bgCard }) {
  return (
    <div style={{ display: "flex", gap: 4, background: bgCard, border: `1px solid ${border}`, borderRadius: 8, padding: 3 }}>
      {TIPOS.map(t => {
        const sel = tipo === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} title={t.label}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 10px", borderRadius: 6,
              border: `1px solid ${sel ? accentBorder : "transparent"}`,
              background: sel ? accentDim : "transparent",
              color: sel ? accent : "#444",
              cursor: "pointer", fontSize: 11,
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (!sel) e.currentTarget.style.color = "#777"; }}
            onMouseLeave={e => { if (!sel) e.currentTarget.style.color = "#444"; }}
          >
            <Icon d={t.icon} size={13} />
            <span style={{ display: "none" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Card de seção de gráfico ──────────────────────────────────────────────────
function GraficoCard({ titulo, sub, tipo, onChangeTipo, series, labels, altura, accent, accentDim, accentBorder, border, bgCard, bgBody, children }) {
  return (
    <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13.5, color: "#C8C4BC" }}>{titulo}</div>
          {sub && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, color: "#3A3A3A", marginTop: 3, letterSpacing: "0.08em" }}>{sub}</div>}
        </div>
        <SeletorTipo tipo={tipo} onChange={onChangeTipo} accent={accent} accentDim={accentDim} accentBorder={accentBorder} border={border} bgCard={bgBody} />
      </div>
      {children || (
        <GraficoUniversal tipo={tipo} series={series} labels={labels} altura={altura} accent={accent} bgCard={bgCard} border={border} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function Graficos({ ingredientes, lotes, movimentos, pedidos, financeiro, produtos, prefs, setPref, t = {} }) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const border       = t.border       || "#1E1E1E";

  // Tipo global vem das prefs; cada gráfico pode sobrescrever localmente
  const tipoGlobal = prefs?.tipoGrafico || "bar";
  const [tipos, setTipos] = useState({
    financeiro:   tipoGlobal,
    estoque:      tipoGlobal,
    movimentos:   tipoGlobal,
    validades:    tipoGlobal,
    produtos:     "bar", // pizza também faz sentido
    custos:       tipoGlobal,
    pedidos:      tipoGlobal,
  });

  const setTipo = (key, val) => setTipos(prev => ({ ...prev, [key]: val }));

  // Ao mudar o tipo global nas prefs, sincroniza todos
  const [periodoIdx, setPeriodoIdx] = useState(0);
  const periodo = PERIODOS[periodoIdx];

  // ── Dados financeiros ────────────────────────────────────────────────────
  const { entradas = [], saidas = [] } = financeiro || {};
  const entFilt = useMemo(() => filtrarPorPeriodo(entradas, periodo.dias), [entradas, periodo]);
  const saidFilt = useMemo(() => filtrarPorPeriodo(saidas,  periodo.dias), [saidas,  periodo]);

  const labelsFinDia = Array.from({ length: periodo.dias }, (_, i) => {
    const d = addDias(-(periodo.dias - 1 - i));
    return i === periodo.dias - 1 ? "hj" : `D-${periodo.dias - 1 - i}`;
  });
  const datasFinDia = Array.from({ length: periodo.dias }, (_, i) => addDias(-(periodo.dias - 1 - i)));

  const dadosEntDia  = datasFinDia.map(d => entFilt.filter(e => e.data === d).reduce((s, e) => s + e.valor, 0));
  const dadosSaidDia = datasFinDia.map(d => saidFilt.filter(e => e.data === d).reduce((s, e) => s + e.valor, 0));
  const dadosLucroDia = dadosEntDia.map((e, i) => Math.max(0, e - dadosSaidDia[i]));

  const custoMateria    = saidFilt.filter(s => s.tipo === "compra").reduce((s, e) => s + e.valor, 0);
  const custoOper       = saidFilt.filter(s => s.tipo === "operacional").reduce((s, e) => s + e.valor, 0);
  const custoDesp       = saidFilt.filter(s => s.tipo === "desperdicio").reduce((s, e) => s + e.valor, 0);
  const totalSaidas     = saidFilt.reduce((s, e) => s + e.valor, 0);

  // ── Dados de estoque ─────────────────────────────────────────────────────
  const estoqueAtual = ingredientes.map(ing => ({
    nome: ing.nome.split(" ")[0],
    valor: calcEstoque(lotes, ing.id),
    minimo: ing.minimo,
    emoji: ing.emoji,
  }));

  // ── Dados de movimentações por dia ───────────────────────────────────────
  const labelsMovDia = Array.from({ length: 7 }, (_, i) =>
    i === 6 ? "hj" : `D-${6 - i}`
  );
  const datasMovDia = Array.from({ length: 7 }, (_, i) => addDias(-(6 - i)));
  const movEntDia   = datasMovDia.map(d => movimentos.filter(m => m.data.startsWith(d) && m.tipo === "entrada").reduce((s, m) => s + m.quantidade, 0));
  const movSaidDia  = datasMovDia.map(d => movimentos.filter(m => m.data.startsWith(d) && m.tipo === "saida").reduce((s, m) => s + m.quantidade, 0));
  const movDescDia  = datasMovDia.map(d => movimentos.filter(m => m.data.startsWith(d) && m.tipo === "descarte").reduce((s, m) => s + m.quantidade, 0));

  // ── Dados de validade por categoria ──────────────────────────────────────
  const categValidade = useMemo(() => {
    const cats = {};
    lotes.forEach(l => {
      const ing = ingredientes.find(i => i.id === l.ingredienteId);
      if (!ing) return;
      if (!cats[ing.categoria]) cats[ing.categoria] = { ok: 0, atencao: 0, critico: 0, vencido: 0 };
      const d = diasAte(l.dataValidade);
      if (d < 0)       cats[ing.categoria].vencido++;
      else if (d <= 3) cats[ing.categoria].critico++;
      else if (d <= 7) cats[ing.categoria].atencao++;
      else             cats[ing.categoria].ok++;
    });
    return cats;
  }, [lotes, ingredientes]);

  // ── Dados de produtos mais vendidos ─────────────────────────────────────
  const produtoStats = useMemo(() => {
    const stats = {};
    entFilt.forEach(e => {
      (e.produtoIds || []).forEach(pid => {
        if (!stats[pid]) stats[pid] = { vendas: 0, receita: 0 };
        stats[pid].vendas++;
        const prod = produtos.find(p => p.id === pid);
        stats[pid].receita += prod?.preco || 0;
      });
    });
    return Object.entries(stats)
      .map(([pid, s]) => ({ ...s, produto: produtos.find(p => p.id === pid) }))
      .filter(s => s.produto)
      .sort((a, b) => b.receita - a.receita);
  }, [entFilt, produtos]);

  // ── Pedidos por dia ───────────────────────────────────────────────────────
  const labelsPedDia = Array.from({ length: 7 }, (_, i) => i === 6 ? "hj" : `D-${6 - i}`);
  const datasPedDia  = Array.from({ length: 7 }, (_, i) => addDias(-(6 - i)));
  const dadosPedDia  = datasPedDia.map(d => pedidos.filter(p => p.data.startsWith(d)).length);
  const dadosValDia  = datasPedDia.map(d => pedidos.filter(p => p.data.startsWith(d)).reduce((s, p) => s + (p.total || 0), 0));

  return (
    <div>
      {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", color: "#EDE9DF", lineHeight: 1.1 }}>
            Gráficos
          </h2>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10.5, color: "#3A3A3A", marginTop: 5, letterSpacing: "0.08em" }}>
            VISÃO VISUAL COMPLETA DO SISTEMA
          </p>
        </div>

        {/* Seletor de período global + tipo global */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Período */}
          <div style={{ display: "flex", gap: 2, background: bgCard, border: `1px solid ${border}`, borderRadius: 8, padding: 3 }}>
            {PERIODOS.map((p, i) => (
              <button key={p.id} onClick={() => setPeriodoIdx(i)}
                style={{
                  padding: "5px 12px", borderRadius: 6, fontSize: 11,
                  fontFamily: "'DM Mono', monospace", cursor: "pointer",
                  background: periodoIdx === i ? accentDim : "transparent",
                  border: `1px solid ${periodoIdx === i ? accentBorder : "transparent"}`,
                  color: periodoIdx === i ? accent : "#444",
                  transition: "all 0.15s",
                }}
              >{p.label}</button>
            ))}
          </div>

          {/* Tipo global */}
          <SeletorTipo
            tipo={prefs?.tipoGrafico || "bar"}
            onChange={v => {
              setPref("tipoGrafico", v);
              setTipos({ financeiro: v, estoque: v, movimentos: v, validades: v, produtos: v, custos: v, pedidos: v });
            }}
            accent={accent} accentDim={accentDim} accentBorder={accentBorder}
            border={border} bgCard={bgBody}
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* BLOCO 1 — FINANCEIRO                                            */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <SecaoLabel label="Financeiro" accent={accent} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>

        {/* Entradas vs Saídas */}
        <GraficoCard
          titulo="Entradas vs Saídas"
          sub={`ÚLTIMOS ${periodo.dias} DIAS`}
          tipo={tipos.financeiro}
          onChangeTipo={v => setTipo("financeiro", v)}
          series={[
            { nome: "Entradas", dados: dadosEntDia,  cor: "#4ADE80" },
            { nome: "Saídas",   dados: dadosSaidDia, cor: "#F87171" },
          ]}
          labels={labelsFinDia}
          altura={160}
          accent={accent} accentDim={accentDim} accentBorder={accentBorder}
          border={border} bgCard={bgCard} bgBody={bgBody}
        />

        {/* Lucro estimado */}
        <GraficoCard
          titulo="Lucro Estimado por Dia"
          sub={`ÚLTIMOS ${periodo.dias} DIAS`}
          tipo={tipos.financeiro}
          onChangeTipo={v => setTipo("financeiro", v)}
          series={[{ nome: "Lucro", dados: dadosLucroDia, cor: accent }]}
          labels={labelsFinDia}
          altura={160}
          accent={accent} accentDim={accentDim} accentBorder={accentBorder}
          border={border} bgCard={bgCard} bgBody={bgBody}
        />
      </div>

      {/* Distribuição de custos — full width */}
      <GraficoCard
        titulo="Distribuição de Custos"
        sub="COMPOSIÇÃO DAS SAÍDAS"
        tipo={tipos.custos}
        onChangeTipo={v => setTipo("custos", v)}
        series={[
          { nome: "Matéria-prima", dados: [custoMateria],  cor: "#60A5FA" },
          { nome: "Operacional",   dados: [custoOper],     cor: "#A78BFA" },
          { nome: "Desperdício",   dados: [custoDesp],     cor: "#FBBF24" },
        ]}
        labels={["Custos"]}
        altura={160}
        accent={accent} accentDim={accentDim} accentBorder={accentBorder}
        border={border} bgCard={bgCard} bgBody={bgBody}
      />

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* BLOCO 2 — ESTOQUE                                               */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <SecaoLabel label="Estoque" accent={accent} style={{ marginTop: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>

        {/* Estoque atual vs mínimo */}
        <GraficoCard
          titulo="Estoque Atual vs Mínimo"
          sub="TODOS OS INGREDIENTES"
          tipo={tipos.estoque}
          onChangeTipo={v => setTipo("estoque", v)}
          series={[
            { nome: "Atual",   dados: estoqueAtual.map(e => e.valor),  cor: accent },
            { nome: "Mínimo",  dados: estoqueAtual.map(e => e.minimo), cor: "#EF4444" },
          ]}
          labels={estoqueAtual.map(e => e.emoji || e.nome.slice(0, 4))}
          altura={160}
          accent={accent} accentDim={accentDim} accentBorder={accentBorder}
          border={border} bgCard={bgCard} bgBody={bgBody}
        />

        {/* Validade dos lotes */}
        <GraficoCard
          titulo="Status de Validade"
          sub="LOTES ATIVOS"
          tipo={tipos.validades}
          onChangeTipo={v => setTipo("validades", v)}
          series={[
            { nome: "OK",      dados: [lotes.filter(l => diasAte(l.dataValidade) > 7 && l.quantidadeRestante > 0).length],  cor: "#4ADE80" },
            { nome: "Atenção", dados: [lotes.filter(l => diasAte(l.dataValidade) >= 0 && diasAte(l.dataValidade) <= 7 && l.quantidadeRestante > 0).length], cor: "#FBBF24" },
            { nome: "Vencido", dados: [lotes.filter(l => diasAte(l.dataValidade) < 0 && l.quantidadeRestante > 0).length],  cor: "#EF4444" },
          ]}
          labels={["Lotes"]}
          altura={160}
          accent={accent} accentDim={accentDim} accentBorder={accentBorder}
          border={border} bgCard={bgCard} bgBody={bgBody}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* BLOCO 3 — MOVIMENTAÇÕES                                         */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <SecaoLabel label="Movimentações" accent={accent} style={{ marginTop: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>

        {/* Entradas / Saídas / Descartes por dia */}
        <GraficoCard
          titulo="Movimentações por Dia"
          sub="ÚLTIMOS 7 DIAS"
          tipo={tipos.movimentos}
          onChangeTipo={v => setTipo("movimentos", v)}
          series={[
            { nome: "Entradas",  dados: movEntDia,  cor: "#4ADE80" },
            { nome: "Saídas",    dados: movSaidDia,  cor: "#F87171" },
            { nome: "Descartes", dados: movDescDia,  cor: "#FBBF24" },
          ]}
          labels={labelsMovDia}
          altura={160}
          accent={accent} accentDim={accentDim} accentBorder={accentBorder}
          border={border} bgCard={bgCard} bgBody={bgBody}
        />

        {/* Pedidos e valor por dia */}
        <GraficoCard
          titulo="Pedidos por Dia"
          sub="ÚLTIMOS 7 DIAS"
          tipo={tipos.pedidos}
          onChangeTipo={v => setTipo("pedidos", v)}
          series={[
            { nome: "Pedidos", dados: dadosPedDia, cor: accent },
            { nome: "Valor R$", dados: dadosValDia.map(v => v / 10), cor: "#A78BFA" },
          ]}
          labels={labelsPedDia}
          altura={160}
          accent={accent} accentDim={accentDim} accentBorder={accentBorder}
          border={border} bgCard={bgCard} bgBody={bgBody}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* BLOCO 4 — PRODUTOS                                              */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <SecaoLabel label="Produtos" accent={accent} style={{ marginTop: 24 }} />
      <GraficoCard
        titulo="Receita por Produto"
        sub={`PERÍODO: ${periodo.label}`}
        tipo={tipos.produtos}
        onChangeTipo={v => setTipo("produtos", v)}
        series={produtoStats.length > 0
          ? produtoStats.map((s, i) => ({
              nome: s.produto.nome,
              dados: [s.receita],
              cor: SERIE_CORES[i % SERIE_CORES.length],
            }))
          : [{ nome: "Sem dados", dados: [0], cor: "#333" }]
        }
        labels={produtoStats.length > 0 ? produtoStats.map(s => s.produto.emoji || s.produto.nome.slice(0, 5)) : ["—"]}
        altura={160}
        accent={accent} accentDim={accentDim} accentBorder={accentBorder}
        border={border} bgCard={bgCard} bgBody={bgBody}
      />

      {/* Legenda de séries global */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 24, padding: "12px 0", borderTop: `1px solid ${border}` }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", letterSpacing: "0.08em", alignSelf: "center" }}>
          TIPO ATIVO:
        </span>
        {TIPOS.map(t => (
          <span key={t.id} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: (prefs?.tipoGrafico || "bar") === t.id ? accent : "#333",
            letterSpacing: "0.04em",
          }}>
            <Icon d={t.icon} size={11} />
            {t.label.toUpperCase()}
            {(prefs?.tipoGrafico || "bar") === t.id && (
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: accent, display: "inline-block" }} />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Label de seção ────────────────────────────────────────────────────────────
function SecaoLabel({ label, accent, style = {} }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, ...style }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: accent, textTransform: "uppercase", fontWeight: 600 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${accent}30, transparent)` }} />
    </div>
  );
}