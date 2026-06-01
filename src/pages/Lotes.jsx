// src/pages/Lotes.jsx
// Controle de lotes: rastreamento individual de cada lote com validade e consumo.

import { useState } from "react";
import { Badge, Card, Select } from "../components/UI";
import { fmtData, diasAte, statusValidade, corStatus } from "../utils/helpers";

export default function Lotes({ lotes, ingredientes }) {
  const [filtroIng,    setFiltroIng]    = useState("Todos");
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  const filtrado = lotes
    .filter((l) => {
      const matchIng    = filtroIng === "Todos" || l.ingredienteId === filtroIng;
      const sv          = statusValidade(l.dataValidade, 3);
      const matchStatus =
        filtroStatus === "Todos" ||
        sv === filtroStatus ||
        (filtroStatus === "esgotado" && l.quantidadeRestante === 0);
      return matchIng && matchStatus;
    })
    .sort((a, b) => new Date(a.dataValidade) - new Date(b.dataValidade));

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Controle de Lotes</h2>
        <p className="text-zinc-500 text-sm">Rastreie cada lote de ingrediente com validade e consumo.</p>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Select label="" value={filtroIng} onChange={(e) => setFiltroIng(e.target.value)} className="!mb-0">
          <option value="Todos">Todos ingredientes</option>
          {ingredientes.map((i) => (
            <option key={i.id} value={i.id}>{i.emoji} {i.nome}</option>
          ))}
        </Select>
        <div className="flex gap-1">
          {[["Todos","Todos"],["ok","Normal"],["atencao","Atenção"],["critico","Crítico"],["vencido","Vencido"],["esgotado","Esgotado"]].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFiltroStatus(v)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filtroStatus === v ? "#f97316" : "#141414",
                color:      filtroStatus === v ? "#fff"    : "#71717a",
                border:     filtroStatus === v ? "1px solid #f97316" : "1px solid #1e1e1e",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#111", borderBottom: "1px solid #1e1e1e" }}>
              {["Lote","Ingrediente","Entrada","Validade","Dias p/ vencer","Qtd inicial","Restante","Status","Registrado por"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrado.map((l, idx) => {
              const ing         = ingredientes.find((i) => i.id === l.ingredienteId);
              const sv          = statusValidade(l.dataValidade, 3);
              const dias        = diasAte(l.dataValidade);
              const pct         = l.quantidade > 0 ? (l.quantidadeRestante / l.quantidade) * 100 : 0;
              const statusLabel = l.quantidadeRestante === 0 ? "Esgotado"
                : sv === "vencido"  ? "Vencido"
                : sv === "critico"  ? "Crítico"
                : sv === "atencao"  ? "Atenção"
                : "Normal";
              const statusKey   = l.quantidadeRestante === 0 ? "Crítico" : statusLabel;

              return (
                <tr
                  key={l.id}
                  className="hover:bg-white/[0.02] transition-colors"
                  style={{ borderBottom: idx < filtrado.length - 1 ? "1px solid #1a1a1a" : "none" }}
                >
                  <td className="px-4 py-3 text-zinc-400 text-xs font-mono">#{l.id}</td>
                  <td className="px-4 py-3">
                    <div className="text-zinc-200 font-medium text-xs">{ing?.emoji} {ing?.nome}</div>
                    <div className="text-zinc-600 text-[11px]">Lote {l.numero}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{fmtData(l.dataEntrada)}</td>
                  <td className="px-4 py-3 text-zinc-300 text-xs font-medium">{fmtData(l.dataValidade)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${dias < 0 ? "text-red-400" : dias <= 3 ? "text-orange-400" : dias <= 7 ? "text-amber-400" : "text-zinc-400"}`}>
                      {dias < 0 ? `${Math.abs(dias)}d atrás` : `${dias}d`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{l.quantidade} {ing?.unidade}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "#2a2a2a" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: pct > 50 ? "#22c55e" : pct > 20 ? "#f97316" : "#ef4444" }}
                        />
                      </div>
                      <span className="text-xs text-zinc-300">{l.quantidadeRestante} {ing?.unidade}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge className={corStatus(statusKey)}>{statusLabel}</Badge></td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{l.usuario}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
