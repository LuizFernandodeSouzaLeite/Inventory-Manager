// src/pages/Estoque.jsx
// v3.0 — clique na linha abre página de detalhe do ingrediente.

import { useState } from "react";
import Icon, { icons } from "../components/Icon";
import { Badge, Card, Modal, Input, Select, BtnPrimary, BtnGhost } from "../components/UI";
import { calcEstoque, calcEstoqueOp } from "../utils/estoque";
import { uid, corStatus } from "../utils/helpers";
import IngredienteDetalhe from "./IngredienteDetalhe";

const FORM_VAZIO = {
  nome: "", categoria: "Carnes", unidade: "kg",
  fatorConversao: 0.15, prazoValidade: 5, minimo: 1, emoji: "🥩",
};

const FATOR_SUGERIDO = { kg: 0.15, g: 50, ml: 20, un: 1, l: 0.2 };

export default function Estoque({ ingredientes, setIngredientes, lotes, movimentos, config, t = {} }) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const border       = t.border       || "#1E1E1E";
  const borderMid    = t.borderMid    || "#252525";

  const [modal,      setModal]      = useState(false);
  const [editando,   setEditando]   = useState(null);
  const [busca,      setBusca]      = useState("");
  const [form,       setForm]       = useState(FORM_VAZIO);
  const [detalhe,    setDetalhe]    = useState(null); // ingrediente selecionado para detalhe

  const filtrado = ingredientes.filter(i =>
    i.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // Se tem ingrediente selecionado, mostra a página de detalhe
  if (detalhe) {
    return (
      <IngredienteDetalhe
        ingrediente={detalhe}
        lotes={lotes}
        movimentos={movimentos}
        onVoltar={() => setDetalhe(null)}
        t={t}
      />
    );
  }

  const abrirCriar = () => { setEditando(null); setForm(FORM_VAZIO); setModal(true); };
  const abrirEditar = (ing, e) => {
    e.stopPropagation();
    setEditando(ing);
    setForm({ nome: ing.nome, categoria: ing.categoria, unidade: ing.unidade, fatorConversao: ing.fatorConversao ?? 1, prazoValidade: ing.prazoValidade, minimo: ing.minimo, emoji: ing.emoji });
    setModal(true);
  };

  const salvar = () => {
    const dados = { ...form, prazoValidade: Number(form.prazoValidade), minimo: Number(form.minimo), fatorConversao: Number(form.fatorConversao) };
    if (editando) {
      setIngredientes(prev => prev.map(i => i.id === editando.id ? { ...i, ...dados } : i));
    } else {
      setIngredientes(prev => [...prev, { id: "ING" + uid(), ...dados }]);
    }
    setModal(false); setEditando(null); setForm(FORM_VAZIO);
  };

  const labelConversao = (ing) => {
    const fator = ing.fatorConversao ?? 1;
    if (ing.unidade === "un" && fator === 1) return "1 un";
    return `${fator} ${ing.unidade} / un`;
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.03em", color:t.textPrimary||"#EDE9DF" }}>Ingredientes</h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t.textDim || "#3A3A3A", marginTop:5, letterSpacing:"0.06em" }}>
            BASE DO SISTEMA · CLIQUE PARA VER DETALHES
          </p>
        </div>
        <button onClick={abrirCriar} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:8, border:"none", background:`linear-gradient(135deg,${accent},${t.accentDark||"#9A7A2E"})`, color:t.accentText||"#080808", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:`0 2px 12px ${accentDim}`, transition:"filter 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.filter="none"}
        >
          <Icon d={icons.plus} size={15}/> Novo Ingrediente
        </button>
      </div>

      {/* Busca */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, padding:"8px 12px", borderRadius:8, background:bgCard, border:`1px solid ${border}`, width:"fit-content" }}>
        <Icon d={icons.search} size={14} style={{ color:t.textDim || "#3A3A3A" }}/>
        <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar ingrediente..."
          style={{ background:"transparent", border:"none", outline:"none", color:"#C8C4BC", fontSize:13, fontFamily:"'DM Sans',sans-serif", width:220 }}
        />
      </div>

      {/* Tabela */}
      <div style={{ background:bgCard, border:`1px solid ${border}`, borderRadius:10, overflow:"hidden" }}>
        {/* Header */}
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr 40px", padding:"10px 16px", background:bgBody, borderBottom:`1px solid ${border}` }}>
          {["INGREDIENTE","CATEGORIA","ESTOQUE (UN)","ESTOQUE BASE","MÍN.","CONVERSÃO","STATUS",""].map(h=>(
            <span key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textDim||"#2A2A2A", letterSpacing:"0.12em" }}>{h}</span>
          ))}
        </div>

        {filtrado.map((ing, idx) => {
          const estoqueBase = calcEstoque(lotes, ing.id);
          const estoqueOp   = calcEstoqueOp(lotes, ing);
          const minimoOp    = ing.fatorConversao ? ing.minimo / ing.fatorConversao : ing.minimo;
          const status      = estoqueBase <= 0 ? "Crítico" : estoqueBase < ing.minimo ? "Baixo" : "Normal";

          return (
            <div key={ing.id}
              onClick={() => setDetalhe(ing)}
              style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr 40px", padding:"11px 16px", alignItems:"center", borderBottom: idx < filtrado.length-1 ? `1px solid ${border}` : "none", cursor:"pointer", transition:"background 0.12s" }}
              onMouseEnter={e=>e.currentTarget.style.background=accentDim}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{ing.emoji}</span>
                <div>
                  <div style={{ fontSize:13, color:t.textPrimary||"#EDE9DF", fontWeight:500 }}>{ing.nome}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textDim || "#3A3A3A", marginTop:1 }}>{ing.categoria}</div>
                </div>
              </div>

              <span style={{ fontSize:12, color:"#555" }}>{ing.categoria}</span>

              <div>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:t.textPrimary||"#EDE9DF", fontWeight:600 }}>
                  {estoqueOp % 1 === 0 ? estoqueOp.toFixed(0) : estoqueOp.toFixed(1)}
                </span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.textDim || "#3A3A3A", marginLeft:4 }}>un</span>
              </div>

              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textMuted||"#4A4A4A" }}>
                {estoqueBase.toFixed(1)} {ing.unidade}
              </span>

              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textMuted||"#4A4A4A" }}>
                {minimoOp % 1 === 0 ? minimoOp.toFixed(0) : minimoOp.toFixed(1)} un
              </span>

              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#555", padding:"2px 7px", borderRadius:5, background:bgBody, border:`1px solid ${border}` }}>
                {labelConversao(ing)}
              </span>

              <Badge className={corStatus(status)}>{status}</Badge>

              {/* Botão editar — stopPropagation para não abrir detalhe */}
              <button onClick={e=>abrirEditar(ing, e)} style={{ width:28, height:28, borderRadius:7, background:"transparent", border:`1px solid transparent`, color:"#333", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
                onMouseEnter={e=>{ e.currentTarget.style.color=accent; e.currentTarget.style.borderColor=accentBorder; e.currentTarget.style.background=accentDim; }}
                onMouseLeave={e=>{ e.currentTarget.style.color="#333"; e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.background="transparent"; }}
              >
                <Icon d={icons.edit} size={13}/>
              </button>
            </div>
          );
        })}

        {filtrado.length === 0 && (
          <div style={{ padding:"32px 0", textAlign:"center" }}>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textDim||"#2A2A2A" }}>Nenhum ingrediente encontrado</p>
          </div>
        )}
      </div>

      {/* Hint */}
      <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.textDim||"#2A2A2A", marginTop:10, letterSpacing:"0.04em" }}>
        ↑ Clique em qualquer ingrediente para ver detalhes, histórico, gráficos e fornecedores.
      </p>

      {/* Modal criar/editar */}
      <Modal open={modal} onClose={()=>{ setModal(false); setEditando(null); }} title={editando ? `Editar — ${editando.emoji} ${editando.nome}` : "Novo Ingrediente"} width="max-w-lg">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
          <div style={{ gridColumn:"1/-1" }}>
            <Input label="Nome do ingrediente *" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Ex: Carne bovina"/>
          </div>
          <Input label="Emoji" value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})}/>
          <Select label="Categoria" value={form.categoria}
            onChange={e=>setForm({...form, categoria:e.target.value, prazoValidade: config.prazosCategoria[e.target.value]||5})}>
            {Object.keys(config.prazosCategoria).map(c=><option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Unidade base (estoque)" value={form.unidade}
            onChange={e=>setForm({...form, unidade:e.target.value, fatorConversao: FATOR_SUGERIDO[e.target.value]||1})}>
            {["kg","g","ml","l","un"].map(u=><option key={u} value={u}>{u}</option>)}
          </Select>
          <div>
            <Input label={`Qtd em ${form.unidade} por unidade`} type="number" step="0.001"
              value={form.fatorConversao}
              onChange={e=>setForm({...form,fatorConversao:e.target.value})}
              helper={form.unidade==="un" ? "Unidade já é operacional" : `1 un = ${form.fatorConversao} ${form.unidade}`}
            />
          </div>
          <Input label="Prazo de validade (dias)" type="number" value={form.prazoValidade} onChange={e=>setForm({...form,prazoValidade:e.target.value})}/>
          <Input label="Mínimo em estoque (base)" type="number" value={form.minimo} onChange={e=>setForm({...form,minimo:e.target.value})}
            helper={`= ${form.minimo > 0 && form.fatorConversao > 0 ? (form.minimo / form.fatorConversao).toFixed(1) : "—"} unidades operacionais`}
          />
        </div>

        {form.unidade !== "un" && Number(form.fatorConversao) > 0 && (
          <div style={{ padding:"10px 14px", borderRadius:8, background:accentDim, border:`1px solid ${accentBorder}`, marginBottom:16 }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:accent, letterSpacing:"0.06em", marginBottom:4 }}>PREVIEW DE CONVERSÃO</div>
            <div style={{ fontSize:13, color:"#C8C4BC" }}>1 unidade operacional = <strong style={{ color:accent }}>{form.fatorConversao} {form.unidade}</strong></div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#555", marginTop:4 }}>Ex: receita com 3 un → baixa {(3 * Number(form.fatorConversao)).toFixed(3)} {form.unidade} do estoque</div>
          </div>
        )}

        <div style={{ display:"flex", gap:10 }}>
          <BtnGhost onClick={()=>{ setModal(false); setEditando(null); }} className="flex-1">Cancelar</BtnGhost>
          <BtnPrimary onClick={salvar} className="flex-1" disabled={!form.nome} variant="confirm">
            {editando ? "Salvar alterações" : "Salvar ingrediente"}
          </BtnPrimary>
        </div>
      </Modal>
    </div>
  );
}