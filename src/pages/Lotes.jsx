// src/pages/Lotes.jsx
// v3.1 — mais espaçamento, colunas proporcionais, dados respirando.

import { useState } from "react";
import { Badge } from "../components/UI";
import { fmtData, diasAte, statusValidade, corStatus } from "../utils/helpers";

export default function Lotes({ lotes, ingredientes, movimentos = [], t = {} }) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const border       = t.border       || "#1E1E1E";
  const borderMid    = t.borderMid    || "#252525";

  const [filtroIng,    setFiltroIng]    = useState("Todos");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [expandido,    setExpandido]    = useState(null);

  const filtrado = lotes
    .filter(l => {
      const matchIng    = filtroIng === "Todos" || l.ingredienteId === filtroIng;
      const sv          = statusValidade(l.dataValidade, 3);
      const matchStatus =
        filtroStatus === "Todos" ||
        sv === filtroStatus ||
        (filtroStatus === "esgotado" && l.quantidadeRestante === 0);
      return matchIng && matchStatus;
    })
    .sort((a, b) => new Date(a.dataValidade) - new Date(b.dataValidade));

  // KPIs
  const totalLotes = lotes.length;
  const criticos   = lotes.filter(l => { const sv=statusValidade(l.dataValidade,3); return (sv==="critico"||sv==="vencido")&&l.quantidadeRestante>0; }).length;
  const vencendo   = lotes.filter(l => { const d=diasAte(l.dataValidade); return d>=0&&d<=1&&l.quantidadeRestante>0; }).length;
  const esgotados  = lotes.filter(l => l.quantidadeRestante===0).length;
  const custoTotal = lotes.reduce((s,l) => s+(l.custo||0), 0);

  const FILTRO_H = 38;
  const STATUS_FILTROS = [
    {v:"Todos",   l:"Todos"},
    {v:"ok",      l:"Normal"},
    {v:"atencao", l:"Atenção"},
    {v:"critico", l:"Crítico"},
    {v:"vencido", l:"Vencido"},
    {v:"esgotado",l:"Esgotado"},
  ];

  const urgenciaBg = (sv, qtd) => {
    if (qtd===0)        return "#EF44440A";
    if (sv==="vencido") return "#EF44440D";
    if (sv==="critico") return "#F9731608";
    if (sv==="atencao") return "#FBBF2406";
    return "transparent";
  };

  // Colunas da tabela — proporções generosas
  const COLS = "80px 2.2fr 100px 110px 80px 220px 100px 90px";

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.03em", color:"#EDE9DF" }}>
          Controle de Lotes
        </h2>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#3A3A3A", marginTop:5, letterSpacing:"0.06em" }}>
          RASTREIE CADA LOTE · VALIDADE · CONSUMO · CLIQUE PARA DETALHES
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:24 }}>
        {[
          { label:"Total de Lotes",  valor:totalLotes,              cor:accent,    sub:"cadastrados"         },
          { label:"Críticos",        valor:criticos,                cor:"#EF4444", sub:"vencendo em ≤3 dias", pulse:criticos>0 },
          { label:"Vencendo Hoje",   valor:vencendo,                cor:"#F97316", sub:"urgência máxima",     pulse:vencendo>0 },
          { label:"Esgotados",       valor:esgotados,               cor:"#FBBF24", sub:"sem estoque"         },
          { label:"Custo Total",     valor:`R$${custoTotal.toFixed(0)}`, cor:"#4ADE80", sub:"todos os lotes" },
        ].map(({ label, valor, cor, sub, pulse }) => (
          <div key={label} style={{
            padding:"18px 20px", borderRadius:10,
            background:bgCard, border:`1px solid ${cor}25`,
            position:"relative", overflow:"hidden",
            animation: pulse ? "barto-pulse-red 2.5s infinite" : "none",
          }}>
            <div style={{ position:"absolute", top:-1, left:"15%", right:"15%", height:1, background:`linear-gradient(90deg,transparent,${cor}80,transparent)` }}/>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#3A3A3A", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>{label}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:28, fontWeight:600, color:cor, letterSpacing:"-0.04em", lineHeight:1 }}>{valor}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#2A2A2A", marginTop:6 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <select value={filtroIng} onChange={e=>setFiltroIng(e.target.value)} style={{
          height:FILTRO_H, padding:"0 36px 0 14px", borderRadius:8,
          background:bgCard, border:`1px solid ${border}`,
          color:"#C8C4BC", fontSize:13, fontFamily:"'DM Sans',sans-serif",
          outline:"none", appearance:"none", cursor:"pointer", minWidth:200,
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center",
        }}>
          <option value="Todos">Todos ingredientes</option>
          {ingredientes.map(i=><option key={i.id} value={i.id}>{i.emoji} {i.nome}</option>)}
        </select>

        <div style={{ width:1, height:FILTRO_H, background:border }}/>

        <div style={{ display:"flex", gap:6 }}>
          {STATUS_FILTROS.map(({ v, l }) => {
            const sel = filtroStatus === v;
            return (
              <button key={v} onClick={()=>setFiltroStatus(v)} style={{
                height:FILTRO_H, padding:"0 16px", borderRadius:8,
                background: sel ? accentDim : bgCard,
                color:      sel ? accent    : "#555",
                border:     `1px solid ${sel ? accentBorder : border}`,
                fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:sel?600:400,
                cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap",
              }}
              onMouseEnter={e=>{ if(!sel){e.currentTarget.style.color="#C8C4BC";e.currentTarget.style.borderColor=borderMid;}}}
              onMouseLeave={e=>{ if(!sel){e.currentTarget.style.color="#555";e.currentTarget.style.borderColor=border;}}}
              >{l}</button>
            );
          })}
        </div>

        <span style={{ marginLeft:"auto", fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#3A3A3A" }}>
          {filtrado.length} lote{filtrado.length!==1?"s":""}
        </span>
      </div>

      {/* Tabela */}
      <div style={{ background:bgCard, border:`1px solid ${border}`, borderRadius:12, overflow:"hidden" }}>

        {/* Header */}
        <div style={{ display:"grid", gridTemplateColumns:COLS, padding:"12px 24px", background:bgBody, borderBottom:`1px solid ${border}`, gap:16 }}>
          {["LOTE","INGREDIENTE","ENTRADA","VALIDADE","DIAS","CONSUMO","STATUS","CUSTO"].map(h=>(
            <span key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#2A2A2A", letterSpacing:"0.12em" }}>{h}</span>
          ))}
        </div>

        {filtrado.length === 0 && (
          <div style={{ padding:"40px 0", textAlign:"center" }}>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#2A2A2A" }}>Nenhum lote encontrado.</p>
          </div>
        )}

        {filtrado.map((l, idx) => {
          const ing   = ingredientes.find(i=>i.id===l.ingredienteId);
          const sv    = statusValidade(l.dataValidade, 3);
          const dias  = diasAte(l.dataValidade);
          const pct   = l.quantidade>0 ? (l.quantidadeRestante/l.quantidade)*100 : 0;
          const isExp = expandido === l.id;

          const statusLabel = l.quantidadeRestante===0 ? "Esgotado"
            : sv==="vencido" ? "Vencido"
            : sv==="critico" ? "Crítico"
            : sv==="atencao" ? "Atenção"
            : "Normal";
          const statusKey = l.quantidadeRestante===0 ? "Crítico" : statusLabel;

          const diasCor  = dias<0 ? "#EF4444" : dias<=3 ? "#F97316" : dias<=7 ? "#FBBF24" : "#4A4A4A";
          const barCor   = pct>50 ? "#22C55E" : pct>20 ? "#F97316" : "#EF4444";
          const movsLote = movimentos.filter(m=>m.loteId===l.id);

          return (
            <div key={l.id}>
              {/* ── Linha principal ─────────────────────────────────────── */}
              <div
                onClick={()=>setExpandido(isExp?null:l.id)}
                style={{
                  display:"grid", gridTemplateColumns:COLS, gap:16,
                  padding:"16px 24px", alignItems:"center",
                  background: isExp ? accentDim : urgenciaBg(sv,l.quantidadeRestante),
                  borderBottom: isExp
                    ? `1px solid ${accentBorder}`
                    : idx<filtrado.length-1 ? `1px solid ${border}` : "none",
                  cursor:"pointer", transition:"background 0.15s",
                }}
                onMouseEnter={e=>{ if(!isExp) e.currentTarget.style.background = bgBody+"BB"; }}
                onMouseLeave={e=>{ if(!isExp) e.currentTarget.style.background = urgenciaBg(sv,l.quantidadeRestante); }}
              >
                {/* Lote */}
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, color:isExp?accent:"#555" }}>
                    L{String(l.numero).padStart(2,"0")}
                  </span>
                  {(sv==="vencido"||sv==="critico") && l.quantidadeRestante>0 && (
                    <span style={{ width:7, height:7, borderRadius:"50%", background:sv==="vencido"?"#EF4444":"#F97316", flexShrink:0, boxShadow:`0 0 5px ${sv==="vencido"?"#EF4444":"#F97316"}` }}/>
                  )}
                </div>

                {/* Ingrediente */}
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13.5, color:"#EDE9DF", fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {ing?.emoji} {ing?.nome}
                  </div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3A3A3A", marginTop:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {l.fornecedor || l.observacao || "—"}
                  </div>
                </div>

                {/* Entrada */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11.5, color:"#555" }}>
                  {fmtData(l.dataEntrada)}
                </span>

                {/* Validade */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#C8C4BC", fontWeight:500 }}>
                  {fmtData(l.dataValidade)}
                </span>

                {/* Dias */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, color:diasCor }}>
                  {dias<0 ? `${Math.abs(dias)}d` : `${dias}d`}
                </span>

                {/* Consumo */}
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#555" }}>
                      {l.quantidadeRestante} / {l.quantidade} {ing?.unidade}
                    </span>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:barCor, fontWeight:700 }}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ height:5, borderRadius:3, background:"#161616", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:barCor, borderRadius:3, transition:"width 0.4s", boxShadow:`0 0 6px ${barCor}50` }}/>
                  </div>
                </div>

                {/* Status */}
                <Badge className={corStatus(statusKey)}>{statusLabel}</Badge>

                {/* Custo */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:accent, fontWeight:600 }}>
                  {l.custo ? `R$${l.custo.toFixed(0)}` : "—"}
                </span>
              </div>

              {/* ── Painel expandido ─────────────────────────────────────── */}
              {isExp && (
                <div style={{
                  background:bgBody,
                  borderBottom: idx<filtrado.length-1 ? `1px solid ${border}` : "none",
                  padding:"24px 28px",
                  display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:28,
                }}>

                  {/* Detalhes */}
                  <div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:accent, letterSpacing:"0.12em", marginBottom:14 }}>
                      DETALHES DO LOTE
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                      {[
                        ["ID",          l.id],
                        ["Ingrediente", `${ing?.emoji} ${ing?.nome}`],
                        ["Lote Nº",     `L${String(l.numero).padStart(2,"0")}`],
                        ["Registrado",  l.usuario || "—"],
                        ["Fornecedor",  l.fornecedor || l.observacao || "Não informado"],
                        ["Custo",       l.custo ? `R$${l.custo.toFixed(2)}` : "Não informado"],
                      ].map(([k,v])=>(
                        <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${border}` }}>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#3A3A3A", letterSpacing:"0.04em" }}>{k}</span>
                          <span style={{ fontSize:12.5, color:"#C8C4BC", fontWeight:500 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consumo */}
                  <div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:accent, letterSpacing:"0.12em", marginBottom:14 }}>
                      CONSUMO DO LOTE
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:0, marginBottom:20 }}>
                      {[
                        ["Quantidade inicial", `${l.quantidade} ${ing?.unidade}`,                          "#EDE9DF"],
                        ["Consumido",          `${(l.quantidade-l.quantidadeRestante).toFixed(1)} ${ing?.unidade}`, "#F87171"],
                        ["Restante",           `${l.quantidadeRestante} ${ing?.unidade}`,                  barCor],
                      ].map(([k,v,cor])=>(
                        <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${border}` }}>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#3A3A3A" }}>{k}</span>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:14, color:cor, fontWeight:700 }}>{v}</span>
                        </div>
                      ))}
                    </div>

                    {/* Barra grande */}
                    <div style={{ height:10, borderRadius:5, background:"#161616", overflow:"hidden", marginBottom:6 }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:barCor, borderRadius:5, boxShadow:`0 0 10px ${barCor}60`, transition:"width 0.4s" }}/>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#2A2A2A" }}>0%</span>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:barCor, fontWeight:700 }}>{pct.toFixed(1)}% restante</span>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#2A2A2A" }}>100%</span>
                    </div>
                  </div>

                  {/* Movimentos */}
                  <div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:accent, letterSpacing:"0.12em", marginBottom:14 }}>
                      MOVIMENTAÇÕES ({movsLote.length})
                    </div>
                    {movsLote.length===0 ? (
                      <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#2A2A2A" }}>
                        Sem movimentações registradas.
                      </p>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                        {movsLote.slice(0,6).map(m=>{
                          const cor = m.tipo==="entrada"?"#4ADE80":m.tipo==="descarte"?"#FBBF24":"#F87171";
                          return (
                            <div key={m.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 0", borderBottom:`1px solid ${border}` }}>
                              <span style={{ width:7, height:7, borderRadius:"50%", background:cor, flexShrink:0 }}/>
                              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:cor, width:56, flexShrink:0 }}>{m.tipo}</span>
                              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:m.tipo==="entrada"?"#4ADE80":"#F87171", fontWeight:700, marginLeft:"auto" }}>
                                {m.tipo==="entrada"?"+":"-"}{m.quantidade} {ing?.unidade}
                              </span>
                              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3A3A3A", flexShrink:0 }}>
                                {m.data?.slice(0,10).split("-").reverse().join("/")}
                              </span>
                            </div>
                          );
                        })}
                        {movsLote.length>6 && (
                          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#2A2A2A", marginTop:8 }}>
                            + {movsLote.length-6} movimentos anteriores
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}