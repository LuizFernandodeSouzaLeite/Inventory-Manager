// src/pages/Estoque.jsx
// Tela de ingredientes cadastrados com tabela, busca e modal de cadastro.

import { useState } from "react";
import Icon, { icons } from "../components/Icon";
import { Badge, Card, Modal, Input, Select, BtnPrimary, BtnGhost } from "../components/UI";
import { calcEstoque } from "../utils/estoque";
import { uid, corStatus } from "../utils/helpers";

export default function Estoque({ ingredientes, setIngredientes, lotes, config }) {
  const [modal, setModal] = useState(false);
  const [busca, setBusca]   = useState("");
  const [form,  setForm]    = useState({
    nome: "", categoria: "Carnes", unidade: "un", prazoValidade: 5, minimo: 1, emoji: "🥩",
  });

  const filtrado = ingredientes.filter((i) =>
    i.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const salvar = () => {
    const novo = {
      ...form,
      id: "ING" + uid(),
      prazoValidade: Number(form.prazoValidade),
      minimo:        Number(form.minimo),
    };
    setIngredientes((prev) => [...prev, novo]);
    setModal(false);
    setForm({ nome: "", categoria: "Carnes", unidade: "un", prazoValidade: 5, minimo: 1, emoji: "🥩" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Ingredientes Cadastrados</h2>
          <p className="text-zinc-500 text-sm">Base de todos os ingredientes do sistema.</p>
        </div>
        <BtnPrimary onClick={() => setModal(true)}>
          <Icon d={icons.plus} size={16} />Novo Ingrediente
        </BtnPrimary>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#141414", border: "1px solid #1e1e1e" }}>
          <Icon d={icons.search} size={14} className="text-zinc-600" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar..."
            className="bg-transparent text-sm text-zinc-300 outline-none placeholder-zinc-600 w-48"
          />
        </div>
      </div>

      {/* Tabela */}
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#111", borderBottom: "1px solid #1e1e1e" }}>
              {["Ingrediente", "Categoria", "Estoque atual", "Mín.", "Prazo padrão", "Unidade", "Status"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrado.map((ing, idx) => {
              const atual  = calcEstoque(lotes, ing.id);
              const status = atual <= 0 ? "Crítico" : atual < ing.minimo ? "Baixo" : "Normal";
              return (
                <tr
                  key={ing.id}
                  className="hover:bg-white/[0.02] transition-colors"
                  style={{ borderBottom: idx < filtrado.length - 1 ? "1px solid #1a1a1a" : "none" }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{ing.emoji}</span>
                      <span className="text-zinc-200 font-medium">{ing.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{ing.categoria}</td>
                  <td className="px-4 py-3 text-zinc-200 font-semibold">{atual.toFixed(1)} {ing.unidade}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{ing.minimo} {ing.unidade}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{ing.prazoValidade} dias</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{ing.unidade}</td>
                  <td className="px-4 py-3"><Badge className={corStatus(status)}>{status}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Modal novo ingrediente */}
      <Modal open={modal} onClose={() => setModal(false)} title="Novo Ingrediente">
        <div className="grid grid-cols-2 gap-x-4">
          <div className="col-span-2">
            <Input label="Nome do ingrediente" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Carne bovina" />
          </div>
          <Input label="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="🥩" />
          <Select
            label="Categoria"
            value={form.categoria}
            onChange={(e) => setForm({
              ...form,
              categoria:     e.target.value,
              prazoValidade: config.prazosCategoria[e.target.value] || 5,
            })}
          >
            {Object.keys(config.prazosCategoria).map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Unidade de medida" value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} placeholder="kg, un, g, ml..." />
          <Input label="Prazo de validade padrão (dias)" type="number" value={form.prazoValidade} onChange={(e) => setForm({ ...form, prazoValidade: e.target.value })} />
          <div className="col-span-2">
            <Input label="Quantidade mínima em estoque" type="number" value={form.minimo} onChange={(e) => setForm({ ...form, minimo: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 mt-2">
          <BtnGhost onClick={() => setModal(false)} className="flex-1">Cancelar</BtnGhost>
          <BtnPrimary onClick={salvar} className="flex-1" disabled={!form.nome}>Salvar ingrediente</BtnPrimary>
        </div>
      </Modal>
    </div>
  );
}
