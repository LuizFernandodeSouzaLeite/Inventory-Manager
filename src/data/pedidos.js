// src/data/pedidos.js
// Pedidos iniciais (mock) e tabela de prazos de validade padrão por categoria.
// Em produção: substituir por chamada à API/banco de dados.

import { addDias } from "../utils/helpers";

export const PEDIDOS_INIT = [
  {
    id: "PED001", numero: 1, status: "entregue", mesa: "02",
    itens: [{ produtoId: "PRD001", quantidade: 2, ajustes: [] }],
    total: 56.00, data: addDias(-1)+" 19:30", usuario: "Maria Lima", observacao: "",
  },
  {
    id: "PED002", numero: 2, status: "entregue", mesa: "05",
    itens: [
      { produtoId: "PRD001", quantidade: 1, ajustes: [{ ingredienteId: "ING01", delta: 0.15, label: "🥩 Carne bovina: +0.15 kg" }] },
      { produtoId: "PRD003", quantidade: 1, ajustes: [] },
    ],
    total: 40.00, data: addDias(-1)+" 20:10", usuario: "Carlos Matos", observacao: "cliente pediu carne dupla",
  },
];

// Prazos de validade padrão por categoria de ingrediente (em dias).
// Editável pelo gerente na tela de Configurações.
export const PRAZOS_PADRAO = {
  "Pães":        3,
  "Carnes":      5,
  "Queijos":     7,
  "Vegetais":    4,
  "Congelados":  30,
  "Condimentos": 90,
  "Outros":      14,
};
