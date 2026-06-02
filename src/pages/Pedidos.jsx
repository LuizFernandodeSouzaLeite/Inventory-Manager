// src/pages/Pedidos.jsx
// v3.0 — visual premium, KPIs, tabela expansível, modal de novo pedido refinado.

import { useState, useMemo } from "react";
import Icon, { icons } from "../components/Icon";
import { Badge, Modal, Input } from "../components/UI";
import { consumirLotesFIFO } from "../utils/estoque";
import { fmtDataHora, uid, hoje } from "../utils/helpers";

const STATUS_STYLE = {
  entregue:  { color:"#4ADE80", bg:"#4ADE8015", border:"#4ADE8030", label:"Entregue"  },
  pendente:  { color:"#FBBF24", bg:"#FBBF2415", border:"#FBBF2430", label:"Pendente"  },
  cancelado: { color:"#F87171", bg:"#F8717115", border:"#F8717130", label:"Cancelado" },
};

export default function Pedidos({ pedidos, setPedidos, produtos, ingredientes, lotes, setLotes, movimentos, setMovimentos, financeiro, setFinanceiro, user, t = {} }) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const accentGrad   = t.accentGrad   || "linear-gradient(135deg,#C9A84C,#9A7A2E)";
  const accentText   = t.accentText   || "#080808";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const border       = t.border       || "#1E1E1E";
  const borderMid    = t.borderMid    || "#252525";

  const [modal,       setModal]       = useState(false);
  const [expandido,   setExpandido]   = useState(null);
  const [form,        setForm]        = useState({ mesa:"", observacao:"" });
  const [itensPedido, setItensPedido] = useState([]);
  const [filtroStatus,setFiltroStatus]= useState("Todos");
  const [busca,       setBusca]       = useState("");

  const proxNumero = pedidos.length > 0 ? Math.max(...pedidos.map(p=>p.numero))+1 : 1;

  // ── Filtros ───────────────────────────────────────────────────────────────
  const filtrados = useMemo(() => pedidos.filter(p => {
    const matchStatus = filtroStatus==="Todos" || p.status===filtroStatus;
    const matchBusca  = !busca || p.mesa?.toLowerCase().includes(busca.toLowerCase()) || String(p.numero).includes(busca);
    return matchStatus && matchBusca;
  }).sort((a,b)=>b.data.localeCompare(a.data)), [pedidos, filtroStatus, busca]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalPedidos  = pedidos.length;
  const pedidosHoje   = pedidos.filter(p=>p.data.startsWith(hoje())).length;
  const faturamento   = pedidos.reduce((s,p)=>s+p.total,0);
  const ticketMedio   = totalPedidos>0 ? faturamento/totalPedidos : 0;

  // ── Manipulação de itens ──────────────────────────────────────────────────
  const adicionarProduto = (produtoId) => {
    setItensPedido(prev => {
      const ex = prev.find(i=>i.produtoId===produtoId);
      if (ex) return prev.map(i=>i.produtoId===produtoId ? {...i,quantidade:i.quantidade+1} : i);
      return [...prev, { produtoId, quantidade:1, ajustes:[] }];
    });
  };
  const remProduto = (produtoId) => setItensPedido(prev=>prev.filter(i=>i.produtoId!==produtoId));
  const updQtd     = (produtoId, delta) =>
    setItensPedido(prev=>prev.map(i=>i.produtoId===produtoId ? {...i,quantidade:Math.max(1,i.quantidade+delta)} : i));

  const adicionarAjuste = (produtoId, ingredienteId, delta) => {
    if (!ingredienteId || !delta || isNaN(Number(delta))) return;
    const ing = ingredientes.find(x=>x.id===ingredienteId);
    setItensPedido(prev=>prev.map(item=>{
      if (item.produtoId!==produtoId) return item;
      const ex = item.ajustes.find(a=>a.ingredienteId===ingredienteId);
      const novos = ex
        ? item.ajustes.map(a=>a.ingredienteId!==ingredienteId?a:{...a,delta:a.delta+Number(delta),label:`${ing?.emoji} ${ing?.nome}: ${a.delta+Number(delta)>0?"+":""}${a.delta+Number(delta)} un`})
        : [...item.ajustes,{ingredienteId,delta:Number(delta),label:`${ing?.emoji} ${ing?.nome}: ${Number(delta)>0?"+":""}${Number(delta)} un`}];
      return {...item,ajustes:novos.filter(a=>a.delta!==0)};
    }));
  };
  const remAjuste = (produtoId, ingredienteId) =>
    setItensPedido(prev=>prev.map(i=>i.produtoId===produtoId?{...i,ajustes:i.ajustes.filter(a=>a.ingredienteId!==ingredienteId)}:i));

  const calcTotal = () => itensPedido.reduce((s,i)=>{
    const p=produtos.find(x=>x.id===i.produtoId); return s+(p?.preco||0)*i.quantidade;
  },0);

  // ── Confirmar pedido ──────────────────────────────────────────────────────
  const confirmarPedido = () => {
    let novosLotes=[...lotes]; const todosMov=[]; let semEstoque=false;
    for (const item of itensPedido) {
      const produto=produtos.find(p=>p.id===item.produtoId); if(!produto) continue;
      const consumoBase=produto.receita.map(r=>({ingredienteId:r.ingredienteId,quantidade:r.quantidade*item.quantidade}));
      for (const aj of item.ajustes||[]) {
        const idx=consumoBase.findIndex(c=>c.ingredienteId===aj.ingredienteId);
        if(idx>=0) consumoBase[idx].quantidade+=aj.delta*item.quantidade;
        else consumoBase.push({ingredienteId:aj.ingredienteId,quantidade:aj.delta*item.quantidade});
      }
      for (const consumo of consumoBase) {
        if(consumo.quantidade<=0) continue;
        const ing=ingredientes.find(i=>i.id===consumo.ingredienteId);
        const result=consumirLotesFIFO(novosLotes,ing||{id:consumo.ingredienteId,fatorConversao:1},consumo.quantidade);
        if(!result.sucesso){semEstoque=true;break;}
        novosLotes=result.novosLotes;
        result.consumidos.forEach(c=>todosMov.push({id:"MOV"+uid(),tipo:"saida",loteId:c.loteId,ingredienteId:c.ingredienteId,quantidade:c.quantidade,data:fmtDataHora(),usuario:user.nome,motivo:`Pedido #${proxNumero}`,pedidoId:"TMP"}));
      }
      if(semEstoque) break;
    }
    if(semEstoque){alert("Estoque insuficiente para um ou mais ingredientes!");return;}
    const novoPedido={id:"PED"+uid(),numero:proxNumero,status:"entregue",mesa:form.mesa,itens:itensPedido,total:calcTotal(),data:fmtDataHora(),usuario:user.nome,observacao:form.observacao};
    setLotes(novosLotes);
    setMovimentos(prev=>[...todosMov.map(m=>({...m,pedidoId:novoPedido.id})),...prev]);
    setPedidos(prev=>[novoPedido,...prev]);

    // ── Integração financeira: registra entrada de venda ──────────────────
    setFinanceiro(prev => ({
      ...prev,
      entradas: [{
        id:          "EFN" + novoPedido.id,
        tipo:        "venda",
        valor:       novoPedido.total,
        data:        novoPedido.data.slice(0, 10),
        descricao:   `Pedido #${novoPedido.numero} — Mesa ${novoPedido.mesa || "—"}`,
        produtoIds:  novoPedido.itens.map(i => i.produtoId),
      }, ...(prev.entradas || [])],
    }));

    setModal(false); setForm({mesa:"",observacao:""}); setItensPedido([]);
  };

  const COLS = "80px 120px 1fr 120px 120px 110px 160px 130px";

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.03em", color:"#EDE9DF" }}>Pedidos</h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#3A3A3A", marginTop:5, letterSpacing:"0.06em" }}>
            BAIXA AUTOMÁTICA VIA FIFO · VALIDADE PRIORITÁRIA
          </p>
        </div>
        <button onClick={()=>setModal(true)} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 22px", borderRadius:9, border:"none", background:accentGrad, color:accentText, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:600, cursor:"pointer", boxShadow:`0 2px 16px ${accentDim}`, transition:"filter 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.filter="none"}
        >
          <Icon d={icons.plus} size={16}/> Novo Pedido
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {[
          { label:"Total de Pedidos", valor:totalPedidos,              cor:accent,    sub:"registrados"        },
          { label:"Pedidos Hoje",     valor:pedidosHoje,               cor:"#4ADE80", sub:"feitos hoje"        },
          { label:"Faturamento",      valor:`R$${faturamento.toFixed(0)}`, cor:"#60A5FA", sub:"total acumulado" },
          { label:"Ticket Médio",     valor:`R$${ticketMedio.toFixed(2)}`, cor:"#A78BFA", sub:"por pedido"     },
        ].map(({ label, valor, cor, sub }) => (
          <div key={label} style={{ padding:"18px 20px", borderRadius:10, background:bgCard, border:`1px solid ${cor}25`, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-1, left:"15%", right:"15%", height:1, background:`linear-gradient(90deg,transparent,${cor}80,transparent)` }}/>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#3A3A3A", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>{label}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:28, fontWeight:600, color:cor, letterSpacing:"-0.04em", lineHeight:1 }}>{valor}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#2A2A2A", marginTop:6 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 14px", height:38, borderRadius:8, background:bgCard, border:`1px solid ${border}` }}>
          <Icon d={icons.search} size={13} style={{ color:"#3A3A3A" }}/>
          <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Mesa, número..."
            style={{ background:"transparent", border:"none", outline:"none", color:"#C8C4BC", fontSize:13, fontFamily:"'DM Sans',sans-serif", width:140 }}
          />
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["Todos","entregue","pendente","cancelado"].map(v=>{
            const sel=filtroStatus===v; const ts=STATUS_STYLE[v]; const cor=ts?.color||accent;
            return (
              <button key={v} onClick={()=>setFiltroStatus(v)} style={{ height:38, padding:"0 16px", borderRadius:8, fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:sel?600:400, background:sel?cor+"20":bgCard, color:sel?cor:"#555", border:`1px solid ${sel?cor+"40":border}`, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" }}
                onMouseEnter={e=>{ if(!sel){e.currentTarget.style.color="#C8C4BC";e.currentTarget.style.borderColor=borderMid;}}}
                onMouseLeave={e=>{ if(!sel){e.currentTarget.style.color="#555";e.currentTarget.style.borderColor=border;}}}
              >{v==="Todos"?"Todos":ts?.label}</button>
            );
          })}
        </div>
        <span style={{ marginLeft:"auto", fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#3A3A3A" }}>
          {filtrados.length} pedido{filtrados.length!==1?"s":""}
        </span>
      </div>

      {/* Tabela */}
      <div style={{ background:bgCard, border:`1px solid ${border}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:COLS, gap:16, padding:"12px 24px", background:bgBody, borderBottom:`1px solid ${border}` }}>
          {["Nº","MESA","ITENS","AJUSTES","TOTAL","STATUS","DATA","FUNCIONÁRIO"].map(h=>(
            <span key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#2A2A2A", letterSpacing:"0.12em" }}>{h}</span>
          ))}
        </div>

        {filtrados.length===0 && (
          <div style={{ padding:"40px 0", textAlign:"center" }}>
            <div style={{ fontSize:28, marginBottom:10 }}>🧾</div>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#2A2A2A" }}>Nenhum pedido encontrado.</p>
          </div>
        )}

        {filtrados.map((ped,idx)=>{
          const ts    = STATUS_STYLE[ped.status] || STATUS_STYLE.entregue;
          const isExp = expandido===ped.id;
          const temAjuste = ped.itens.some(i=>i.ajustes?.length>0);

          return (
            <div key={ped.id}>
              <div
                onClick={()=>setExpandido(isExp?null:ped.id)}
                style={{ display:"grid", gridTemplateColumns:COLS, gap:16, padding:"15px 24px", alignItems:"center", background:isExp?accentDim:"transparent", borderBottom:isExp?`1px solid ${accentBorder}`:idx<filtrados.length-1?`1px solid ${border}`:"none", cursor:"pointer", transition:"background 0.15s" }}
                onMouseEnter={e=>{ if(!isExp) e.currentTarget.style.background=bgBody+"BB"; }}
                onMouseLeave={e=>{ if(!isExp) e.currentTarget.style.background="transparent"; }}
              >
                {/* Número */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:14, fontWeight:800, color:isExp?accent:"#555" }}>
                  #{ped.numero}
                </span>

                {/* Mesa */}
                <div>
                  <div style={{ fontSize:13, color:"#EDE9DF", fontWeight:500 }}>Mesa {ped.mesa||"—"}</div>
                  {ped.observacao && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#3A3A3A", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ped.observacao}</div>}
                </div>

                {/* Itens */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {ped.itens.map((i,ii)=>{
                    const p=produtos.find(x=>x.id===i.produtoId);
                    return (
                      <span key={ii} style={{ fontSize:11.5, padding:"2px 8px", borderRadius:5, background:"#161616", border:`1px solid ${border}`, color:"#888", whiteSpace:"nowrap" }}>
                        {p?.emoji} {p?.nome} ×{i.quantidade}
                      </span>
                    );
                  })}
                </div>

                {/* Ajustes */}
                {temAjuste
                  ? <span style={{ display:"inline-flex", fontFamily:"'DM Mono',monospace", fontSize:10.5, fontWeight:600, padding:"3px 10px", borderRadius:5, background:"#60A5FA15", color:"#60A5FA", border:"1px solid #60A5FA30" }}>sim</span>
                  : <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#2A2A2A" }}>—</span>
                }

                {/* Total */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:14, fontWeight:700, color:"#EDE9DF" }}>
                  R$ {ped.total.toFixed(2)}
                </span>

                {/* Status */}
                <span style={{ display:"inline-flex", fontFamily:"'DM Mono',monospace", fontSize:10.5, fontWeight:600, padding:"4px 12px", borderRadius:6, background:ts.bg, color:ts.color, border:`1px solid ${ts.border}` }}>
                  {ts.label}
                </span>

                {/* Data */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#555" }}>
                  {ped.data?.slice(0,16).replace("T"," ")}
                </span>

                {/* Funcionário */}
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:24, height:24, borderRadius:6, background:accentDim, border:`1px solid ${accentBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700, color:accent }}>{ped.usuario?.slice(0,2).toUpperCase()}</span>
                  </div>
                  <span style={{ fontSize:12, color:"#555" }}>{ped.usuario?.split(" ")[0]}</span>
                </div>
              </div>

              {/* Painel expandido */}
              {isExp && (
                <div style={{ background:bgBody, borderBottom:idx<filtrados.length-1?`1px solid ${border}`:"none", padding:"22px 28px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:28 }}>
                  {/* Itens detalhados */}
                  <div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:accent, letterSpacing:"0.12em", marginBottom:14 }}>ITENS DO PEDIDO</div>
                    {ped.itens.map((item,i)=>{
                      const p=produtos.find(x=>x.id===item.produtoId);
                      return (
                        <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${border}` }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: item.ajustes?.length>0?8:0 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <span style={{ fontSize:16 }}>{p?.emoji}</span>
                              <div>
                                <div style={{ fontSize:13, color:"#EDE9DF", fontWeight:500 }}>{p?.nome}</div>
                                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3A3A3A", marginTop:1 }}>{item.quantidade}× · R${((p?.preco||0)*item.quantidade).toFixed(2)}</div>
                              </div>
                            </div>
                            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:accent, fontWeight:700 }}>
                              R${((p?.preco||0)*item.quantidade).toFixed(2)}
                            </span>
                          </div>
                          {item.ajustes?.length>0 && (
                            <div style={{ display:"flex", flexWrap:"wrap", gap:4, paddingLeft:24 }}>
                              {item.ajustes.map(a=>(
                                <span key={a.ingredienteId} style={{ fontSize:10.5, padding:"2px 8px", borderRadius:4, background:a.delta>0?"#4ADE8015":"#F8717115", border:`1px solid ${a.delta>0?"#4ADE8030":"#F8717130"}`, color:a.delta>0?"#4ADE80":"#F87171" }}>
                                  {a.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:12, marginTop:4 }}>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#555" }}>Total</span>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:800, color:"#EDE9DF" }}>R$ {ped.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Info do pedido */}
                  <div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:accent, letterSpacing:"0.12em", marginBottom:14 }}>INFORMAÇÕES</div>
                    {[
                      ["Pedido Nº",    `#${ped.numero}`],
                      ["Mesa",         ped.mesa||"—"],
                      ["Status",       STATUS_STYLE[ped.status]?.label||ped.status],
                      ["Funcionário",  ped.usuario],
                      ["Data/hora",    ped.data],
                      ["Observação",   ped.observacao||"—"],
                      ["ID",           ped.id],
                    ].map(([k,v])=>(
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${border}` }}>
                        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#3A3A3A" }}>{k}</span>
                        <span style={{ fontSize:12.5, color:"#C8C4BC", fontWeight:500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Modal novo pedido ─────────────────────────────────────────────── */}
      <Modal open={modal} onClose={()=>{ setModal(false); setItensPedido([]); setForm({mesa:"",observacao:""}); }}
        title={`Novo Pedido #${proxNumero}`} width="max-w-3xl"
      >
        {/* Mesa + obs */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px", marginBottom:4 }}>
          <Input label="Mesa / Identificação" value={form.mesa} onChange={e=>setForm({...form,mesa:e.target.value})} placeholder="Ex: 05, Balcão, Delivery..."/>
          <Input label="Observação geral" value={form.observacao} onChange={e=>setForm({...form,observacao:e.target.value})} placeholder="Sem cebola, bem passado..."/>
        </div>

        {/* Grid de produtos */}
        <div style={{ borderTop:`1px solid ${border}`, paddingTop:16, marginBottom:16 }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#3A3A3A", letterSpacing:"0.12em", marginBottom:12 }}>SELECIONE OS PRODUTOS</div>
          <div style={{ display:"grid", gap:8, gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))" }}>
            {produtos.map(p=>{
              const noItem=itensPedido.find(i=>i.produtoId===p.id);
              return (
                <button key={p.id} onClick={()=>adicionarProduto(p.id)} style={{
                  padding:"12px", borderRadius:10, textAlign:"left", cursor:"pointer", transition:"all 0.15s",
                  background: noItem ? accentDim : bgBody,
                  border: `1px solid ${noItem ? accentBorder : border}`,
                  boxShadow: noItem ? `0 0 0 1px ${accentBorder}` : "none",
                }}>
                  <div style={{ fontSize:22, marginBottom:6, lineHeight:1 }}>{p.emoji}</div>
                  <div style={{ fontSize:12.5, color:"#EDE9DF", fontWeight:600, marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.nome}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:noItem?accent:"#555" }}>R$ {p.preco.toFixed(2)}</div>
                  {noItem && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:accent, marginTop:4, fontWeight:700 }}>×{noItem.quantidade} no pedido</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Itens selecionados */}
        {itensPedido.length>0 && (
          <div style={{ borderTop:`1px solid ${border}`, paddingTop:16 }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#3A3A3A", letterSpacing:"0.12em", marginBottom:12 }}>ITENS DO PEDIDO</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
              {itensPedido.map(item=>{
                const p=produtos.find(x=>x.id===item.produtoId);
                return (
                  <ItemRow key={item.produtoId} item={item} produto={p} ingredientes={ingredientes}
                    onUpdQtd={delta=>updQtd(item.produtoId,delta)}
                    onRem={()=>remProduto(item.produtoId)}
                    onAjuste={(ingId,delta)=>adicionarAjuste(item.produtoId,ingId,delta)}
                    onRemAjuste={ingId=>remAjuste(item.produtoId,ingId)}
                    accent={accent} accentDim={accentDim} accentBorder={accentBorder}
                    border={border} borderMid={borderMid} bgBody={bgBody}
                  />
                );
              })}
            </div>

            {/* Total */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderRadius:9, background:accentDim, border:`1px solid ${accentBorder}` }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:accent, letterSpacing:"0.06em" }}>TOTAL DO PEDIDO</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:22, fontWeight:800, color:accent, letterSpacing:"-0.03em" }}>R$ {calcTotal().toFixed(2)}</span>
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:10, marginTop:16 }}>
          <button onClick={()=>{ setModal(false); setItensPedido([]); }} style={{ flex:1, padding:"10px", borderRadius:8, background:"#141414", border:`1px solid ${borderMid}`, color:"#666", fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer" }}>
            Cancelar
          </button>
          <button onClick={confirmarPedido} disabled={itensPedido.length===0} style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:itensPedido.length===0?"#2A2A2A":accentGrad, color:itensPedido.length===0?"#555":accentText, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, cursor:itensPedido.length===0?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"filter 0.15s" }}
            onMouseEnter={e=>{ if(itensPedido.length>0) e.currentTarget.style.filter="brightness(1.1)"; }}
            onMouseLeave={e=>e.currentTarget.style.filter="none"}
          >
            <Icon d={icons.check} size={15}/> Confirmar & Baixar Estoque
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ── Linha de item no modal ────────────────────────────────────────────────────
function ItemRow({ item, produto: p, ingredientes, onUpdQtd, onRem, onAjuste, onRemAjuste, accent, accentDim, accentBorder, border, borderMid, bgBody }) {
  const [ingSel,   setIngSel]   = useState("");
  const [deltaSel, setDeltaSel] = useState("");
  const [showAdj,  setShowAdj]  = useState(false);

  return (
    <div style={{ borderRadius:9, background:bgBody, border:`1px solid ${border}`, overflow:"hidden" }}>
      {/* Linha principal */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px" }}>
        <span style={{ fontSize:20, flexShrink:0 }}>{p?.emoji}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13.5, color:"#EDE9DF", fontWeight:600 }}>{p?.nome}</div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#555", marginTop:1 }}>R$ {p?.preco?.toFixed(2)} / un</div>
        </div>
        {/* Quantidade */}
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <button onClick={()=>onUpdQtd(-1)} style={{ width:28, height:28, borderRadius:7, background:"#1A1A1A", border:`1px solid ${border}`, color:"#666", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, transition:"all 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.color="#EDE9DF"; e.currentTarget.style.borderColor=borderMid; }}
            onMouseLeave={e=>{ e.currentTarget.style.color="#666"; e.currentTarget.style.borderColor=border; }}
          >−</button>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:15, fontWeight:700, color:"#EDE9DF", width:24, textAlign:"center" }}>{item.quantidade}</span>
          <button onClick={()=>onUpdQtd(+1)} style={{ width:28, height:28, borderRadius:7, background:"#1A1A1A", border:`1px solid ${border}`, color:"#666", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, transition:"all 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.color="#EDE9DF"; e.currentTarget.style.borderColor=borderMid; }}
            onMouseLeave={e=>{ e.currentTarget.style.color="#666"; e.currentTarget.style.borderColor=border; }}
          >+</button>
        </div>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:14, fontWeight:700, color:accent, width:70, textAlign:"right" }}>
          R${((p?.preco||0)*item.quantidade).toFixed(2)}
        </span>
        {/* Ajuste toggle */}
        <button onClick={()=>setShowAdj(s=>!s)} title="Ajustes de ingredientes" style={{ height:28, padding:"0 10px", borderRadius:7, background:showAdj||item.ajustes?.length>0?accentDim:"#1A1A1A", border:`1px solid ${showAdj||item.ajustes?.length>0?accentBorder:border}`, color:showAdj||item.ajustes?.length>0?accent:"#555", fontSize:10.5, fontFamily:"'DM Mono',monospace", cursor:"pointer", transition:"all 0.15s", flexShrink:0, display:"flex", alignItems:"center", gap:4 }}>
          <Icon d={icons.edit} size={12}/>{item.ajustes?.length>0?`${item.ajustes.length} ajuste${item.ajustes.length>1?"s":""}` : "ajustes"}
        </button>
        <button onClick={onRem} style={{ width:28, height:28, borderRadius:7, background:"#EF444415", border:"1px solid #EF444430", color:"#EF4444", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
          <Icon d={icons.x} size={13}/>
        </button>
      </div>

      {/* Painel de ajustes */}
      {showAdj && (
        <div style={{ borderTop:`1px solid ${border}`, padding:"12px 14px", background:"#0A0A0A" }}>
          {/* Ajustes existentes */}
          {item.ajustes?.length>0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:10 }}>
              {item.ajustes.map(a=>(
                <span key={a.ingredienteId} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, padding:"3px 9px", borderRadius:5, background:a.delta>0?"#4ADE8015":"#F8717115", border:`1px solid ${a.delta>0?"#4ADE8030":"#F8717130"}`, color:a.delta>0?"#4ADE80":"#F87171" }}>
                  {a.label}
                  <button onClick={()=>onRemAjuste(a.ingredienteId)} style={{ background:"none", border:"none", color:"inherit", cursor:"pointer", opacity:0.6, padding:0, display:"flex", alignItems:"center" }}>
                    <Icon d={icons.x} size={10}/>
                  </button>
                </span>
              ))}
            </div>
          )}
          {/* Novo ajuste */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <select value={ingSel} onChange={e=>setIngSel(e.target.value)} style={{ flex:1, padding:"7px 10px", borderRadius:7, background:"#141414", border:`1px solid ${borderMid}`, color:"#C8C4BC", fontSize:12.5, outline:"none", fontFamily:"'DM Sans',sans-serif" }}>
              <option value="">Ingrediente a ajustar...</option>
              <optgroup label="Receita base">
                {p?.receita.map(r=>{ const ing=ingredientes.find(x=>x.id===r.ingredienteId); return <option key={r.ingredienteId} value={r.ingredienteId}>{ing?.emoji} {ing?.nome} (base: {r.quantidade} un)</option>; })}
              </optgroup>
              <optgroup label="Extra">
                {ingredientes.filter(i=>!p?.receita.find(r=>r.ingredienteId===i.id)).map(i=><option key={i.id} value={i.id}>{i.emoji} {i.nome}</option>)}
              </optgroup>
            </select>
            <input type="number" step="0.5" value={deltaSel} onChange={e=>setDeltaSel(e.target.value)} placeholder="±Qtd"
              style={{ width:72, padding:"7px 8px", borderRadius:7, background:"#141414", border:`1px solid ${borderMid}`, color:"#C8C4BC", fontSize:13, outline:"none", textAlign:"center", fontFamily:"'DM Mono',monospace" }}
            />
            <button onClick={()=>{ onAjuste(ingSel,deltaSel); setIngSel(""); setDeltaSel(""); }} style={{ height:34, padding:"0 14px", borderRadius:7, background:accentDim, border:`1px solid ${accentBorder}`, color:accent, fontSize:12.5, fontFamily:"'DM Sans',sans-serif", fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
              + Ajuste
            </button>
          </div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#2A2A2A", marginTop:6 }}>
            Positivo = adicionar · Negativo = remover · Ex: +1 = carne dupla, -1 = sem queijo
          </div>
        </div>
      )}
    </div>
  );
}