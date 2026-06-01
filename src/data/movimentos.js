// src/data/movimentos.js
// Histórico inicial de movimentações (entradas, saídas, descartes).
// Em produção: substituir por chamada à API/banco de dados.

import { addDias, hoje } from "../utils/helpers";

export const MOVIMENTOS_INIT = [
  { id: "MOV001", tipo: "entrada",  loteId: "LOT001", ingredienteId: "ING01", quantidade: 8,  data: addDias(-2)+" 14:22", usuario: "João Silva",   motivo: "Compra fornecedor", pedidoId: null    },
  { id: "MOV002", tipo: "saida",    loteId: "LOT002", ingredienteId: "ING02", quantidade: 12, data: addDias(-1)+" 13:10", usuario: "Maria Lima",   motivo: "Uso produção",      pedidoId: "PED001" },
  { id: "MOV003", tipo: "entrada",  loteId: "LOT002", ingredienteId: "ING02", quantidade: 60, data: addDias(-1)+" 09:45", usuario: "João Silva",   motivo: "Compra fornecedor", pedidoId: null    },
  { id: "MOV004", tipo: "saida",    loteId: "LOT001", ingredienteId: "ING01", quantidade: 0,  data: addDias(-1)+" 18:30", usuario: "Carlos Matos", motivo: "Uso produção",      pedidoId: "PED002" },
  { id: "MOV005", tipo: "entrada",  loteId: "LOT006", ingredienteId: "ING01", quantidade: 5,  data: hoje()+" 10:00",      usuario: "João Silva",   motivo: "Compra fornecedor", pedidoId: null    },
  { id: "MOV006", tipo: "descarte", loteId: "LOT003", ingredienteId: "ING05", quantidade: 3,  data: hoje()+" 08:00",      usuario: "Maria Lima",   motivo: "Produto vencido",   pedidoId: null    },
];
