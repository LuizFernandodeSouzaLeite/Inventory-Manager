// src/pages/Produtos.jsx
// v4.0 — grid denso, widget lateral de detalhe, cadastro rápido.

import { useState, useMemo } from "react";
import Icon, { icons } from "../components/Icon";
import { Modal, Input, Select, BtnPrimary, BtnGhost } from "../components/UI";
import { uid } from "../utils/helpers";
import { calcEstoque } from "../utils/estoque";

const CATEGORIAS = ["Lanches","Acompanhamentos","Bebidas","Sobremesas","Outros"];
const EMOJIS_RAP = ["🍔","🌭","🍟","🥤","🍕","🥗","🍦","🧁","🥪","🌮"];
const FORM_VAZIO = { nome:"", categoria:"Lanches", preco:"", emoji:"🍔" };

// Cor por categoria
const CAT_COR = {
  Lanches:         "#F97316",
  Acompanhamentos: "#60A5FA",
  Bebidas:         "#34D399",
  Sobremesas:      "#A78BFA",
  Outros:          "#9CA3AF",
};

export default function Produtos({ produtos, setProdutos, ingredientes, lotes = [], t = {} }) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const accentGrad   = t.accentGrad   || "linear-gradient(135deg,#C9A84C,#9A7A2E)";
  const accentText   = t.accentText   || "#080808";
  const accentDark   = t.accentDark   || "#9A7A2E";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const border       = t.border       || "#1E1E1E";
  const borderMid    = t.borderMid    || "#252525";

  const [selecionado, setSelecionado] = useState(null); // produto no widget
  const [modal,       setModal]       = useState(false);
  const [editando,    setEditando]    = useState(null);
  const [confirmar,   setConfirmar]   = useState(null);
  const [form,        setForm]        = useState(FORM_VAZIO);
  const [receita,     setReceita]     = useState([]);
  const [busca,       setBusca]       = useState("");
  const [filtCat,     setFiltCat]     = useState("Todas");

  // Receita helpers
  const addItem    = () => setReceita(p => [...p, { ingredienteId:"", quantidade:1, unidade:"un" }]);
  const remItem    = i  => setReceita(p => p.filter((_,idx) => idx !== i));
  const updItem    = (i, field, val) => setReceita(p => p.map((r,idx) => idx !== i ? r : { ...r, [field]:val, unidade:"un" }));

  const abrirCriar = () => { setEditando(null); setForm(FORM_VAZIO); setReceita([]); setModal(true); };
  const abrirEditar = (p) => {
    setEditando(p);
    setForm({ nome:p.nome, categoria:p.categoria, preco:String(p.preco), emoji:p.emoji });
    setReceita(p.receita.map(r => ({ ...r, quantidade:String(r.quantidade), unidade:"un" })));
    setSelecionado(null);
    setModal(true);
  };

  const salvar = () => {
    const dados = {
      nome:      form.nome,
      categoria: form.categoria,
      preco:     Number(form.preco),
      emoji:     form.emoji,
      receita:   receita
        .filter(r => r.ingredienteId && r.quantidade)
        .map(r => ({ ingredienteId:r.ingredienteId, quantidade:Number(r.quantidade), unidade:"un" })),
    };
    if (editando) setProdutos(p => p.map(x => x.id===editando.id ? {...x,...dados} : x));
    else          setProdutos(p => [...p, { id:"PRD"+uid(), ...dados }]);
    setModal(false); setEditando(null); setForm(FORM_VAZIO); setReceita([]);
  };

  const excluir = () => {
    setProdutos(p => p.filter(x => x.id !== confirmar.id));
    if (selecionado?.id === confirmar.id) setSelecionado(null);
    setConfirmar(null);
  };

  // Filtros
  const filtrados = useMemo(() => produtos.filter(p => {
    const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCat   = filtCat==="Todas" || p.categoria===filtCat;
    return matchBusca && matchCat;
  }), [produtos, busca, filtCat]);

  // KPIs
  const totalProdutos = produtos.length;
  const precoMedio    = produtos.length > 0 ? produtos.reduce((s,p)=>s+p.preco,0)/produtos.length : 0;
  const maisLucr      = [...produtos].sort((a,b)=>b.preco-a.preco)[0];
  const catCount      = [...new Set(produtos.map(p=>p.categoria))].length;

  const labelConversao = (ing) => {
    if (!ing || (ing.unidade==="un" && (ing.fatorConversao??1)===1)) return "";
    return `= ${((ing.fatorConversao??1)).toFixed(3).replace(/\.?0+$/,"")} ${ing.unidade}`;
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.03em", color:"#EDE9DF" }}>
            Produtos & Receitas
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#3A3A3A", marginTop:5, letterSpacing:"0.06em" }}>
            CARDÁPIO · RECEITAS · BAIXA AUTOMÁTICA NO PEDIDO
          </p>
        </div>
        <button onClick={abrirCriar} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 22px", borderRadius:9, border:"none", background:accentGrad, color:accentText, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:600, cursor:"pointer", boxShadow:`0 2px 16px ${accentDim}`, transition:"filter 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.filter="none"}
        >
          <Icon d={icons.plus} size={16}/> Novo Produto
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"Total de Produtos", valor:totalProdutos,              cor:accent,    sub:"cadastrados"           },
          { label:"Preço Médio",       valor:`R$${precoMedio.toFixed(2)}`,cor:"#4ADE80", sub:"média do cardápio"    },
          { label:"Mais Caro",         valor:maisLucr?`R$${maisLucr.preco.toFixed(2)}`:"—", cor:"#F97316", sub:maisLucr?.nome||"—" },
          { label:"Categorias",        valor:catCount,                   cor:"#A78BFA", sub:"tipos diferentes"      },
        ].map(({ label, valor, cor, sub }) => (
          <div key={label} style={{ padding:"16px 18px", borderRadius:10, background:bgCard, border:`1px solid ${cor}25`, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-1, left:"15%", right:"15%", height:1, background:`linear-gradient(90deg,transparent,${cor}80,transparent)` }}/>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#3A3A3A", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>{label}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:24, fontWeight:600, color:cor, letterSpacing:"-0.03em", lineHeight:1 }}>{valor}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#2A2A2A", marginTop:5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 14px", height:36, borderRadius:8, background:bgCard, border:`1px solid ${border}` }}>
          <Icon d={icons.search} size={13} style={{ color:"#3A3A3A" }}/>
          <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar produto..."
            style={{ background:"transparent", border:"none", outline:"none", color:"#C8C4BC", fontSize:13, fontFamily:"'DM Sans',sans-serif", width:160 }}
          />
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {["Todas",...CATEGORIAS].map(c=>{
            const sel=filtCat===c; const cor=CAT_COR[c]||accent;
            return (
              <button key={c} onClick={()=>setFiltCat(c)} style={{ height:36, padding:"0 14px", borderRadius:8, fontSize:12.5, fontFamily:"'DM Sans',sans-serif", fontWeight:sel?600:400, background:sel?cor+"20":bgCard, color:sel?cor:"#555", border:`1px solid ${sel?cor+"40":border}`, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" }}
                onMouseEnter={e=>{ if(!sel){e.currentTarget.style.color="#C8C4BC";e.currentTarget.style.borderColor=borderMid;}}}
                onMouseLeave={e=>{ if(!sel){e.currentTarget.style.color="#555";e.currentTarget.style.borderColor=border;}}}
              >{c}</button>
            );
          })}
        </div>
        <span style={{ marginLeft:"auto", fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#3A3A3A" }}>
          {filtrados.length} produto{filtrados.length!==1?"s":""}
        </span>
      </div>

      {/* Layout: grid + widget lateral */}
      <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>

        {/* Grid de cards */}
        <div style={{ flex:1, minWidth:0, display:"grid", gap:10, gridTemplateColumns:`repeat(auto-fill,minmax(${selecionado?"180px":"220px"},1fr))` }}>
          {filtrados.map(p => {
            const catCor = CAT_COR[p.categoria] || accent;
            const isSel  = selecionado?.id === p.id;
            return (
              <div key={p.id}
                onClick={()=>setSelecionado(isSel?null:p)}
                style={{
                  background: isSel ? catCor+"18" : bgCard,
                  border: `1px solid ${isSel ? catCor+"50" : border}`,
                  borderRadius:10, padding:"14px 16px",
                  cursor:"pointer", transition:"all 0.18s",
                  boxShadow: isSel ? `0 0 0 1px ${catCor}30, 0 4px 20px #00000050` : "none",
                  position:"relative",
                }}
                onMouseEnter={e=>{ if(!isSel){ e.currentTarget.style.borderColor=borderMid; e.currentTarget.style.background=bgBody+"CC"; }}}
                onMouseLeave={e=>{ if(!isSel){ e.currentTarget.style.borderColor=border;    e.currentTarget.style.background=bgCard; }}}
              >
                {/* Badge categoria */}
                <div style={{ position:"absolute", top:10, right:10, padding:"2px 8px", borderRadius:5, background:catCor+"20", border:`1px solid ${catCor}30`, fontFamily:"'DM Mono',monospace", fontSize:9, color:catCor, letterSpacing:"0.06em" }}>
                  {p.categoria.slice(0,4).toUpperCase()}
                </div>

                {/* Emoji + preço */}
                <div style={{ fontSize:30, marginBottom:8, lineHeight:1 }}>{p.emoji}</div>
                <div style={{ fontSize:13.5, fontWeight:700, color:"#EDE9DF", marginBottom:3, paddingRight:52, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  {p.nome}
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:14, fontWeight:700, color:catCor, letterSpacing:"-0.02em", marginBottom:10 }}>
                  R$ {p.preco.toFixed(2)}
                </div>

                {/* Tags de ingredientes */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {p.receita.slice(0,3).map((r,i)=>{
                    const ing = ingredientes.find(x=>x.id===r.ingredienteId);
                    return (
                      <span key={i} style={{ fontSize:10, padding:"2px 7px", borderRadius:4, background:"#161616", border:`1px solid #1E1E1E`, color:"#555" }}>
                        {ing?.emoji} {r.quantidade}×
                      </span>
                    );
                  })}
                  {p.receita.length > 3 && (
                    <span style={{ fontSize:10, padding:"2px 5px", color:"#333", fontFamily:"'DM Mono',monospace" }}>+{p.receita.length-3}</span>
                  )}
                </div>

                {/* Indicador de seleção */}
                {isSel && (
                  <div style={{ position:"absolute", bottom:0, left:"20%", right:"20%", height:2, background:catCor, borderRadius:"2px 2px 0 0" }}/>
                )}
              </div>
            );
          })}

          {filtrados.length === 0 && (
            <div style={{ gridColumn:"1/-1", padding:"48px 0", textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>🍽️</div>
              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#2A2A2A" }}>Nenhum produto encontrado.</p>
            </div>
          )}
        </div>

        {/* ── Widget de detalhe lateral ─────────────────────────────────── */}
        {selecionado && (() => {
          const p      = selecionado;
          const catCor = CAT_COR[p.categoria] || accent;
          return (
            <div style={{ width:300, flexShrink:0, background:bgCard, border:`1px solid ${catCor}35`, borderRadius:12, overflow:"hidden", position:"sticky", top:0 }}>
              {/* Linha de cor no topo */}
              <div style={{ height:3, background:`linear-gradient(90deg,${catCor},${catCor}60)` }}/>

              {/* Header */}
              <div style={{ padding:"20px 20px 16px", borderBottom:`1px solid ${border}` }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                  <span style={{ fontSize:40 }}>{p.emoji}</span>
                  <button onClick={()=>setSelecionado(null)} style={{ width:28, height:28, borderRadius:7, background:"#141414", border:`1px solid ${border}`, color:"#444", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.color="#EDE9DF"; e.currentTarget.style.borderColor=borderMid; }}
                    onMouseLeave={e=>{ e.currentTarget.style.color="#444"; e.currentTarget.style.borderColor=border; }}
                  >
                    <Icon d={icons.x} size={13}/>
                  </button>
                </div>
                <div style={{ fontSize:17, fontWeight:700, color:"#EDE9DF", marginBottom:4 }}>{p.nome}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ padding:"2px 9px", borderRadius:5, background:catCor+"20", border:`1px solid ${catCor}30`, fontFamily:"'DM Mono',monospace", fontSize:10, color:catCor }}>
                    {p.categoria}
                  </span>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:700, color:catCor, letterSpacing:"-0.02em" }}>
                    R$ {p.preco.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Receita */}
              <div style={{ padding:"16px 20px", borderBottom:`1px solid ${border}` }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:catCor, letterSpacing:"0.12em", marginBottom:12 }}>
                  RECEITA — {p.receita.length} INGREDIENTE{p.receita.length!==1?"S":""}
                </div>
                {p.receita.map((r,i)=>{
                  const ing  = ingredientes.find(x=>x.id===r.ingredienteId);
                  const conv = labelConversao(ing);
                  const estOk = ing ? calcEstoque(lotes||[], ing.id) >= r.quantidade*(ing.fatorConversao??1) : true;
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                        {/* Indicador de estoque */}
                        <span style={{ width:6, height:6, borderRadius:"50%", background:estOk?"#22C55E":"#EF4444", flexShrink:0 }}/>
                        <span style={{ fontSize:13 }}>{ing?.emoji}</span>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:12.5, color:"#C8C4BC", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ing?.nome}</div>
                          {conv && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#3A3A3A", marginTop:1 }}>{r.quantidade} un {conv}</div>}
                        </div>
                      </div>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:600, color:"#EDE9DF", flexShrink:0, marginLeft:8 }}>
                        {r.quantidade} un
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legenda estoque */}
              <div style={{ padding:"10px 20px", borderBottom:`1px solid ${border}`, display:"flex", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#22C55E" }}/>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#3A3A3A" }}>Estoque OK</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#EF4444" }}/>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#3A3A3A" }}>Estoque baixo</span>
                </div>
              </div>

              {/* Ações */}
              <div style={{ padding:"14px 20px", display:"flex", gap:8 }}>
                <button onClick={()=>abrirEditar(p)} style={{ flex:1, padding:"9px", borderRadius:8, background:accentDim, border:`1px solid ${accentBorder}`, color:accent, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all 0.15s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=accentBorder; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=accentDim; }}
                >
                  <Icon d={icons.edit} size={14}/> Editar
                </button>
                <button onClick={()=>setConfirmar(p)} style={{ width:38, height:38, borderRadius:8, background:"#EF444415", border:"1px solid #EF444430", color:"#EF4444", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="#EF444425"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="#EF444415"; }}
                >
                  <Icon d={icons.trash} size={14}/>
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── Modal criar / editar ─────────────────────────────────────────── */}
      <Modal open={modal} onClose={()=>{ setModal(false); setEditando(null); }}
        title={editando ? `Editar — ${editando.emoji} ${editando.nome}` : "Novo Produto"}
        width="max-w-2xl"
      >
        {/* Linha 1: emoji rápido */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"#555", display:"block", marginBottom:8 }}>Emoji rápido</label>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {EMOJIS_RAP.map(e=>(
              <button key={e} onClick={()=>setForm(f=>({...f,emoji:e}))} style={{ width:36, height:36, borderRadius:8, fontSize:18, border:`1px solid ${form.emoji===e?accentBorder:border}`, background:form.emoji===e?accentDim:"#141414", cursor:"pointer", transition:"all 0.15s" }}>
                {e}
              </button>
            ))}
            <input value={form.emoji} onChange={e=>setForm(f=>({...f,emoji:e.target.value}))} placeholder="ou cole"
              style={{ width:60, padding:"0 8px", height:36, borderRadius:8, background:"#141414", border:`1px solid ${border}`, color:"#C8C4BC", fontSize:16, outline:"none", textAlign:"center" }}
            />
          </div>
        </div>

        {/* Linha 2: nome, categoria, preço */}
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:"0 12px" }}>
          <Input label="Nome do produto *" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Ex: X-Bacon"/>
          <Select label="Categoria" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}>
            {CATEGORIAS.map(c=><option key={c}>{c}</option>)}
          </Select>
          <Input label="Preço (R$)" type="number" value={form.preco} onChange={e=>setForm({...form,preco:e.target.value})} placeholder="0.00"/>
        </div>

        {/* Receita */}
        <div style={{ borderTop:`1px solid ${border}`, paddingTop:16, marginTop:4 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#EDE9DF" }}>
              Receita <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3A3A3A", marginLeft:6 }}>EM UNIDADES OPERACIONAIS</span>
            </span>
            <button onClick={addItem} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12.5, color:accent, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              <Icon d={icons.plus} size={13}/> Adicionar
            </button>
          </div>

          {receita.length===0 && (
            <div style={{ padding:"20px 0", textAlign:"center" }}>
              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#2A2A2A" }}>Nenhum ingrediente adicionado.</p>
              <button onClick={addItem} style={{ marginTop:8, padding:"7px 16px", borderRadius:7, background:accentDim, border:`1px solid ${accentBorder}`, color:accent, fontSize:12.5, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}>
                + Adicionar primeiro ingrediente
              </button>
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {receita.map((r,i)=>{
              const ing  = ingredientes.find(x=>x.id===r.ingredienteId);
              const conv = ing && ing.unidade!=="un" ? `→ ${(Number(r.quantidade)*(ing.fatorConversao??1)).toFixed(3).replace(/\.?0+$/,"")} ${ing.unidade}` : "";
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {/* Seletor */}
                  <select value={r.ingredienteId} onChange={e=>updItem(i,"ingredienteId",e.target.value)}
                    style={{ flex:1, padding:"8px 10px", borderRadius:7, background:"#141414", border:`1px solid ${borderMid}`, color:"#D4D0C8", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }}>
                    <option value="">Selecionar ingrediente...</option>
                    {ingredientes.map(x=><option key={x.id} value={x.id}>{x.emoji} {x.nome}</option>)}
                  </select>
                  {/* Quantidade */}
                  <input type="number" min="0.5" step="0.5" value={r.quantidade} onChange={e=>updItem(i,"quantidade",e.target.value)}
                    style={{ width:64, padding:"8px", borderRadius:7, background:"#141414", border:`1px solid ${borderMid}`, color:"#D4D0C8", fontSize:13, outline:"none", textAlign:"center", fontFamily:"'DM Mono',monospace" }}
                  />
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#555", width:18 }}>un</span>
                  {/* Conversão inline */}
                  {conv && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:accent+"70", whiteSpace:"nowrap" }}>{conv}</span>}
                  {/* Remover */}
                  <button onClick={()=>remItem(i)} style={{ width:28, height:28, borderRadius:6, background:"none", border:"none", color:"#333", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"color 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.color="#EF4444"}
                    onMouseLeave={e=>e.currentTarget.style.color="#333"}
                  ><Icon d={icons.x} size={14}/></button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview do produto */}
        {form.nome && (
          <div style={{ marginTop:16, padding:"12px 14px", borderRadius:8, background:accentDim, border:`1px solid ${accentBorder}`, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:22 }}>{form.emoji}</span>
            <div>
              <div style={{ fontSize:13.5, fontWeight:600, color:"#EDE9DF" }}>{form.nome}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:accent, marginTop:2 }}>
                {form.categoria} · R$ {Number(form.preco||0).toFixed(2)} · {receita.filter(r=>r.ingredienteId).length} ingrediente{receita.filter(r=>r.ingredienteId).length!==1?"s":""}
              </div>
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:10, marginTop:16 }}>
          <BtnGhost onClick={()=>{ setModal(false); setEditando(null); }} className="flex-1">Cancelar</BtnGhost>
          <BtnPrimary onClick={salvar} className="flex-1" disabled={!form.nome}>
            {editando ? "Salvar alterações" : "Salvar produto"}
          </BtnPrimary>
        </div>
      </Modal>

      {/* ── Modal confirmar exclusão ──────────────────────────────────────── */}
      <Modal open={!!confirmar} onClose={()=>setConfirmar(null)} title="Excluir produto" width="max-w-sm">
        <div style={{ textAlign:"center", padding:"12px 0 20px" }}>
          <div style={{ fontSize:44, marginBottom:12 }}>{confirmar?.emoji}</div>
          <p style={{ fontSize:14, color:"#C8C4BC", fontWeight:500, marginBottom:8 }}>
            Excluir <strong style={{ color:"#EDE9DF" }}>{confirmar?.nome}</strong>?
          </p>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#3A3A3A", lineHeight:1.7 }}>
            Esta ação não pode ser desfeita.<br/>O produto será removido permanentemente.
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <BtnGhost onClick={()=>setConfirmar(null)} className="flex-1 justify-center">Cancelar</BtnGhost>
          <button onClick={excluir} style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#EF4444,#B91C1C)", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"0 2px 12px #EF444425" }}>
            <Icon d={icons.trash} size={14}/> Excluir produto
          </button>
        </div>
      </Modal>
    </div>
  );
}