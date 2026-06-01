// src/utils/estoque.js
// Funções de lógica de negócio para cálculo e consumo de estoque.

/**
 * Retorna a quantidade total disponível de um ingrediente somando todos os lotes ativos.
 * @param {Array} lotes
 * @param {string} ingredienteId
 * @returns {number}
 */
export function calcEstoque(lotes, ingredienteId) {
  return lotes
    .filter((l) => l.ingredienteId === ingredienteId && l.quantidadeRestante > 0)
    .reduce((s, l) => s + l.quantidadeRestante, 0);
}

/**
 * Consome `quantidade` de um ingrediente usando a estratégia FIFO com prioridade
 * para lotes com validade mais próxima (evita desperdício).
 *
 * @param {Array}  lotes         - Estado atual dos lotes
 * @param {string} ingredienteId - ID do ingrediente a consumir
 * @param {number} quantidade    - Quantidade a consumir
 * @returns {{ novosLotes: Array, consumidos: Array, sucesso: boolean }}
 *   - novosLotes: cópia atualizada dos lotes após o consumo
 *   - consumidos: lista de { loteId, ingredienteId, quantidade } consumidos
 *   - sucesso: false se o estoque for insuficiente
 */
export function consumirLotesFIFO(lotes, ingredienteId, quantidade) {
  // Ordena: lotes com validade mais próxima primeiro (prioridade anti-desperdício)
  const ativos = [...lotes]
    .filter((l) => l.ingredienteId === ingredienteId && l.quantidadeRestante > 0)
    .sort((a, b) => new Date(a.dataValidade) - new Date(b.dataValidade));

  let restante = quantidade;
  const novosLotes = lotes.map((l) => ({ ...l }));
  const consumidos = [];

  for (const lote of ativos) {
    if (restante <= 0) break;
    const idx = novosLotes.findIndex((l) => l.id === lote.id);
    const consumir = Math.min(novosLotes[idx].quantidadeRestante, restante);
    novosLotes[idx].quantidadeRestante -= consumir;
    consumidos.push({ loteId: lote.id, ingredienteId, quantidade: consumir });
    restante -= consumir;
  }

  return { novosLotes, consumidos, sucesso: restante <= 0 };
}
