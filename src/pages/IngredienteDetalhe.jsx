// src/pages/IngredienteDetalhe.jsx
// v2.0 — seletor de tipo de gráfico + seletor de período por gráfico.

import { useState, useMemo, useCallback } from "react";
import Icon, { icons } from "../components/Icon";
import { Badge, Card } from "../components/UI";
import { calcEstoque, calcEstoqueOp } from "../utils/estoque";
import { fmtData, diasAte, corStatus, addDias } from "../utils/helpers";

// ── Tipos de gráfico disponíveis ──────────────────────────────────────────────
const TIPOS = [
  { id:"bar",    icon:"M18 20V10 M12 20V4 M6 20v-6",                label:"Barras" },
  { id:"line",   icon:"M22 12h-4l-3 9L9 3l-3 9H2",                 label:"Linha"  },
  { id:"area",   icon:"M23 6l-9.5 9.5-5-5L1 18",                   label:"Área"   },
];

const PERIODOS = [
  { id:"5",  label:"5 lotes",  n:5  },
  { id:"8",  label:"8 lotes",  n:8  },
  { id:"12", label:"12 lotes", n:12 },
  { id:"all",label:"Todos",    n:999},
];

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ tt }) {
  if (!tt.visible) return null;
  return (
    <div style={{ position:"fixed", left:tt.x+14, top:tt.y-10, zIndex:9999, pointerEvents:"none", background:"#0A0A0A", border:`1px solid ${tt.cor||"#C9A84C"}40`, borderRadius:8, padding:"8px 12px", boxShadow:`0 8px 24px #00000080`, minWidth:110, animation:"barto-fade-in 0.1s ease" }}>
      {tt.serie && (
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:tt.cor }}/>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#888", textTransform:"uppercase", letterSpacing:"0.06em" }}>{tt.serie}</span>
        </div>
      )}
      {tt.label && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#888", marginBottom:3 }}>{tt.label}</div>}
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:16, fontWeight:600, color:tt.cor||"#EDE9DF" }}>{tt.valor}</div>
      {tt.sub && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#888", marginTop:2 }}>{tt.sub}</div>}
    </div>
  );
}

function useTooltip() {
  const [tt, setTt] = useState({ visible:false, x:0, y:0, valor:"", label:"", serie:"", cor:"", sub:"" });
  const show = useCallback((e, data) => setTt({ visible:true, x:e.clientX, y:e.clientY, ...data }), []);
  const hide = useCallback(() => setTt(p => ({ ...p, visible:false })), []);
  const move = useCallback((e) => setTt(p => p.visible ? { ...p, x:e.clientX, y:e.clientY } : p), []);
  return { tt, show, hide, move };
}

// ── Gráfico de Barras ─────────────────────────────────────────────────────────
function GraficoBarra({ dados, labels, cor, altura=130, border="#1E1E1E", pre="", suf="", textDim="#555", textGhost="#888" }) {
  const { tt, show, hide, move } = useTooltip();
  const max = Math.max(...dados, 1);
  const W=500; const pad=32; const plotW=W-pad; const plotH=altura-24;
  const bW = Math.max(8, (plotW/dados.length)-6);
  return (<>
    <Tooltip tt={tt}/>
    <svg viewBox={`0 0 ${W} ${altura}`} style={{ width:"100%", height:altura, display:"block" }} onMouseMove={move} onMouseLeave={hide}>
      {[.25,.5,.75,1].map(f=><line key={f} x1={pad} x2={W} y1={plotH*(1-f)} y2={plotH*(1-f)} stroke={border} strokeWidth={.5}/>)}
      {dados.map((v,i)=>{
        const h=Math.max(2,(v/max)*plotH); const x=pad+i*(plotW/dados.length)+((plotW/dados.length)-bW)/2;
        return (<g key={i}>
          <rect x={x} y={plotH-h} width={bW} height={h} fill={cor} opacity={.85} rx={3} style={{cursor:"crosshair"}}
            onMouseEnter={e=>show(e,{valor:`${pre}${Number(v).toFixed(2)}${suf}`,label:labels[i],serie:"valor",cor})}/>
          <text x={x+bW/2} y={altura-4} textAnchor="middle" fill={textDim} fontSize={8} fontFamily="'DM Mono',monospace">{labels[i]}</text>
        </g>);
      })}
      {[0,.5,1].map(f=><text key={f} x={pad-4} y={plotH*(1-f)+4} textAnchor="end" fill={textGhost} fontSize={7} fontFamily="'DM Mono',monospace">{pre}{(max*f).toFixed(0)}{suf}</text>)}
    </svg>
  </>);
}

// ── Gráfico de Linha ──────────────────────────────────────────────────────────
function GraficoLinha({ dados, labels, cor, altura=130, border="#1E1E1E", pre="", suf="", textDim="#555", textGhost="#888" }) {
  const { tt, show, hide, move } = useTooltip();
  const max = Math.max(...dados, 1);
  const W=500; const pad=32; const plotW=W-pad; const plotH=altura-24;
  const toX = i => pad+(i/Math.max(dados.length-1,1))*plotW;
  const toY = v => plotH-(v/max)*plotH;
  const pts = dados.map((v,i)=>`${toX(i)},${toY(v)}`).join(" ");
  return (<>
    <Tooltip tt={tt}/>
    <svg viewBox={`0 0 ${W} ${altura}`} style={{ width:"100%", height:altura, display:"block" }} onMouseMove={move} onMouseLeave={hide}>
      {[.25,.5,.75,1].map(f=><line key={f} x1={pad} x2={W} y1={plotH*(1-f)} y2={plotH*(1-f)} stroke={border} strokeWidth={.5}/>)}
      <polyline points={pts} fill="none" stroke={cor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" opacity={.9}/>
      {dados.map((v,i)=><circle key={i} cx={toX(i)} cy={toY(v)} r={5} fill={cor} style={{cursor:"crosshair"}}
        onMouseEnter={e=>show(e,{valor:`${pre}${Number(v).toFixed(2)}${suf}`,label:labels[i],serie:"valor",cor})}/>)}
      {labels.map((lbl,i)=><text key={i} x={toX(i)} y={altura-4} textAnchor="middle" fill={textDim} fontSize={8} fontFamily="'DM Mono',monospace">{lbl}</text>)}
      {[0,.5,1].map(f=><text key={f} x={pad-4} y={plotH*(1-f)+4} textAnchor="end" fill={textGhost} fontSize={7} fontFamily="'DM Mono',monospace">{pre}{(max*f).toFixed(0)}{suf}</text>)}
    </svg>
  </>);
}

// ── Gráfico de Área ───────────────────────────────────────────────────────────
function GraficoArea({ dados, labels, cor, altura=130, border="#1E1E1E", pre="", suf="", textDim="#555", textGhost="#888" }) {
  const { tt, show, hide, move } = useTooltip();
  const max = Math.max(...dados, 1);
  const W=500; const pad=32; const plotW=W-pad; const plotH=altura-24;
  const toX = i => pad+(i/Math.max(dados.length-1,1))*plotW;
  const toY = v => plotH-(v/max)*plotH;
  const pts = dados.map((v,i)=>`${toX(i)},${toY(v)}`).join(" ");
  const area = `${toX(0)},${plotH} ${pts} ${toX(dados.length-1)},${plotH}`;
  return (<>
    <Tooltip tt={tt}/>
    <svg viewBox={`0 0 ${W} ${altura}`} style={{ width:"100%", height:altura, display:"block" }} onMouseMove={move} onMouseLeave={hide}>
      <defs>
        <linearGradient id={`det_ag_${cor.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cor} stopOpacity={.35}/><stop offset="100%" stopColor={cor} stopOpacity={.02}/>
        </linearGradient>
      </defs>
      {[.25,.5,.75,1].map(f=><line key={f} x1={pad} x2={W} y1={plotH*(1-f)} y2={plotH*(1-f)} stroke={border} strokeWidth={.5}/>)}
      <polygon points={area} fill={`url(#det_ag_${cor.replace("#","")})`}/>
      <polyline points={pts} fill="none" stroke={cor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/>
      {dados.map((v,i)=><circle key={i} cx={toX(i)} cy={toY(v)} r={5} fill={cor} opacity={.9} style={{cursor:"crosshair"}}
        onMouseEnter={e=>show(e,{valor:`${pre}${Number(v).toFixed(2)}${suf}`,label:labels[i],serie:"valor",cor})}/>)}
      {labels.map((lbl,i)=><text key={i} x={toX(i)} y={altura-4} textAnchor="middle" fill={textDim} fontSize={8} fontFamily="'DM Mono',monospace">{lbl}</text>)}
    </svg>
  </>);
}

// ── Roteador de gráfico ───────────────────────────────────────────────────────
function GraficoUniversal({ tipo, dados, labels, cor, altura=130, border="#1E1E1E", pre="", suf="", textDim="#555", textGhost="#888" }) {
  const props = { dados, labels, cor, altura, border, pre, suf, textDim, textGhost };
  if (!dados || dados.length < 2) return (
    <div style={{ height:altura, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:textGhost }}>Dados insuficientes</span>
    </div>
  );
  switch(tipo) {
    case "line": return <GraficoLinha {...props}/>;
    case "area": return <GraficoArea  {...props}/>;
    default:     return <GraficoBarra {...props}/>;
  }
}

// ── Seletor de tipo ───────────────────────────────────────────────────────────
function SeletorTipo({ tipo, onChange, accent, accentDim, accentBorder, border, bg }) {
  return (
    <div style={{ display:"flex", gap:2, background:bg, border:`1px solid ${border}`, borderRadius:7, padding:2 }}>
      {TIPOS.map(t=>{
        const sel=tipo===t.id;
        return (
          <button key={t.id} onClick={()=>onChange(t.id)} title={t.label}
            style={{ width:26, height:26, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${sel?accentBorder:"transparent"}`, background:sel?accentDim:"transparent", color:sel?accent:"#444", cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e=>{ if(!sel) e.currentTarget.style.color="#777"; }}
            onMouseLeave={e=>{ if(!sel) e.currentTarget.style.color="#444"; }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              {t.icon.split(" M").map((p,i)=><path key={i} d={i===0?p:"M"+p}/>)}
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// ── Seletor de período ────────────────────────────────────────────────────────
function SeletorPeriodo({ periodo, onChange, accent, accentDim, accentBorder, border, bg }) {
  return (
    <div style={{ display:"flex", gap:2, background:bg, border:`1px solid ${border}`, borderRadius:7, padding:2 }}>
      {PERIODOS.map(p=>{
        const sel=periodo===p.id;
        return (
          <button key={p.id} onClick={()=>onChange(p.id)}
            style={{ padding:"3px 9px", borderRadius:5, border:`1px solid ${sel?accentBorder:"transparent"}`, background:sel?accentDim:"transparent", color:sel?accent:"#444", fontFamily:"'DM Mono',monospace", fontSize:10, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" }}
            onMouseEnter={e=>{ if(!sel) e.currentTarget.style.color="#777"; }}
            onMouseLeave={e=>{ if(!sel) e.currentTarget.style.color="#444"; }}
          >{p.label}</button>
        );
      })}
    </div>
  );
}

// ── Card de gráfico com controles ─────────────────────────────────────────────
function GraficoCard({ titulo, sub, dados, labels, cor, tipo, setTipo, periodo, setPeriodo, accent, accentDim, accentBorder, bgBody, border, pre="", suf="", t={} }) {
  return (
    <Card>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:13, color:t.textSecondary||"#C8C4BC" }}>{titulo}</div>
          {sub && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textDim||"#3A3A3A", marginTop:2, letterSpacing:"0.06em" }}>{sub}</div>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <SeletorPeriodo periodo={periodo} onChange={setPeriodo} accent={accent} accentDim={accentDim} accentBorder={accentBorder} border={border} bg={bgBody}/>
          <SeletorTipo tipo={tipo} onChange={setTipo} accent={accent} accentDim={accentDim} accentBorder={accentBorder} border={border} bg={bgBody}/>
        </div>
      </div>
      <GraficoUniversal tipo={tipo} dados={dados} labels={labels} cor={cor} altura={140} border={border} pre={pre} suf={suf} textDim={t.textDim||"#555"} textGhost={t.textGhost||"#888"}/>
    </Card>
  );
}

// ── Seção com título ──────────────────────────────────────────────────────────
function Secao({ titulo, children, accent, t={} }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.14em", color:accent, textTransform:"uppercase", fontWeight:600 }}>{titulo}</span>
        <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${accent}25,transparent)` }}/>
      </div>
      {children}
    </div>
  );
}

function MiniStat({ label, value, sub, cor, bgBody="#080808", border="#1E1E1E", t={} }) {
  return (
    <div style={{ padding:"12px 14px", borderRadius:8, background:bgBody, border:`1px solid ${border}` }}>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textDim||"#3A3A3A", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:22, fontWeight:600, color:cor||(t.textPrimary||"#EDE9DF"), letterSpacing:"-0.03em", lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textDim||"#3A3A3A", marginTop:4 }}>{sub}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function IngredienteDetalhe({ ingrediente, lotes, movimentos, onVoltar, t = {} }) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const border       = t.border       || "#1E1E1E";
  const bgElevated   = t.bgElevated   || "#141414";

  const ing = ingrediente;

  // ── Estado dos gráficos — tipo e período independentes por gráfico ─────────
  const [tipoCusto,    setTipoCusto]    = useState("bar");
  const [tipoQtd,      setTipoQtd]      = useState("bar");
  const [periodoCusto, setPeriodoCusto] = useState("8");
  const [periodoQtd,   setPeriodoQtd]   = useState("8");

  const [aba, setAba] = useState("visao");
  const ABAS = [
    { id:"visao",      label:"Visão Geral" },
    { id:"lotes",      label:"Lotes"       },
    { id:"historico",  label:"Histórico"   },
    { id:"fornecedor", label:"Fornecedor"  },
  ];

  // ── Dados ─────────────────────────────────────────────────────────────────
  const lotesIng = useMemo(() =>
    lotes.filter(l=>l.ingredienteId===ing.id).sort((a,b)=>new Date(a.dataEntrada)-new Date(b.dataEntrada)),
    [lotes, ing.id]
  );

  const movsIng    = useMemo(() => movimentos.filter(m=>m.ingredienteId===ing.id).sort((a,b)=>b.data.localeCompare(a.data)), [movimentos, ing.id]);
  const entradasIng = movsIng.filter(m=>m.tipo==="entrada");
  const saidasIng   = movsIng.filter(m=>m.tipo==="saida"||m.tipo==="descarte");

  const estoqueBase  = calcEstoque(lotes, ing.id);
  const estoqueOp    = calcEstoqueOp(lotes, ing);
  const status       = estoqueBase<=0?"Crítico":estoqueBase<ing.minimo?"Baixo":"Normal";
  const totalEntrado = entradasIng.reduce((s,m)=>s+m.quantidade,0);
  const totalSaido   = saidasIng.reduce((s,m)=>s+m.quantidade,0);
  const custoTotal   = lotesIng.reduce((s,l)=>s+(l.custo||0),0);
  const custoMedio   = lotesIng.length>0 ? custoTotal/lotesIng.length : 0;
  const custoUnitMedio = totalEntrado>0 ? custoTotal/totalEntrado : 0;

  // Variação de preço mês a mês
  const agora=new Date(); const mesAtual=agora.getMonth(); const anoAtual=agora.getFullYear();
  const lotesEsteMes    = lotesIng.filter(l=>{ const d=new Date(l.dataEntrada); return d.getMonth()===mesAtual&&d.getFullYear()===anoAtual; });
  const lotesMesPassado = lotesIng.filter(l=>{ const d=new Date(l.dataEntrada); const m=mesAtual===0?11:mesAtual-1; const a=mesAtual===0?anoAtual-1:anoAtual; return d.getMonth()===m&&d.getFullYear()===a; });
  const custoMedioMesAtual   = lotesEsteMes.length>0    ? lotesEsteMes.reduce((s,l)=>s+(l.custo||0),0)/lotesEsteMes.length       : null;
  const custoMedioMesPassado = lotesMesPassado.length>0 ? lotesMesPassado.reduce((s,l)=>s+(l.custo||0),0)/lotesMesPassado.length : null;
  const variacaoPreco = custoMedioMesAtual!==null&&custoMedioMesPassado!==null&&custoMedioMesPassado>0
    ? ((custoMedioMesAtual-custoMedioMesPassado)/custoMedioMesPassado)*100 : null;

  // Fornecedores
  const fornecedores = useMemo(()=>{
    const map={};
    lotesIng.forEach(l=>{ const f=l.fornecedor||(l.observacao||"").trim()||null; if(!f)return; if(!map[f])map[f]={nome:f,compras:0,totalGasto:0,ultimaCompra:""}; map[f].compras++;map[f].totalGasto+=l.custo||0; if(!map[f].ultimaCompra||l.dataEntrada>map[f].ultimaCompra)map[f].ultimaCompra=l.dataEntrada; });
    return Object.values(map).sort((a,b)=>b.compras-a.compras);
  },[lotesIng]);

  // Dados dos gráficos — filtrados pelo período selecionado
  const lotesParaCusto = lotesIng.slice(-(PERIODOS.find(p=>p.id===periodoCusto)?.n||8));
  const lotesParaQtd   = lotesIng.slice(-(PERIODOS.find(p=>p.id===periodoQtd)?.n||8));
  const dadosCusto    = lotesParaCusto.map(l=>l.custo||0);
  const dadosQtd      = lotesParaQtd.map(l=>l.quantidade);
  const labelsCusto   = lotesParaCusto.map(l=>fmtData(l.dataEntrada).slice(0,5));
  const labelsQtd     = lotesParaQtd.map(l=>fmtData(l.dataEntrada).slice(0,5));

  const graphProps = { accent, accentDim, accentBorder, bgBody, border, t };

  return (
    <div>
      {/* Voltar */}
      <button onClick={onVoltar} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:t.textMuted||"#444", cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:11, marginBottom:16, padding:0, transition:"color 0.15s", letterSpacing:"0.04em" }}
        onMouseEnter={e=>e.currentTarget.style.color=accent}
        onMouseLeave={e=>e.currentTarget.style.color="#444"}
      >
        <Icon d={icons.arrowRight} size={12} style={{ transform:"rotate(180deg)" }}/> Voltar para Ingredientes
      </button>

      {/* Cabeçalho */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
        <div style={{ width:52, height:52, borderRadius:14, background:accentDim, border:`1px solid ${accentBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>
          {ing.emoji}
        </div>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, letterSpacing:"-0.03em", color:t.textPrimary||"#EDE9DF", lineHeight:1.1 }}>{ing.nome}</h2>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:5 }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.textDim||"#3A3A3A", letterSpacing:"0.06em" }}>{ing.categoria.toUpperCase()}</span>
            <span style={{ width:3, height:3, borderRadius:"50%", background:"#2A2A2A" }}/>
            <Badge className={corStatus(status)}>{status}</Badge>
            <span style={{ width:3, height:3, borderRadius:"50%", background:"#2A2A2A" }}/>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.textDim||"#3A3A3A" }}>
              {ing.fatorConversao!==1?`1 un = ${ing.fatorConversao} ${ing.unidade}`:`unidade: ${ing.unidade}`}
            </span>
          </div>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:36, fontWeight:600, color:status==="Normal"?accent:status==="Baixo"?"#F97316":"#EF4444", letterSpacing:"-0.04em", lineHeight:1 }}>
            {estoqueOp%1===0?estoqueOp.toFixed(0):estoqueOp.toFixed(1)}<span style={{ fontSize:16, color:t.textDim||"#3A3A3A", marginLeft:4 }}>un</span>
          </div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.textDim||"#3A3A3A", marginTop:3 }}>
            {estoqueBase.toFixed(2)} {ing.unidade} em estoque
          </div>
        </div>
      </div>

      {/* Abas */}
      <div style={{ display:"flex", gap:4, marginBottom:20, background:bgCard, border:`1px solid ${border}`, borderRadius:10, padding:4 }}>
        {ABAS.map(a=>(
          <button key={a.id} onClick={()=>setAba(a.id)} style={{ flex:1, padding:"7px 0", borderRadius:7, background:aba===a.id?accentDim:"transparent", border:`1px solid ${aba===a.id?accentBorder:"transparent"}`, color:aba===a.id?accent:(t.textMuted||"#444"), fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:aba===a.id?600:400, cursor:"pointer", transition:"all 0.15s" }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* ── VISÃO GERAL ───────────────────────────────────────────────────── */}
      {aba==="visao" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
            <MiniStat label="Estoque (un)" value={estoqueOp%1===0?estoqueOp.toFixed(0):estoqueOp.toFixed(1)} sub={`mín: ${(ing.minimo/(ing.fatorConversao||1)).toFixed(0)} un`} cor={status==="Normal"?accent:status==="Baixo"?"#F97316":"#EF4444"} bgBody={bgBody} border={border} t={t}/>
            <MiniStat label="Total entrado" value={`${totalEntrado.toFixed(1)} ${ing.unidade}`} sub={`${entradasIng.length} lotes`} cor="#4ADE80" bgBody={bgBody} border={border} t={t}/>
            <MiniStat label="Total consumido" value={`${totalSaido.toFixed(1)} ${ing.unidade}`} sub={`${saidasIng.length} movimentações`} cor="#F87171" bgBody={bgBody} border={border} t={t}/>
            <MiniStat label="Custo médio/lote" value={`R$${custoMedio.toFixed(2)}`} sub={`R$${custoUnitMedio.toFixed(2)} por ${ing.unidade}`} cor={accent} bgBody={bgBody} border={border} t={t}/>
          </div>

          {/* Variação de preço */}
          {variacaoPreco!==null && (
            <div style={{ padding:"12px 16px", borderRadius:10, marginBottom:20, background:variacaoPreco>0?"#EF444410":"#4ADE8010", border:`1px solid ${variacaoPreco>0?"#EF444430":"#4ADE8030"}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <Icon d={variacaoPreco>0?icons.trendingDown:icons.trending} size={16} style={{ color:variacaoPreco>0?"#EF4444":"#4ADE80" }}/>
                <div>
                  <span style={{ fontSize:13, fontWeight:600, color:variacaoPreco>0?"#EF4444":"#4ADE80" }}>
                    {variacaoPreco>0?"+":""}{variacaoPreco.toFixed(1)}% em relação ao mês passado
                  </span>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t.textMuted||"#555", marginLeft:10 }}>
                    Mês atual: R${custoMedioMesAtual?.toFixed(2)} · Mês passado: R${custoMedioMesPassado?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Gráficos com controles */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
            <GraficoCard
              titulo="Custo por lote" sub={`R$ POR LOTE · ${lotesParaCusto.length} ENTRADAS`}
              dados={dadosCusto} labels={labelsCusto} cor={accent}
              tipo={tipoCusto} setTipo={setTipoCusto}
              periodo={periodoCusto} setPeriodo={setPeriodoCusto}
              pre="R$" {...graphProps}
            />
            <GraficoCard
              titulo="Quantidade por lote" sub={`${ing.unidade.toUpperCase()} POR LOTE · ${lotesParaQtd.length} ENTRADAS`}
              dados={dadosQtd} labels={labelsQtd} cor="#4ADE80"
              tipo={tipoQtd} setTipo={setTipoQtd}
              periodo={periodoQtd} setPeriodo={setPeriodoQtd}
              suf={` ${ing.unidade}`} {...graphProps}
            />
          </div>

          {/* Lotes ativos */}
          <Secao titulo="Lotes Ativos" accent={accent}>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {lotesIng.filter(l=>l.quantidadeRestante>0).length===0
                ? <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:textGhost, padding:"12px 0" }}>Nenhum lote ativo</p>
                : [...lotesIng].filter(l=>l.quantidadeRestante>0).sort((a,b)=>new Date(a.dataValidade)-new Date(b.dataValidade)).map(l=>{
                  const dias=diasAte(l.dataValidade); const pct=l.quantidade>0?(l.quantidadeRestante/l.quantidade)*100:0;
                  const cor=dias<0?"#EF4444":dias<=3?"#F97316":"#4ADE80";
                  return (
                    <div key={l.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:8, background:bgBody, border:`1px solid ${border}` }}>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:700, color:t.textMuted||"#555", width:48, flexShrink:0 }}>L{String(l.numero).padStart(2,"0")}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11.5, color:t.textSecondary||"#C8C4BC" }}>{l.quantidadeRestante} / {l.quantidade} {ing.unidade}</span>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:cor }}>{dias<0?`vencido há ${Math.abs(dias)}d`:`vence em ${dias}d`}</span>
                        </div>
                        <div style={{ height:4, background:bgElevated, borderRadius:2, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${pct}%`, background:cor, borderRadius:2, boxShadow:`0 0 6px ${cor}50` }}/>
                        </div>
                      </div>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:accent, fontWeight:600, flexShrink:0 }}>
                        R${l.custo?.toFixed(2)||"—"}
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </Secao>
        </div>
      )}

      {/* ── LOTES ─────────────────────────────────────────────────────────── */}
      {aba==="lotes" && (
        <div style={{ background:bgCard, border:`1px solid ${border}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"60px 1fr 1fr 1fr 1fr 1fr 1fr", padding:"10px 16px", background:bgBody, borderBottom:`1px solid ${border}` }}>
            {["Lote","Entrada","Validade","Dias","Qtd inicial","Restante","Custo"].map(h=>(
              <span key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textDim||"#2A2A2A", letterSpacing:"0.1em" }}>{h}</span>
            ))}
          </div>
          {[...lotesIng].sort((a,b)=>new Date(b.dataEntrada)-new Date(a.dataEntrada)).map((l,idx)=>{
            const dias=diasAte(l.dataValidade); const pct=l.quantidade>0?(l.quantidadeRestante/l.quantidade)*100:0;
            const cor=dias<0?"#EF4444":dias<=3?"#F97316":"#4ADE80";
            return (
              <div key={l.id} style={{ display:"grid", gridTemplateColumns:"60px 1fr 1fr 1fr 1fr 1fr 1fr", padding:"11px 16px", alignItems:"center", borderBottom:idx<lotesIng.length-1?`1px solid ${border}`:"none" }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:700, color:t.textMuted||"#555" }}>L{String(l.numero).padStart(2,"0")}</span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textMuted||"#555" }}>{fmtData(l.dataEntrada)}</span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textSecondary||"#C8C4BC" }}>{fmtData(l.dataValidade)}</span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:cor }}>{dias<0?`${Math.abs(dias)}d atrás`:`${dias}d`}</span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textMuted||"#555" }}>{l.quantidade} {ing.unidade}</span>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:40, height:2, background:bgElevated, borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:cor, borderRadius:2 }}/>
                  </div>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textSecondary||"#C8C4BC" }}>{l.quantidadeRestante}</span>
                </div>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:accent }}>R${l.custo?.toFixed(2)||"—"}</span>
              </div>
            );
          })}
          {lotesIng.length===0&&<div style={{ padding:"24px 0", textAlign:"center" }}><p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:textGhost }}>Nenhum lote</p></div>}
        </div>
      )}

      {/* ── HISTÓRICO ─────────────────────────────────────────────────────── */}
      {aba==="historico" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            <MiniStat label="Total entradas" value={`${entradasIng.length}`} sub={`${totalEntrado.toFixed(1)} ${ing.unidade} recebidos`} cor="#4ADE80" bgBody={bgBody} border={border} t={t}/>
            <MiniStat label="Total saídas" value={`${saidasIng.length}`} sub={`${totalSaido.toFixed(1)} ${ing.unidade} consumidos`} cor="#F87171" bgBody={bgBody} border={border} t={t}/>
          </div>
          <div style={{ background:bgCard, border:`1px solid ${border}`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"0.8fr 1fr 0.7fr 1fr 1fr", padding:"10px 16px", background:bgBody, borderBottom:`1px solid ${border}` }}>
              {["TIPO","DATA","QTD","USUÁRIO","MOTIVO"].map(h=><span key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textDim||"#2A2A2A", letterSpacing:"0.1em" }}>{h}</span>)}
            </div>
            {movsIng.slice(0,30).map((m,idx)=>{
              const cor=m.tipo==="entrada"?"#4ADE80":m.tipo==="descarte"?"#FBBF24":"#F87171";
              return (
                <div key={m.id} style={{ display:"grid", gridTemplateColumns:"0.8fr 1fr 0.7fr 1fr 1fr", padding:"10px 16px", alignItems:"center", borderBottom:idx<Math.min(movsIng.length,30)-1?`1px solid ${border}`:"none" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", fontFamily:"'DM Mono',monospace", fontSize:10, padding:"2px 8px", borderRadius:4, background:cor+"15", color:cor, border:`1px solid ${cor}30` }}>{m.tipo}</span>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textMuted||"#555" }}>{m.data.slice(0,16)}</span>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:m.tipo==="entrada"?"#4ADE80":"#F87171", fontWeight:600 }}>{m.tipo==="entrada"?"+":"-"}{m.quantidade} {ing.unidade}</span>
                  <span style={{ fontSize:12, color:t.textMuted||"#555" }}>{m.usuario}</span>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.textDim||"#3A3A3A", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.motivo||"—"}</span>
                </div>
              );
            })}
            {movsIng.length===0&&<div style={{ padding:"24px 0", textAlign:"center" }}><p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:textGhost }}>Nenhuma movimentação</p></div>}
          </div>
        </div>
      )}

      {/* ── FORNECEDOR ────────────────────────────────────────────────────── */}
      {aba==="fornecedor" && (
        <div>
          {fornecedores.length===0 ? (
            <div style={{ padding:"40px 0", textAlign:"center", background:bgCard, borderRadius:10, border:`1px solid ${border}` }}>
              <div style={{ fontSize:28, marginBottom:8 }}>🏭</div>
              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:textGhost }}>Nenhum fornecedor registrado ainda.</p>
              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#1E1E1E", marginTop:6 }}>Adicione o fornecedor ao registrar uma entrada.</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
              {fornecedores.map((f,i)=>(
                <div key={f.nome} style={{ padding:"16px 18px", borderRadius:10, background:bgCard, border:`1px solid ${i===0?accentBorder:border}` }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:9, background:i===0?accentDim:"#141414", border:`1px solid ${i===0?accentBorder:border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🏭</div>
                      <div>
                        <div style={{ fontSize:13.5, fontWeight:600, color:t.textPrimary||"#EDE9DF" }}>{f.nome}</div>
                        {i===0&&<div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:accent, marginTop:2, letterSpacing:"0.06em" }}>FORNECEDOR PRINCIPAL</div>}
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:16, fontWeight:600, color:accent }}>R${f.totalGasto.toFixed(2)}</div>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.textDim||"#3A3A3A", marginTop:2 }}>total gasto</div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    {[["COMPRAS",f.compras],["MÉDIA/COMPRA",`R$${(f.totalGasto/f.compras).toFixed(2)}`],["ÚLTIMA COMPRA",fmtData(f.ultimaCompra)]].map(([k,v])=>(
                      <div key={k} style={{ padding:"8px 10px", borderRadius:7, background:bgBody, border:`1px solid ${border}` }}>
                        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:t.textDim||"#2A2A2A", letterSpacing:"0.08em" }}>{k}</div>
                        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:15, color:t.textSecondary||"#C8C4BC", fontWeight:600, marginTop:3 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Secao titulo="Histórico de Compras" accent={accent}>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {entradasIng.map(m=>{
                const lote=lotes.find(l=>l.id===m.loteId);
                return (
                  <div key={m.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:8, background:bgBody, border:`1px solid ${border}` }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12.5, color:t.textSecondary||"#C8C4BC", fontWeight:500 }}>{lote?.fornecedor||lote?.observacao||"Não informado"}</div>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.textDim||"#3A3A3A", marginTop:2 }}>
                        {m.data.slice(0,10).split("-").reverse().join("/")} · L{String(lote?.numero||0).padStart(2,"0")} · {m.quantidade} {ing.unidade}
                      </div>
                    </div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:accent, fontWeight:600, flexShrink:0 }}>R${lote?.custo?.toFixed(2)||"—"}</div>
                  </div>
                );
              })}
              {entradasIng.length===0&&<p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:textGhost, padding:"12px 0" }}>Nenhuma entrada registrada</p>}
            </div>
          </Secao>
        </div>
      )}
    </div>
  );
}