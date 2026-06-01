// src/pages/Entradas.jsx
// Registro de entradas de lotes com validade automática (por prazo do ingrediente) ou manual.

import { useState } from "react";
import Icon, { icons } from "../components/Icon";
import { Card, Modal, Input, Select, BtnPrimary, BtnGhost } from "../components/UI";
import { hoje, addDias, fmtData, fmtDataHora, diasAte, uid } from "../utils/helpers";

export default function Entradas({ ingredientes, lotes, setLotes, movimentos, setMovimentos, user }) {
  const [modal, setModal] = useState(false);
  const [form,  setForm]  = useState({
    ingredienteId: "", quantidade: "", custo: "", dataValidade: "", modoValidade: "automatica", observacao: "",
  });

  const entradas   = movimentos.filter((m) => m.tipo === "entrada").sort((a, b) => b.data.localeCompare(a.data));
  const ingSel     = ingredientes.find((i) => i.id === form.ingredienteId);
  const validadeAuto = ingSel ? addDias(ingSel.prazoValidade) : "";

  const registrar = () => {
    const validade = form.modoValidade === "automatica" ? validadeAuto : form.dataValidade;
    const proxNum  = lotes.filter((l) => l.ingredienteId === form.ingredienteId).length + 1;

    const novoLote = {
      id: "LOT" + uid(), ingredienteId: form.ingredienteId, numero: proxNum,
      quantidade: Number(form.quantidade), quantidadeRestante: Number(form.quantidade),
      dataEntrada: hoje(), dataValidade: validade,
      custo: Number(form.custo) || 0, usuario: user.nome, observacao: form.observacao,
    };
    const novoMov = {
      id: "MOV" + uid(), tipo: "entrada", loteId: novoLote.id,
      ingredienteId: form.ingredienteId, quantidade: Number(form.quantidade),
      data: fmtDataHora(), usuario: user.nome, motivo: "Entrada de estoque", pedidoId: null,
    };

    setLotes((prev) => [...prev, novoLote]);
    setMovimentos((prev) => [novoMov, ...prev]);
    setModal(false);
    setForm({ ingredienteId: "", quantidade: "", custo: "", dataValidade: "", modoValidade: "automatica", observacao: "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Entradas de Estoque</h2>
          <p className="text-zinc-500 text-sm">Registre a entrada de novos lotes com validade automática ou manual.</p>
        </div>
        <BtnPrimary onClick={() => setModal(true)} style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
          <Icon d={icons.entradas} size={16} />Registrar Entrada
        </BtnPrimary>
      </div>

      {/* Tabela */}
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#111", borderBottom: "1px solid #1e1e1e" }}>
              {["ID Lote","Ingrediente","Qtd","Lote Nº","Data entrada","Validade","Dias p/ vencer","Por","Obs"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entradas.map((m, idx) => {
              const lote = lotes.find((l) => l.id === m.loteId);
              const ing  = ingredientes.find((i) => i.id === m.ingredienteId);
              const dias = lote ? diasAte(lote.dataValidade) : null;
              return (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors"
                  style={{ borderBottom: idx < entradas.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                  <td className="px-4 py-3 text-zinc-500 text-xs font-mono">{m.loteId}</td>
                  <td className="px-4 py-3 text-zinc-200 text-xs font-medium">{ing?.emoji} {ing?.nome}</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold text-xs">+{m.quantidade} {ing?.unidade}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{lote ? `Lote ${lote.numero}` : "—"}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{m.data}</td>
                  <td className="px-4 py-3 text-zinc-300 text-xs">{lote ? fmtData(lote.dataValidade) : "—"}</td>
                  <td className="px-4 py-3">
                    {dias !== null && (
                      <span className={`text-xs font-bold ${dias < 0 ? "text-red-400" : dias <= 3 ? "text-orange-400" : "text-zinc-400"}`}>
                        {dias < 0 ? `${Math.abs(dias)}d atrás` : `${dias}d`}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{m.usuario}</td>
                  <td className="px-4 py-3 text-zinc-600 text-xs">{lote?.observacao || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Modal registrar entrada */}
      <Modal open={modal} onClose={() => setModal(false)} title="Registrar Entrada de Lote">
        <Select label="Ingrediente *" value={form.ingredienteId} onChange={(e) => setForm({ ...form, ingredienteId: e.target.value })}>
          <option value="">Selecione o ingrediente...</option>
          {ingredientes.map((i) => <option key={i.id} value={i.id}>{i.emoji} {i.nome}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input label={`Quantidade (${ingSel?.unidade || "un"}) *`} type="number" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} placeholder="0" />
          <Input label="Custo total (R$)" type="number" value={form.custo} onChange={(e) => setForm({ ...form, custo: e.target.value })} placeholder="0.00" />
        </div>

        {/* Modo de validade */}
        <div className="mb-4">
          <label className="text-xs text-zinc-500 mb-2 block">Validade</label>
          <div className="flex gap-2 mb-3">
            {[["automatica", "Automática"], ["manual", "Manual"]].map(([v, l]) => (
              <button key={v} onClick={() => setForm({ ...form, modoValidade: v })}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                style={{ background: form.modoValidade === v ? "#f97316" : "#1e1e1e", color: form.modoValidade === v ? "#fff" : "#71717a", border: form.modoValidade === v ? "1px solid #f97316" : "1px solid #2a2a2a" }}>
                {l}
              </button>
            ))}
          </div>
          {form.modoValidade === "automatica" ? (
            ingSel ? (
              <div className="p-3 rounded-lg text-sm" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                <span className="text-zinc-400">Validade calculada: </span>
                <span className="text-emerald-400 font-semibold">{fmtData(validadeAuto)}</span>
                <span className="text-zinc-500 text-xs ml-2">({ingSel.prazoValidade} dias a partir de hoje)</span>
              </div>
            ) : (
              <div className="p-3 rounded-lg text-xs text-zinc-500" style={{ background: "#1a1a1a" }}>
                Selecione um ingrediente primeiro
              </div>
            )
          ) : (
            <Input label="" type="date" value={form.dataValidade} onChange={(e) => setForm({ ...form, dataValidade: e.target.value })} />
          )}
        </div>

        <Input label="Observação (opcional)" value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} placeholder="Ex: Fornecedor X, nota fiscal 1234..." />
        <div className="flex gap-3 mt-2">
          <BtnGhost onClick={() => setModal(false)} className="flex-1">Cancelar</BtnGhost>
          <BtnPrimary onClick={registrar} className="flex-1" disabled={!form.ingredienteId || !form.quantidade}
            style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
            Confirmar Entrada
          </BtnPrimary>
        </div>
      </Modal>
    </div>
  );
}
