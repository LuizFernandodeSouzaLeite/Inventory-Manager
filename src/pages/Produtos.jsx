// src/pages/Produtos.jsx
// Cadastro de produtos com receitas.
// v2.1 — ações de editar e excluir nos cards, modal de confirmação de exclusão.

import { useState } from "react";
import Icon, { icons } from "../components/Icon";
import { Badge, Card, Modal, Input, Select, BtnPrimary, BtnGhost } from "../components/UI";
import { uid } from "../utils/helpers";

// ── Form vazio ────────────────────────────────────────────────────────────────
const FORM_VAZIO = { nome: "", categoria: "Lanches", preco: "", emoji: "🍔" };

export default function Produtos({ produtos, setProdutos, ingredientes }) {
  const [modal,      setModal]      = useState(false);       // criar / editar
  const [verReceita, setVerReceita] = useState(null);        // visualizar receita
  const [editando,   setEditando]   = useState(null);        // produto sendo editado (objeto)
  const [confirmar,  setConfirmar]  = useState(null);        // produto a excluir

  const [form,    setForm]    = useState(FORM_VAZIO);
  const [receita, setReceita] = useState([]);

  // ── Receita helpers ──────────────────────────────────────────────────────
  const adicionarItem = () => setReceita((prev) => [...prev, { ingredienteId: "", quantidade: "", unidade: "un" }]);
  const remItem       = (i) => setReceita((prev) => prev.filter((_, idx) => idx !== i));
  const updItem       = (i, field, val) =>
    setReceita((prev) =>
      prev.map((r, idx) =>
        idx !== i ? r : {
          ...r,
          [field]: val,
          unidade: field === "ingredienteId"
            ? (ingredientes.find((x) => x.id === val)?.unidade || r.unidade)
            : r.unidade,
        }
      )
    );

  // ── Abrir modal de criação ───────────────────────────────────────────────
  const abrirCriar = () => {
    setEditando(null);
    setForm(FORM_VAZIO);
    setReceita([]);
    setModal(true);
  };

  // ── Abrir modal de edição ────────────────────────────────────────────────
  const abrirEditar = (p, e) => {
    e.stopPropagation(); // não abre o modal de receita
    setEditando(p);
    setForm({ nome: p.nome, categoria: p.categoria, preco: String(p.preco), emoji: p.emoji });
    setReceita(p.receita.map((r) => ({ ...r, quantidade: String(r.quantidade) })));
    setModal(true);
  };

  // ── Salvar (criar ou editar) ─────────────────────────────────────────────
  const salvar = () => {
    const dados = {
      nome:     form.nome,
      categoria: form.categoria,
      preco:    Number(form.preco),
      emoji:    form.emoji,
      receita:  receita
        .filter((r) => r.ingredienteId && r.quantidade)
        .map((r) => ({ ...r, quantidade: Number(r.quantidade) })),
    };

    if (editando) {
      // atualiza produto existente
      setProdutos((prev) => prev.map((p) => p.id === editando.id ? { ...p, ...dados } : p));
    } else {
      // novo produto
      setProdutos((prev) => [...prev, { id: "PRD" + uid(), ...dados }]);
    }

    setModal(false);
    setEditando(null);
    setForm(FORM_VAZIO);
    setReceita([]);
  };

  // ── Confirmar exclusão ───────────────────────────────────────────────────
  const excluir = () => {
    setProdutos((prev) => prev.filter((p) => p.id !== confirmar.id));
    setConfirmar(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", color: "#EDE9DF" }}>
            Produtos & Receitas
          </h2>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10.5, color: "#3A3A3A", marginTop: 5, letterSpacing: "0.04em" }}>
            Cadastre produtos com a lista de ingredientes para baixa automática no pedido.
          </p>
        </div>
        <BtnPrimary onClick={abrirCriar}>
          <Icon d={icons.plus} size={15} /> Novo Produto
        </BtnPrimary>
      </div>

      {/* Grid de cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {produtos.map((p) => (
          <ProdutoCard
            key={p.id}
            produto={p}
            ingredientes={ingredientes}
            onVer={() => setVerReceita(p)}
            onEditar={(e) => abrirEditar(p, e)}
            onExcluir={(e) => { e.stopPropagation(); setConfirmar(p); }}
          />
        ))}

        {produtos.length === 0 && (
          <div style={{ gridColumn: "1/-1", padding: "48px 0", textAlign: "center" }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#2A2A2A" }}>
              Nenhum produto cadastrado ainda.
            </p>
          </div>
        )}
      </div>

      {/* ── Modal criar / editar ────────────────────────────────────────── */}
      <Modal
        open={modal}
        onClose={() => { setModal(false); setEditando(null); }}
        title={editando ? `Editar — ${editando.emoji} ${editando.nome}` : "Novo Produto"}
        width="max-w-2xl"
      >
        <div className="grid grid-cols-2 gap-x-4">
          <Input
            label="Nome do produto *"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Ex: X-Bacon"
          />
          <Input
            label="Emoji"
            value={form.emoji}
            onChange={(e) => setForm({ ...form, emoji: e.target.value })}
          />
          <Select
            label="Categoria"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            {["Lanches", "Acompanhamentos", "Bebidas", "Sobremesas", "Outros"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Input
            label="Preço (R$)"
            type="number"
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: e.target.value })}
            placeholder="0.00"
          />
        </div>

        {/* Receita */}
        <div style={{ borderTop: "1px solid #1E1E1E", marginTop: 4, paddingTop: 16 }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 13, fontWeight: 600, color: "#EDE9DF" }}>
              Receita (ingredientes)
            </span>
            <button
              onClick={adicionarItem}
              className="flex items-center gap-1"
              style={{ fontSize: 12, color: "#F97316", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => e.currentTarget.style.color = "#FB923C"}
              onMouseLeave={e => e.currentTarget.style.color = "#F97316"}
            >
              <Icon d={icons.plus} size={13} /> Adicionar ingrediente
            </button>
          </div>

          {receita.length === 0 && (
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#2A2A2A", marginBottom: 12 }}>
              Nenhum ingrediente adicionado ainda.
            </p>
          )}

          {receita.map((r, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <select
                value={r.ingredienteId}
                onChange={(e) => updItem(i, "ingredienteId", e.target.value)}
                style={{ flex: 1, padding: "8px 10px", borderRadius: 7, background: "#141414", border: "1px solid #252525", color: "#D4D0C8", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif" }}
              >
                <option value="">Selecionar...</option>
                {ingredientes.map((x) => (
                  <option key={x.id} value={x.id}>{x.emoji} {x.nome}</option>
                ))}
              </select>
              <input
                type="number"
                value={r.quantidade}
                onChange={(e) => updItem(i, "quantidade", e.target.value)}
                placeholder="Qtd"
                style={{ width: 72, padding: "8px 8px", borderRadius: 7, background: "#141414", border: "1px solid #252525", color: "#D4D0C8", fontSize: 13, outline: "none", textAlign: "center", fontFamily: "'DM Mono', monospace" }}
              />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3A3A3A", width: 28 }}>
                {r.unidade}
              </span>
              <button
                onClick={() => remItem(i)}
                style={{ color: "#444", background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 5, transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
                onMouseLeave={e => e.currentTarget.style.color = "#444"}
              >
                <Icon d={icons.x} size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-5">
          <BtnGhost onClick={() => { setModal(false); setEditando(null); }} className="flex-1">
            Cancelar
          </BtnGhost>
          <BtnPrimary
            onClick={salvar}
            className="flex-1"
            disabled={!form.nome || receita.length === 0}
          >
            {editando ? "Salvar alterações" : "Salvar produto"}
          </BtnPrimary>
        </div>
      </Modal>

      {/* ── Modal ver receita ───────────────────────────────────────────── */}
      <Modal
        open={!!verReceita}
        onClose={() => setVerReceita(null)}
        title={`${verReceita?.emoji} ${verReceita?.nome}`}
      >
        <div className="flex items-center gap-4 mb-4">
          <Badge style={{ background: "#F9731612", color: "#F97316", borderColor: "#F9731628" }}>
            {verReceita?.categoria}
          </Badge>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 600, color: "#C9A84C", letterSpacing: "-0.02em" }}>
            R$ {verReceita?.preco?.toFixed(2)}
          </span>
        </div>

        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
          Receita padrão — 1 unidade
        </p>

        {verReceita?.receita.map((r, i) => {
          const ing = ingredientes.find((x) => x.id === r.ingredienteId);
          return (
            <div
              key={i}
              className="flex items-center justify-between"
              style={{ padding: "9px 0", borderBottom: "1px solid #161616" }}
            >
              <span style={{ fontSize: 13, color: "#C8C4BC" }}>{ing?.emoji} {ing?.nome}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4A4A4A" }}>
                {r.quantidade} {r.unidade}
              </span>
            </div>
          );
        })}

        <div className="flex gap-3 mt-5">
          <BtnGhost
            onClick={() => { setVerReceita(null); abrirEditar(verReceita, { stopPropagation: () => {} }); }}
            className="flex-1"
          >
            <Icon d={icons.edit} size={14} /> Editar
          </BtnGhost>
          <BtnGhost onClick={() => setVerReceita(null)} className="flex-1 justify-center">
            Fechar
          </BtnGhost>
        </div>
      </Modal>

      {/* ── Modal confirmar exclusão ────────────────────────────────────── */}
      <Modal
        open={!!confirmar}
        onClose={() => setConfirmar(null)}
        title="Excluir produto"
        width="max-w-sm"
      >
        <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{confirmar?.emoji}</div>
          <p style={{ fontSize: 14, color: "#C8C4BC", fontWeight: 500, marginBottom: 8 }}>
            Excluir <strong style={{ color: "#EDE9DF" }}>{confirmar?.nome}</strong>?
          </p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3A3A3A", lineHeight: 1.6 }}>
            Esta ação não pode ser desfeita. O produto será removido e não estará mais disponível para novos pedidos.
          </p>
        </div>

        <div className="flex gap-3">
          <BtnGhost onClick={() => setConfirmar(null)} className="flex-1 justify-center">
            Cancelar
          </BtnGhost>
          <BtnPrimary
            onClick={excluir}
            className="flex-1"
            variant="ember"
            style={{ background: "linear-gradient(135deg, #EF4444, #B91C1C)", boxShadow: "0 2px 12px #EF444425" }}
          >
            <Icon d={icons.trash} size={14} /> Excluir produto
          </BtnPrimary>
        </div>
      </Modal>
    </div>
  );
}

// ── ProdutoCard ───────────────────────────────────────────────────────────────
function ProdutoCard({ produto: p, ingredientes, onVer, onEditar, onExcluir }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onVer}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#0F0F0F",
        border: `1px solid ${hover ? "#2A2A2A" : "#1A1A1A"}`,
        borderRadius: 10,
        padding: "16px 18px",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: hover ? "0 4px 24px #00000050" : "none",
        position: "relative",
      }}
    >
      {/* Botões de ação — aparecem no hover */}
      <div
        style={{
          position: "absolute", top: 12, right: 12,
          display: "flex", gap: 6,
          opacity: hover ? 1 : 0,
          transform: hover ? "translateY(0)" : "translateY(-4px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          pointerEvents: hover ? "auto" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Editar */}
        <button
          onClick={onEditar}
          title="Editar produto"
          style={{
            width: 28, height: 28, borderRadius: 7,
            background: "#161616", border: "1px solid #2A2A2A",
            color: "#555", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "color 0.15s, border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#C9A84C"; e.currentTarget.style.borderColor = "#C9A84C40"; e.currentTarget.style.background = "#C9A84C0A"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#555"; e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.background = "#161616"; }}
        >
          <Icon d={icons.edit} size={13} />
        </button>

        {/* Excluir */}
        <button
          onClick={onExcluir}
          title="Excluir produto"
          style={{
            width: 28, height: 28, borderRadius: 7,
            background: "#161616", border: "1px solid #2A2A2A",
            color: "#555", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "color 0.15s, border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.borderColor = "#EF444430"; e.currentTarget.style.background = "#EF44440A"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#555"; e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.background = "#161616"; }}
        >
          <Icon d={icons.trash} size={13} />
        </button>
      </div>

      {/* Conteúdo do card */}
      <div className="flex items-center gap-3 mb-3" style={{ paddingRight: hover ? 72 : 0, transition: "padding-right 0.2s" }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>{p.emoji}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#EDE9DF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {p.nome}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", marginTop: 2, letterSpacing: "0.04em" }}>
            {p.categoria}
          </div>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: "#C9A84C", letterSpacing: "-0.02em", flexShrink: 0 }}>
          R$ {p.preco.toFixed(2)}
        </div>
      </div>

      {/* Contagem + tags de ingredientes */}
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", marginBottom: 10, letterSpacing: "0.04em" }}>
        {p.receita.length} ingrediente{p.receita.length !== 1 ? "s" : ""} na receita
      </div>

      <div className="flex flex-wrap gap-1.5">
        {p.receita.slice(0, 3).map((r, i) => {
          const ing = ingredientes.find((x) => x.id === r.ingredienteId);
          return (
            <span
              key={i}
              style={{
                fontSize: 10.5, padding: "2px 8px", borderRadius: 5,
                background: "#161616", border: "1px solid #222",
                color: "#666",
              }}
            >
              {ing?.emoji} {ing?.nome}
            </span>
          );
        })}
        {p.receita.length > 3 && (
          <span style={{ fontSize: 10.5, color: "#333", padding: "2px 4px", fontFamily: "'DM Mono', monospace" }}>
            +{p.receita.length - 3}
          </span>
        )}
      </div>
    </div>
  );
}