// src/data/financeiro.js
// Dados financeiros iniciais — entradas (vendas) e saídas (custos/perdas).
// Em produção: substituir por chamada à API/banco de dados.

import { addDias, hoje } from "../utils/helpers";

// ── Entradas financeiras (vendas) ─────────────────────────────────────────────
// Representam faturamento por pedido/venda
export const ENTRADAS_FIN_INIT = [
  { id: "EFN001", tipo: "venda",    valor: 56.00, data: addDias(-6), descricao: "Pedido #001 — Mesa 02", produtoIds: ["PRD001"] },
  { id: "EFN002", tipo: "venda",    valor: 40.00, data: addDias(-5), descricao: "Pedido #002 — Mesa 05", produtoIds: ["PRD001", "PRD003"] },
  { id: "EFN003", tipo: "venda",    valor: 84.00, data: addDias(-4), descricao: "Pedido #003 — Mesa 01", produtoIds: ["PRD001", "PRD002"] },
  { id: "EFN004", tipo: "venda",    valor: 110.00, data: addDias(-4), descricao: "Pedido #004 — Mesa 07", produtoIds: ["PRD001", "PRD002", "PRD003"] },
  { id: "EFN005", tipo: "venda",    valor: 22.00, data: addDias(-3), descricao: "Pedido #005 — Mesa 03", produtoIds: ["PRD002"] },
  { id: "EFN006", tipo: "venda",    valor: 66.00, data: addDias(-3), descricao: "Pedido #006 — Mesa 08", produtoIds: ["PRD002"] },
  { id: "EFN007", tipo: "venda",    valor: 96.00, data: addDias(-2), descricao: "Pedido #007 — Mesa 04", produtoIds: ["PRD001"] },
  { id: "EFN008", tipo: "venda",    valor: 50.00, data: addDias(-2), descricao: "Pedido #008 — Mesa 06", produtoIds: ["PRD003"] },
  { id: "EFN009", tipo: "venda",    valor: 140.00, data: addDias(-1), descricao: "Pedido #009 — Delivery", produtoIds: ["PRD001", "PRD002"] },
  { id: "EFN010", tipo: "venda",    valor: 62.00, data: hoje(),       descricao: "Pedido #010 — Mesa 02", produtoIds: ["PRD001", "PRD003"] },
  { id: "EFN011", tipo: "venda",    valor: 88.00, data: hoje(),       descricao: "Pedido #011 — Mesa 09", produtoIds: ["PRD001", "PRD002"] },
];

// ── Saídas financeiras (custos e perdas) ───────────────────────────────────────
export const SAIDAS_FIN_INIT = [
  // Compras de matéria-prima
  { id: "SFN001", tipo: "compra",    valor: 240.00, data: addDias(-6), descricao: "Compra carne bovina — 8kg",       categoria: "Matéria-prima" },
  { id: "SFN002", tipo: "compra",    valor: 85.00,  data: addDias(-5), descricao: "Compra pãezinhos — 50un",         categoria: "Matéria-prima" },
  { id: "SFN003", tipo: "compra",    valor: 120.00, data: addDias(-4), descricao: "Compra queijo cheddar — 3kg",     categoria: "Matéria-prima" },
  { id: "SFN004", tipo: "compra",    valor: 60.00,  data: addDias(-3), descricao: "Compra batata congelada — 5kg",   categoria: "Matéria-prima" },
  { id: "SFN005", tipo: "compra",    valor: 180.00, data: addDias(-2), descricao: "Compra geral — reposição semanal", categoria: "Matéria-prima" },
  // Perdas e desperdício
  { id: "SFN006", tipo: "desperdicio", valor: 48.00, data: addDias(-5), descricao: "Descarte carne vencida — 1.6kg", categoria: "Desperdício" },
  { id: "SFN007", tipo: "desperdicio", valor: 18.00, data: addDias(-3), descricao: "Descarte pão mofado — 6un",      categoria: "Desperdício" },
  { id: "SFN008", tipo: "desperdicio", valor: 22.00, data: addDias(-1), descricao: "Perda operacional — quebra",     categoria: "Desperdício" },
  // Custos operacionais
  { id: "SFN009", tipo: "operacional", valor: 350.00, data: addDias(-6), descricao: "Energia elétrica",              categoria: "Operacional" },
  { id: "SFN010", tipo: "operacional", valor: 80.00,  data: addDias(-4), descricao: "Material de limpeza",           categoria: "Operacional" },
  { id: "SFN011", tipo: "operacional", valor: 45.00,  data: addDias(-2), descricao: "Embalagens e descartáveis",     categoria: "Operacional" },
];

// ── Estado inicial agrupado ────────────────────────────────────────────────────
export const FINANCEIRO_INIT = {
  entradas: ENTRADAS_FIN_INIT,
  saidas:   SAIDAS_FIN_INIT,
};