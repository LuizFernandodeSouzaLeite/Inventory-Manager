// src/pages/Entradas.jsx
// v3.0 — visual premium, KPIs, tabela expansível, modal refinado.

import { useState, useMemo } from "react";
import Icon, { icons } from "../components/Icon";
import { Badge, Modal, Input, Select } from "../components/UI";
import { hoje, addDias, fmtData, fmtDataHora, diasAte, uid } from "../utils/helpers";

export default function Entradas({ ingredientes, lotes, setLotes, movimentos, setMovimentos, financeiro, setFinanceiro, user, t = {} }) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const accentGrad   = t.accentGrad   || "linear-gradient(135deg,#C9A84C,#9A7A2E)";
  const accentText   = t.accentText   || "#080808";
  const accentDark   = t.accentDark   || "#9A7A2E";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const border       = t.border       || "#1E1E1E";
  const bgElevated   = t.bgElevated   || "#141414";
  const borderMid    = t.borderMid    || "#252525";

  const [modal,      setModal]      = useState(false);
  const [expandido,  setExpandido]  = useState(null);
  const [busca,      setBusca]      = useState("");
  const [filtroIng,  setFiltroIng]  = useState("Todos");
  const [form, setForm] = useState({
    ingredienteId:"", quantidade:"", custo:"",
    fornecedor:"", observacao:"",
    dataValidade:"", modoValidade:"automatica",
  });

  const entradas = movimentos
    .filter(m => m.tipo === "entrada")
    .sort((a,b) => b.data.localeCompare(a.data));

  const filtradas = entradas.filter(m => {
    const ing = ingredientes.find(i => i.id === m.ingredienteId);
    const matchBusca  = !busca || ing?.nome.toLowerCase().includes(busca.toLowerCase());
    const matchFiltro = filtroIng === "Todos" || m.ingredienteId === filtroIng;
    return matchBusca && matchFiltro;
  });

  const ingSel       = ingredientes.find(i => i.id === form.ingredienteId);
  const validadeAuto = ingSel ? addDias(ingSel.prazoValidade) : "";

  // KPIs
  const totalEntradas    = entradas.length;
  const custoTotal       = lotes.reduce((s,l) => s + (l.custo||0), 0);
  const entHoje          = entradas.filter(m => m.data.startsWith(hoje())).length;
  const fornecedores     = new Set(lotes.map(l => l.fornecedor).filter(Boolean)).size;
  const ultimaEntrada    = entradas[0];
  const ultimoIng        = ingredientes.find(i => i.id === ultimaEntrada?.ingredienteId);

  const registrar = () => {
    const validade = form.modoValidade === "automatica" ? validadeAuto : form.dataValidade;
    const proxNum  = lotes.filter(l => l.ingredienteId === form.ingredienteId).length + 1;
    const novoLote = {
      id: "LOT" + uid(),
      ingredienteId: form.ingredienteId,
      numero: proxNum,
      quantidade: Number(form.quantidade),
      quantidadeRestante: Number(form.quantidade),
      dataEntrada: hoje(),
      dataValidade: validade,
      custo: Number(form.custo) || 0,
      fornecedor: form.fornecedor.trim() || null,
      observacao: form.observacao,
      usuario: user.nome,
    };
    const novoMov = {
      id: "MOV" + uid(), tipo: "entrada", loteId: novoLote.id,
      ingredienteId: form.ingredienteId,
      quantidade: Number(form.quantidade),
      data: fmtDataHora(), usuario: user.nome,
      motivo: form.fornecedor ? `Compra — ${form.fornecedor}` : "Entrada de estoque",
      pedidoId: null,
    };
    setLotes(prev => [...prev, novoLote]);
    setMovimentos(prev => [novoMov, ...prev]);

    // ── Integração financeira: compra de matéria-prima ────────────────────
    if (Number(form.custo) > 0) {
      setFinanceiro(prev => ({
        ...prev,
        saidas: [{
          id:        "SFN_BUY_" + novoLote.id,
          tipo:      "compra",
          valor:     Number(form.custo),
          data:      novoLote.dataEntrada,
          descricao: `Compra — ${ingSel?.nome}${form.fornecedor ? " (" + form.fornecedor + ")" : ""}`,
          categoria: "Matéria-prima",
        }, ...(prev.saidas || [])],
      }));
    }

    setModal(false);
    setForm({ ingredienteId:"", quantidade:"", custo:"", fornecedor:"", observacao:"", dataValidade:"", modoValidade:"automatica" });
  };

  const COLS = "1.6fr 1.2fr 100px 80px 110px 110px 110px 120px";

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.03em", color:t.textPrimary||"#EDE9DF" }}>
            Entradas de Estoque
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t.textDim||"#3A3A3A", marginTop:5, letterSpacing:"0.06em" }}>
            REGISTRO DE LOTES · VALIDADE AUTOMÁTICA OU MANUAL
          </p>
        </div>
        <button onClick={()=>setModal(true)} style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"10px 22px", borderRadius:9, border:"none",
          background:"linear-gradient(135deg,#10b981,#059669)",
          color:"#fff", fontFamily:"'DM Sans',sans-serif",
          fontSize:13.5, fontWeight:600, cursor:"pointer",
          boxShadow:"0 2px 16px #10b98130", transition:"filter 0.15s",
        }}
          onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.filter="none"}
        >
          <Icon d={icons.plus} size={16}/> Registrar Entrada
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {[
          { label:"Total de Entradas", valor:totalEntradas,          cor:"#4ADE80", sub:"lotes registrados"   },
          { label:"Entradas Hoje",     valor:entHoje,                cor:accent,    sub:"registradas hoje"    },
          { label:"Custo Total",       valor:`R$${custoTotal.toFixed(0)}`, cor:"#60A5FA", sub:"soma de todos os lotes" },
          { label:"Fornecedores",      valor:fornecedores,           cor:"#A78BFA", sub:"diferentes cadastrados" },
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
            style={{ background:"transparent", border:"none", outline:"none", color:t.textSecondary||"#C8C4BC", fontSize:13, fontFamily:"'DM Sans',sans-serif", width:200 }}
          />
        </div>

        <div style={{ width:1, height:38, background:border }}/>

        {/* Filtro por ingrediente */}
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
          {filtradas.length} entrada{filtradas.length!==1?"s":""}
        </span>
      </div>

      {/* Tabela */}
      <div style={{ background:bgCard, border:`1px solid ${border}`, borderRadius:12, overflow:"hidden" }}>
        {/* Header */}
        <div style={{ display:"grid", gridTemplateColumns:COLS, gap:16, padding:"12px 24px", background:bgBody, borderBottom:`1px solid ${border}` }}>
          {["INGREDIENTE","FORNECEDOR","QTD","LOTE","ENTRADA","VALIDADE","CUSTO","POR"].map(h=>(
            <span key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textDim||"#2A2A2A", letterSpacing:"0.12em" }}>{h}</span>
          ))}
        </div>

        {filtradas.length === 0 && (
          <div style={{ padding:"40px 0", textAlign:"center" }}>
            <div style={{ fontSize:28, marginBottom:10 }}>📦</div>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textGhost||"#2A2A2A" }}>Nenhuma entrada encontrada.</p>
          </div>
        )}

        {filtradas.map((m, idx) => {
          const lote = lotes.find(l => l.id === m.loteId);
          const ing  = ingredientes.find(i => i.id === m.ingredienteId);
          const dias = lote ? diasAte(lote.dataValidade) : null;
          const isExp = expandido === m.id;
          const fornecedor = lote?.fornecedor || lote?.observacao || "—";

          const diasCor = dias === null ? "#555"
            : dias < 0  ? "#EF4444"
            : dias <= 3 ? "#F97316"
            : dias <= 7 ? "#FBBF24"
            : "#555";

          const validadeCor = dias !== null && dias < 0 ? "#EF4444"
            : dias !== null && dias <= 3 ? "#F97316"
            : "#C8C4BC";

          return (
            <div key={m.id}>
              {/* Linha */}
              <div
                onClick={()=>setExpandido(isExp?null:m.id)}
                style={{
                  display:"grid", gridTemplateColumns:COLS, gap:16,
                  padding:"15px 24px", alignItems:"center",
                  background: isExp ? accentDim : "transparent",
                  borderBottom: isExp ? `1px solid ${accentBorder}` : idx<filtradas.length-1 ? `1px solid ${border}` : "none",
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

                {/* Fornecedor */}
                <span style={{ fontSize:12.5, color:t.textMuted||"#666", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{fornecedor}</span>

                {/* Quantidade */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:"#4ADE80", fontWeight:700 }}>
                  +{m.quantidade} <span style={{ fontSize:10, color:"#4ADE8080" }}>{ing?.unidade}</span>
                </span>

                {/* Lote */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:isExp?accent:"#555", fontWeight:isExp?700:400 }}>
                  {lote ? `L${String(lote.numero).padStart(2,"0")}` : "—"}
                </span>

                {/* Entrada */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11.5, color:t.textMuted||"#555" }}>
                  {m.data?.slice(0,10).split("-").reverse().join("/")}
                </span>

                {/* Validade */}
                <div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:validadeCor, fontWeight:500 }}>
                    {lote ? fmtData(lote.dataValidade) : "—"}
                  </div>
                  {dias !== null && (
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:diasCor, marginTop:2 }}>
                      {dias < 0 ? `venceu há ${Math.abs(dias)}d` : `vence em ${dias}d`}
                    </div>
                  )}
                </div>

                {/* Custo */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:accent, fontWeight:600 }}>
                  {lote?.custo ? `R$${lote.custo.toFixed(2)}` : "—"}
                </span>

                {/* Usuário */}
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:24, height:24, borderRadius:6, background:accentDim, border:`1px solid ${accentBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700, color:accent }}>
                      {m.usuario?.slice(0,2).toUpperCase()}
                    </span>
                  </div>
                  <span style={{ fontSize:12, color:t.textMuted||"#555", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {m.usuario?.split(" ")[0]}
                  </span>
                </div>
              </div>

              {/* Painel expandido */}
              {isExp && (
                <div style={{ background:bgBody, borderBottom:idx<filtradas.length-1?`1px solid ${border}`:"none", padding:"22px 28px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:28 }}>
                  {/* Info do lote */}
                  <div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:accent, letterSpacing:"0.12em", marginBottom:14 }}>DETALHES DA ENTRADA</div>
                    {[
                      ["ID Movimentação", m.id],
                      ["ID Lote",         lote?.id || "—"],
                      ["Ingrediente",     `${ing?.emoji} ${ing?.nome}`],
                      ["Quantidade",      `${m.quantidade} ${ing?.unidade}`],
                      ["Fornecedor",      lote?.fornecedor || "Não informado"],
                      ["Custo total",     lote?.custo ? `R$${lote.custo.toFixed(2)}` : "Não informado"],
                      ["Custo unitário",  lote?.custo && m.quantidade ? `R$${(lote.custo/m.quantidade).toFixed(3)} / ${ing?.unidade}` : "—"],
                      ["Validade",        lote ? fmtData(lote.dataValidade) : "—"],
                      ["Registrado por",  m.usuario],
                      ["Data/hora",       m.data],
                      ["Observação",      lote?.observacao || "—"],
                    ].map(([k,v])=>(
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${border}` }}>
                        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t.textDim||"#3A3A3A" }}>{k}</span>
                        <span style={{ fontSize:12.5, color:t.textSecondary||"#C8C4BC", fontWeight:500, maxWidth:260, textAlign:"right", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status atual do lote */}
                  <div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:accent, letterSpacing:"0.12em", marginBottom:14 }}>STATUS ATUAL DO LOTE</div>
                    {lote ? (
                      <>
                        {/* Barra de consumo */}
                        {(() => {
                          const pct = lote.quantidade > 0 ? (lote.quantidadeRestante/lote.quantidade)*100 : 0;
                          const barCor = pct>50?"#22C55E":pct>20?"#F97316":"#EF4444";
                          return (
                            <div style={{ marginBottom:20 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textMuted||"#555" }}>Restante</span>
                                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:14, color:barCor, fontWeight:700 }}>
                                  {lote.quantidadeRestante} / {lote.quantidade} {ing?.unidade}
                                </span>
                              </div>
                              <div style={{ height:8, borderRadius:4, background:bgElevated, overflow:"hidden", marginBottom:6 }}>
                                <div style={{ height:"100%", width:`${pct}%`, background:barCor, borderRadius:4, boxShadow:`0 0 8px ${barCor}60` }}/>
                              </div>
                              <div style={{ display:"flex", justifyContent:"space-between" }}>
                                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textGhost||"#2A2A2A" }}>0%</span>
                                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:barCor, fontWeight:700 }}>{pct.toFixed(1)}% restante</span>
                                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textGhost||"#2A2A2A" }}>100%</span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Validade */}
                        <div style={{ padding:"14px 16px", borderRadius:8, background:bgCard, border:`1px solid ${dias!==null&&dias<0?"#EF444430":dias!==null&&dias<=3?"#F9731630":border}` }}>
                          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textDim||"#3A3A3A", letterSpacing:"0.08em", marginBottom:6 }}>VALIDADE</div>
                          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:700, color:validadeCor }}>
                            {fmtData(lote.dataValidade)}
                          </div>
                          {dias !== null && (
                            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:diasCor, marginTop:4 }}>
                              {dias < 0 ? `⚠️ Venceu há ${Math.abs(dias)} dia(s)` : dias === 0 ? "⚠️ Vence hoje" : `✓ Vence em ${dias} dia(s)`}
                            </div>
                          )}
                        </div>
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
      <Modal open={modal} onClose={()=>setModal(false)} title="Registrar Entrada de Lote" width="max-w-lg">
        <Select label="Ingrediente *" value={form.ingredienteId} onChange={e=>setForm({...form,ingredienteId:e.target.value})}>
          <option value="">Selecione o ingrediente...</option>
          {ingredientes.map(i=><option key={i.id} value={i.id}>{i.emoji} {i.nome}</option>)}
        </Select>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
          <Input label={`Quantidade (${ingSel?.unidade||"un"}) *`} type="number" value={form.quantidade} onChange={e=>setForm({...form,quantidade:e.target.value})} placeholder="0"/>
          <Input label="Custo total (R$)" type="number" value={form.custo} onChange={e=>setForm({...form,custo:e.target.value})} placeholder="0.00"/>
        </div>

        <Input label="Fornecedor" value={form.fornecedor} onChange={e=>setForm({...form,fornecedor:e.target.value})} placeholder="Ex: Frigorífico Bom, Distribuidora X..."/>

        {/* Validade */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, letterSpacing:"0.1em", textTransform:"uppercase", color:t.textMuted||"#555", display:"block", marginBottom:8 }}>Validade</label>
          <div style={{ display:"flex", gap:6, marginBottom:10 }}>
            {[["automatica","Automática"],["manual","Manual"]].map(([v,l])=>(
              <button key={v} onClick={()=>setForm({...form,modoValidade:v})} style={{
                flex:1, padding:"9px", borderRadius:8, fontSize:13,
                fontFamily:"'DM Sans',sans-serif", fontWeight:500, cursor:"pointer",
                background:form.modoValidade===v?"linear-gradient(135deg,#10b981,#059669)":"#141414",
                color:form.modoValidade===v?"#fff":"#555",
                border:`1px solid ${form.modoValidade===v?"#10b981":"#252525"}`,
                transition:"all 0.15s",
              }}>{l}</button>
            ))}
          </div>
          {form.modoValidade==="automatica" ? (
            ingSel ? (
              <div style={{ padding:"12px 14px", borderRadius:8, background:"#10b98110", border:"1px solid #10b98130" }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12.5, color:"#4ADE80" }}>
                  Validade: <strong>{fmtData(validadeAuto)}</strong>
                </span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t.textMuted||"#555", marginLeft:10 }}>
                  ({ingSel.prazoValidade} dias)
                </span>
              </div>
            ) : (
              <div style={{ padding:"12px 14px", borderRadius:8, background:bgElevated, border:`1px solid ${borderMid}` }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textDim||"#3A3A3A" }}>Selecione um ingrediente primeiro</span>
              </div>
            )
          ) : (
            <Input label="" type="date" value={form.dataValidade} onChange={e=>setForm({...form,dataValidade:e.target.value})}/>
          )}
        </div>

        {/* Custo unitário calculado */}
        {form.custo && form.quantidade && ingSel && (
          <div style={{ padding:"10px 14px", borderRadius:8, background:accentDim, border:`1px solid ${accentBorder}`, marginBottom:16 }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:accent }}>
              Custo unitário: <strong>R${(Number(form.custo)/Number(form.quantidade)).toFixed(4)} / {ingSel.unidade}</strong>
            </span>
          </div>
        )}

        <Input label="Observação (opcional)" value={form.observacao} onChange={e=>setForm({...form,observacao:e.target.value})} placeholder="Nota fiscal, observações..."/>

        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <button onClick={()=>setModal(false)} style={{ flex:1, padding:"10px", borderRadius:8, background:bgElevated, border:`1px solid ${borderMid}`, color:t.textMuted||"#666", fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer" }}>
            Cancelar
          </button>
          <button onClick={registrar} disabled={!form.ingredienteId||!form.quantidade} style={{
            flex:1, padding:"10px", borderRadius:8, border:"none",
            background:!form.ingredienteId||!form.quantidade?"#2A2A2A":"linear-gradient(135deg,#34D399,#10B981)",
            color:!form.ingredienteId||!form.quantidade?"#555":"#fff",
            fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600,
            cursor:!form.ingredienteId||!form.quantidade?"not-allowed":"pointer",
            transition:"filter 0.15s",
          }}
            onMouseEnter={e=>{ if(form.ingredienteId&&form.quantidade) e.currentTarget.style.filter="brightness(1.1)"; }}
            onMouseLeave={e=>e.currentTarget.style.filter="none"}
          >
            Confirmar Entrada
          </button>
        </div>
      </Modal>
    </div>
  );
}