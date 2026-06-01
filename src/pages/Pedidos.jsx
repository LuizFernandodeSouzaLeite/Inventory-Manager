// src/pages/Pedidos.jsx
// Registro de pedidos com ajuste de ingredientes inline antes de confirmar.
// Ao confirmar, baixa o estoque automaticamente via FIFO.

import { useState } from "react";
import Icon, { icons } from "../components/Icon";
import { Badge, Card, Modal, Input, BtnPrimary, BtnGhost } from "../components/UI";
import { consumirLotesFIFO } from "../utils/estoque";
import { fmtDataHora, uid } from "../utils/helpers";

export default function Pedidos({ pedidos, setPedidos, produtos, ingredientes, lotes, setLotes, movimentos, setMovimentos, user }) {
  const [modal,       setModal]       = useState(false);
  const [form,        setForm]        = useState({ mesa: "", observacao: "" });
  const [itensPedido, setItensPedido] = useState([]);

  const proxNumero = pedidos.length > 0 ? Math.max(...pedidos.map((p) => p.numero)) + 1 : 1;

  // ── Manipulação de itens ──────────────────────────────────────────────────
  const adicionarProduto = (produtoId) => {
    setItensPedido((prev) => {
      const ex = prev.find((i) => i.produtoId === produtoId);
      if (ex) return prev.map((i) => i.produtoId === produtoId ? { ...i, quantidade: i.quantidade + 1 } : i);
      return [...prev, { produtoId, quantidade: 1, ajustes: [] }];
    });
  };

  const remProduto = (produtoId) => setItensPedido((prev) => prev.filter((i) => i.produtoId !== produtoId));

  const updQtd = (produtoId, delta) =>
    setItensPedido((prev) =>
      prev.map((i) => i.produtoId === produtoId ? { ...i, quantidade: Math.max(1, i.quantidade + delta) } : i)
    );

  // ── Ajustes de ingrediente ────────────────────────────────────────────────
  const adicionarAjuste = (produtoId, ingredienteId, delta) => {
    if (!ingredienteId || !delta || isNaN(Number(delta))) return;
    const ing   = ingredientes.find((x) => x.id === ingredienteId);
    const label = `${ing?.emoji} ${ing?.nome}: ${delta > 0 ? "+" : ""}${delta} ${ing?.unidade}`;

    setItensPedido((prev) =>
      prev.map((item) => {
        if (item.produtoId !== produtoId) return item;
        const ex = item.ajustes.find((a) => a.ingredienteId === ingredienteId);
        const novosDelta = ex
          ? item.ajustes.map((a) =>
              a.ingredienteId !== ingredienteId ? a : {
                ...a,
                delta: a.delta + Number(delta),
                label: `${ing?.emoji} ${ing?.nome}: ${a.delta + Number(delta) > 0 ? "+" : ""}${a.delta + Number(delta)} ${ing?.unidade}`,
              }
            )
          : [...item.ajustes, { ingredienteId, delta: Number(delta), label }];
        return { ...item, ajustes: novosDelta.filter((a) => a.delta !== 0) };
      })
    );
  };

  const remAjuste = (produtoId, ingredienteId) =>
    setItensPedido((prev) =>
      prev.map((i) => i.produtoId === produtoId ? { ...i, ajustes: i.ajustes.filter((a) => a.ingredienteId !== ingredienteId) } : i)
    );

  const calcTotal = () =>
    itensPedido.reduce((s, i) => {
      const p = produtos.find((x) => x.id === i.produtoId);
      return s + (p?.preco || 0) * i.quantidade;
    }, 0);

  // ── Confirmar pedido e baixar estoque ─────────────────────────────────────
  const confirmarPedido = () => {
    let novosLotes = [...lotes];
    const todosMov = [];
    let semEstoque = false;

    for (const item of itensPedido) {
      const produto = produtos.find((p) => p.id === item.produtoId);
      if (!produto) continue;

      const consumoBase = produto.receita.map((r) => ({
        ingredienteId: r.ingredienteId,
        quantidade:    r.quantidade * item.quantidade,
      }));

      for (const aj of item.ajustes || []) {
        const idx = consumoBase.findIndex((c) => c.ingredienteId === aj.ingredienteId);
        if (idx >= 0) consumoBase[idx].quantidade += aj.delta * item.quantidade;
        else consumoBase.push({ ingredienteId: aj.ingredienteId, quantidade: aj.delta * item.quantidade });
      }

      for (const consumo of consumoBase) {
        if (consumo.quantidade <= 0) continue;
        const result = consumirLotesFIFO(novosLotes, consumo.ingredienteId, consumo.quantidade);
        if (!result.sucesso) { semEstoque = true; break; }
        novosLotes = result.novosLotes;
        result.consumidos.forEach((c) =>
          todosMov.push({
            id: "MOV" + uid(), tipo: "saida", loteId: c.loteId, ingredienteId: c.ingredienteId,
            quantidade: c.quantidade, data: fmtDataHora(), usuario: user.nome,
            motivo: `Pedido #${proxNumero}`, pedidoId: "TMP",
          })
        );
      }
      if (semEstoque) break;
    }

    if (semEstoque) { alert("Estoque insuficiente para um ou mais ingredientes!"); return; }

    const novoPedido = {
      id: "PED" + uid(), numero: proxNumero, status: "entregue", mesa: form.mesa,
      itens: itensPedido, total: calcTotal(), data: fmtDataHora(),
      usuario: user.nome, observacao: form.observacao,
    };

    setLotes(novosLotes);
    setMovimentos((prev) => [...todosMov.map((m) => ({ ...m, pedidoId: novoPedido.id })), ...prev]);
    setPedidos((prev) => [novoPedido, ...prev]);
    setModal(false);
    setForm({ mesa: "", observacao: "" });
    setItensPedido([]);
  };

  // ── Painel de ajuste inline (subcomponente) ───────────────────────────────
  function ItemAjuste({ item }) {
    const produto = produtos.find((p) => p.id === item.produtoId);
    const [ingSel,    setIngSel]    = useState("");
    const [deltaSel,  setDeltaSel]  = useState("");
    if (!produto) return null;

    return (
      <div className="mt-3 pt-3 border-t" style={{ borderColor: "#252525" }}>
        {/* Ajustes aplicados */}
        {item.ajustes.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {item.ajustes.map((a) => (
              <span key={a.ingredienteId} className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}>
                <span className={a.delta > 0 ? "text-emerald-400" : "text-red-400"}>{a.label}</span>
                <button onClick={() => remAjuste(item.produtoId, a.ingredienteId)} className="text-zinc-600 hover:text-red-400 ml-1">×</button>
              </span>
            ))}
          </div>
        )}
        {/* Formulário de novo ajuste */}
        <div className="flex items-center gap-2">
          <select value={ingSel} onChange={(e) => setIngSel(e.target.value)}
            className="flex-1 px-2 py-1.5 rounded-lg text-xs text-zinc-300 outline-none"
            style={{ background: "#1a1a1a", border: "1px solid #252525" }}>
            <option value="">Ingrediente a ajustar...</option>
            <optgroup label="Receita base">
              {produto.receita.map((r) => {
                const ing = ingredientes.find((x) => x.id === r.ingredienteId);
                return <option key={r.ingredienteId} value={r.ingredienteId}>{ing?.emoji} {ing?.nome} (base: {r.quantidade} {ing?.unidade})</option>;
              })}
            </optgroup>
            <optgroup label="Extra (fora da receita)">
              {ingredientes.filter((i) => !produto.receita.find((r) => r.ingredienteId === i.id)).map((i) => (
                <option key={i.id} value={i.id}>{i.emoji} {i.nome}</option>
              ))}
            </optgroup>
          </select>
          <input type="number" step="0.01" value={deltaSel} onChange={(e) => setDeltaSel(e.target.value)}
            placeholder="±Qtd" className="w-20 px-2 py-1.5 rounded-lg text-xs text-zinc-300 outline-none text-center"
            style={{ background: "#1a1a1a", border: "1px solid #252525" }} />
          <button
            onClick={() => { adicionarAjuste(item.produtoId, ingSel, deltaSel); setIngSel(""); setDeltaSel(""); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
            style={{ background: "#f97316" }}>
            + Ajuste
          </button>
        </div>
        <p className="text-[10px] text-zinc-600 mt-1">Positivo = adicionar, negativo = remover. Ex: +0.15 kg = carne dupla.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Pedidos</h2>
          <p className="text-zinc-500 text-sm">Confirmar pedido baixa o estoque automaticamente via FIFO (validade prioritária).</p>
        </div>
        <BtnPrimary onClick={() => setModal(true)}>
          <Icon d={icons.plus} size={16} />Novo Pedido
        </BtnPrimary>
      </div>

      {/* Tabela de pedidos */}
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#111", borderBottom: "1px solid #1e1e1e" }}>
              {["#","Mesa","Itens","Ajustes","Total","Status","Data","Funcionário"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pedidos.map((ped, idx) => (
              <tr key={ped.id} className="hover:bg-white/[0.02] transition-colors"
                style={{ borderBottom: idx < pedidos.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                <td className="px-4 py-3 text-orange-400 font-bold text-sm">#{ped.numero}</td>
                <td className="px-4 py-3 text-zinc-300 text-xs">Mesa {ped.mesa || "—"}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">
                  {ped.itens.map((i) => { const p = produtos.find((x) => x.id === i.produtoId); return `${p?.emoji || ""}${p?.nome || "?"} ×${i.quantidade}`; }).join(", ")}
                </td>
                <td className="px-4 py-3">
                  {ped.itens.some((i) => i.ajustes?.length > 0)
                    ? <Badge className="text-sky-400 bg-sky-400/10 border-sky-400/20">sim</Badge>
                    : <span className="text-zinc-700">—</span>}
                </td>
                <td className="px-4 py-3 text-white font-semibold text-sm">R$ {ped.total.toFixed(2)}</td>
                <td className="px-4 py-3"><Badge className="text-emerald-400 bg-emerald-400/10 border-emerald-400/20">{ped.status}</Badge></td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{ped.data}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{ped.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal novo pedido */}
      <Modal open={modal} onClose={() => { setModal(false); setItensPedido([]); setForm({ mesa: "", observacao: "" }); }}
        title={`Novo Pedido #${proxNumero}`} width="max-w-3xl">

        <div className="grid grid-cols-2 gap-4 mb-2">
          <Input label="Mesa / Identificação" value={form.mesa} onChange={(e) => setForm({ ...form, mesa: e.target.value })} placeholder="Ex: 05, Balcão, Delivery..." />
          <Input label="Observação geral" value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} placeholder="Sem cebola, etc..." />
        </div>

        {/* Grade de produtos */}
        <div className="border-t pt-4 mb-4" style={{ borderColor: "#252525" }}>
          <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-3">Selecione os produtos</div>
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))" }}>
            {produtos.map((p) => {
              const noItem = itensPedido.find((i) => i.produtoId === p.id);
              return (
                <button key={p.id} onClick={() => adicionarProduto(p.id)}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{ background: noItem ? "rgba(249,115,22,0.12)" : "#1a1a1a", border: noItem ? "1px solid #f97316" : "1px solid #252525" }}>
                  <div className="text-xl mb-1">{p.emoji}</div>
                  <div className="text-xs text-zinc-200 font-medium leading-tight">{p.nome}</div>
                  <div className="text-xs text-orange-400 mt-0.5">R$ {p.preco.toFixed(2)}</div>
                  {noItem && <div className="text-[10px] text-orange-300 mt-1">×{noItem.quantidade} no pedido</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Itens selecionados com ajustes */}
        {itensPedido.length > 0 && (
          <div className="border-t pt-4" style={{ borderColor: "#252525" }}>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-3">Itens do pedido</div>
            {itensPedido.map((item) => {
              const p = produtos.find((x) => x.id === item.produtoId);
              return (
                <div key={item.produtoId} className="mb-3 p-3 rounded-xl" style={{ background: "#1a1a1a", border: "1px solid #252525" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{p?.emoji}</span>
                    <span className="text-zinc-100 text-sm font-semibold flex-1">{p?.nome}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updQtd(item.produtoId, -1)} className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white" style={{ background: "#252525" }}>−</button>
                      <span className="text-white font-bold w-5 text-center text-sm">{item.quantidade}</span>
                      <button onClick={() => updQtd(item.produtoId, +1)} className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white" style={{ background: "#252525" }}>+</button>
                    </div>
                    <span className="text-orange-400 font-bold text-sm w-20 text-right">R$ {((p?.preco || 0) * item.quantidade).toFixed(2)}</span>
                    <button onClick={() => remProduto(item.produtoId)} className="text-zinc-600 hover:text-red-400 ml-1">
                      <Icon d={icons.x} size={14} />
                    </button>
                  </div>
                  <ItemAjuste item={item} />
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#252525" }}>
              <span className="text-zinc-400 text-sm">Total do pedido</span>
              <span className="text-white font-black text-xl">R$ {calcTotal().toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <BtnGhost onClick={() => { setModal(false); setItensPedido([]); }} className="flex-1">Cancelar</BtnGhost>
          <BtnPrimary onClick={confirmarPedido} className="flex-1" disabled={itensPedido.length === 0}>
            <Icon d={icons.checkCircle} size={16} />Confirmar & Baixar Estoque
          </BtnPrimary>
        </div>
      </Modal>
    </div>
  );
}
