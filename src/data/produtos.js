// src/data/produtos.js
// Produtos cadastrados com suas receitas (lista de ingredientes por unidade).
// Em produção: substituir por chamada à API/banco de dados.

export const PRODUTOS_INIT = [
  {
    id: "PRD001", nome: "X-Bacon", categoria: "Lanches", preco: 28.00, emoji: "🍔",
    receita: [
      { ingredienteId: "ING02", quantidade: 1,    unidade: "un" },
      { ingredienteId: "ING01", quantidade: 0.15, unidade: "kg" },
      { ingredienteId: "ING04", quantidade: 50,   unidade: "g"  },
      { ingredienteId: "ING03", quantidade: 2,    unidade: "un" },
      { ingredienteId: "ING05", quantidade: 1,    unidade: "un" },
      { ingredienteId: "ING10", quantidade: 20,   unidade: "g"  },
    ],
  },
  {
    id: "PRD002", nome: "X-Burguer", categoria: "Lanches", preco: 22.00, emoji: "🍔",
    receita: [
      { ingredienteId: "ING02", quantidade: 1,    unidade: "un" },
      { ingredienteId: "ING01", quantidade: 0.15, unidade: "kg" },
      { ingredienteId: "ING03", quantidade: 1,    unidade: "un" },
      { ingredienteId: "ING05", quantidade: 1,    unidade: "un" },
      { ingredienteId: "ING07", quantidade: 2,    unidade: "un" },
      { ingredienteId: "ING10", quantidade: 20,   unidade: "g"  },
    ],
  },
  {
    id: "PRD003", nome: "Fritas P", categoria: "Acompanhamentos", preco: 12.00, emoji: "🍟",
    receita: [
      { ingredienteId: "ING06", quantidade: 0.2, unidade: "kg" },
    ],
  },
];
