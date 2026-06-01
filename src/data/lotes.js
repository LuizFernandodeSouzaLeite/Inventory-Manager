// src/data/lotes.js
// Lotes de estoque iniciais (mock).
// Importa addDias/hoje de utils/helpers para gerar datas relativas a hoje.
// Em produção: substituir por chamada à API/banco de dados.

import { addDias, hoje } from "../utils/helpers";

export const LOTES_INIT = [
  { id: "LOT001", ingredienteId: "ING01", numero: 1, quantidade: 8,   quantidadeRestante: 8,   dataEntrada: addDias(-2), dataValidade: addDias(3),  custo: 120.00, usuario: "João Silva",  observacao: "Fornecedor Frigorifico Bom" },
  { id: "LOT002", ingredienteId: "ING02", numero: 1, quantidade: 60,  quantidadeRestante: 48,  dataEntrada: addDias(-1), dataValidade: addDias(2),  custo: 48.00,  usuario: "João Silva",  observacao: "" },
  { id: "LOT003", ingredienteId: "ING03", numero: 1, quantidade: 40,  quantidadeRestante: 35,  dataEntrada: addDias(-3), dataValidade: addDias(4),  custo: 60.00,  usuario: "Maria Lima",  observacao: "" },
  { id: "LOT004", ingredienteId: "ING04", numero: 1, quantidade: 800, quantidadeRestante: 650, dataEntrada: addDias(-1), dataValidade: addDias(4),  custo: 32.00,  usuario: "João Silva",  observacao: "" },
  { id: "LOT005", ingredienteId: "ING06", numero: 1, quantidade: 15,  quantidadeRestante: 12,  dataEntrada: addDias(-5), dataValidade: addDias(25), custo: 55.00,  usuario: "Maria Lima",  observacao: "Congelado" },
  { id: "LOT006", ingredienteId: "ING01", numero: 2, quantidade: 5,   quantidadeRestante: 5,   dataEntrada: hoje(),      dataValidade: addDias(5),  custo: 75.00,  usuario: "João Silva",  observacao: "Lote novo" },
];
