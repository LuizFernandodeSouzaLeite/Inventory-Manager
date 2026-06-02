// src/data/produtos.js
// v2.0 — receitas usam unidade "un" (operacional).
// O sistema converte para unidade base via fatorConversao do ingrediente.

export const PRODUTOS_INIT = [
  {
    id: "PRD001", nome: "X-Bacon", categoria: "Lanches", preco: 28.00, emoji: "🍔",
    receita: [
      { ingredienteId: "ING02", quantidade: 1, unidade: "un" },
      { ingredienteId: "ING01", quantidade: 1, unidade: "un" },
      { ingredienteId: "ING04", quantidade: 1, unidade: "un" },
      { ingredienteId: "ING03", quantidade: 2, unidade: "un" },
      { ingredienteId: "ING05", quantidade: 1, unidade: "un" },
      { ingredienteId: "ING10", quantidade: 1, unidade: "un" },
    ],
  },
  {
    id: "PRD002", nome: "X-Burguer", categoria: "Lanches", preco: 22.00, emoji: "🍔",
    receita: [
      { ingredienteId: "ING02", quantidade: 1, unidade: "un" },
      { ingredienteId: "ING01", quantidade: 1, unidade: "un" },
      { ingredienteId: "ING03", quantidade: 1, unidade: "un" },
      { ingredienteId: "ING05", quantidade: 1, unidade: "un" },
      { ingredienteId: "ING07", quantidade: 2, unidade: "un" },
      { ingredienteId: "ING10", quantidade: 1, unidade: "un" },
    ],
  },
  {
    id: "PRD003", nome: "Fritas P", categoria: "Acompanhamentos", preco: 12.00, emoji: "🍟",
    receita: [
      { ingredienteId: "ING06", quantidade: 1, unidade: "un" },
    ],
  },
];