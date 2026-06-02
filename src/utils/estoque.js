// src/utils/estoque.js
// v2.0 — funções de cálculo e consumo de estoque com suporte a fatorConversao.

/**
 * Retorna a quantidade total disponível de um ingrediente (em sua unidade base).
 */
export function calcEstoque(lotes, ingredienteId) {
  return lotes
    .filter(l => l.ingredienteId === ingredienteId && l.quantidadeRestante > 0)
    .reduce((s, l) => s + l.quantidadeRestante, 0);
}

/**
 * Retorna o estoque em unidades operacionais (o que o funcionário entende).
 * Ex: 1.5kg de carne com fatorConversao=0.15 → 10 unidades operacionais
 */
export function calcEstoqueOp(lotes, ingrediente) {
  const estoqueBase = calcEstoque(lotes, ingrediente.id);
  const fator = ingrediente.fatorConversao || 1;
  return estoqueBase / fator;
}

/**
 * Converte quantidade operacional → quantidade base para baixar do estoque.
 * Ex: 2 unidades de carne × 0.15 = 0.30kg
 */
export function opParaBase(quantidadeOp, ingrediente) {
  return quantidadeOp * (ingrediente.fatorConversao || 1);
}

/**
 * Converte quantidade base → operacional para exibição.
 */
export function baseParaOp(quantidadeBase, ingrediente) {
  const fator = ingrediente.fatorConversao || 1;
  return quantidadeBase / fator;
}

/**
 * Consome `quantidadeOp` unidades operacionais de um ingrediente via FIFO.
 * Internamente converte para unidade base antes de descontar dos lotes.
 *
 * @param {Array}  lotes
 * @param {Object} ingrediente — objeto completo (precisa de fatorConversao)
 * @param {number} quantidadeOp — em unidades operacionais ("un")
 */
export function consumirLotesFIFO(lotes, ingrediente, quantidadeOp) {
  const ingredienteId = ingrediente.id || ingrediente; // retrocompatibilidade
  const fator = (typeof ingrediente === "object" ? ingrediente.fatorConversao : null) || 1;
  const quantidadeBase = quantidadeOp * fator;

  const ativos = [...lotes]
    .filter(l => l.ingredienteId === ingredienteId && l.quantidadeRestante > 0)
    .sort((a, b) => new Date(a.dataValidade) - new Date(b.dataValidade));

  let restante = quantidadeBase;
  const novosLotes = lotes.map(l => ({ ...l }));
  const consumidos = [];

  for (const lote of ativos) {
    if (restante <= 0) break;
    const idx = novosLotes.findIndex(l => l.id === lote.id);
    const consumir = Math.min(novosLotes[idx].quantidadeRestante, restante);
    novosLotes[idx].quantidadeRestante -= consumir;
    consumidos.push({ loteId: lote.id, ingredienteId, quantidade: consumir });
    restante -= consumir;
  }

  return { novosLotes, consumidos, sucesso: restante <= 0 };
}