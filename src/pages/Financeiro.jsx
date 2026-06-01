// src/pages/Financeiro.jsx
// v2.0 — gráficos configuráveis via prefs.tipoGrafico (importa engine de Graficos).

import { useState, useMemo } from "react";
import Icon, { icons } from "../components/Icon";
import { Card, StatCard, BtnPrimary, BtnGhost, Modal, Input, Select } from "../components/UI";
import { hoje, addDias } from "../utils/helpers";

// ── Engine de gráfico reutilizável (inline, sem import de Graficos.jsx) ────────
const SERIE_CORES = ["#4ADE80", "#F87171", "#60A5FA", "#A78BFA", "#FBBF24", "#C9A84C"];

function GraficoUniversal({ tipo, series, labels, altura = 140, accent = "#C9A84C", bgCard = "#0F0F0F", border = "#1E1E1E" }) {
  if (tipo === "pie" || tipo === "radial") return <GraficoPizza series={series} labels={labels} altura={altura} tipo={tipo} accent={accent} />;
  if (tipo === "line")  return <GraficoLinha  series={series} labels={labels} altura={altura} accent={accent} border={border} />;
  if (tipo === "area")  return <GraficoArea   series={series} labels={labels} altura={altura} accent={accent} border={border} bgCard={bgCard} />;
  return <GraficoBarra series={series} labels={labels} altura={altura} accent={accent} border={border} />;
}

function GraficoBarra({ series, labels, altura, accent, border }) {
  const allVals = series.flatMap(s => s.dados);
  const max = Math.max(...allVals, 1);
  const n = labels.length;
  const W = 500; const pad = 28; const plotW = W - pad; const plotH = altura - 20;
  const grupoW = plotW / n;
  const barW = Math.max(8, (grupoW / series.length) - 4);
  return (
    <svg viewBox={`0 0 ${W} ${altura}`} style={{ width: "100%", height: altura, display: "block" }}>
      {[0.5, 1].map(f => <line key={f} x1={pad} x2={W} y1={plotH*(1-f)} y2={plotH*(1-f)} stroke={border} strokeWidth={0.5}/>)}
      {labels.map((lbl, i) => (
        <g key={i}>
          {series.map((s, si) => {
            const v = s.dados[i] || 0;
            const h = Math.max(2, (v / max) * plotH);
            const cor = s.cor || SERIE_CORES[si];
            const x = pad + i * grupoW + si * (barW + 3) + 4;
            return <rect key={si} x={x} y={plotH-h} width={barW} height={h} fill={cor} opacity={0.82} rx={3}/>;
          })}
          <text x={pad + i*grupoW + grupoW/2} y={altura-4} textAnchor="middle" fill="#333" fontSize={8} fontFamily="'DM Mono',monospace">{lbl}</text>
        </g>
      ))}
    </svg>
  );
}

function GraficoLinha({ series, labels, altura, accent, border }) {
  const allVals = series.flatMap(s => s.dados);
  const max = Math.max(...allVals, 1);
  const n = labels.length;
  const W = 500; const pad = 28; const plotW = W - pad; const plotH = altura - 20;
  const toX = i => pad + (i / Math.max(n-1,1)) * plotW;
  const toY = v => plotH - (v / max) * plotH;
  return (
    <svg viewBox={`0 0 ${W} ${altura}`} style={{ width: "100%", height: altura, display: "block" }}>
      {[0.5, 1].map(f => <line key={f} x1={pad} x2={W} y1={plotH*(1-f)} y2={plotH*(1-f)} stroke={border} strokeWidth={0.5}/>)}
      {series.map((s, si) => {
        const cor = s.cor || SERIE_CORES[si];
        const pts = s.dados.map((v,i) => `${toX(i)},${toY(v)}`).join(" ");
        return <g key={si}><polyline points={pts} fill="none" stroke={cor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" opacity={0.9}/>{s.dados.map((v,i)=><circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill={cor} opacity={0.9}/>)}</g>;
      })}
      {labels.map((lbl,i)=><text key={i} x={toX(i)} y={altura-4} textAnchor="middle" fill="#333" fontSize={8} fontFamily="'DM Mono',monospace">{lbl}</text>)}
    </svg>
  );
}

function GraficoArea({ series, labels, altura, accent, border, bgCard }) {
  const allVals = series.flatMap(s => s.dados);
  const max = Math.max(...allVals, 1);
  const n = labels.length;
  const W = 500; const pad = 28; const plotW = W - pad; const plotH = altura - 20;
  const toX = i => pad + (i / Math.max(n-1,1)) * plotW;
  const toY = v => plotH - (v / max) * plotH;
  return (
    <svg viewBox={`0 0 ${W} ${altura}`} style={{ width: "100%", height: altura, display: "block" }}>
      <defs>{series.map((s,si)=>{ const cor=s.cor||SERIE_CORES[si]; return <linearGradient key={si} id={`fg${si}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={cor} stopOpacity={0.35}/><stop offset="100%" stopColor={cor} stopOpacity={0.02}/></linearGradient>; })}</defs>
      {[0.5,1].map(f=><line key={f} x1={pad} x2={W} y1={plotH*(1-f)} y2={plotH*(1-f)} stroke={border} strokeWidth={0.5}/>)}
      {series.map((s,si)=>{ const cor=s.cor||SERIE_CORES[si]; const areaPts=`${toX(0)},${plotH} `+s.dados.map((v,i)=>`${toX(i)},${toY(v)}`).join(" ")+` ${toX(n-1)},${plotH}`; const linePts=s.dados.map((v,i)=>`${toX(i)},${toY(v)}`).join(" "); return <g key={si}><polygon points={areaPts} fill={`url(#fg${si})`}/><polyline points={linePts} fill="none" stroke={cor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/></g>; })}
      {labels.map((lbl,i)=><text key={i} x={toX(i)} y={altura-4} textAnchor="middle" fill="#333" fontSize={8} fontFamily="'DM Mono',monospace">{lbl}</text>)}
    </svg>
  );
}

function GraficoPizza({ series, labels, altura, tipo, accent }) {
  const dados = series.map((s,i)=>({ label: s.nome, valor: s.dados.reduce((a,b)=>a+b,0), cor: s.cor||SERIE_CORES[i] })).filter(d=>d.valor>0);
  const total = dados.reduce((s,d)=>s+d.valor,0)||1;
  const cx=100; const cy=altura/2; const r=Math.min(cy-10,65);
  let ang = -Math.PI/2;
  const fatias = dados.map(d=>{ const a=(d.valor/total)*2*Math.PI; const x1=cx+r*Math.cos(ang); const y1=cy+r*Math.sin(ang); ang+=a; const x2=cx+r*Math.cos(ang); const y2=cy+r*Math.sin(ang); return {...d,path:`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${a>Math.PI?1:0},1 ${x2},${y2} Z`}; });
  return (
    <svg viewBox={`0 0 500 ${altura}`} style={{ width: "100%", height: altura, display: "block" }}>
      {fatias.map((f,i)=><path key={i} d={f.path} fill={f.cor} opacity={0.85} stroke="#080808" strokeWidth={1.5}/>)}
      {dados.map((d,i)=>(
        <g key={i}>
          <rect x={220} y={10+i*22} width={10} height={10} fill={d.cor} rx={2}/>
          <text x={236} y={20+i*22} fill="#888" fontSize={10} fontFamily="'DM Sans',sans-serif">{d.label}</text>
          <text x={490} y={20+i*22} fill={d.cor} fontSize={10} fontFamily="'DM Mono',monospace" textAnchor="end" fontWeight="600">{((d.valor/total)*100).toFixed(1)}%</text>
        </g>
      ))}
    </svg>
  );
}

// ── Período ───────────────────────────────────────────────────────────────────
const PERIODOS = [
  { id: "7d",  label: "7 dias",   dias: 7  },
  { id: "30d", label: "30 dias",  dias: 30 },
  { id: "mes", label: "Este mês", dias: null },
];

function filtrarPorPeriodo(lista, periodo) {
  const agora = new Date();
  return lista.filter(item => {
    const data = new Date(item.data);
    if (periodo.id === "mes") return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
    const diff = (agora - data) / (1000 * 60 * 60 * 24);
    return diff <= periodo.dias;
  });
}

const FORM_ENTRADA = { descricao: "", valor: "", data: hoje(), produtoId: "" };
const FORM_SAIDA   = { descricao: "", valor: "", data: hoje(), tipo: "compra", categoria: "Matéria-prima" };

export default function Financeiro({ financeiro, setFinanceiro, produtos, prefs, t = {} }) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const accentGrad   = t.accentGrad   || "linear-gradient(135deg,#C9A84C,#9A7A2E)";
  const accentText   = t.accentText   || "#080808";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const border       = t.border       || "#1E1E1E";
  const borderMid    = t.borderMid    || "#252525";
  const tipoGrafico  = prefs?.tipoGrafico || "bar";

  const [periodo,     setPeriodo]     = useState(PERIODOS[0]);
  const [modalTipo,   setModalTipo]   = useState(null);
  const [formEntrada, setFormEntrada] = useState(FORM_ENTRADA);
  const [formSaida,   setFormSaida]   = useState(FORM_SAIDA);

  const { entradas = [], saidas = [] } = financeiro || {};
  const entradasPeriodo = useMemo(() => filtrarPorPeriodo(entradas, periodo), [entradas, periodo]);
  const saidasPeriodo   = useMemo(() => filtrarPorPeriodo(saidas,   periodo), [saidas, periodo]);

  const totalEntradas    = entradasPeriodo.reduce((s,e)=>s+e.valor,0);
  const totalSaidas      = saidasPeriodo.reduce((s,e)=>s+e.valor,0);
  const lucroEstimado    = totalEntradas - totalSaidas;
  const totalDesperdicio = saidasPeriodo.filter(s=>s.tipo==="desperdicio").reduce((s,e)=>s+e.valor,0);
  const custoOperacional = saidasPeriodo.filter(s=>s.tipo==="operacional").reduce((s,e)=>s+e.valor,0);
  const custoMateria     = saidasPeriodo.filter(s=>s.tipo==="compra").reduce((s,e)=>s+e.valor,0);
  const margemLucro      = totalEntradas > 0 ? (lucroEstimado/totalEntradas)*100 : 0;

  const diasGrafico = Math.min(periodo.dias || 30, 7);
  const datasGraf   = Array.from({length: diasGrafico}, (_, i) => addDias(-(diasGrafico-1-i)));
  const labelsGraf  = datasGraf.map((_, i) => i === diasGrafico-1 ? "hj" : `D-${diasGrafico-1-i}`);
  const dadosEntDia  = datasGraf.map(d => entradasPeriodo.filter(e=>e.data===d).reduce((s,e)=>s+e.valor,0));
  const dadosSaidDia = datasGraf.map(d => saidasPeriodo.filter(e=>e.data===d).reduce((s,e)=>s+e.valor,0));

  const produtoStats = useMemo(() => {
    const stats = {};
    entradasPeriodo.forEach(e=>{
      (e.produtoIds||[]).forEach(pid=>{
        if(!stats[pid]) stats[pid]={vendas:0,receita:0};
        stats[pid].vendas++;
        const prod=produtos.find(p=>p.id===pid);
        stats[pid].receita+=prod?.preco||0;
      });
    });
    return Object.entries(stats).map(([pid,s])=>({...s,produto:produtos.find(p=>p.id===pid)})).filter(s=>s.produto).sort((a,b)=>b.receita-a.receita);
  }, [entradasPeriodo, produtos]);

  const adicionarEntrada = () => {
    if (!formEntrada.valor || !formEntrada.descricao) return;
    setFinanceiro(prev=>({...prev, entradas:[{ id:"EFN"+Date.now(), tipo:"venda", valor:Number(formEntrada.valor), data:formEntrada.data, descricao:formEntrada.descricao, produtoIds:formEntrada.produtoId?[formEntrada.produtoId]:[] }, ...prev.entradas]}));
    setModalTipo(null); setFormEntrada(FORM_ENTRADA);
  };

  const adicionarSaida = () => {
    if (!formSaida.valor || !formSaida.descricao) return;
    setFinanceiro(prev=>({...prev, saidas:[{ id:"SFN"+Date.now(), tipo:formSaida.tipo, valor:Number(formSaida.valor), data:formSaida.data, descricao:formSaida.descricao, categoria:formSaida.categoria }, ...prev.saidas]}));
    setModalTipo(null); setFormSaida(FORM_SAIDA);
  };

  const todosLancamentos = [
    ...entradasPeriodo.map(e=>({...e,_tipo:"entrada"})),
    ...saidasPeriodo.map(s=>({...s,_tipo:"saida"})),
  ].sort((a,b)=>b.data.localeCompare(a.data)).slice(0,10);

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.03em", color:"#EDE9DF", lineHeight:1.1 }}>Financeiro</h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#3A3A3A", marginTop:5, letterSpacing:"0.08em" }}>FATURAMENTO · CUSTOS · LUCRO ESTIMADO</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Período */}
          <div style={{ display:"flex", gap:2, background:bgCard, border:`1px solid ${border}`, borderRadius:8, padding:3 }}>
            {PERIODOS.map(p=>(
              <button key={p.id} onClick={()=>setPeriodo(p)} style={{ padding:"5px 12px", borderRadius:6, background:periodo.id===p.id?accentDim:"transparent", border:`1px solid ${periodo.id===p.id?accentBorder:"transparent"}`, color:periodo.id===p.id?accent:"#444", fontFamily:"'DM Mono',monospace", fontSize:11, cursor:"pointer", transition:"all 0.15s" }}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={()=>setModalTipo("saida")} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:8,background:"#141414",border:`1px solid ${borderMid}`,color:"#666",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",transition:"all 0.15s" }}
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
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"Faturamento",   value:`R$${totalEntradas.toFixed(0)}`,   sub:`${entradasPeriodo.length} transações`, icon:icons.trending,     iconColor:"#4ADE80", accent:"green" },
          { label:"Saídas Totais", value:`R$${totalSaidas.toFixed(0)}`,     sub:`${saidasPeriodo.length} lançamentos`,  icon:icons.trendingDown, iconColor:"#F87171", accent:"red"   },
          { label:"Lucro Est.",    value:`R$${lucroEstimado.toFixed(0)}`,    sub:`Margem: ${margemLucro.toFixed(1)}%`,   icon:icons.dollarSign,   iconColor:lucroEstimado>=0?accent:"#EF4444", accent:lucroEstimado>=0?"gold":"red" },
          { label:"Desperdício",   value:`R$${totalDesperdicio.toFixed(0)}`, sub:"perdas + descarte",                    icon:icons.alertas,      iconColor:totalDesperdicio>0?"#FBBF24":"#333", accent:totalDesperdicio>50?"gold":null },
        ].map(kpi=>(
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Gráfico configurável — Entradas vs Saídas */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        <Card>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:13.5,color:"#C8C4BC" }}>Entradas vs Saídas</div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:9.5,color:"#3A3A3A",marginTop:3,letterSpacing:"0.08em" }}>ÚLTIMOS {diasGrafico} DIAS — {tipoGrafico.toUpperCase()}</div>
            </div>
            <span style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:accentBorder,padding:"2px 8px",borderRadius:5,background:accentDim,border:`1px solid ${accentBorder}` }}>
              {tipoGrafico}
            </span>
          </div>
          <GraficoUniversal
            tipo={tipoGrafico}
            series={[
              { nome:"Entradas", dados:dadosEntDia,  cor:"#4ADE80" },
              { nome:"Saídas",   dados:dadosSaidDia, cor:"#F87171" },
            ]}
            labels={labelsGraf}
            altura={150}
            accent={accent} bgCard={bgCard} border={border}
          />
          <div style={{ display:"flex",gap:12,marginTop:10 }}>
            {[["#4ADE80","Entradas"],["#F87171","Saídas"]].map(([cor,nome])=>(
              <div key={nome} style={{ display:"flex",alignItems:"center",gap:6 }}>
                <div style={{ width:8,height:8,borderRadius:2,background:cor }}/>
                <span style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"#555" }}>{nome}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Distribuição de custos */}
        <Card>
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:13.5,color:"#C8C4BC",marginBottom:16 }}>Distribuição de Custos</div>
          <GraficoUniversal
            tipo={tipoGrafico}
            series={[
              { nome:"Matéria-prima", dados:[custoMateria],    cor:"#60A5FA" },
              { nome:"Operacional",   dados:[custoOperacional], cor:"#A78BFA" },
              { nome:"Desperdício",   dados:[totalDesperdicio], cor:"#FBBF24" },
            ]}
            labels={["Custos"]}
            altura={150}
            accent={accent} bgCard={bgCard} border={border}
          />
        </Card>
      </div>

      {/* Lançamentos + Top Produtos */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:12, marginBottom:12 }}>
        <Card>
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:13.5,color:"#C8C4BC",marginBottom:14 }}>Lançamentos recentes</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 0.55fr 0.75fr",padding:"0 6px 8px",borderBottom:`1px solid ${border}` }}>
            {["DESCRIÇÃO","TIPO","VALOR"].map(h=><span key={h} style={{ fontFamily:"'DM Mono',monospace",fontSize:9.5,color:"#2A2A2A",letterSpacing:"0.12em" }}>{h}</span>)}
          </div>
          {todosLancamentos.map((item,idx)=>{
            const isEnt=item._tipo==="entrada";
            const cor=isEnt?"#4ADE80":item.tipo==="desperdicio"?"#FBBF24":item.tipo==="operacional"?"#A78BFA":"#60A5FA";
            return (
              <div key={item.id} style={{ display:"grid",gridTemplateColumns:"1fr 0.55fr 0.75fr",padding:"8px 6px",borderBottom:idx<todosLancamentos.length-1?`1px solid ${border}`:"none" }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:12.5,color:"#C8C4BC",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{item.descricao}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace",fontSize:9.5,color:"#2A2A2A",marginTop:1 }}>{item.data.split("-").reverse().join("/")}</div>
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
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:13.5,color:"#C8C4BC",marginBottom:14 }}>Top Produtos</div>
          {produtoStats.length===0
            ? <p style={{ fontFamily:"'DM Mono',monospace",fontSize:11,color:"#2A2A2A",textAlign:"center",padding:"16px 0" }}>Sem vendas no período</p>
            : produtoStats.map((s,i)=>(
              <div key={s.produto.id} style={{ marginBottom:12 }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"#333",width:14 }}>#{i+1}</span>
                    <span style={{ fontSize:13 }}>{s.produto.emoji}</span>
                    <span style={{ fontSize:12.5,color:"#C8C4BC" }}>{s.produto.nome}</span>
                  </div>
                  <span style={{ fontFamily:"'DM Mono',monospace",fontSize:11,color:accent,fontWeight:600 }}>R${s.receita.toFixed(0)}</span>
                </div>
                <div style={{ height:2,background:"#161616",borderRadius:2,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${(s.receita/(produtoStats[0]?.receita||1))*100}%`,background:i===0?accent:accent+"60",borderRadius:2,transition:"width 0.4s ease" }}/>
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"#333",marginTop:2 }}>{s.vendas} {s.vendas===1?"venda":"vendas"}</div>
              </div>
            ))
          }
        </Card>
      </div>

      {/* Resumo */}
      <Card>
        <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:13.5,color:"#C8C4BC",marginBottom:14 }}>Resumo — {periodo.label}</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10 }}>
          {[
            { label:"Faturamento",   valor:totalEntradas,    cor:"#4ADE80",  icon:icons.trending  },
            { label:"Matéria-prima", valor:custoMateria,     cor:"#60A5FA",  icon:icons.package   },
            { label:"Operacional",   valor:custoOperacional,  cor:"#A78BFA",  icon:icons.zap       },
            { label:"Desperdício",   valor:totalDesperdicio, cor:"#FBBF24",  icon:icons.alertas   },
          ].map(({label,valor,cor,icon})=>(
            <div key={label} style={{ padding:"12px 14px",background:bgBody,borderRadius:8,border:`1px solid ${border}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}>
                <span style={{ color:cor,display:"flex" }}><Icon d={icon} size={12}/></span>
                <span style={{ fontFamily:"'DM Mono',monospace",fontSize:9.5,color:"#3A3A3A",letterSpacing:"0.06em",textTransform:"uppercase" }}>{label}</span>
              </div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:600,color:cor,letterSpacing:"-0.03em" }}>R${valor.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modais */}
      <Modal open={modalTipo==="entrada"} onClose={()=>setModalTipo(null)} title="Registrar Entrada" width="max-w-md">
        <Input label="Descrição *" value={formEntrada.descricao} onChange={e=>setFormEntrada({...formEntrada,descricao:e.target.value})} placeholder="Ex: Pedido Mesa 05"/>
        <Input label="Valor (R$) *" type="number" value={formEntrada.valor} onChange={e=>setFormEntrada({...formEntrada,valor:e.target.value})} placeholder="0.00"/>
        <Input label="Data" type="date" value={formEntrada.data} onChange={e=>setFormEntrada({...formEntrada,data:e.target.value})}/>
        <Select label="Produto (opcional)" value={formEntrada.produtoId} onChange={e=>setFormEntrada({...formEntrada,produtoId:e.target.value})}>
          <option value="">Nenhum</option>
          {(produtos||[]).map(p=><option key={p.id} value={p.id}>{p.emoji} {p.nome}</option>)}
        </Select>
        <div style={{ display:"flex",gap:10,marginTop:8 }}>
          <button onClick={()=>setModalTipo(null)} style={{ flex:1,padding:"9px",borderRadius:8,background:"#141414",border:`1px solid ${borderMid}`,color:"#666",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>Cancelar</button>
          <button onClick={adicionarEntrada} disabled={!formEntrada.valor||!formEntrada.descricao} style={{ flex:1,padding:"9px",borderRadius:8,background:!formEntrada.valor||!formEntrada.descricao?"#2A2A2A":accentGrad,color:!formEntrada.valor||!formEntrada.descricao?"#555":accentText,border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:!formEntrada.valor||!formEntrada.descricao?"not-allowed":"pointer" }}>Registrar Entrada</button>
        </div>
      </Modal>

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
          <button onClick={()=>setModalTipo(null)} style={{ flex:1,padding:"9px",borderRadius:8,background:"#141414",border:`1px solid ${borderMid}`,color:"#666",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>Cancelar</button>
          <button onClick={adicionarSaida} disabled={!formSaida.valor||!formSaida.descricao} style={{ flex:1,padding:"9px",borderRadius:8,background:!formSaida.valor||!formSaida.descricao?"#2A2A2A":"linear-gradient(135deg,#F97316,#EA580C)",color:!formSaida.valor||!formSaida.descricao?"#555":"#fff",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:!formSaida.valor||!formSaida.descricao?"not-allowed":"pointer" }}>Registrar Saída</button>
        </div>
      </Modal>
    </div>
  );
}