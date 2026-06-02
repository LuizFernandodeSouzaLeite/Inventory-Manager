// src/pages/Graficos.jsx
// v3.0 — tooltips interativos em todos os tipos de gráfico (barra, linha, área, pizza, radial).

import { useState, useMemo, useRef, useCallback } from "react";
import Icon, { icons } from "../components/Icon";
import { calcEstoque } from "../utils/estoque";
import { addDias, diasAte, fmtData } from "../utils/helpers";

const PERIODOS = [
  { id: "7d",  label: "7d",  dias: 7  },
  { id: "14d", label: "14d", dias: 14 },
  { id: "30d", label: "30d", dias: 30 },
];

function filtrarPorPeriodo(lista, dias) {
  const agora = new Date();
  return lista.filter(item => ((agora - new Date(item.data)) / 86400000) <= dias);
}

const SERIE_CORES = ["#C9A84C","#4ADE80","#F87171","#60A5FA","#A78BFA","#FBBF24","#FB923C"];

const TIPOS = [
  { id: "bar",    label: "Barras",  icon: icons.barChart },
  { id: "line",   label: "Linha",   icon: icons.activity },
  { id: "area",   label: "Área",    icon: icons.trending },
  { id: "pie",    label: "Pizza",   icon: icons.pieChart },
  { id: "radial", label: "Radial",  icon: icons.repeat   },
];

const CHAVES = ["entVsSaid","lucro","custos","estoqueAtual","validades","movDia","pedDia","produtos"];
function mkTipos(v) { return Object.fromEntries(CHAVES.map(k => [k, v])); }

// ── Tooltip flutuante ─────────────────────────────────────────────────────────
function Tooltip({ tooltip, textDim = "#3A3A3A" }) {
  if (!tooltip.visible) return null;
  return (
    <div style={{
      position: "fixed",
      left: tooltip.x + 14,
      top: tooltip.y - 10,
      zIndex: 9999,
      pointerEvents: "none",
      background: "#0A0A0A",
      border: `1px solid ${tooltip.cor || "#C9A84C"}40`,
      borderRadius: 8,
      padding: "8px 12px",
      boxShadow: `0 8px 24px #00000080, 0 0 0 1px ${tooltip.cor || "#C9A84C"}15`,
      minWidth: 120,
      maxWidth: 220,
      animation: "barto-fade-in 0.1s ease",
    }}>
      {/* Label da série */}
      {tooltip.serie && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: tooltip.cor, flexShrink: 0 }}/>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {tooltip.serie}
          </span>
        </div>
      )}
      {/* Label do eixo X (dia, categoria) */}
      {tooltip.label && (
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: textDim, marginBottom: 4, letterSpacing: "0.04em" }}>
          {tooltip.label}
        </div>
      )}
      {/* Valor principal */}
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 600, color: tooltip.cor || "#EDE9DF", letterSpacing: "-0.02em" }}>
        {tooltip.valor}
      </div>
      {/* Sub-info opcional */}
      {tooltip.sub && (
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#444", marginTop: 3 }}>
          {tooltip.sub}
        </div>
      )}
    </div>
  );
}

// ── Hook de tooltip ───────────────────────────────────────────────────────────
function useTooltip() {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, valor: "", label: "", serie: "", cor: "", sub: "" });

  const show = useCallback((e, data) => {
    setTooltip({ visible: true, x: e.clientX, y: e.clientY, ...data });
  }, []);

  const hide = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  const move = useCallback((e) => {
    setTooltip(prev => prev.visible ? { ...prev, x: e.clientX, y: e.clientY } : prev);
  }, []);

  return { tooltip, show, hide, move };
}

// ── Formata valor para exibição no tooltip ────────────────────────────────────
function fmtValor(v, prefixo = "", sufixo = "") {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return prefixo + (n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)) + sufixo;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRÁFICO DE BARRAS com tooltips
// ═══════════════════════════════════════════════════════════════════════════════
function GraficoBarra({ series, labels, altura, border, prefixo = "", sufixo = "", textDim = "#3A3A3A", textGhost = "#2A2A2A" }) {
  const { tooltip, show, hide, move } = useTooltip();
  const allVals = series.flatMap(s => s.dados);
  const max = Math.max(...allVals, 1);
  const n = labels.length;
  const W = 500; const pad = 32; const plotW = W - pad; const plotH = altura - 24;
  const grupoW = plotW / n;
  const barW = Math.max(6, (grupoW / series.length) - 4);

  return (
    <>
      <Tooltip tooltip={tooltip} textDim={textDim} />
      <svg viewBox={`0 0 ${W} ${altura}`} style={{ width:"100%", height:altura, display:"block" }}
        onMouseMove={move} onMouseLeave={hide}>
        {[0.25,0.5,0.75,1].map(f => (
          <line key={f} x1={pad} x2={W} y1={plotH*(1-f)} y2={plotH*(1-f)} stroke={border} strokeWidth={0.5}/>
        ))}
        {labels.map((lbl, i) => (
          <g key={i}>
            {series.map((s, si) => {
              const v = s.dados[i] || 0;
              const h = Math.max(2, (v / max) * plotH);
              const x = pad + i * grupoW + si * (barW + 3) + 4;
              const cor = s.cor || SERIE_CORES[si % SERIE_CORES.length];
              return (
                <rect key={si} x={x} y={plotH - h} width={barW} height={h}
                  fill={cor} opacity={0.82} rx={3}
                  style={{ cursor: "crosshair" }}
                  onMouseEnter={e => show(e, { valor: fmtValor(v, prefixo, sufixo), label: lbl, serie: s.nome, cor })}
                />
              );
            })}
            <text x={pad + i*grupoW + grupoW/2} y={altura-4}
              textAnchor="middle" fill={textGhost} fontSize={8} fontFamily="'DM Mono',monospace">{lbl}</text>
          </g>
        ))}
        {[0,0.5,1].map(f => (
          <text key={f} x={pad-4} y={plotH*(1-f)+4}
            textAnchor="end" fill={textGhost} fontSize={7} fontFamily="'DM Mono',monospace">
            {fmtValor(max*f, prefixo, sufixo)}
          </text>
        ))}
      </svg>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRÁFICO DE LINHA com tooltips
// ═══════════════════════════════════════════════════════════════════════════════
function GraficoLinha({ series, labels, altura, border, prefixo = "", sufixo = "", textDim = "#3A3A3A", textGhost = "#2A2A2A" }) {
  const { tooltip, show, hide, move } = useTooltip();
  const allVals = series.flatMap(s => s.dados);
  const max = Math.max(...allVals, 1);
  const n = labels.length;
  const W = 500; const pad = 32; const plotW = W - pad; const plotH = altura - 24;
  const toX = i => pad + (i / Math.max(n-1,1)) * plotW;
  const toY = v => plotH - (v / max) * plotH;

  return (
    <>
      <Tooltip tooltip={tooltip} textDim={textDim} />
      <svg viewBox={`0 0 ${W} ${altura}`} style={{ width:"100%", height:altura, display:"block" }}
        onMouseMove={move} onMouseLeave={hide}>
        {[0.25,0.5,0.75,1].map(f => (
          <line key={f} x1={pad} x2={W} y1={plotH*(1-f)} y2={plotH*(1-f)} stroke={border} strokeWidth={0.5}/>
        ))}
        {series.map((s, si) => {
          const cor = s.cor || SERIE_CORES[si % SERIE_CORES.length];
          const pts = s.dados.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
          return (
            <g key={si}>
              <polyline points={pts} fill="none" stroke={cor} strokeWidth={2}
                strokeLinejoin="round" strokeLinecap="round" opacity={0.9}/>
              {s.dados.map((v, i) => (
                <circle key={i} cx={toX(i)} cy={toY(v)} r={5} fill={cor}
                  style={{ cursor: "crosshair" }}
                  onMouseEnter={e => show(e, { valor: fmtValor(v, prefixo, sufixo), label: labels[i], serie: s.nome, cor })}
                />
              ))}
            </g>
          );
        })}
        {labels.map((lbl, i) => (
          <text key={i} x={toX(i)} y={altura-4}
            textAnchor="middle" fill={textGhost} fontSize={8} fontFamily="'DM Mono',monospace">{lbl}</text>
        ))}
        {[0,0.5,1].map(f => (
          <text key={f} x={pad-4} y={plotH*(1-f)+4}
            textAnchor="end" fill={textGhost} fontSize={7} fontFamily="'DM Mono',monospace">
            {fmtValor(max*f, prefixo, sufixo)}
          </text>
        ))}
      </svg>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRÁFICO DE ÁREA com tooltips
// ═══════════════════════════════════════════════════════════════════════════════
function GraficoArea({ series, labels, altura, border, prefixo = "", sufixo = "", textDim = "#3A3A3A", textGhost = "#2A2A2A" }) {
  const { tooltip, show, hide, move } = useTooltip();
  const allVals = series.flatMap(s => s.dados);
  const max = Math.max(...allVals, 1);
  const n = labels.length;
  const W = 500; const pad = 32; const plotW = W - pad; const plotH = altura - 24;
  const toX = i => pad + (i / Math.max(n-1,1)) * plotW;
  const toY = v => plotH - (v / max) * plotH;

  return (
    <>
      <Tooltip tooltip={tooltip} textDim={textDim} />
      <svg viewBox={`0 0 ${W} ${altura}`} style={{ width:"100%", height:altura, display:"block" }}
        onMouseMove={move} onMouseLeave={hide}>
        <defs>
          {series.map((s, si) => {
            const cor = s.cor || SERIE_CORES[si % SERIE_CORES.length];
            return (
              <linearGradient key={si} id={`ag${si}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cor} stopOpacity={0.35}/>
                <stop offset="100%" stopColor={cor} stopOpacity={0.02}/>
              </linearGradient>
            );
          })}
        </defs>
        {[0.25,0.5,0.75,1].map(f => (
          <line key={f} x1={pad} x2={W} y1={plotH*(1-f)} y2={plotH*(1-f)} stroke={border} strokeWidth={0.5}/>
        ))}
        {series.map((s, si) => {
          const cor = s.cor || SERIE_CORES[si % SERIE_CORES.length];
          const areaPts = `${toX(0)},${plotH} ` + s.dados.map((v,i) => `${toX(i)},${toY(v)}`).join(" ") + ` ${toX(n-1)},${plotH}`;
          const linePts = s.dados.map((v,i) => `${toX(i)},${toY(v)}`).join(" ");
          return (
            <g key={si}>
              <polygon points={areaPts} fill={`url(#ag${si})`}/>
              <polyline points={linePts} fill="none" stroke={cor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/>
              {s.dados.map((v, i) => (
                <circle key={i} cx={toX(i)} cy={toY(v)} r={5} fill={cor} opacity={0.9}
                  style={{ cursor: "crosshair" }}
                  onMouseEnter={e => show(e, { valor: fmtValor(v, prefixo, sufixo), label: labels[i], serie: s.nome, cor })}
                />
              ))}
            </g>
          );
        })}
        {labels.map((lbl, i) => (
          <text key={i} x={toX(i)} y={altura-4}
            textAnchor="middle" fill={textGhost} fontSize={8} fontFamily="'DM Mono',monospace">{lbl}</text>
        ))}
      </svg>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRÁFICO DE PIZZA com tooltips
// ═══════════════════════════════════════════════════════════════════════════════
function GraficoPizza({ series, labels, altura, prefixo = "", sufixo = "", textDim = "#3A3A3A", textGhost = "#2A2A2A" }) {
  const { tooltip, show, hide, move } = useTooltip();
  const dados = series.map((s,i) => ({
    label: s.nome,
    valor: s.dados.reduce((a,b) => a+b, 0),
    cor: s.cor || SERIE_CORES[i % SERIE_CORES.length],
  })).filter(d => d.valor > 0);
  const total = dados.reduce((s,d) => s+d.valor, 0) || 1;
  const cx = 110; const cy = altura/2; const r = Math.min(cy-10, 68);
  let ang = -Math.PI/2;

  const fatias = dados.map(d => {
    const a = (d.valor/total)*2*Math.PI;
    const x1 = cx + r*Math.cos(ang); const y1 = cy + r*Math.sin(ang);
    ang += a;
    const x2 = cx + r*Math.cos(ang); const y2 = cy + r*Math.sin(ang);
    return { ...d, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${a>Math.PI?1:0},1 ${x2},${y2} Z`, pct: (d.valor/total*100).toFixed(1) };
  });

  return (
    <>
      <Tooltip tooltip={tooltip} textDim={textDim} />
      <svg viewBox={`0 0 500 ${altura}`} style={{ width:"100%", height:altura, display:"block" }}
        onMouseMove={move} onMouseLeave={hide}>
        {fatias.map((f, i) => (
          <path key={i} d={f.path} fill={f.cor} opacity={0.85}
            stroke="#080808" strokeWidth={1.5}
            style={{ cursor: "crosshair", transition: "opacity 0.15s" }}
            onMouseEnter={e => show(e, { valor: fmtValor(f.valor, prefixo, sufixo), label: f.label, serie: f.label, cor: f.cor, sub: `${f.pct}% do total` })}
            onMouseOver={e => e.currentTarget.setAttribute("opacity","1")}
            onMouseOut={e => e.currentTarget.setAttribute("opacity","0.85")}
          />
        ))}
        {dados.map((d, i) => (
          <g key={i}>
            <rect x={240} y={12+i*22} width={10} height={10} fill={d.cor} rx={2}/>
            <text x={256} y={22+i*22} fill="#888" fontSize={11} fontFamily="'DM Sans',sans-serif">{d.label}</text>
            <text x={495} y={22+i*22} fill={d.cor} fontSize={11} fontFamily="'DM Mono',monospace" textAnchor="end" fontWeight="600">
              {((d.valor/total)*100).toFixed(1)}%
            </text>
          </g>
        ))}
      </svg>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRÁFICO RADIAL com tooltips
// ═══════════════════════════════════════════════════════════════════════════════
function GraficoRadial({ series, labels, altura, prefixo = "", sufixo = "", textDim = "#3A3A3A", textGhost = "#2A2A2A" }) {
  const { tooltip, show, hide, move } = useTooltip();
  const dados = series.map((s,i) => ({
    label: s.nome,
    valor: s.dados.reduce((a,b) => a+b, 0),
    cor: s.cor || SERIE_CORES[i % SERIE_CORES.length],
  })).filter(d => d.valor > 0);
  const total = dados.reduce((s,d) => s+d.valor, 0) || 1;
  const cx = 110; const cy = altura/2; const rMin = 20; const rMax = Math.min(cy-10, 70);

  return (
    <>
      <Tooltip tooltip={tooltip} textDim={textDim} />
      <svg viewBox={`0 0 500 ${altura}`} style={{ width:"100%", height:altura, display:"block" }}
        onMouseMove={move} onMouseLeave={hide}>
        {dados.map((d, i) => {
          const pct = d.valor/total;
          const rAtual = rMin + (rMax-rMin)*((i+1)/dados.length);
          const thickness = Math.max(6, (rMax-rMin)/dados.length - 3);
          const startA = -Math.PI/2;
          const endA = startA + pct*2*Math.PI;
          const x1 = cx + rAtual*Math.cos(startA); const y1 = cy + rAtual*Math.sin(startA);
          const x2 = cx + rAtual*Math.cos(endA);   const y2 = cy + rAtual*Math.sin(endA);
          const large = pct*2*Math.PI > Math.PI ? 1 : 0;
          const pathD = `M${x1},${y1} A${rAtual},${rAtual} 0 ${large},1 ${x2},${y2}`;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={rAtual} fill="none" stroke={d.cor+"20"} strokeWidth={thickness}/>
              <path d={pathD} fill="none" stroke={d.cor} strokeWidth={thickness}
                strokeLinecap="round" opacity={0.9}
                style={{ cursor: "crosshair" }}
                onMouseEnter={e => show(e, { valor: fmtValor(d.valor, prefixo, sufixo), label: d.label, serie: d.label, cor: d.cor, sub: `${(pct*100).toFixed(1)}% do total` })}
              />
            </g>
          );
        })}
        {dados.map((d, i) => (
          <g key={i}>
            <rect x={240} y={12+i*22} width={10} height={10} fill={d.cor} rx={2}/>
            <text x={256} y={22+i*22} fill="#888" fontSize={11} fontFamily="'DM Sans',sans-serif">{d.label}</text>
            <text x={495} y={22+i*22} fill={d.cor} fontSize={11} fontFamily="'DM Mono',monospace" textAnchor="end" fontWeight="600">
              {((d.valor/total)*100).toFixed(1)}%
            </text>
          </g>
        ))}
      </svg>
    </>
  );
}

// ── Router de gráfico ─────────────────────────────────────────────────────────
function GraficoUniversal({ tipo, series, labels, altura = 160, accent, bgCard, border, prefixo = "", sufixo = "", textDim = "#3A3A3A", textGhost = "#2A2A2A" }) {
  const props = { series, labels, altura, border, prefixo, sufixo, textDim, textGhost };
  switch (tipo) {
    case "line":   return <GraficoLinha  {...props} />;
    case "area":   return <GraficoArea   {...props} />;
    case "pie":    return <GraficoPizza  {...props} />;
    case "radial": return <GraficoRadial {...props} />;
    default:       return <GraficoBarra  {...props} />;
  }
}

// ── Seletor de tipo ───────────────────────────────────────────────────────────
function SeletorTipo({ tipo, onChange, accent, accentDim, accentBorder, border, bgCard }) {
  return (
    <div style={{ display:"flex", gap:3, background:bgCard, border:`1px solid ${border}`, borderRadius:8, padding:3 }}>
      {TIPOS.map(t => {
        const sel = tipo === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} title={t.label}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", width:28, height:28, borderRadius:6, border:`1px solid ${sel?accentBorder:"transparent"}`, background:sel?accentDim:"transparent", color:sel?accent:"#444", cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e => { if(!sel) e.currentTarget.style.color="#777"; }}
            onMouseLeave={e => { if(!sel) e.currentTarget.style.color="#444"; }}
          >
            <Icon d={t.icon} size={13}/>
          </button>
        );
      })}
    </div>
  );
}

// ── Card de gráfico ───────────────────────────────────────────────────────────
function GraficoCard({ titulo, sub, chave, tipos, setTipo, series, labels, altura=160, accent, accentDim, accentBorder, border, bgCard, bgBody, prefixo="", sufixo="", t={} }) {
  const tipo = tipos[chave];
  return (
    <div style={{ background:bgCard, border:`1px solid ${border}`, borderRadius:10, padding:"16px 18px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:13.5, color:"#C8C4BC" }}>{titulo}</div>
          {sub && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#3A3A3A", marginTop:3, letterSpacing:"0.08em" }}>{sub}</div>}
        </div>
        <SeletorTipo tipo={tipo} onChange={v => setTipo(chave, v)} accent={accent} accentDim={accentDim} accentBorder={accentBorder} border={border} bgCard={bgBody}/>
      </div>
      <GraficoUniversal tipo={tipo} series={series} labels={labels} altura={altura} accent={accent} bgCard={bgCard} border={border} prefixo={prefixo} sufixo={sufixo} textDim={t?.textDim||textDim} textGhost={t?.textGhost||textGhost}/>
      {series.length > 1 && (
        <div style={{ display:"flex", gap:12, marginTop:10, flexWrap:"wrap" }}>
          {series.map(s => (
            <div key={s.nome} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:7, height:7, borderRadius:2, background:s.cor, flexShrink:0 }}/>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#555" }}>{s.nome}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SecaoLabel({ label, accent, mt = 24 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, marginTop:mt }}>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.14em", color:accent, textTransform:"uppercase", fontWeight:600 }}>{label}</span>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${accent}30,transparent)` }}/>
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

  const tipoGlobal = prefs?.tipoGrafico || "bar";
  const [tipos, setTipos] = useState(() => mkTipos(tipoGlobal));
  const setTipo = (chave, val) => setTipos(prev => ({ ...prev, [chave]: val }));
  const setTipoGlobal = (val) => { setPref("tipoGrafico", val); setTipos(mkTipos(val)); };

  const [periodoIdx, setPeriodoIdx] = useState(0);
  const periodo = PERIODOS[periodoIdx];

  // ── Dados financeiros ─────────────────────────────────────────────────────
  const { entradas = [], saidas = [] } = financeiro || {};
  const entFilt  = useMemo(() => filtrarPorPeriodo(entradas, periodo.dias), [entradas, periodo]);
  const saidFilt = useMemo(() => filtrarPorPeriodo(saidas,   periodo.dias), [saidas,   periodo]);

  const datasGraf    = Array.from({ length: periodo.dias }, (_, i) => addDias(-(periodo.dias-1-i)));
  const labelsGraf   = datasGraf.map((_, i) => {
    const d = datasGraf[i];
    return i === periodo.dias-1 ? "hoje" : fmtData(d).slice(0,5);
  });
  const dadosEntDia  = datasGraf.map(d => entFilt.filter(e => e.data === d).reduce((s,e) => s+e.valor, 0));
  const dadosSaidDia = datasGraf.map(d => saidFilt.filter(e => e.data === d).reduce((s,e) => s+e.valor, 0));
  const dadosLucro   = dadosEntDia.map((e, i) => Math.max(0, e - dadosSaidDia[i]));
  const custoMateria = saidFilt.filter(s => s.tipo==="compra").reduce((s,e) => s+e.valor, 0);
  const custoOper    = saidFilt.filter(s => s.tipo==="operacional").reduce((s,e) => s+e.valor, 0);
  const custoDesp    = saidFilt.filter(s => s.tipo==="desperdicio").reduce((s,e) => s+e.valor, 0);

  // ── Dados de estoque ──────────────────────────────────────────────────────
  const estoqueAtual = ingredientes.map(ing => ({
    nome: ing.nome.split(" ")[0], emoji: ing.emoji,
    valor: calcEstoque(lotes, ing.id), minimo: ing.minimo,
  }));

  // ── Dados de movimentações ────────────────────────────────────────────────
  const datasMovDia  = Array.from({ length: 7 }, (_, i) => addDias(-(6-i)));
  const labelsMovDia = datasMovDia.map((d, i) => i===6 ? "hoje" : fmtData(d).slice(0,5));
  const movEntDia    = datasMovDia.map(d => movimentos.filter(m => m.data.startsWith(d) && m.tipo==="entrada").reduce((s,m) => s+m.quantidade, 0));
  const movSaidDia   = datasMovDia.map(d => movimentos.filter(m => m.data.startsWith(d) && m.tipo==="saida").reduce((s,m) => s+m.quantidade, 0));
  const movDescDia   = datasMovDia.map(d => movimentos.filter(m => m.data.startsWith(d) && m.tipo==="descarte").reduce((s,m) => s+m.quantidade, 0));

  // ── Dados de pedidos ──────────────────────────────────────────────────────
  const datasPedDia  = Array.from({ length: 7 }, (_, i) => addDias(-(6-i)));
  const labelsPedDia = datasPedDia.map((d, i) => i===6 ? "hoje" : fmtData(d).slice(0,5));
  const dadosPedDia  = datasPedDia.map(d => pedidos.filter(p => p.data.startsWith(d)).length);
  const dadosValDia  = datasPedDia.map(d => pedidos.filter(p => p.data.startsWith(d)).reduce((s,p) => s+(p.total||0), 0));

  // ── Dados de produtos ─────────────────────────────────────────────────────
  const produtoStats = useMemo(() => {
    const stats = {};
    entFilt.forEach(e => (e.produtoIds||[]).forEach(pid => {
      if(!stats[pid]) stats[pid] = { vendas:0, receita:0 };
      stats[pid].vendas++;
      stats[pid].receita += (produtos.find(p => p.id===pid)?.preco || 0);
    }));
    return Object.entries(stats)
      .map(([pid,s]) => ({ ...s, produto: produtos.find(p => p.id===pid) }))
      .filter(s => s.produto)
      .sort((a,b) => b.receita-a.receita);
  }, [entFilt, produtos]);

  const cardProps = { tipos, setTipo, accent, accentDim, accentBorder, border, bgCard, bgBody, t };

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.03em", color:"#EDE9DF" }}>Gráficos</h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#3A3A3A", marginTop:5, letterSpacing:"0.08em" }}>
            VISÃO VISUAL COMPLETA · PASSE O MOUSE PARA VER DETALHES
          </p>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Período */}
          <div style={{ display:"flex", gap:2, background:bgCard, border:`1px solid ${border}`, borderRadius:8, padding:3 }}>
            {PERIODOS.map((p, i) => (
              <button key={p.id} onClick={() => setPeriodoIdx(i)}
                style={{ padding:"5px 12px", borderRadius:6, fontSize:11, fontFamily:"'DM Mono',monospace", cursor:"pointer", background:periodoIdx===i?accentDim:"transparent", border:`1px solid ${periodoIdx===i?accentBorder:"transparent"}`, color:periodoIdx===i?accent:"#444", transition:"all 0.15s" }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Tipo global */}
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 10px", borderRadius:8, background:bgCard, border:`1px solid ${border}` }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#3A3A3A", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>TODOS:</span>
            <SeletorTipo tipo={prefs?.tipoGrafico||"bar"} onChange={setTipoGlobal} accent={accent} accentDim={accentDim} accentBorder={accentBorder} border={border} bgCard={bgBody}/>
          </div>
        </div>
      </div>

      {/* ── FINANCEIRO ───────────────────────────────────────────────────── */}
      <SecaoLabel label="Financeiro" accent={accent} mt={0}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        <GraficoCard {...cardProps} chave="entVsSaid" titulo="Entradas vs Saídas" sub={`ÚLTIMOS ${periodo.dias} DIAS`} prefixo="R$"
          series={[{nome:"Entradas",dados:dadosEntDia,cor:"#4ADE80"},{nome:"Saídas",dados:dadosSaidDia,cor:"#F87171"}]}
          labels={labelsGraf}
        />
        <GraficoCard {...cardProps} chave="lucro" titulo="Lucro Estimado por Dia" sub={`ÚLTIMOS ${periodo.dias} DIAS`} prefixo="R$"
          series={[{nome:"Lucro",dados:dadosLucro,cor:accent}]}
          labels={labelsGraf}
        />
      </div>
      <GraficoCard {...cardProps} chave="custos" titulo="Distribuição de Custos" sub="COMPOSIÇÃO DAS SAÍDAS" prefixo="R$"
        series={[{nome:"Matéria-prima",dados:[custoMateria],cor:"#60A5FA"},{nome:"Operacional",dados:[custoOper],cor:"#A78BFA"},{nome:"Desperdício",dados:[custoDesp],cor:"#FBBF24"}]}
        labels={["Custos"]}
      />

      {/* ── ESTOQUE ──────────────────────────────────────────────────────── */}
      <SecaoLabel label="Estoque" accent={accent}/>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:12, marginBottom:12 }}>
        <GraficoCard {...cardProps} chave="estoqueAtual" titulo="Estoque Atual vs Mínimo" sub="TODOS OS INGREDIENTES"
          series={[{nome:"Atual",dados:estoqueAtual.map(e=>e.valor),cor:accent},{nome:"Mínimo",dados:estoqueAtual.map(e=>e.minimo),cor:"#EF4444"}]}
          labels={estoqueAtual.map(e => e.emoji || e.nome.slice(0,4))}
        />
        <GraficoCard {...cardProps} chave="validades" titulo="Status de Validade" sub="LOTES ATIVOS"
          series={[
            {nome:"OK",     dados:[lotes.filter(l=>diasAte(l.dataValidade)>7&&l.quantidadeRestante>0).length],    cor:"#4ADE80"},
            {nome:"Atenção",dados:[lotes.filter(l=>diasAte(l.dataValidade)>=0&&diasAte(l.dataValidade)<=7&&l.quantidadeRestante>0).length],cor:"#FBBF24"},
            {nome:"Vencido",dados:[lotes.filter(l=>diasAte(l.dataValidade)<0&&l.quantidadeRestante>0).length],    cor:"#EF4444"},
          ]}
          labels={["Lotes"]}
        />
      </div>

      {/* ── MOVIMENTAÇÕES ────────────────────────────────────────────────── */}
      <SecaoLabel label="Movimentações" accent={accent}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        <GraficoCard {...cardProps} chave="movDia" titulo="Movimentações por Dia" sub="ÚLTIMOS 7 DIAS"
          series={[{nome:"Entradas",dados:movEntDia,cor:"#4ADE80"},{nome:"Saídas",dados:movSaidDia,cor:"#F87171"},{nome:"Descartes",dados:movDescDia,cor:"#FBBF24"}]}
          labels={labelsMovDia}
        />
        <GraficoCard {...cardProps} chave="pedDia" titulo="Pedidos por Dia" sub="ÚLTIMOS 7 DIAS"
          series={[{nome:"Pedidos",dados:dadosPedDia,cor:accent},{nome:"Valor ÷10",dados:dadosValDia.map(v=>v/10),cor:"#A78BFA"}]}
          labels={labelsPedDia}
        />
      </div>

      {/* ── PRODUTOS ─────────────────────────────────────────────────────── */}
      <SecaoLabel label="Produtos" accent={accent}/>
      <GraficoCard {...cardProps} chave="produtos" titulo="Receita por Produto" sub={`PERÍODO: ${periodo.label}`} prefixo="R$"
        series={produtoStats.length > 0
          ? produtoStats.map((s,i) => ({nome:s.produto.nome, dados:[s.receita], cor:SERIE_CORES[i%SERIE_CORES.length]}))
          : [{nome:"Sem dados",dados:[0],cor:"#333"}]
        }
        labels={produtoStats.length > 0 ? produtoStats.map(s => s.produto.emoji||s.produto.nome.slice(0,5)) : ["—"]}
      />

      {/* Rodapé */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:16, marginTop:24, paddingTop:16, borderTop:`1px solid ${border}` }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3A3A3A", alignSelf:"center", letterSpacing:"0.08em" }}>TIPO GLOBAL:</span>
        {TIPOS.map(tp => (
          <span key={tp.id} style={{ display:"inline-flex", alignItems:"center", gap:5, fontFamily:"'DM Mono',monospace", fontSize:10, color:(prefs?.tipoGrafico||"bar")===tp.id?accent:"#333" }}>
            <Icon d={tp.icon} size={11}/>
            {tp.label.toUpperCase()}
            {(prefs?.tipoGrafico||"bar")===tp.id && <span style={{ width:4, height:4, borderRadius:"50%", background:accent, display:"inline-block" }}/>}
          </span>
        ))}
      </div>
    </div>
  );
}