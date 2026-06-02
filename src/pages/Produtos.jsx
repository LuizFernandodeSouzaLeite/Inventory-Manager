// src/pages/Produtos.jsx
// v3.0 — receita sempre em "un" (unidade operacional).
//         Mostra conversão ao lado: "1 un = 0.15kg" para o usuário entender.

import { useState } from "react";
import Icon, { icons } from "../components/Icon";
import { Badge, Card, Modal, Input, Select, BtnPrimary, BtnGhost } from "../components/UI";
import { uid } from "../utils/helpers";

const FORM_VAZIO = { nome: "", categoria: "Lanches", preco: "", emoji: "🍔" };

export default function Produtos({ produtos, setProdutos, ingredientes, t = {} }) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const border       = t.border       || "#1E1E1E";
  const borderMid    = t.borderMid    || "#252525";

  const [modal,      setModal]      = useState(false);
  const [verReceita, setVerReceita] = useState(null);
  const [editando,   setEditando]   = useState(null);
  const [confirmar,  setConfirmar]  = useState(null);
  const [form,       setForm]       = useState(FORM_VAZIO);
  const [receita,    setReceita]    = useState([]);

  // ── Receita helpers ──────────────────────────────────────────────────────
  // Sempre adiciona com unidade "un" — nunca kg/g/ml
  const adicionarItem = () =>
    setReceita(prev => [...prev, { ingredienteId: "", quantidade: 1, unidade: "un" }]);

  const remItem = (i) => setReceita(prev => prev.filter((_, idx) => idx !== i));

  const updItem = (i, field, val) =>
    setReceita(prev => prev.map((r, idx) => {
      if (idx !== i) return r;
      return {
        ...r,
        [field]: val,
        // unidade SEMPRE "un" — independente do ingrediente selecionado
        unidade: "un",
      };
    }));

  // ── Modais ───────────────────────────────────────────────────────────────
  const abrirCriar = () => {
    setEditando(null);
    setForm(FORM_VAZIO);
    setReceita([]);
    setModal(true);
  };

  const abrirEditar = (p, e) => {
    e?.stopPropagation();
    setEditando(p);
    setForm({ nome: p.nome, categoria: p.categoria, preco: String(p.preco), emoji: p.emoji });
    // Garante que todos os itens da receita existente também ficam em "un"
    setReceita(p.receita.map(r => ({ ...r, quantidade: String(r.quantidade), unidade: "un" })));
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
        .map(r => ({ ingredienteId: r.ingredienteId, quantidade: Number(r.quantidade), unidade: "un" })),
    };
    if (editando) {
      setProdutos(prev => prev.map(p => p.id === editando.id ? { ...p, ...dados } : p));
    } else {
      setProdutos(prev => [...prev, { id: "PRD" + uid(), ...dados }]);
    }
    setModal(false);
    setEditando(null);
    setForm(FORM_VAZIO);
    setReceita([]);
  };

  const excluir = () => {
    setProdutos(prev => prev.filter(p => p.id !== confirmar.id));
    setConfirmar(null);
  };

  // Label de conversão: mostra o que "1 un" representa em unidade base
  const labelConversao = (ing) => {
    if (!ing) return "";
    if (ing.unidade === "un" && (ing.fatorConversao ?? 1) === 1) return "";
    return `1 un = ${ing.fatorConversao ?? 1} ${ing.unidade}`;
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.03em", color:"#EDE9DF" }}>
            Produtos & Receitas
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#3A3A3A", marginTop:5, letterSpacing:"0.04em" }}>
            RECEITAS EM UNIDADES · BAIXA AUTOMÁTICA NO PEDIDO
          </p>
        </div>
        <button onClick={abrirCriar} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:8, border:"none", background:`linear-gradient(135deg,${accent},${t.accentDark||"#9A7A2E"})`, color:t.accentText||"#080808", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:`0 2px 12px ${accentDim}`, transition:"filter 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.filter="none"}
        >
          <Icon d={icons.plus} size={15}/> Novo Produto
        </button>
      </div>

      {/* Grid de cards */}
      <div style={{ display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))" }}>
        {produtos.map(p => (
          <ProdutoCard key={p.id} produto={p} ingredientes={ingredientes}
            onVer={() => setVerReceita(p)}
            onEditar={e => abrirEditar(p, e)}
            onExcluir={e => { e.stopPropagation(); setConfirmar(p); }}
            accent={accent} accentDim={accentDim} accentBorder={accentBorder}
            bgCard={bgCard} border={border}
          />
        ))}
        {produtos.length === 0 && (
          <div style={{ gridColumn:"1/-1", padding:"48px 0", textAlign:"center" }}>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#2A2A2A" }}>Nenhum produto cadastrado ainda.</p>
          </div>
        )}
      </div>

      {/* ── Modal criar / editar ─────────────────────────────────────────── */}
      <Modal open={modal} onClose={() => { setModal(false); setEditando(null); }}
        title={editando ? `Editar — ${editando.emoji} ${editando.nome}` : "Novo Produto"}
        width="max-w-2xl"
      >
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
          <Input label="Nome do produto *" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Ex: X-Bacon"/>
          <Input label="Emoji" value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})}/>
          <Select label="Categoria" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}>
            {["Lanches","Acompanhamentos","Bebidas","Sobremesas","Outros"].map(c=><option key={c}>{c}</option>)}
          </Select>
          <Input label="Preço (R$)" type="number" value={form.preco} onChange={e=>setForm({...form,preco:e.target.value})} placeholder="0.00"/>
        </div>

        {/* Receita */}
        <div style={{ borderTop:`1px solid ${border}`, marginTop:4, paddingTop:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <span style={{ fontSize:13, fontWeight:600, color:"#EDE9DF" }}>Receita</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3A3A3A", marginLeft:8, letterSpacing:"0.06em" }}>
                QUANTIDADES EM UNIDADES OPERACIONAIS
              </span>
            </div>
            <button onClick={adicionarItem} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:accent, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"color 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.7"}
              onMouseLeave={e=>e.currentTarget.style.opacity="1"}
            >
              <Icon d={icons.plus} size={13}/> Adicionar ingrediente
            </button>
          </div>

          {receita.length === 0 && (
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#2A2A2A", marginBottom:12 }}>
              Nenhum ingrediente adicionado ainda.
            </p>
          )}

          {receita.map((r, i) => {
            const ing = ingredientes.find(x => x.id === r.ingredienteId);
            const conv = labelConversao(ing);
            const totalBase = ing && r.quantidade
              ? (Number(r.quantidade) * (ing.fatorConversao ?? 1)).toFixed(3).replace(/\.?0+$/, "") + " " + ing.unidade
              : null;

            return (
              <div key={i} style={{ marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {/* Seletor de ingrediente */}
                  <select value={r.ingredienteId}
                    onChange={e => updItem(i, "ingredienteId", e.target.value)}
                    style={{ flex:1, padding:"8px 10px", borderRadius:7, background:"#141414", border:`1px solid ${borderMid}`, color:"#D4D0C8", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }}
                  >
                    <option value="">Selecionar ingrediente...</option>
                    {ingredientes.map(x => (
                      <option key={x.id} value={x.id}>{x.emoji} {x.nome}</option>
                    ))}
                  </select>

                  {/* Quantidade em "un" */}
                  <input type="number" min="0.5" step="0.5"
                    value={r.quantidade}
                    onChange={e => updItem(i, "quantidade", e.target.value)}
                    placeholder="Qtd"
                    style={{ width:68, padding:"8px", borderRadius:7, background:"#141414", border:`1px solid ${borderMid}`, color:"#D4D0C8", fontSize:13, outline:"none", textAlign:"center", fontFamily:"'DM Mono',monospace" }}
                  />

                  {/* Rótulo fixo "un" */}
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#555", width:22, textAlign:"center" }}>un</span>

                  {/* Remover */}
                  <button onClick={() => remItem(i)} style={{ color:"#333", background:"none", border:"none", cursor:"pointer", padding:4, borderRadius:5, transition:"color 0.15s", flexShrink:0 }}
                    onMouseEnter={e=>e.currentTarget.style.color="#EF4444"}
                    onMouseLeave={e=>e.currentTarget.style.color="#333"}
                  >
                    <Icon d={icons.x} size={14}/>
                  </button>
                </div>

                {/* Info de conversão — aparece quando ingrediente selecionado */}
                {ing && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4, paddingLeft:4 }}>
                    {conv && (
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#3A3A3A", letterSpacing:"0.04em" }}>
                        {conv}
                      </span>
                    )}
                    {totalBase && r.quantidade > 0 && (
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:accent+"80", letterSpacing:"0.04em" }}>
                        → baixa {totalBase} do estoque
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <BtnGhost onClick={() => { setModal(false); setEditando(null); }} className="flex-1">Cancelar</BtnGhost>
          <BtnPrimary onClick={salvar} className="flex-1" disabled={!form.nome || receita.length === 0}>
            {editando ? "Salvar alterações" : "Salvar produto"}
          </BtnPrimary>
        </div>
      </Modal>

      {/* ── Modal ver receita ──────────────────────────────────────────────── */}
      <Modal open={!!verReceita} onClose={() => setVerReceita(null)} title={`${verReceita?.emoji} ${verReceita?.nome}`}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <Badge style={{ background:"#F9731612", color:"#F97316", borderColor:"#F9731628" }}>
            {verReceita?.categoria}
          </Badge>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:15, fontWeight:600, color:accent, letterSpacing:"-0.02em" }}>
            R$ {verReceita?.preco?.toFixed(2)}
          </span>
        </div>

        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3A3A3A", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12 }}>
          Receita padrão — 1 unidade
        </p>

        {verReceita?.receita.map((r, i) => {
          const ing = ingredientes.find(x => x.id === r.ingredienteId);
          const fator = ing?.fatorConversao ?? 1;
          const unBase = ing?.unidade || "un";
          const totalBase = (r.quantidade * fator).toFixed(3).replace(/\.?0+$/, "");
          const mostraConv = unBase !== "un" || fator !== 1;

          return (
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${border}` }}>
              <span style={{ fontSize:13, color:"#C8C4BC" }}>{ing?.emoji} {ing?.nome}</span>
              <div style={{ textAlign:"right" }}>
                {/* Quantidade operacional — o que o funcionário vê */}
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:"#EDE9DF", fontWeight:600 }}>
                  {r.quantidade} un
                </div>
                {/* Conversão — para transparência técnica */}
                {mostraConv && (
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3A3A3A", marginTop:1 }}>
                    = {totalBase} {unBase}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <BtnGhost onClick={() => { setVerReceita(null); abrirEditar(verReceita, null); }} className="flex-1">
            <Icon d={icons.edit} size={14}/> Editar
          </BtnGhost>
          <BtnGhost onClick={() => setVerReceita(null)} className="flex-1 justify-center">Fechar</BtnGhost>
        </div>
      </Modal>

      {/* ── Modal confirmar exclusão ──────────────────────────────────────── */}
      <Modal open={!!confirmar} onClose={() => setConfirmar(null)} title="Excluir produto" width="max-w-sm">
        <div style={{ textAlign:"center", padding:"8px 0 16px" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>{confirmar?.emoji}</div>
          <p style={{ fontSize:14, color:"#C8C4BC", fontWeight:500, marginBottom:8 }}>
            Excluir <strong style={{ color:"#EDE9DF" }}>{confirmar?.nome}</strong>?
          </p>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#3A3A3A", lineHeight:1.6 }}>
            Esta ação não pode ser desfeita.
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <BtnGhost onClick={() => setConfirmar(null)} className="flex-1 justify-center">Cancelar</BtnGhost>
          <BtnPrimary onClick={excluir} className="flex-1" variant="ember"
            style={{ background:"linear-gradient(135deg,#EF4444,#B91C1C)", boxShadow:"0 2px 12px #EF444425" }}
          >
            <Icon d={icons.trash} size={14}/> Excluir
          </BtnPrimary>
        </div>
      </Modal>
    </div>
  );
}

// ── ProdutoCard ───────────────────────────────────────────────────────────────
function ProdutoCard({ produto: p, ingredientes, onVer, onEditar, onExcluir, accent, accentDim, accentBorder, bgCard, border }) {
  const [hover, setHover] = useState(false);

  return (
    <div onClick={onVer}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background:bgCard, border:`1px solid ${hover?"#2A2A2A":"#1A1A1A"}`, borderRadius:10, padding:"16px 18px", cursor:"pointer", transition:"border-color 0.2s, box-shadow 0.2s", boxShadow:hover?"0 4px 24px #00000050":"none", position:"relative" }}
    >
      {/* Botões hover */}
      <div style={{ position:"absolute", top:12, right:12, display:"flex", gap:6, opacity:hover?1:0, transform:hover?"translateY(0)":"translateY(-4px)", transition:"opacity 0.2s, transform 0.2s", pointerEvents:hover?"auto":"none" }}
        onClick={e=>e.stopPropagation()}
      >
        <ActionBtn onClick={onEditar} title="Editar" hoverColor={accent} hoverBorder={accentBorder} hoverBg={accentDim}>
          <Icon d={icons.edit} size={13}/>
        </ActionBtn>
        <ActionBtn onClick={onExcluir} title="Excluir" hoverColor="#EF4444" hoverBorder="#EF444430" hoverBg="#EF44440A">
          <Icon d={icons.trash} size={13}/>
        </ActionBtn>
      </div>

      {/* Nome + preço */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10, paddingRight:hover?72:0, transition:"padding-right 0.2s" }}>
        <span style={{ fontSize:28, flexShrink:0 }}>{p.emoji}</span>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:13.5, fontWeight:600, color:"#EDE9DF", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.nome}</div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3A3A3A", marginTop:2, letterSpacing:"0.04em" }}>{p.categoria}</div>
        </div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:600, color:accent, letterSpacing:"-0.02em", flexShrink:0 }}>
          R$ {p.preco.toFixed(2)}
        </div>
      </div>

      {/* Contagem */}
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3A3A3A", marginBottom:8, letterSpacing:"0.04em" }}>
        {p.receita.length} ingrediente{p.receita.length!==1?"s":""} na receita
      </div>

      {/* Tags de ingredientes — sempre mostra em "un" */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
        {p.receita.slice(0,3).map((r,i) => {
          const ing = ingredientes.find(x=>x.id===r.ingredienteId);
          return (
            <span key={i} style={{ fontSize:10.5, padding:"2px 8px", borderRadius:5, background:"#161616", border:"1px solid #222", color:"#666" }}>
              {ing?.emoji} {r.quantidade}× {ing?.nome}
            </span>
          );
        })}
        {p.receita.length > 3 && (
          <span style={{ fontSize:10.5, color:"#333", padding:"2px 4px", fontFamily:"'DM Mono',monospace" }}>+{p.receita.length-3}</span>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ onClick, title, hoverColor, hoverBorder, hoverBg, children }) {
  return (
    <button onClick={onClick} title={title}
      style={{ width:28, height:28, borderRadius:7, background:"#161616", border:"1px solid #2A2A2A", color:"#555", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
      onMouseEnter={e=>{ e.currentTarget.style.color=hoverColor; e.currentTarget.style.borderColor=hoverBorder; e.currentTarget.style.background=hoverBg; }}
      onMouseLeave={e=>{ e.currentTarget.style.color="#555"; e.currentTarget.style.borderColor="#2A2A2A"; e.currentTarget.style.background="#161616"; }}
    >{children}</button>
  );
}