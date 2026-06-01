// src/hooks/useAlertas.js
// Hook que calcula os alertas ativos dinamicamente.
// Re-executa sempre que lotes, ingredientes ou diasAviso mudam.

import { useMemo } from "react";
import { diasAte, fmtData, statusValidade } from "../utils/helpers";
import { calcEstoque } from "../utils/estoque";

/**
 * @param {Array}  lotes
 * @param {Array}  ingredientes
 * @param {number} diasAviso - dias antes do vencimento para alertar (vem de config)
 * @returns {Array} lista de alertas { nivel, titulo, descricao }
 */
export function useAlertas(lotes, ingredientes, diasAviso) {
  return useMemo(() => {
    const list = [];

    // ── Validade de lotes ───────────────────────────────────────────────────
    lotes.filter((l) => l.quantidadeRestante > 0).forEach((l) => {
      const ing  = ingredientes.find((i) => i.id === l.ingredienteId);
      const dias = diasAte(l.dataValidade);

      if (dias < 0) {
        list.push({
          nivel:    "critico",
          titulo:   `Lote vencido: ${ing?.nome} — Lote ${l.numero}`,
          descricao:`Venceu há ${Math.abs(dias)} dia(s). Restam ${l.quantidadeRestante} ${ing?.unidade}. Descarte imediato recomendado.`,
        });
      } else if (dias <= diasAviso) {
        list.push({
          nivel:    "atencao",
          titulo:   `Vencendo em ${dias}d: ${ing?.nome} — Lote ${l.numero}`,
          descricao:`Validade: ${fmtData(l.dataValidade)}. Restam ${l.quantidadeRestante} ${ing?.unidade}. Priorize o uso deste lote.`,
        });
      }
    });

    // ── Estoque abaixo do mínimo ────────────────────────────────────────────
    ingredientes.forEach((ing) => {
      const atual = calcEstoque(lotes, ing.id);
      if (atual <= 0) {
        list.push({
          nivel:    "critico",
          titulo:   `Estoque zerado: ${ing.nome}`,
          descricao:`Nenhuma unidade disponível. Mínimo recomendado: ${ing.minimo} ${ing.unidade}.`,
        });
      } else if (atual < ing.minimo) {
        list.push({
          nivel:    "atencao",
          titulo:   `Estoque baixo: ${ing.nome}`,
          descricao:`${atual.toFixed(1)} ${ing.unidade} disponíveis. Mínimo: ${ing.minimo} ${ing.unidade}.`,
        });
      }
    });

    return list;
  }, [lotes, ingredientes, diasAviso]);
}
