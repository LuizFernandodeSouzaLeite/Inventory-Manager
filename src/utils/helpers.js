// src/utils/helpers.js
// v2.0 — fmtDataHora agora retorna ISO (YYYY-MM-DD HH:MM) para ordenação correta.
//         Nova função fmtDataHoraBR para exibição em pt-BR.

// ── Datas ─────────────────────────────────────────────────────────────────────

/** Retorna a data de hoje no formato ISO (YYYY-MM-DD). */
export const hoje = () => new Date().toISOString().split("T")[0];

/** Retorna a data daqui a `dias` dias no formato ISO. */
export const addDias = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().split("T")[0];
};

/** Retorna quantos dias faltam até `dataStr` (negativo = já venceu). */
export const diasAte = (dataStr) => {
  const diff = new Date(dataStr) - new Date(hoje());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/** Formata uma data ISO (YYYY-MM-DD) para DD/MM/YYYY. */
export const fmtData = (d) => {
  if (!d) return "—";
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
};

/**
 * Retorna data e hora atual em formato ISO ordenável: "YYYY-MM-DD HH:MM".
 * Usado internamente nos movimentos para garantir ordenação correta por string.
 */
export const fmtDataHora = () => {
  const n = new Date();
  const yyyy = n.getFullYear();
  const mm   = String(n.getMonth() + 1).padStart(2, "0");
  const dd   = String(n.getDate()).padStart(2, "0");
  const hh   = String(n.getHours()).padStart(2, "0");
  const min  = String(n.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

/**
 * Formata uma string de data/hora (YYYY-MM-DD HH:MM ou DD/MM/YYYY HH:MM)
 * para exibição em pt-BR: "01/06/2026 14:30".
 * Compatível com ambos os formatos (retrocompatibilidade com dados antigos).
 */
export const fmtDataHoraBR = (dataStr) => {
  if (!dataStr) return "—";
  // Já está no formato BR (dados antigos): "01/06/2026 14:30"
  if (dataStr.includes("/")) return dataStr;
  // Formato ISO: "2026-06-01 14:30"
  const [datePart, timePart] = dataStr.split(" ");
  return `${fmtData(datePart)}${timePart ? " " + timePart : ""}`;
};

// ── IDs ───────────────────────────────────────────────────────────────────────

/** Gera um ID aleatório curto (ex: "A3F9K2"). */
export const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();

// ── Status de validade ────────────────────────────────────────────────────────

/**
 * Retorna o status de validade de um lote.
 * @param {string} dataStr - Data no formato ISO (YYYY-MM-DD)
 * @param {number} diasAviso - Dias de antecedência para alertar
 * @returns {"vencido"|"critico"|"atencao"|"ok"|null}
 */
export const statusValidade = (dataStr, diasAviso = 3) => {
  if (!dataStr) return null;
  const d = diasAte(dataStr);
  if (d < 0)              return "vencido";
  if (d <= diasAviso)     return "critico";
  if (d <= diasAviso * 3) return "atencao";
  return "ok";
};

// ── Classes de cor ────────────────────────────────────────────────────────────

/** Classes Tailwind para o status de estoque/validade de um lote. */
export const corStatus = (s) =>
  ({
    Crítico:  "text-red-400 bg-red-400/10 border border-red-400/20",
    Baixo:    "text-amber-400 bg-amber-400/10 border border-amber-400/20",
    Normal:   "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
    vencido:  "text-red-500 bg-red-500/15 border border-red-500/30",
    critico:  "text-orange-400 bg-orange-400/10 border border-orange-400/20",
    atencao:  "text-amber-400 bg-amber-400/10 border border-amber-400/20",
    ok:       "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
  }[s] || "text-zinc-400");

/** Label legível para o cargo do usuário. */
export const cargoLabel = (c) =>
  ({ adm_global: "Adm Global", gerente: "Gerente", funcionario: "Funcionário" }[c] || c);

/** Classes Tailwind para o badge de cargo. */
export const cargoColor = (c) =>
  ({
    adm_global:  "text-violet-400 bg-violet-400/10 border border-violet-400/20",
    gerente:     "text-sky-400 bg-sky-400/10 border border-sky-400/20",
    funcionario: "text-zinc-400 bg-zinc-400/10 border border-zinc-400/20",
  }[c] || "");