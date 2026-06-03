// src/pages/Saidas.jsx
// v3.0 — visual premium, KPIs, filtros, linha expansível, modal refinado.

import { useState, useMemo } from "react";
import Icon, { icons } from "../components/Icon";
import { Badge, Modal, Input, Select } from "../components/UI";
import { calcEstoque, consumirLotesFIFO } from "../utils/estoque";
import { fmtDataHora, uid, hoje } from "../utils/helpers";

const MOTIVOS = ["Uso produção","Produto vencido","Perda/quebra","Teste/degustação","Descarte automático","Outro"];

const TIPO_STYLE = {
  saida:    { color:"#F87171", bg:"#F8717115", border:"#F8717130", label:"saída"    },
  descarte: { color:"#FBBF24", bg:"#FBBF2415", border:"#FBBF2430", label:"descarte" },
};

export default function Saidas({ ingredientes, lotes, setLotes, movimentos, setMovimentos, financeiro, setFinanceiro, user, t = {} }) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const accentGrad   = t.accentGrad   || "linear-gradient(135deg,#C9A84C,#9A7A2E)";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const border       = t.border       || "#1E1E1E";
  const bgElevated   = t.bgElevated   || "#141414";
  const borderMid    = t.borderMid    || "#252525";

  const [modal,     setModal]     = useState(false);
  const [expandido, setExpandido] = useState(null);
  const [busca,     setBusca]     = useState("");
  const [filtroTipo,setFiltroTipo]= useState("Todos");
  const [filtroIng, setFiltroIng] = useState("Todos");
  const [form, setForm] = useState({ ingredienteId:"", quantidade:"", motivo:"Uso produção", observacao:"" });
  const [erro, setErro] = useState("");

  const saidas = movimentos
    .filter(m => m.tipo==="saida" || m.tipo==="descarte")
    .sort((a,b) => b.data.localeCompare(a.data));

  const filtradas = saidas.filter(m => {
    const ing = ingredientes.find(i => i.id === m.ingredienteId);
    const matchBusca  = !busca || ing?.nome.toLowerCase().includes(busca.toLowerCase());
    const matchTipo   = filtroTipo==="Todos" || m.tipo===filtroTipo;
    const matchIng    = filtroIng==="Todos"  || m.ingredienteId===filtroIng;
    return matchBusca && matchTipo && matchIng;
  });

  const ingSel       = ingredientes.find(i => i.id === form.ingredienteId);
  const estoqueAtual = ingSel ? calcEstoque(lotes, ingSel.id) : 0;
  const estoqueOp    = ingSel && ingSel.fatorConversao ? estoqueAtual / ingSel.fatorConversao : estoqueAtual;
  const excede       = Number(form.quantidade) > estoqueOp;

  // KPIs
  const totalSaidas     = saidas.length;
  const saidasHoje      = saidas.filter(m => m.data.startsWith(hoje())).length;
  const totalDescartes  = saidas.filter(m => m.tipo==="descarte").length;
  const totalConsumido  = saidas.reduce((s,m) => s + m.quantidade, 0);

  const registrar = () => {
    setErro("");
    const qtdOp  = Number(form.quantidade);
    const fator  = ingSel?.fatorConversao || 1;
    const ing    = ingredientes.find(i => i.id === form.ingredienteId);

    const { novosLotes, consumidos, sucesso } = consumirLotesFIFO(lotes, ing, qtdOp);
    if (!sucesso) { setErro("Estoque insuficiente para esta saída."); return; }

    const tipo = form.motivo==="Produto vencido" || form.motivo==="Descarte automático" ? "descarte" : "saida";
    const novosMov = consumidos.map(c => ({
      id:            "MOV" + uid(),
      tipo,
      loteId:        c.loteId,
      ingredienteId: c.ingredienteId,
      quantidade:    c.quantidade,
      data:          fmtDataHora(),
      usuario:       user.nome,
      motivo:        form.motivo,
      observacao:    form.observacao,
      pedidoId:      null,
    }));

    setLotes(novosLotes);
    setMovimentos(prev => [...novosMov, ...prev]);

    // ── Integração financeira: registra saída de custo ────────────────────
    const tipoFin = form.motivo === "Produto vencido" || form.motivo === "Descarte automático"
      ? "desperdicio"
      : form.motivo === "Uso produção" || form.motivo === "Perda/quebra"
      ? "operacional"
      : "compra";

    // Só registra no financeiro se for descarte/perda (compras entram via Entradas)
    if (tipoFin !== "compra") {
      const custoAprox = novosMov.reduce((s, m) => {
        const loteRef = novosLotes.find(l => l.id === m.loteId);
        const custoUnit = loteRef && loteRef.quantidade > 0
          ? (loteRef.custo || 0) / loteRef.quantidade
          : 0;
        return s + custoUnit * m.quantidade;
      }, 0);

      setFinanceiro(prev => ({
        ...prev,
        saidas: [{
          id:        "SFN_OUT_" + Date.now(),
          tipo:      tipoFin,
          valor:     custoAprox,
          data:      novosMov[0]?.data?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          descricao: form.motivo + (form.observacao ? ` — ${form.observacao}` : ""),
          categoria: tipoFin,
        }, ...(prev.saidas || [])],
      }));
    }

    setModal(false);
    setErro("");
    setForm({ ingredienteId:"", quantidade:"", motivo:"Uso produção", observacao:"" });
  };

  const COLS = "1.8fr 100px 110px 90px 1.4fr 150px 130px 110px";

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.03em", color:t.textPrimary||"#EDE9DF" }}>
            Saídas de Estoque
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t.textDim||"#3A3A3A", marginTop:5, letterSpacing:"0.06em" }}>
            SAÍDAS MANUAIS · DESCARTES · PEDIDOS BAIXAM AUTOMATICAMENTE
          </p>
        </div>
        <button onClick={()=>setModal(true)} style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"10px 22px", borderRadius:9, border:"none",
          background:"linear-gradient(135deg,#EF4444,#DC2626)",
          color:"#fff", fontFamily:"'DM Sans',sans-serif",
          fontSize:13.5, fontWeight:600, cursor:"pointer",
          boxShadow:"0 2px 16px #EF444430", transition:"filter 0.15s",
        }}
          onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.filter="none"}
        >
          <Icon d={icons.saidas} size={16}/> Registrar Saída
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {[
          { label:"Total de Saídas",  valor:totalSaidas,                   cor:"#F87171", sub:"registradas"         },
          { label:"Saídas Hoje",      valor:saidasHoje,                    cor:accent,    sub:"movimentações hoje"   },
          { label:"Descartes",        valor:totalDescartes,                cor:"#FBBF24", sub:"perdas e vencimentos" },
          { label:"Total Consumido",  valor:`${totalConsumido.toFixed(1)}`, cor:"#A78BFA", sub:"unidades retiradas"  },
        ].map(({ label, valor, cor, sub }) => (
          <div key={label} style={{
            padding:"18px 20px", borderRadius:10,
            background:bgCard, border:`1px solid ${cor}25`,
            position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", top:-1, left:"15%", right:"15%", height:1, background:`linear-gradient(90deg,transparent,${cor}80,transparent)` }}/>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textDim||"#3A3A3A", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>{label}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:28, fontWeight:600, color:cor, letterSpacing:"-0.04em", lineHeight:1 }}>{valor}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textGhost||"#2A2A2A", marginTop:6 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        {/* Busca */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 14px", height:38, borderRadius:8, background:bgCard, border:`1px solid ${border}` }}>
          <Icon d={icons.search} size={14} style={{ color:t.textDim||"#3A3A3A", flexShrink:0 }}/>
          <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar ingrediente..."
            style={{ background:"transparent", border:"none", outline:"none", color:t.textSecondary||"#C8C4BC", fontSize:13, fontFamily:"'DM Sans',sans-serif", width:190 }}
          />
        </div>

        <div style={{ width:1, height:38, background:border }}/>

        {/* Tipo */}
        <div style={{ display:"flex", gap:6 }}>
          {[["Todos","Todos"],["saida","Saída"],["descarte","Descarte"]].map(([v,l])=>{
            const sel = filtroTipo===v;
            const cor = v==="saida"?"#F87171":v==="descarte"?"#FBBF24":accent;
            return (
              <button key={v} onClick={()=>setFiltroTipo(v)} style={{
                height:38, padding:"0 16px", borderRadius:8, fontSize:13,
                fontFamily:"'DM Sans',sans-serif", fontWeight:sel?600:400,
                background: sel ? cor+"20" : bgCard,
                color:      sel ? cor      : "#555",
                border:     `1px solid ${sel ? cor+"40" : border}`,
                cursor:"pointer", transition:"all 0.15s",
              }}
              onMouseEnter={e=>{ if(!sel){e.currentTarget.style.color="#C8C4BC";e.currentTarget.style.borderColor=borderMid;}}}
              onMouseLeave={e=>{ if(!sel){e.currentTarget.style.color="#555";e.currentTarget.style.borderColor=border;}}}
              >{l}</button>
            );
          })}
        </div>

        <div style={{ width:1, height:38, background:border }}/>

        {/* Ingrediente */}
        <select value={filtroIng} onChange={e=>setFiltroIng(e.target.value)} style={{
          height:38, padding:"0 36px 0 14px", borderRadius:8,
          background:bgCard, border:`1px solid ${border}`,
          color:t.textSecondary||"#C8C4BC", fontSize:13, fontFamily:"'DM Sans',sans-serif",
          outline:"none", appearance:"none", cursor:"pointer", minWidth:190,
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center",
        }}>
          <option value="Todos">Todos ingredientes</option>
          {ingredientes.map(i=><option key={i.id} value={i.id}>{i.emoji} {i.nome}</option>)}
        </select>

        <span style={{ marginLeft:"auto", fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t.textDim||"#3A3A3A" }}>
          {filtradas.length} registro{filtradas.length!==1?"s":""}
        </span>
      </div>

      {/* Tabela */}
      <div style={{ background:bgCard, border:`1px solid ${border}`, borderRadius:12, overflow:"hidden" }}>
        {/* Header */}
        <div style={{ display:"grid", gridTemplateColumns:COLS, gap:16, padding:"12px 24px", background:bgBody, borderBottom:`1px solid ${border}` }}>
          {["INGREDIENTE","TIPO","QTD","LOTE","MOTIVO","DATA","POR","PEDIDO"].map(h=>(
            <span key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textDim||"#2A2A2A", letterSpacing:"0.12em" }}>{h}</span>
          ))}
        </div>

        {filtradas.length === 0 && (
          <div style={{ padding:"40px 0", textAlign:"center" }}>
            <div style={{ fontSize:28, marginBottom:10 }}>📤</div>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textGhost||"#2A2A2A" }}>Nenhuma saída encontrada.</p>
          </div>
        )}

        {filtradas.map((m, idx) => {
          const ing  = ingredientes.find(i => i.id === m.ingredienteId);
          const lote = lotes.find(l => l.id === m.loteId);
          const ts   = TIPO_STYLE[m.tipo] || TIPO_STYLE.saida;
          const isExp = expandido === m.id;

          return (
            <div key={m.id}>
              {/* Linha */}
              <div
                onClick={()=>setExpandido(isExp?null:m.id)}
                style={{
                  display:"grid", gridTemplateColumns:COLS, gap:16,
                  padding:"15px 24px", alignItems:"center",
                  background: isExp ? ts.bg : "transparent",
                  borderBottom: isExp ? `1px solid ${ts.border}` : idx<filtradas.length-1 ? `1px solid ${border}` : "none",
                  cursor:"pointer", transition:"background 0.15s",
                }}
                onMouseEnter={e=>{ if(!isExp) e.currentTarget.style.background=bgBody+"BB"; }}
                onMouseLeave={e=>{ if(!isExp) e.currentTarget.style.background="transparent"; }}
              >
                {/* Ingrediente */}
                <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{ing?.emoji}</span>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13.5, color:t.textPrimary||"#EDE9DF", fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ing?.nome}</div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.textDim||"#3A3A3A", marginTop:2 }}>{ing?.categoria}</div>
                  </div>
                </div>

                {/* Tipo */}
                <span style={{ display:"inline-flex", alignItems:"center", fontFamily:"'DM Mono',monospace", fontSize:10.5, fontWeight:600, padding:"3px 10px", borderRadius:5, background:ts.bg, color:ts.color, border:`1px solid ${ts.border}`, whiteSpace:"nowrap" }}>
                  {ts.label}
                </span>

                {/* Quantidade */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:"#F87171", fontWeight:700 }}>
                  -{m.quantidade} <span style={{ fontSize:10, color:"#F8717160" }}>{ing?.unidade}</span>
                </span>

                {/* Lote */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:isExp?ts.color:t.textMuted||"#555", fontWeight:isExp?700:400 }}>
                  {lote ? `L${String(lote.numero).padStart(2,"0")}` : "—"}
                </span>

                {/* Motivo */}
                <span style={{ fontSize:12.5, color:t.textMuted||"#666", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  {m.motivo || "—"}
                </span>

                {/* Data */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textMuted||"#555" }}>
                  {m.data?.slice(0,16).replace("T"," ")}
                </span>

                {/* Usuário */}
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:24, height:24, borderRadius:6, background:ts.bg, border:`1px solid ${ts.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700, color:ts.color }}>
                      {m.usuario?.slice(0,2).toUpperCase()}
                    </span>
                  </div>
                  <span style={{ fontSize:12, color:t.textMuted||"#555", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {m.usuario?.split(" ")[0]}
                  </span>
                </div>

                {/* Pedido */}
                {m.pedidoId ? (
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:accent, fontWeight:600 }}>{m.pedidoId}</span>
                ) : (
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textGhost||"#2A2A2A" }}>Manual</span>
                )}
              </div>

              {/* Painel expandido */}
              {isExp && (
                <div style={{ background:bgBody, borderBottom:idx<filtradas.length-1?`1px solid ${border}`:"none", padding:"22px 28px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:28 }}>

                  {/* Detalhes */}
                  <div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:ts.color, letterSpacing:"0.12em", marginBottom:14 }}>DETALHES DA SAÍDA</div>
                    {[
                      ["ID Movimentação", m.id],
                      ["Tipo",            ts.label],
                      ["Ingrediente",     `${ing?.emoji} ${ing?.nome}`],
                      ["Quantidade",      `${m.quantidade} ${ing?.unidade}`],
                      ["Lote",            lote ? `L${String(lote.numero).padStart(2,"0")} (${lote.id})` : "—"],
                      ["Motivo",          m.motivo || "—"],
                      ["Observação",      m.observacao || "—"],
                      ["Registrado por",  m.usuario],
                      ["Data/hora",       m.data],
                      ["Pedido",          m.pedidoId || "Saída manual"],
                    ].map(([k,v])=>(
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${border}` }}>
                        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t.textDim||"#3A3A3A" }}>{k}</span>
                        <span style={{ fontSize:12.5, color:t.textSecondary||"#C8C4BC", fontWeight:500, maxWidth:280, textAlign:"right", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Estado do lote após a saída */}
                  <div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:ts.color, letterSpacing:"0.12em", marginBottom:14 }}>ESTADO DO LOTE</div>
                    {lote ? (
                      <>
                        {(() => {
                          const pct = lote.quantidade>0 ? (lote.quantidadeRestante/lote.quantidade)*100 : 0;
                          const barCor = pct>50?"#22C55E":pct>20?"#F97316":"#EF4444";
                          return (
                            <div style={{ marginBottom:20 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textMuted||"#555" }}>Restante após saída</span>
                                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:14, color:barCor, fontWeight:700 }}>
                                  {lote.quantidadeRestante} / {lote.quantidade} {ing?.unidade}
                                </span>
                              </div>
                              <div style={{ height:8, borderRadius:4, background:bgElevated, overflow:"hidden", marginBottom:6 }}>
                                <div style={{ height:"100%", width:`${pct}%`, background:barCor, borderRadius:4, boxShadow:`0 0 8px ${barCor}60` }}/>
                              </div>
                              <div style={{ display:"flex", justifyContent:"space-between" }}>
                                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textGhost||"#2A2A2A" }}>Esgotado</span>
                                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:barCor, fontWeight:700 }}>{pct.toFixed(1)}% restante</span>
                                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textGhost||"#2A2A2A" }}>Completo</span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Info do lote */}
                        {[
                          ["Fornecedor",    lote.fornecedor || lote.observacao || "Não informado"],
                          ["Custo do lote", lote.custo ? `R$${lote.custo.toFixed(2)}` : "—"],
                          ["Data entrada",  lote.dataEntrada],
                          ["Data validade", lote.dataValidade],
                        ].map(([k,v])=>(
                          <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${border}` }}>
                            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t.textDim||"#3A3A3A" }}>{k}</span>
                            <span style={{ fontSize:12.5, color:t.textSecondary||"#C8C4BC", fontWeight:500 }}>{v}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textGhost||"#2A2A2A" }}>Lote não encontrado.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal open={modal} onClose={()=>{ setModal(false); setErro(""); }} title="Registrar Saída Manual" width="max-w-md">
        <Select label="Ingrediente *" value={form.ingredienteId} onChange={e=>{ setForm({...form,ingredienteId:e.target.value}); setErro(""); }}>
          <option value="">Selecione o ingrediente...</option>
          {ingredientes.map(i=>{
            const est = calcEstoque(lotes, i.id);
            const estOp = i.fatorConversao ? est/i.fatorConversao : est;
            return <option key={i.id} value={i.id}>{i.emoji} {i.nome} — {estOp.toFixed(1)} un disponíveis</option>;
          })}
        </Select>

        {/* Estoque disponível */}
        {ingSel && (
          <div style={{ padding:"10px 14px", borderRadius:8, background:bgBody, border:`1px solid ${border}`, marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t.textDim||"#3A3A3A" }}>Disponível em estoque</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:14, color:estoqueOp>0?"#4ADE80":"#EF4444", fontWeight:700 }}>
                {estoqueOp.toFixed(1)} un
              </span>
            </div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.textGhost||"#2A2A2A", marginTop:4 }}>
              = {estoqueAtual.toFixed(2)} {ingSel.unidade} · FIFO — lotes com validade mais próxima primeiro
            </div>
          </div>
        )}

        <Input
          label={`Quantidade (un) *`}
          type="number" value={form.quantidade}
          onChange={e=>{ setForm({...form,quantidade:e.target.value}); setErro(""); }}
          placeholder="0"
          error={excede ? `Máximo disponível: ${estoqueOp.toFixed(1)} un` : ""}
        />

        <Select label="Motivo" value={form.motivo} onChange={e=>setForm({...form,motivo:e.target.value})}>
          {MOTIVOS.map(m=><option key={m}>{m}</option>)}
        </Select>

        <Input label="Observação (opcional)" value={form.observacao} onChange={e=>setForm({...form,observacao:e.target.value})} placeholder="Detalhes adicionais..."/>

        {erro && (
          <div style={{ padding:"10px 14px", borderRadius:8, background:"#EF444415", border:"1px solid #EF444430", marginBottom:12 }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#EF4444" }}>⚠️ {erro}</span>
          </div>
        )}

        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <button onClick={()=>{ setModal(false); setErro(""); }} style={{ flex:1, padding:"10px", borderRadius:8, background:bgElevated, border:`1px solid ${borderMid}`, color:t.textMuted||"#666", fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer" }}>
            Cancelar
          </button>
          <button onClick={registrar}
            disabled={!form.ingredienteId || !form.quantidade || excede}
            style={{
              flex:1, padding:"10px", borderRadius:8, border:"none",
              background: !form.ingredienteId||!form.quantidade||excede ? "#2A2A2A" : "linear-gradient(135deg,#34D399,#10B981)",
              color: !form.ingredienteId||!form.quantidade||excede ? "#555" : "#fff",
              fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600,
              cursor: !form.ingredienteId||!form.quantidade||excede ? "not-allowed" : "pointer",
              transition:"filter 0.15s",
            }}
            onMouseEnter={e=>{ if(form.ingredienteId&&form.quantidade&&!excede) e.currentTarget.style.filter="brightness(1.1)"; }}
            onMouseLeave={e=>e.currentTarget.style.filter="none"}
          >
            Confirmar Saída
          </button>
        </div>
      </Modal>
    </div>
  );
}