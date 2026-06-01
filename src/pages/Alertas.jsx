// src/pages/Alertas.jsx
// Central de alertas: vencimento de lotes e estoque abaixo do mínimo.

import Icon, { icons } from "../components/Icon";
import { Badge, Card } from "../components/UI";

export default function Alertas({ alertas }) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Central de Alertas</h2>
        <p className="text-zinc-500 text-sm">{alertas.length} alertas ativos no momento.</p>
      </div>

      {alertas.length === 0 ? (
        <Card>
          <p className="text-center text-zinc-500 py-8">✅ Nenhum alerta ativo. Estoque sob controle!</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {alertas.map((a, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-xl"
              style={{
                background: "#141414",
                border: `1px solid ${a.nivel === "critico" ? "#ef444440" : a.nivel === "atencao" ? "#f9731640" : "#1e1e1e"}`,
              }}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.nivel === "critico" ? "bg-red-500/20" : a.nivel === "atencao" ? "bg-orange-500/20" : "bg-amber-500/20"}`}>
                <Icon
                  d={icons.warning}
                  size={16}
                  className={a.nivel === "critico" ? "text-red-400" : a.nivel === "atencao" ? "text-orange-400" : "text-amber-400"}
                />
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold text-sm">{a.titulo}</div>
                <div className="text-zinc-400 text-xs mt-0.5">{a.descricao}</div>
              </div>
              <Badge
                className={
                  a.nivel === "critico"
                    ? "text-red-400 bg-red-400/10 border-red-400/20"
                    : a.nivel === "atencao"
                    ? "text-orange-400 bg-orange-400/10 border-orange-400/20"
                    : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                }
              >
                {a.nivel === "critico" ? "Crítico" : a.nivel === "atencao" ? "Atenção" : "Aviso"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
