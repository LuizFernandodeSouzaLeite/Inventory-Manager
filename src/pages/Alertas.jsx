// src/pages/Alertas.jsx
// v2.0 — seção dedicada e impossível de ignorar para retiradas físicas pendentes.

import { useState } from "react";
import Icon, { icons } from "../components/Icon";
import { Badge, Card } from "../components/UI";

export default function Alertas({
  alertas,
  retiradas = [],
  confirmarRetirada,
  confirmarTodasRetiradas,
  t = {},
}) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const border       = t.border       || "#1E1E1E";

  const pendentes   = retiradas.filter(r => !r.confirmado);
  const confirmadas = retiradas.filter(r => r.confirmado);

  const [verConfirmadas, setVerConfirmadas] = useState(false);

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", color: "#EDE9DF" }}>
          Central de Alertas
        </h2>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10.5, color: "#3A3A3A", marginTop: 5, letterSpacing: "0.06em" }}>
          {alertas.length} alerta{alertas.length !== 1 ? "s" : ""} ativo{alertas.length !== 1 ? "s" : ""}
          {pendentes.length > 0 && ` · ${pendentes.length} retirada${pendentes.length !== 1 ? "s" : ""} física${pendentes.length !== 1 ? "s" : ""} pendente${pendentes.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* BLOCO 1 — RETIRADAS FÍSICAS PENDENTES                            */}
      {/* Sempre no topo, impossível de ignorar                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {pendentes.length > 0 && (
        <div style={{ marginBottom: 28 }}>

          {/* Card principal de aviso — borda vermelha pulsante */}
          <div style={{
            padding: "16px 20px",
            borderRadius: 12,
            background: "#120808",
            border: "1px solid #EF444450",
            boxShadow: "0 0 0 1px #EF444420, 0 8px 32px #EF444415",
            marginBottom: 12,
            animation: "barto-pulse-red 2.5s infinite",
          }}>
            {/* Header do bloco */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Ícone de alerta grande */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: "#EF444420", border: "1px solid #EF444440",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon d={icons.alertas} size={20} style={{ color: "#EF4444" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: "#EF4444", letterSpacing: "-0.01em" }}>
                    Baixas do Sistema — Retirada Física Pendente
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10.5, color: "#EF444480", marginTop: 3, letterSpacing: "0.06em" }}>
                    {pendentes.length} lote{pendentes.length !== 1 ? "s" : ""} descartado{pendentes.length !== 1 ? "s" : ""} automaticamente · aguardando confirmação física
                  </div>
                </div>
              </div>

              {/* Botão confirmar todos */}
              {pendentes.length > 1 && (
                <button
                  onClick={confirmarTodasRetiradas}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "8px 16px", borderRadius: 8,
                    background: "#EF444420", border: "1px solid #EF444440",
                    color: "#EF4444", fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    transition: "background 0.15s, border-color 0.15s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#EF444435"; e.currentTarget.style.borderColor = "#EF444460"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#EF444420"; e.currentTarget.style.borderColor = "#EF444440"; }}
                >
                  <Icon d={icons.check} size={13} />
                  Confirmar todas
                </button>
              )}
            </div>

            {/* Instruções */}
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: "#EF44440A", border: "1px solid #EF444420",
              marginBottom: 14,
            }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10.5, color: "#EF444499", lineHeight: 1.7, letterSpacing: "0.02em" }}>
                ⚠️ Os lotes abaixo foram <strong style={{ color: "#EF4444" }}>removidos do estoque virtual automaticamente</strong> por terem vencido.
                Confirme que os itens também foram <strong style={{ color: "#EF4444" }}>retirados fisicamente</strong> do freezer/estoque
                para que não haja divergência entre o sistema e o estoque real.
              </p>
            </div>

            {/* Lista de lotes pendentes */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pendentes.map((r, idx) => (
                <div key={r.id}>
                  <LoteRetiradaCard
                    retirada={r}
                    onConfirmar={() => confirmarRetirada(r.id)}
                    border={border} bgBody={bgBody}
                  />
                  {idx < pendentes.length - 1 && <div style={{ height: 1, background: "#EF44441A", margin: "4px 0" }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* BLOCO 2 — ALERTAS DO SISTEMA                                     */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: accent, textTransform: "uppercase", fontWeight: 600 }}>
          Alertas do Sistema
        </span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${accent}30, transparent)` }} />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A" }}>
          {alertas.length} ativo{alertas.length !== 1 ? "s" : ""}
        </span>
      </div>

      {alertas.length === 0 ? (
        <div style={{ padding: "32px 0", textAlign: "center", background: bgCard, borderRadius: 10, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3A3A3A" }}>
            Nenhum alerta ativo. Estoque sob controle!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {alertas.map((a, i) => {
            const isCritico = a.nivel === "critico";
            const isAtencao = a.nivel === "atencao";
            const cor = isCritico ? "#EF4444" : isAtencao ? "#F97316" : "#FBBF24";
            const bg  = isCritico ? "#EF444410" : isAtencao ? "#F9731610" : "#FBBF2410";
            const brd = isCritico ? "#EF444430" : isAtencao ? "#F9731630" : "#FBBF2430";

            return (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "13px 16px", borderRadius: 10,
                background: bgCard, border: `1px solid ${brd}`,
              }}>
                {/* Ícone */}
                <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: bg, border: `1px solid ${brd}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={icons.alertas} size={15} style={{ color: cor }} />
                </div>

                {/* Conteúdo */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#EDE9DF", marginBottom: 3 }}>{a.titulo}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10.5, color: "#555", lineHeight: 1.6 }}>{a.descricao}</div>
                </div>

                {/* Badge */}
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 600,
                  padding: "3px 9px", borderRadius: 5, flexShrink: 0,
                  background: bg, color: cor, border: `1px solid ${brd}`,
                }}>
                  {isCritico ? "Crítico" : isAtencao ? "Atenção" : "Aviso"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* BLOCO 3 — HISTÓRICO DE RETIRADAS CONFIRMADAS                     */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {confirmadas.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <button
            onClick={() => setVerConfirmadas(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
              background: "none", border: "none", cursor: "pointer", padding: 0,
            }}
          >
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "#3A3A3A", textTransform: "uppercase", fontWeight: 600 }}>
              Retiradas Confirmadas
            </span>
            <div style={{ flex: 1, height: 1, background: "#1E1E1E", width: 60 }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#2A2A2A" }}>
              {confirmadas.length} · {verConfirmadas ? "ocultar" : "ver"}
            </span>
            <Icon d={icons.arrowDown} size={11} style={{ color: "#2A2A2A", transform: verConfirmadas ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>

          {verConfirmadas && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {confirmadas.map(r => (
                <div key={r.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 8,
                  background: bgCard, border: `1px solid ${border}`,
                  opacity: 0.6,
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{r.ingredienteEmoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: "#C8C4BC" }}>{r.ingredienteNome} — Lote {r.loteNumero}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", marginTop: 2 }}>
                      {r.quantidade} {r.unidade} · {r.dataDescarte}
                    </div>
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4ADE80", padding: "2px 8px", borderRadius: 5, background: "#4ADE8010", border: "1px solid #4ADE8025" }}>
                    <Icon d={icons.check} size={10} /> Confirmado
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Card individual de lote pendente de retirada física ───────────────────────
function LoteRetiradaCard({ retirada: r, onConfirmar, border, bgBody }) {
  const [confirmando, setConfirmando] = useState(false);

  const handleConfirmar = () => {
    setConfirmando(true);
    setTimeout(() => onConfirmar(), 400);
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "12px 4px",
      opacity: confirmando ? 0.4 : 1,
      transition: "opacity 0.3s",
    }}>
      {/* Emoji + info */}
      <span style={{ fontSize: 22, flexShrink: 0 }}>{r.ingredienteEmoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: "#EDE9DF", fontWeight: 600 }}>
          {r.ingredienteNome}
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#EF444480", marginLeft: 8, fontWeight: 400 }}>
            Lote {r.loteNumero}
          </span>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10.5, color: "#EF444460", marginTop: 3 }}>
          {r.quantidade} {r.unidade} · descartado em {r.dataDescarte}
        </div>
      </div>

      {/* Status + botão */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 600,
          padding: "3px 9px", borderRadius: 5,
          background: "#EF444415", color: "#EF4444", border: "1px solid #EF444430",
          animation: "barto-pulse-red 2s infinite",
        }}>
          Não confirmado
        </span>

        <button
          onClick={handleConfirmar}
          disabled={confirmando}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8,
            background: confirmando ? "#1A1A1A" : "#4ADE8015",
            border: `1px solid ${confirmando ? "#222" : "#4ADE8035"}`,
            color: confirmando ? "#333" : "#4ADE80",
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
            cursor: confirmando ? "default" : "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { if (!confirmando) { e.currentTarget.style.background = "#4ADE8025"; e.currentTarget.style.borderColor = "#4ADE8050"; } }}
          onMouseLeave={e => { if (!confirmando) { e.currentTarget.style.background = "#4ADE8015"; e.currentTarget.style.borderColor = "#4ADE8035"; } }}
        >
          <Icon d={icons.check} size={13} />
          {confirmando ? "Confirmando..." : "Retirada física OK"}
        </button>
      </div>
    </div>
  );
}