// src/pages/Financeiro.jsx
// v3.0 — tooltips interativos + seletor de tipo por gráfico + período independente.

import { useState, useMemo, useCallback } from "react";
import Icon, { icons } from "../components/Icon";
import { Card, StatCard, Modal, Input, Select } from "../components/UI";
import { hoje, addDias, fmtData } from "../utils/helpers";

// ── Constantes ────────────────────────────────────────────────────────────────
const SERIE_CORES = ["#4ADE80","#F87171","#60A5FA","#A78BFA","#FBBF24","#C9A84C"];

const TIPOS_GRAFICO = [
  { id:"bar",    icon: "M18 20V10 M12 20V4 M6 20v-6" },
  { id:"line",   icon: "M22 12h-4l-3 9L9 3l-3 9H2"  },
  { id:"area",   icon: "M23 6l-9.5 9.5-5-5L1 18"     },
  { id:"pie",    icon: "M21.21 15.89A10 10 0 118 2.83 M22 12A10 10 0 0012 2v10z" },
  { id:"radial", icon: "M17 1l4 4-4 4 M3 11V9a4 4 0 014-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 01-4 4H3" },
];

const PERIODOS = [
  { id:"7d",  label:"7 dias",   dias:7    },
  { id:"30d", label:"30 dias",  dias:30   },
  { id:"mes", label:"Este mês", dias:null },
];

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ tooltip }) {
  if (!tooltip.visible) return null;
  return (
    <div style={{
      position:"fixed", left:tooltip.x+14, top:tooltip.y-10,
      zIndex:9999, pointerEvents:"none",
      background:"#0A0A0A", border:`1px solid ${tooltip.cor||"#C9A84C"}40`,
      borderRadius:8, padding:"8px 12px",
      boxShadow:`0 8px 24px #00000080, 0 0 0 1px ${tooltip.cor||"#C9A84C"}15`,
      minWidth:130, maxWidth:220,
      animation:"barto-fade-in 0.1s ease",
    }}>
      {tooltip.serie && (
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:tooltip.cor, flexShrink:0 }}/>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#888", letterSpacing:"0.06em", textTransform:"uppercase" }}>
            {tooltip.serie}
          </span>
        </div>
      )}
      {tooltip.label && (
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#888", marginBottom:4 }}>
          {tooltip.label}
        </div>
      )}
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:17, fontWeight:600, color:tooltip.cor||"#EDE9DF", letterSpacing:"-0.02em" }}>
        {tooltip.valor}
      </div>
      {tooltip.sub && (
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#888", marginTop:3 }}>
          {tooltip.sub}
        </div>
      )}
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

function fmtV(v, pre="", suf="") {
  const n = Number(v);
  return isNaN(n) ? "—" : pre + (n%1===0 ? n.toFixed(0) : n.toFixed(1)) + suf;
}

// ── Gráficos com tooltips ─────────────────────────────────────────────────────
function GraficoBarra({ series, labels, altura, border, pre="", suf="", textDim="#555", textGhost="#888" }) {
  const { tt, show, hide, move } = useTooltip();
  const max = Math.max(...series.flatMap(s=>s.dados), 1);
  const n=labels.length; const W=500; const pad=32; const plotW=W-pad; const plotH=altura-24;
  const gW=plotW/n; const bW=Math.max(6,(gW/series.length)-4);
  return (<>
    <Tooltip tooltip={tt}/>
    <svg viewBox={`0 0 ${W} ${altura}`} style={{ width:"100%",height:altura,display:"block" }} onMouseMove={move} onMouseLeave={hide}>
      {[.25,.5,.75,1].map(f=><line key={f} x1={pad} x2={W} y1={plotH*(1-f)} y2={plotH*(1-f)} stroke={border} strokeWidth={.5}/>)}
      {labels.map((lbl,i)=>(
        <g key={i}>
          {series.map((s,si)=>{
            const v=s.dados[i]||0; const h=Math.max(2,(v/max)*plotH);
            const x=pad+i*gW+si*(bW+3)+4; const cor=s.cor||SERIE_CORES[si%SERIE_CORES.length];
            return <rect key={si} x={x} y={plotH-h} width={bW} height={h} fill={cor} opacity={.82} rx={3} style={{cursor:"crosshair"}}
              onMouseEnter={e=>show(e,{valor:fmtV(v,pre,suf),label:lbl,serie:s.nome,cor})}/>;
          })}
          <text x={pad+i*gW+gW/2} y={altura-4} textAnchor="middle" fill={textDim} fontSize={8} fontFamily="'DM Mono',monospace">{lbl}</text>
        </g>
      ))}
      {[0,.5,1].map(f=><text key={f} x={pad-4} y={plotH*(1-f)+4} textAnchor="end" fill={textGhost} fontSize={7} fontFamily="'DM Mono',monospace">{fmtV(max*f,pre,suf)}</text>)}
    </svg>
  </>);
}

function GraficoLinha({ series, labels, altura, border, pre="", suf="", textDim="#555", textGhost="#888" }) {
  const { tt, show, hide, move } = useTooltip();
  const max = Math.max(...series.flatMap(s=>s.dados), 1);
  const n=labels.length; const W=500; const pad=32; const plotW=W-pad; const plotH=altura-24;
  const toX=i=>pad+(i/Math.max(n-1,1))*plotW; const toY=v=>plotH-(v/max)*plotH;
  return (<>
    <Tooltip tooltip={tt}/>
    <svg viewBox={`0 0 ${W} ${altura}`} style={{ width:"100%",height:altura,display:"block" }} onMouseMove={move} onMouseLeave={hide}>
      {[.25,.5,.75,1].map(f=><line key={f} x1={pad} x2={W} y1={plotH*(1-f)} y2={plotH*(1-f)} stroke={border} strokeWidth={.5}/>)}
      {series.map((s,si)=>{
        const cor=s.cor||SERIE_CORES[si%SERIE_CORES.length];
        const pts=s.dados.map((v,i)=>`${toX(i)},${toY(v)}`).join(" ");
        return (<g key={si}>
          <polyline points={pts} fill="none" stroke={cor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" opacity={.9}/>
          {s.dados.map((v,i)=><circle key={i} cx={toX(i)} cy={toY(v)} r={5} fill={cor} style={{cursor:"crosshair"}}
            onMouseEnter={e=>show(e,{valor:fmtV(v,pre,suf),label:labels[i],serie:s.nome,cor})}/>)}
        </g>);
      })}
      {labels.map((lbl,i)=><text key={i} x={toX(i)} y={altura-4} textAnchor="middle" fill={textDim} fontSize={8} fontFamily="'DM Mono',monospace">{lbl}</text>)}
      {[0,.5,1].map(f=><text key={f} x={pad-4} y={plotH*(1-f)+4} textAnchor="end" fill={textGhost} fontSize={7} fontFamily="'DM Mono',monospace">{fmtV(max*f,pre,suf)}</text>)}
    </svg>
  </>);
}

function GraficoArea({ series, labels, altura, border, pre="", suf="", textDim="#555", textGhost="#888" }) {
  const { tt, show, hide, move } = useTooltip();
  const max = Math.max(...series.flatMap(s=>s.dados), 1);
  const n=labels.length; const W=500; const pad=32; const plotW=W-pad; const plotH=altura-24;
  const toX=i=>pad+(i/Math.max(n-1,1))*plotW; const toY=v=>plotH-(v/max)*plotH;
  return (<>
    <Tooltip tooltip={tt}/>
    <svg viewBox={`0 0 ${W} ${altura}`} style={{ width:"100%",height:altura,display:"block" }} onMouseMove={move} onMouseLeave={hide}>
      <defs>{series.map((s,si)=>{ const cor=s.cor||SERIE_CORES[si%SERIE_CORES.length]; return (
        <linearGradient key={si} id={`fin_ag${si}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cor} stopOpacity={.35}/><stop offset="100%" stopColor={cor} stopOpacity={.02}/>
        </linearGradient>);})}</defs>
      {[.25,.5,.75,1].map(f=><line key={f} x1={pad} x2={W} y1={plotH*(1-f)} y2={plotH*(1-f)} stroke={border} strokeWidth={.5}/>)}
      {series.map((s,si)=>{
        const cor=s.cor||SERIE_CORES[si%SERIE_CORES.length];
        const area=`${toX(0)},${plotH} `+s.dados.map((v,i)=>`${toX(i)},${toY(v)}`).join(" ")+` ${toX(n-1)},${plotH}`;
        const line=s.dados.map((v,i)=>`${toX(i)},${toY(v)}`).join(" ");
        return (<g key={si}>
          <polygon points={area} fill={`url(#fin_ag${si})`}/>
          <polyline points={line} fill="none" stroke={cor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/>
          {s.dados.map((v,i)=><circle key={i} cx={toX(i)} cy={toY(v)} r={5} fill={cor} opacity={.9} style={{cursor:"crosshair"}}
            onMouseEnter={e=>show(e,{valor:fmtV(v,pre,suf),label:labels[i],serie:s.nome,cor})}/>)}
        </g>);
      })}
      {labels.map((lbl,i)=><text key={i} x={toX(i)} y={altura-4} textAnchor="middle" fill={textDim} fontSize={8} fontFamily="'DM Mono',monospace">{lbl}</text>)}
    </svg>
  </>);
}

function GraficoPizza({ series, labels, altura, pre="", suf="" }) {
  const { tt, show, hide, move } = useTooltip();
  const dados=series.map((s,i)=>({label:s.nome,valor:s.dados.reduce((a,b)=>a+b,0),cor:s.cor||SERIE_CORES[i%SERIE_CORES.length]})).filter(d=>d.valor>0);
  const total=dados.reduce((s,d)=>s+d.valor,0)||1;
  const cx=110; const cy=altura/2; const r=Math.min(cy-10,68);
  let ang=-Math.PI/2;
  const fatias=dados.map(d=>{ const a=(d.valor/total)*2*Math.PI; const x1=cx+r*Math.cos(ang); const y1=cy+r*Math.sin(ang); ang+=a; const x2=cx+r*Math.cos(ang); const y2=cy+r*Math.sin(ang); return {...d,path:`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${a>Math.PI?1:0},1 ${x2},${y2} Z`,pct:(d.valor/total*100).toFixed(1)}; });
  return (<>
    <Tooltip tooltip={tt}/>
    <svg viewBox={`0 0 500 ${altura}`} style={{ width:"100%",height:altura,display:"block" }} onMouseMove={move} onMouseLeave={hide}>
      {fatias.map((f,i)=><path key={i} d={f.path} fill={f.cor} opacity={.85} stroke="#080808" strokeWidth={1.5} style={{cursor:"crosshair",transition:"opacity 0.15s"}}
        onMouseEnter={e=>{ show(e,{valor:fmtV(f.valor,pre,suf),label:f.label,serie:f.label,cor:f.cor,sub:`${f.pct}% do total`}); e.currentTarget.setAttribute("opacity","1"); }}
        onMouseOut={e=>e.currentTarget.setAttribute("opacity","0.85")}/>)}
      {dados.map((d,i)=>(<g key={i}>
        <rect x={240} y={12+i*22} width={10} height={10} fill={d.cor} rx={2}/>
        <text x={256} y={22+i*22} fill="#888" fontSize={11} fontFamily="'DM Sans',sans-serif">{d.label}</text>
        <text x={495} y={22+i*22} fill={d.cor} fontSize={11} fontFamily="'DM Mono',monospace" textAnchor="end" fontWeight="600">{((d.valor/total)*100).toFixed(1)}%</text>
      </g>))}
    </svg>
  </>);
}

function GraficoRadial({ series, labels, altura, pre="", suf="" }) {
  const { tt, show, hide, move } = useTooltip();
  const dados=series.map((s,i)=>({label:s.nome,valor:s.dados.reduce((a,b)=>a+b,0),cor:s.cor||SERIE_CORES[i%SERIE_CORES.length]})).filter(d=>d.valor>0);
  const total=dados.reduce((s,d)=>s+d.valor,0)||1;
  const cx=110; const cy=altura/2; const rMin=20; const rMax=Math.min(cy-10,70);
  return (<>
    <Tooltip tooltip={tt}/>
    <svg viewBox={`0 0 500 ${altura}`} style={{ width:"100%",height:altura,display:"block" }} onMouseMove={move} onMouseLeave={hide}>
      {dados.map((d,i)=>{
        const pct=d.valor/total; const rA=rMin+(rMax-rMin)*((i+1)/dados.length);
        const th=Math.max(6,(rMax-rMin)/dados.length-3);
        const sA=-Math.PI/2; const eA=sA+pct*2*Math.PI;
        const x1=cx+rA*Math.cos(sA); const y1=cy+rA*Math.sin(sA);
        const x2=cx+rA*Math.cos(eA); const y2=cy+rA*Math.sin(eA);
        const lg=pct*2*Math.PI>Math.PI?1:0;
        return (<g key={i}>
          <circle cx={cx} cy={cy} r={rA} fill="none" stroke={d.cor+"20"} strokeWidth={th}/>
          <path d={`M${x1},${y1} A${rA},${rA} 0 ${lg},1 ${x2},${y2}`} fill="none" stroke={d.cor} strokeWidth={th} strokeLinecap="round" opacity={.9} style={{cursor:"crosshair"}}
            onMouseEnter={e=>show(e,{valor:fmtV(d.valor,pre,suf),label:d.label,serie:d.label,cor:d.cor,sub:`${(pct*100).toFixed(1)}% do total`})}/>
        </g>);
      })}
      {dados.map((d,i)=>(<g key={i}>
        <rect x={240} y={12+i*22} width={10} height={10} fill={d.cor} rx={2}/>
        <text x={256} y={22+i*22} fill="#888" fontSize={11} fontFamily="'DM Sans',sans-serif">{d.label}</text>
        <text x={495} y={22+i*22} fill={d.cor} fontSize={11} fontFamily="'DM Mono',monospace" textAnchor="end" fontWeight="600">{((d.valor/total)*100).toFixed(1)}%</text>
      </g>))}
    </svg>
  </>);
}

function GraficoUniversal({ tipo, series, labels, altura=150, border, pre="", suf="", textDim="#555", textGhost="#888" }) {
  const p = { series, labels, altura, border, pre, suf, textDim, textGhost };
  switch(tipo) {
    case "line":   return <GraficoLinha  {...p}/>;
    case "area":   return <GraficoArea   {...p}/>;
    case "pie":    return <GraficoPizza  {...p}/>;
    case "radial": return <GraficoRadial {...p}/>;
    default:       return <GraficoBarra  {...p}/>;
  }
}

// ── Seletor de tipo de gráfico ────────────────────────────────────────────────
function SeletorTipo({ tipo, onChange, accent, accentDim, accentBorder, border, bg }) {
  return (
    <div style={{ display:"flex", gap:2, background:bg, border:`1px solid ${border}`, borderRadius:8, padding:3 }}>
      {TIPOS_GRAFICO.map(t=>{
        const sel=tipo===t.id;
        return (
          <button key={t.id} onClick={()=>onChange(t.id)} title={t.id}
            style={{ width:28,height:28,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${sel?accentBorder:"transparent"}`,background:sel?accentDim:"transparent",color:sel?accent:"#444",cursor:"pointer",transition:"all 0.15s" }}
            onMouseEnter={e=>{ if(!sel) e.currentTarget.style.color="#777"; }}
            onMouseLeave={e=>{ if(!sel) e.currentTarget.style.color="#444"; }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              {t.icon.split(" M").map((p,i)=><path key={i} d={i===0?p:"M"+p}/>)}
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// ── Card de gráfico com header completo ───────────────────────────────────────
function GraficoCard({ titulo, sub, tipo, onTipo, series, labels, pre="", suf="", altura=150, border, bgCard, bgBody, accent, accentDim, accentBorder, legenda=true, t={} }) {
  return (
    <Card>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:13.5,color:t.textSecondary||"#C8C4BC" }}>{titulo}</div>
          {sub && <div style={{ fontFamily:"'DM Mono',monospace",fontSize:9.5,color:t.textDim||"#3A3A3A",marginTop:3,letterSpacing:"0.08em" }}>{sub}</div>}
        </div>
        <SeletorTipo tipo={tipo} onChange={onTipo} accent={accent} accentDim={accentDim} accentBorder={accentBorder} border={border} bg={bgBody}/>
      </div>
      <GraficoUniversal tipo={tipo} series={series} labels={labels} altura={altura} border={border} pre={pre} suf={suf} textDim={t.textDim||"#555"} textGhost={t.textGhost||"#888"}/>
      {legenda && series.length > 1 && (
        <div style={{ display:"flex",gap:12,marginTop:10,flexWrap:"wrap" }}>
          {series.map(s=>(
            <div key={s.nome} style={{ display:"flex",alignItems:"center",gap:5 }}>
              <div style={{ width:7,height:7,borderRadius:2,background:s.cor,flexShrink:0 }}/>
              <span style={{ fontFamily:"'DM Mono',monospace",fontSize:9.5,color:t.textMuted||"#555" }}>{s.nome}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── filtrar por período ───────────────────────────────────────────────────────
function filtrarPorPeriodo(lista, periodo) {
  const agora = new Date();
  return lista.filter(item => {
    const data = new Date(item.data);
    if (periodo.id === "mes") return data.getMonth()===agora.getMonth() && data.getFullYear()===agora.getFullYear();
    const diff = (agora - data) / 86400000;
    return diff <= periodo.dias;
  });
}

const FORM_ENTRADA = { descricao:"", valor:"", data:hoje(), produtoId:"" };
const FORM_SAIDA   = { descricao:"", valor:"", data:hoje(), tipo:"compra" };

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function Financeiro({ financeiro, setFinanceiro, produtos, prefs, t={} }) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const accentGrad   = t.accentGrad   || "linear-gradient(135deg,#C9A84C,#9A7A2E)";
  const accentText   = t.accentText   || "#080808";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const border       = t.border       || "#1E1E1E";
  const bgElevated   = t.bgElevated   || "#141414";
  const borderMid    = t.borderMid    || "#252525";

  // Tipo global inicial vem das prefs; cada gráfico pode sobrescrever
  const tipoGlobal = prefs?.tipoGrafico || "bar";
  const [tipos, setTipos] = useState({
    entVsSaid: tipoGlobal,
    custos:    tipoGlobal,
  });
  const setTipo = (chave, val) => setTipos(prev => ({ ...prev, [chave]: val }));

  const [periodo,     setPeriodo]     = useState(PERIODOS[0]);
  const [modalTipo,   setModalTipo]   = useState(null);
  const [formEntrada, setFormEntrada] = useState(FORM_ENTRADA);
  const [formSaida,   setFormSaida]   = useState(FORM_SAIDA);

  const { entradas=[], saidas=[] } = financeiro || {};
  const entFilt = useMemo(()=>filtrarPorPeriodo(entradas,periodo),[entradas,periodo]);
  const saidFilt = useMemo(()=>filtrarPorPeriodo(saidas,periodo),[saidas,periodo]);

  const totalEntradas    = entFilt.reduce((s,e)=>s+e.valor,0);
  const totalSaidas      = saidFilt.reduce((s,e)=>s+e.valor,0);
  const lucroEstimado    = totalEntradas - totalSaidas;
  const totalDesperdicio = saidFilt.filter(s=>s.tipo==="desperdicio").reduce((s,e)=>s+e.valor,0);
  const custoOperacional = saidFilt.filter(s=>s.tipo==="operacional").reduce((s,e)=>s+e.valor,0);
  const custoMateria     = saidFilt.filter(s=>s.tipo==="compra").reduce((s,e)=>s+e.valor,0);
  const margemLucro      = totalEntradas>0?(lucroEstimado/totalEntradas)*100:0;

  const diasGrafico = Math.min(periodo.dias||30,7);
  const datasGraf   = Array.from({length:diasGrafico},(_,i)=>addDias(-(diasGrafico-1-i)));
  const labelsGraf  = datasGraf.map((d,i)=>i===diasGrafico-1?"hoje":fmtData(d).slice(0,5));
  const dadosEntDia  = datasGraf.map(d=>entFilt.filter(e=>e.data===d).reduce((s,e)=>s+e.valor,0));
  const dadosSaidDia = datasGraf.map(d=>saidFilt.filter(e=>e.data===d).reduce((s,e)=>s+e.valor,0));

  const produtoStats = useMemo(()=>{
    const stats={};
    entFilt.forEach(e=>(e.produtoIds||[]).forEach(pid=>{
      if(!stats[pid]) stats[pid]={vendas:0,receita:0};
      stats[pid].vendas++;
      stats[pid].receita+=(produtos.find(p=>p.id===pid)?.preco||0);
    }));
    return Object.entries(stats).map(([pid,s])=>({...s,produto:produtos.find(p=>p.id===pid)})).filter(s=>s.produto).sort((a,b)=>b.receita-a.receita);
  },[entFilt,produtos]);

  const todosLancamentos = [
    ...entFilt.map(e=>({...e,_tipo:"entrada"})),
    ...saidFilt.map(s=>({...s,_tipo:"saida"})),
  ].sort((a,b)=>b.data.localeCompare(a.data)).slice(0,10);

  const adicionarEntrada = () => {
    if(!formEntrada.valor||!formEntrada.descricao) return;
    setFinanceiro(prev=>({...prev,entradas:[{id:"EFN"+Date.now(),tipo:"venda",valor:Number(formEntrada.valor),data:formEntrada.data,descricao:formEntrada.descricao,produtoIds:formEntrada.produtoId?[formEntrada.produtoId]:[]}, ...prev.entradas]}));
    setModalTipo(null); setFormEntrada(FORM_ENTRADA);
  };

  const adicionarSaida = () => {
    if(!formSaida.valor||!formSaida.descricao) return;
    setFinanceiro(prev=>({...prev,saidas:[{id:"SFN"+Date.now(),tipo:formSaida.tipo,valor:Number(formSaida.valor),data:formSaida.data,descricao:formSaida.descricao,categoria:formSaida.tipo}, ...prev.saidas]}));
    setModalTipo(null); setFormSaida(FORM_SAIDA);
  };

  const cardProps = { border, bgCard, bgBody, accent, accentDim, accentBorder, t };

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,letterSpacing:"-0.03em",color:t.textPrimary||"#EDE9DF",lineHeight:1.1 }}>Financeiro</h2>
          <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10.5,color:t.textDim||"#3A3A3A",marginTop:5,letterSpacing:"0.08em" }}>FATURAMENTO · CUSTOS · LUCRO ESTIMADO</p>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          {/* Período */}
          <div style={{ display:"flex",gap:2,background:bgCard,border:`1px solid ${border}`,borderRadius:8,padding:3 }}>
            {PERIODOS.map(p=>(
              <button key={p.id} onClick={()=>setPeriodo(p)} style={{ padding:"5px 12px",borderRadius:6,background:periodo.id===p.id?accentDim:"transparent",border:`1px solid ${periodo.id===p.id?accentBorder:"transparent"}`,color:periodo.id===p.id?accent:"#444",fontFamily:"'DM Mono',monospace",fontSize:11,cursor:"pointer",transition:"all 0.15s" }}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={()=>setModalTipo("saida")} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:8,background:bgElevated,border:`1px solid ${borderMid}`,color:t.textMuted||"#666",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.color="#C8C4BC";e.currentTarget.style.borderColor="#333";}}
            onMouseLeave={e=>{e.currentTarget.style.color="#666";e.currentTarget.style.borderColor=borderMid;}}
          ><Icon d={icons.arrowDown} size={14}/> Saída</button>
          <button onClick={()=>setModalTipo("entrada")} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:8,background:accentGrad,color:accentText,border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:`0 2px 12px ${accentDim}`,transition:"filter 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
            onMouseLeave={e=>e.currentTarget.style.filter="none"}
          ><Icon d={icons.arrowUp} size={14}/> Entrada</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
        {[
          { label:"Faturamento",   value:`R$${totalEntradas.toFixed(0)}`,   sub:`${entFilt.length} transações`,   icon:icons.trending,     iconColor:"#4ADE80", accent:"green" },
          { label:"Saídas Totais", value:`R$${totalSaidas.toFixed(0)}`,     sub:`${saidFilt.length} lançamentos`, icon:icons.trendingDown, iconColor:"#F87171", accent:"red"   },
          { label:"Lucro Est.",    value:`R$${lucroEstimado.toFixed(0)}`,   sub:`Margem: ${margemLucro.toFixed(1)}%`, icon:icons.dollarSign, iconColor:lucroEstimado>=0?accent:"#EF4444", accent:lucroEstimado>=0?"gold":"red" },
          { label:"Desperdício",   value:`R$${totalDesperdicio.toFixed(0)}`,sub:"perdas + descarte", icon:icons.alertas, iconColor:totalDesperdicio>0?"#FBBF24":"#333", accent:totalDesperdicio>50?"gold":null },
        ].map(kpi=><StatCard key={kpi.label} {...kpi}/>)}
      </div>

      {/* Gráficos — linha 1 */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
        <GraficoCard {...cardProps}
          titulo="Entradas vs Saídas"
          sub={`ÚLTIMOS ${diasGrafico} DIAS`}
          tipo={tipos.entVsSaid} onTipo={v=>setTipo("entVsSaid",v)}
          series={[{nome:"Entradas",dados:dadosEntDia,cor:"#4ADE80"},{nome:"Saídas",dados:dadosSaidDia,cor:"#F87171"}]}
          labels={labelsGraf} pre="R$"
        />
        <GraficoCard {...cardProps}
          titulo="Distribuição de Custos"
          sub="COMPOSIÇÃO DAS SAÍDAS"
          tipo={tipos.custos} onTipo={v=>setTipo("custos",v)}
          series={[{nome:"Matéria-prima",dados:[custoMateria],cor:"#60A5FA"},{nome:"Operacional",dados:[custoOperacional],cor:"#A78BFA"},{nome:"Desperdício",dados:[totalDesperdicio],cor:"#FBBF24"}]}
          labels={["Custos"]} pre="R$"
        />
      </div>

      {/* Lançamentos + Top Produtos */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 280px",gap:12,marginBottom:12 }}>
        <Card>
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:13.5,color:t.textSecondary||"#C8C4BC",marginBottom:14 }}>Lançamentos recentes</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 0.55fr 0.75fr",padding:"0 6px 8px",borderBottom:`1px solid ${border}` }}>
            {["DESCRIÇÃO","TIPO","VALOR"].map(h=><span key={h} style={{ fontFamily:"'DM Mono',monospace",fontSize:9.5,color:t.textDim||"#2A2A2A",letterSpacing:"0.12em" }}>{h}</span>)}
          </div>
          {todosLancamentos.map((item,idx)=>{
            const isEnt=item._tipo==="entrada";
            const cor=isEnt?"#4ADE80":item.tipo==="desperdicio"?"#FBBF24":item.tipo==="operacional"?"#A78BFA":"#60A5FA";
            return (
              <div key={item.id} style={{ display:"grid",gridTemplateColumns:"1fr 0.55fr 0.75fr",padding:"8px 6px",borderBottom:idx<todosLancamentos.length-1?`1px solid ${border}`:"none" }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:12.5,color:t.textSecondary||"#C8C4BC",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{item.descricao}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace",fontSize:9.5,color:t.textGhost||"#2A2A2A",marginTop:1 }}>
                    {item.data.includes("-") ? item.data.slice(0,10).split("-").reverse().join("/") : item.data.split(" ")[0]}
                  </div>
                </div>
                <span style={{ display:"inline-flex",alignItems:"center",fontFamily:"'DM Mono',monospace",fontSize:10,padding:"2px 7px",borderRadius:4,background:cor+"15",color:cor,border:`1px solid ${cor}30`,whiteSpace:"nowrap",alignSelf:"center" }}>
                  {isEnt?"venda":item.tipo}
                </span>
                <span style={{ fontFamily:"'DM Mono',monospace",fontSize:13,color:isEnt?"#4ADE80":"#F87171",fontWeight:600,letterSpacing:"-0.02em",textAlign:"right",alignSelf:"center" }}>
                  {isEnt?"+":"-"}R${item.valor.toFixed(2)}
                </span>
              </div>
            );
          })}
        </Card>

        <Card>
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:13.5,color:t.textSecondary||"#C8C4BC",marginBottom:14 }}>Top Produtos</div>
          {produtoStats.length===0
            ? <p style={{ fontFamily:"'DM Mono',monospace",fontSize:11,color:t.textGhost||"#2A2A2A",textAlign:"center",padding:"16px 0" }}>Sem vendas no período</p>
            : produtoStats.map((s,i)=>(
              <div key={s.produto.id} style={{ marginBottom:12 }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:t.textDim||"#333",width:14 }}>#{i+1}</span>
                    <span style={{ fontSize:13 }}>{s.produto.emoji}</span>
                    <span style={{ fontSize:12.5,color:t.textSecondary||"#C8C4BC" }}>{s.produto.nome}</span>
                  </div>
                  <span style={{ fontFamily:"'DM Mono',monospace",fontSize:11,color:accent,fontWeight:600 }}>R${s.receita.toFixed(0)}</span>
                </div>
                <div style={{ height:2,background:bgElevated,borderRadius:2,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${(s.receita/(produtoStats[0]?.receita||1))*100}%`,background:i===0?accent:accent+"60",borderRadius:2,transition:"width 0.4s" }}/>
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:t.textDim||"#333",marginTop:2 }}>{s.vendas} {s.vendas===1?"venda":"vendas"}</div>
              </div>
            ))
          }
        </Card>
      </div>

      {/* Resumo */}
      <Card>
        <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:13.5,color:t.textSecondary||"#C8C4BC",marginBottom:14 }}>Resumo — {periodo.label}</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10 }}>
          {[
            {label:"Faturamento",valor:totalEntradas,cor:"#4ADE80",icon:icons.trending},
            {label:"Matéria-prima",valor:custoMateria,cor:"#60A5FA",icon:icons.package},
            {label:"Operacional",valor:custoOperacional,cor:"#A78BFA",icon:icons.zap},
            {label:"Desperdício",valor:totalDesperdicio,cor:"#FBBF24",icon:icons.alertas},
          ].map(({label,valor,cor,icon})=>(
            <div key={label} style={{ padding:"12px 14px",background:bgBody,borderRadius:8,border:`1px solid ${border}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}>
                <span style={{ color:cor,display:"flex" }}><Icon d={icon} size={12}/></span>
                <span style={{ fontFamily:"'DM Mono',monospace",fontSize:9.5,color:t.textDim||"#3A3A3A",letterSpacing:"0.06em",textTransform:"uppercase" }}>{label}</span>
              </div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:600,color:cor,letterSpacing:"-0.03em" }}>R${valor.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal Entrada */}
      <Modal open={modalTipo==="entrada"} onClose={()=>setModalTipo(null)} title="Registrar Entrada" width="max-w-md">
        <Input label="Descrição *" value={formEntrada.descricao} onChange={e=>setFormEntrada({...formEntrada,descricao:e.target.value})} placeholder="Ex: Pedido Mesa 05"/>
        <Input label="Valor (R$) *" type="number" value={formEntrada.valor} onChange={e=>setFormEntrada({...formEntrada,valor:e.target.value})} placeholder="0.00"/>
        <Input label="Data" type="date" value={formEntrada.data} onChange={e=>setFormEntrada({...formEntrada,data:e.target.value})}/>
        <Select label="Produto (opcional)" value={formEntrada.produtoId} onChange={e=>setFormEntrada({...formEntrada,produtoId:e.target.value})}>
          <option value="">Nenhum</option>
          {(produtos||[]).map(p=><option key={p.id} value={p.id}>{p.emoji} {p.nome}</option>)}
        </Select>
        <div style={{ display:"flex",gap:10,marginTop:8 }}>
          <button onClick={()=>setModalTipo(null)} style={{ flex:1,padding:"9px",borderRadius:8,background:bgElevated,border:`1px solid ${borderMid}`,color:t.textMuted||"#666",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>Cancelar</button>
          <button onClick={adicionarEntrada} disabled={!formEntrada.valor||!formEntrada.descricao} style={{ flex:1,padding:"9px",borderRadius:8,background:!formEntrada.valor||!formEntrada.descricao?"#2A2A2A":"linear-gradient(135deg,#34D399,#10B981)",color:!formEntrada.valor||!formEntrada.descricao?"#555":"#fff",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:!formEntrada.valor||!formEntrada.descricao?"not-allowed":"pointer" }}>Registrar Entrada</button>
        </div>
      </Modal>

      {/* Modal Saída */}
      <Modal open={modalTipo==="saida"} onClose={()=>setModalTipo(null)} title="Registrar Saída" width="max-w-md">
        <Input label="Descrição *" value={formSaida.descricao} onChange={e=>setFormSaida({...formSaida,descricao:e.target.value})} placeholder="Ex: Compra carne bovina"/>
        <Input label="Valor (R$) *" type="number" value={formSaida.valor} onChange={e=>setFormSaida({...formSaida,valor:e.target.value})} placeholder="0.00"/>
        <Input label="Data" type="date" value={formSaida.data} onChange={e=>setFormSaida({...formSaida,data:e.target.value})}/>
        <Select label="Tipo" value={formSaida.tipo} onChange={e=>setFormSaida({...formSaida,tipo:e.target.value})}>
          <option value="compra">Compra (Matéria-prima)</option>
          <option value="desperdicio">Desperdício / Descarte</option>
          <option value="operacional">Custo Operacional</option>
        </Select>
        <div style={{ display:"flex",gap:10,marginTop:8 }}>
          <button onClick={()=>setModalTipo(null)} style={{ flex:1,padding:"9px",borderRadius:8,background:bgElevated,border:`1px solid ${borderMid}`,color:t.textMuted||"#666",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>Cancelar</button>
          <button onClick={adicionarSaida} disabled={!formSaida.valor||!formSaida.descricao} style={{ flex:1,padding:"9px",borderRadius:8,background:!formSaida.valor||!formSaida.descricao?"#2A2A2A":"linear-gradient(135deg,#F97316,#EA580C)",color:!formSaida.valor||!formSaida.descricao?"#555":"#fff",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:!formSaida.valor||!formSaida.descricao?"not-allowed":"pointer" }}>Registrar Saída</button>
        </div>
      </Modal>
    </div>
  );
}