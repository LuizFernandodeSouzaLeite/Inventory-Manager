// src/pages/Saidas.jsx
// Registro manual de saídas e descartes. Pedidos baixam automaticamente pelo fluxo de Pedidos.

import { useState } from "react";
import Icon, { icons } from "../components/Icon";
import { Badge, Card, Modal, Input, Select, BtnPrimary, BtnGhost } from "../components/UI";
import { calcEstoque, consumirLotesFIFO } from "../utils/estoque";
import { fmtDataHora, uid } from "../utils/helpers";

export default function Saidas({ ingredientes, lotes, setLotes, movimentos, setMovimentos, user }) {
  const [modal, setModal] = useState(false);
  const [form,  setForm]  = useState({ ingredienteId: "", quantidade: "", motivo: "Uso produção", observacao: "" });

  const saidas        = movimentos.filter((m) => m.tipo === "saida" || m.tipo === "descarte").sort((a, b) => b.data.localeCompare(a.data));
  const ingSel        = ingredientes.find((i) => i.id === form.ingredienteId);
  const estoqueAtual  = ingSel ? calcEstoque(lotes, ingSel.id) : 0;

  const registrar = () => {
    const qtd = Number(form.quantidade);
    const { novosLotes, consumidos, sucesso } = consumirLotesFIFO(lotes, form.ingredienteId, qtd);
    if (!sucesso) { alert("Estoque insuficiente!"); return; }

    const novosMov = consumidos.map((c) => ({
      id: "MOV" + uid(),
      tipo: form.motivo === "Produto vencido" ? "descarte" : "saida",
      loteId: c.loteId, ingredienteId: c.ingredienteId, quantidade: c.quantidade,
      data: fmtDataHora(), usuario: user.nome, motivo: form.motivo, pedidoId: null,
    }));

    setLotes(novosLotes);
    setMovimentos((prev) => [...novosMov, ...prev]);
    setModal(false);
    setForm({ ingredienteId: "", quantidade: "", motivo: "Uso produção", observacao: "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Saídas de Estoque</h2>
          <p className="text-zinc-500 text-sm">Registre saídas manuais e descartes. Pedidos baixam automaticamente.</p>
        </div>
        <BtnPrimary onClick={() => setModal(true)} style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
          <Icon d={icons.saidas} size={16} />Registrar Saída
        </BtnPrimary>
      </div>

      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#111", borderBottom: "1px solid #1e1e1e" }}>
              {["Ingrediente","Tipo","Qtd","Lote","Motivo","Data","Por","Pedido"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {saidas.map((m, idx) => {
              const ing  = ingredientes.find((i) => i.id === m.ingredienteId);
              const lote = lotes.find((l) => l.id === m.loteId);
              return (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors"
                  style={{ borderBottom: idx < saidas.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                  <td className="px-4 py-3 text-zinc-200 text-xs">{ing?.emoji} {ing?.nome}</td>
                  <td className="px-4 py-3">
                    <Badge className={m.tipo === "descarte" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"}>
                      {m.tipo}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-red-400 font-semibold text-xs">-{m.quantidade} {ing?.unidade}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{lote ? `Lote ${lote.numero}` : "—"}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{m.motivo}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{m.data}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{m.usuario}</td>
                  <td className="px-4 py-3 text-zinc-600 text-xs">{m.pedidoId || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Registrar Saída Manual">
        <Select label="Ingrediente *" value={form.ingredienteId} onChange={(e) => setForm({ ...form, ingredienteId: e.target.value })}>
          <option value="">Selecione...</option>
          {ingredientes.map((i) => {
            const e = calcEstoque(lotes, i.id);
            return <option key={i.id} value={i.id}>{i.emoji} {i.nome} ({e.toFixed(1)} {i.unidade} disp.)</option>;
          })}
        </Select>
        {ingSel && (
          <div className="mb-3 p-2 rounded-lg text-xs text-zinc-400" style={{ background: "#1a1a1a" }}>
            Estoque disponível: <span className="text-white font-semibold">{estoqueAtual.toFixed(1)} {ingSel.unidade}</span>
            <span className="text-zinc-600 ml-2">(FIFO — lotes com validade mais próxima consumidos primeiro)</span>
          </div>
        )}
        <Input label={`Quantidade (${ingSel?.unidade || "un"}) *`} type="number" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} placeholder="0" />
        <Select label="Motivo" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })}>
          {["Uso produção", "Produto vencido", "Perda/quebra", "Teste/degustação", "Outro"].map((m) => <option key={m}>{m}</option>)}
        </Select>
        <div className="flex gap-3 mt-2">
          <BtnGhost onClick={() => setModal(false)} className="flex-1">Cancelar</BtnGhost>
          <BtnPrimary onClick={registrar} className="flex-1"
            disabled={!form.ingredienteId || !form.quantidade || Number(form.quantidade) > estoqueAtual}
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
            Confirmar Saída
          </BtnPrimary>
        </div>
      </Modal>
    </div>
  );
}
