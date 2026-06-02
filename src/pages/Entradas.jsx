// src/pages/Entradas.jsx
// v2.0 — campo de fornecedor dedicado, salvo no lote.

import { useState } from "react";
import Icon, { icons } from "../components/Icon";
import { Card, Modal, Input, Select, BtnPrimary, BtnGhost } from "../components/UI";
import { hoje, addDias, fmtData, fmtDataHora, diasAte, uid } from "../utils/helpers";

export default function Entradas({ ingredientes, lotes, setLotes, movimentos, setMovimentos, user, t = {} }) {
  const accent     = t.accent     || "#C9A84C";
  const accentDim  = t.accentDim  || "#C9A84C15";
  const bgCard     = t.bgCard     || "#0F0F0F";
  const bgBody     = t.bgBody     || "#080808";
  const border     = t.border     || "#1E1E1E";
  const borderMid  = t.borderMid  || "#252525";

  const [modal, setModal] = useState(false);
  const [form,  setForm]  = useState({
    ingredienteId: "", quantidade: "", custo: "",
    fornecedor: "", observacao: "",
    dataValidade: "", modoValidade: "automatica",
  });

  const entradas   = movimentos.filter(m => m.tipo === "entrada").sort((a, b) => b.data.localeCompare(a.data));
  const ingSel     = ingredientes.find(i => i.id === form.ingredienteId);
  const validadeAuto = ingSel ? addDias(ingSel.prazoValidade) : "";

  const registrar = () => {
    const validade = form.modoValidade === "automatica" ? validadeAuto : form.dataValidade;
    const proxNum  = lotes.filter(l => l.ingredienteId === form.ingredienteId).length + 1;

    const novoLote = {
      id: "LOT" + uid(),
      ingredienteId:    form.ingredienteId,
      numero:           proxNum,
      quantidade:       Number(form.quantidade),
      quantidadeRestante: Number(form.quantidade),
      dataEntrada:      hoje(),
      dataValidade:     validade,
      custo:            Number(form.custo) || 0,
      fornecedor:       form.fornecedor.trim() || null,
      observacao:       form.observacao,
      usuario:          user.nome,
    };
    const novoMov = {
      id: "MOV" + uid(), tipo: "entrada", loteId: novoLote.id,
      ingredienteId: form.ingredienteId, quantidade: Number(form.quantidade),
      data: fmtDataHora(), usuario: user.nome,
      motivo: form.fornecedor ? `Compra — ${form.fornecedor}` : "Entrada de estoque",
      pedidoId: null,
    };

    setLotes(prev => [...prev, novoLote]);
    setMovimentos(prev => [novoMov, ...prev]);
    setModal(false);
    setForm({ ingredienteId:"", quantidade:"", custo:"", fornecedor:"", observacao:"", dataValidade:"", modoValidade:"automatica" });
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.03em", color:"#EDE9DF" }}>Entradas de Estoque</h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#3A3A3A", marginTop:5, letterSpacing:"0.06em" }}>REGISTRO DE LOTES · VALIDADE AUTOMÁTICA OU MANUAL</p>
        </div>
        <button onClick={()=>setModal(true)} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:"0 2px 12px #10b98125", transition:"filter 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.filter="none"}
        >
          <Icon d={icons.entradas} size={15}/> Registrar Entrada
        </button>
      </div>

      {/* Tabela */}
      <div style={{ background:bgCard, border:`1px solid ${border}`, borderRadius:10, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr 1fr", padding:"10px 16px", background:bgBody, borderBottom:`1px solid ${border}` }}>
          {["INGREDIENTE","FORNECEDOR","QTD","LOTE","ENTRADA","VALIDADE","CUSTO","POR"].map(h=>(
            <span key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#2A2A2A", letterSpacing:"0.12em" }}>{h}</span>
          ))}
        </div>

        {entradas.map((m, idx) => {
          const lote = lotes.find(l => l.id === m.loteId);
          const ing  = ingredientes.find(i => i.id === m.ingredienteId);
          const dias = lote ? diasAte(lote.dataValidade) : null;
          const fornecedor = lote?.fornecedor || lote?.observacao || "—";
          return (
            <div key={m.id} style={{ display:"grid", gridTemplateColumns:"1fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr 1fr", padding:"11px 16px", alignItems:"center", borderBottom: idx < entradas.length-1 ? `1px solid ${border}` : "none", transition:"background 0.12s" }}
              onMouseEnter={e=>e.currentTarget.style.background=bgBody}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div style={{ fontSize:13, color:"#EDE9DF", fontWeight:500 }}>{ing?.emoji} {ing?.nome}</div>
              <div style={{ fontSize:12, color:"#666", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{fornecedor}</div>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#4ADE80", fontWeight:600 }}>+{m.quantidade} {ing?.unidade}</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#555" }}>{lote ? `#${lote.numero}` : "—"}</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#555" }}>{m.data.slice(0,10).split("-").reverse().join("/")}</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#C8C4BC" }}>{lote ? fmtData(lote.dataValidade) : "—"}</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:accent, fontWeight:600 }}>
                {lote?.custo ? `R$${lote.custo.toFixed(2)}` : "—"}
              </span>
              <span style={{ fontSize:12, color:"#555" }}>{m.usuario}</span>
            </div>
          );
        })}

        {entradas.length === 0 && (
          <div style={{ padding:"32px 0", textAlign:"center" }}>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#2A2A2A" }}>Nenhuma entrada registrada ainda.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title="Registrar Entrada de Lote">
        <Select label="Ingrediente *" value={form.ingredienteId} onChange={e=>setForm({...form,ingredienteId:e.target.value})}>
          <option value="">Selecione o ingrediente...</option>
          {ingredientes.map(i=><option key={i.id} value={i.id}>{i.emoji} {i.nome}</option>)}
        </Select>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
          <Input label={`Quantidade (${ingSel?.unidade || "un"}) *`} type="number" value={form.quantidade} onChange={e=>setForm({...form,quantidade:e.target.value})} placeholder="0"/>
          <Input label="Custo total (R$)" type="number" value={form.custo} onChange={e=>setForm({...form,custo:e.target.value})} placeholder="0.00"/>
        </div>

        {/* Fornecedor — campo dedicado */}
        <Input label="Fornecedor" value={form.fornecedor} onChange={e=>setForm({...form,fornecedor:e.target.value})} placeholder="Ex: Frigorífico Bom, Distribuidora X..."/>

        {/* Validade */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"#555", display:"block", marginBottom:7 }}>Validade</label>
          <div style={{ display:"flex", gap:6, marginBottom:10 }}>
            {[["automatica","Automática"],["manual","Manual"]].map(([v,l])=>(
              <button key={v} onClick={()=>setForm({...form,modoValidade:v})}
                style={{ flex:1, padding:"8px", borderRadius:8, fontSize:12, fontFamily:"'DM Sans',sans-serif", fontWeight:500, cursor:"pointer", background:form.modoValidade===v?"linear-gradient(135deg,#10b981,#059669)":"#141414", color:form.modoValidade===v?"#fff":"#555", border:`1px solid ${form.modoValidade===v?"#10b981":borderMid}`, transition:"all 0.15s" }}>
                {l}
              </button>
            ))}
          </div>
          {form.modoValidade === "automatica" ? (
            ingSel ? (
              <div style={{ padding:"10px 14px", borderRadius:8, background:"#10b98110", border:"1px solid #10b98130" }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#4ADE80" }}>
                  Validade calculada: <strong>{fmtData(validadeAuto)}</strong>
                </span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#555", marginLeft:8 }}>({ingSel.prazoValidade} dias)</span>
              </div>
            ) : (
              <div style={{ padding:"10px 14px", borderRadius:8, background:"#141414", border:`1px solid ${borderMid}` }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#3A3A3A" }}>Selecione um ingrediente primeiro</span>
              </div>
            )
          ) : (
            <Input label="" type="date" value={form.dataValidade} onChange={e=>setForm({...form,dataValidade:e.target.value})}/>
          )}
        </div>

        <Input label="Observação (opcional)" value={form.observacao} onChange={e=>setForm({...form,observacao:e.target.value})} placeholder="Nota fiscal, observações..."/>

        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <BtnGhost onClick={()=>setModal(false)} className="flex-1">Cancelar</BtnGhost>
          <button onClick={registrar} disabled={!form.ingredienteId||!form.quantidade}
            style={{ flex:1, padding:"9px", borderRadius:8, border:"none", background:!form.ingredienteId||!form.quantidade?"#2A2A2A":"linear-gradient(135deg,#10b981,#059669)", color:!form.ingredienteId||!form.quantidade?"#555":"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:!form.ingredienteId||!form.quantidade?"not-allowed":"pointer", transition:"filter 0.15s" }}
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