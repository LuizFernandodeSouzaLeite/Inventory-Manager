// src/pages/Dashboard.jsx
// v2.1 — ordenação de movimentos corrigida (ISO), exibição com fmtDataHoraBR.

import Icon, { icons } from "../components/Icon";
import { Badge, Card, StatCard, Divider } from "../components/UI";
import { calcEstoque } from "../utils/estoque";
import { hoje, diasAte, statusValidade, fmtDataHoraBR } from "../utils/helpers";

const TIPO_STYLE = {
  entrada:  { color: "#4ADE80", bg: "#4ADE8010", border: "#4ADE8025", label: "entrada"  },
  saida:    { color: "#F87171", bg: "#F8717110", border: "#F8717125", label: "saída"    },
  descarte: { color: "#FBBF24", bg: "#FBBF2410", border: "#FBBF2425", label: "descarte" },
};

export default function Dashboard({ ingredientes, lotes, movimentos, pedidos, alertas, setActive, t = {} }) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const bgElevated   = t.bgElevated   || "#141414";
  const border       = t.border       || "#1E1E1E";
  const borderMid    = t.borderMid    || "#252525";

  const totalEstoque  = ingredientes.reduce((s, ing) => s + calcEstoque(lotes, ing.id), 0);

  const lotesVencendo = lotes.filter(l => {
    const sv = statusValidade(l.dataValidade, 3);
    return sv === "critico" || sv === "vencido";
  }).length;

  const pedidosHoje = pedidos.filter(p => p.data.startsWith(hoje())).length;

  // Ordenação correta — ambos os formatos funcionam pois ISO ordena lexicograficamente
  const ultimosMov = [...movimentos]
    .sort((a, b) => {
      // Normaliza para ISO antes de comparar
      const toISO = (d) => {
        if (!d) return "";
        if (d.includes("/")) {
          // formato BR: "01/06/2026 14:30" → "2026-06-01 14:30"
          const [datePart, timePart = ""] = d.split(" ");
          const [dd, mm, yyyy] = datePart.split("/");
          return `${yyyy}-${mm}-${dd} ${timePart}`;
        }
        return d;
      };
      return toISO(b.data).localeCompare(toISO(a.data));
    })
    .slice(0, 6);

  const lotesAlerta = lotes
    .filter(l => {
      const sv = statusValidade(l.dataValidade, 3);
      return (sv === "critico" || sv === "vencido") && l.quantidadeRestante > 0;
    })
    .sort((a, b) => new Date(a.dataValidade) - new Date(b.dataValidade));

  const estoqueBaixo = ingredientes.filter(ing => calcEstoque(lotes, ing.id) < ing.minimo);

  return (
    <div>
      {/* Cabeçalho */}
      <div className="mb-6 anim-slide-up">
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.03em", color:t.textPrimary||"#EDE9DF", lineHeight:1.1 }}>
          Dashboard
        </h2>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t.textDim||"#3A3A3A", marginTop:5, letterSpacing:"0.08em" }}>
          {new Date().toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long" }).toUpperCase()}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 mb-5" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
        {[
          { label:"Itens em Estoque",  value:totalEstoque.toFixed(0),  sub:"un / kg disponíveis",    icon:icons.estoque,  iconColor:accent,                                              accent:"gold",                          className:"anim-slide-up anim-delay-1" },
          { label:"Lotes Vencendo",    value:lotesVencendo,            sub:"nos próximos 3 dias",     icon:icons.alertas,  iconColor:lotesVencendo>0?"#EF4444":"#333",                    accent:lotesVencendo>0?"red":null,      onClick:()=>setActive("alertas"), className:"anim-slide-up anim-delay-2" },
          { label:"Pedidos Hoje",      value:pedidosHoje,              sub:"registrados hoje",        icon:icons.pedidos,  iconColor:"#F97316",                                           accent:pedidosHoje>0?"ember":null,      onClick:()=>setActive("pedidos"), className:"anim-slide-up anim-delay-3" },
          { label:"Alertas Ativos",    value:alertas.length,           sub:"requerem atenção",        icon:icons.bell,     iconColor:alertas.length>0?"#FBBF24":"#333",                   accent:alertas.length>0?"gold":null,    onClick:()=>setActive("alertas"), className:"anim-slide-up anim-delay-4" },
        ].map(kpi => (
          <div key={kpi.label} className={kpi.className}>
            <StatCard {...kpi} />
          </div>
        ))}
      </div>

      {/* Corpo */}
      <div className="grid gap-4 anim-slide-up anim-delay-3" style={{ gridTemplateColumns:"1fr 300px" }}>

        {/* Tabela de movimentações */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:13.5, color:"#C8C4BC" }}>Últimas movimentações</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3A3A3A", padding:"1px 7px", borderRadius:4, background:bgElevated, border:"1px solid #222" }}>
                {ultimosMov.length}
              </span>
            </div>
            <button onClick={()=>setActive("entradas")}
              style={{ padding:"4px 10px", borderRadius:6, fontSize:11, color:t.textDim||"#3A3A3A", fontFamily:"'DM Mono',monospace", letterSpacing:"0.04em", background:"transparent", border:"1px solid transparent", cursor:"pointer", display:"flex", alignItems:"center", gap:4, transition:"all 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.color=accent; e.currentTarget.style.borderColor=accentBorder; e.currentTarget.style.background=accentDim; }}
              onMouseLeave={e=>{ e.currentTarget.style.color="#3A3A3A"; e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.background="transparent"; }}
            >
              ver todas <Icon d={icons.arrowRight} size={10}/>
            </button>
          </div>

          {/* Header tabela */}
          <div className="grid gap-2" style={{ gridTemplateColumns:"1.8fr 0.8fr 0.7fr 0.9fr 0.7fr", padding:"0 10px 8px", borderBottom:`1px solid ${border}` }}>
            {["INGREDIENTE","TIPO","QTD","DATA","POR"].map(h => (
              <span key={h} className="label-caps" style={{color:t.textDim||undefined}}>{h}</span>
            ))}
          </div>

          {/* Linhas */}
          {ultimosMov.map((m, idx) => {
            const ing  = ingredientes.find(i => i.id === m.ingredienteId);
            const tipo = TIPO_STYLE[m.tipo] || TIPO_STYLE.descarte;
            return (
              <div key={m.id}>
                <div className="grid gap-2 items-center"
                  style={{ gridTemplateColumns:"1.8fr 0.8fr 0.7fr 0.9fr 0.7fr", padding:"10px 10px", borderRadius:6, transition:"background 0.12s", cursor:"default" }}
                  onMouseEnter={e=>e.currentTarget.style.background=bgElevated}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span style={{ fontSize:14, flexShrink:0 }}>{ing?.emoji}</span>
                    <span style={{ fontSize:12.5, color:t.textSecondary||"#C8C4BC", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ing?.nome}</span>
                  </div>
                  <Badge style={{ background:tipo.bg, color:tipo.color, borderColor:tipo.border, fontSize:10 }}>{tipo.label}</Badge>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#EDE9DF", letterSpacing:"-0.01em" }}>
                    {m.quantidade} <span style={{ color:"#333", fontSize:10 }}>{ing?.unidade}</span>
                  </span>
                  {/* Exibição em BR, ordenação em ISO */}
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#3A3A3A", letterSpacing:"0.02em" }}>
                    {fmtDataHoraBR(m.data).split(" ")[0]}
                  </span>
                  <span style={{ fontSize:12, color:t.textMuted||"#4A4A4A" }}>{m.usuario.split(" ")[0]}</span>
                </div>
                {idx < ultimosMov.length - 1 && <Divider />}
              </div>
            );
          })}

          {ultimosMov.length === 0 && (
            <div style={{ padding:"24px 0", textAlign:"center" }}>
              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textGhost||"#2A2A2A" }}>Nenhuma movimentação registrada</p>
            </div>
          )}
        </Card>

        {/* Coluna direita */}
        <div className="flex flex-col gap-4">

          {/* Vencimento próximo */}
          <Card accent={lotesAlerta.length > 0 ? "ember" : null}>
            <div className="flex items-center gap-2.5 mb-4">
              <div style={{ width:24, height:24, borderRadius:7, background:lotesAlerta.length>0?"#F9731615":"#161616", border:`1px solid ${lotesAlerta.length>0?"#F9731630":"#1E1E1E"}`, display:"flex", alignItems:"center", justifyContent:"center", color:lotesAlerta.length>0?"#F97316":"#333" }}>
                <Icon d={icons.alertas} size={12}/>
              </div>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:13, color:t.textSecondary||"#C8C4BC" }}>Vencimento próximo</span>
              {lotesAlerta.length > 0 && (
                <span style={{ marginLeft:"auto", fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:600, padding:"1px 6px", borderRadius:4, background:"#F9731615", color:"#F97316", border:"1px solid #F9731630" }}>
                  {lotesAlerta.length}
                </span>
              )}
            </div>

            {lotesAlerta.length === 0 ? (
              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t.textGhost||"#2A2A2A", textAlign:"center", padding:"10px 0" }}>✓ Nenhum lote crítico</p>
            ) : (
              lotesAlerta.slice(0, 4).map((l, idx) => {
                const ing = ingredientes.find(i => i.id === l.ingredienteId);
                const d   = diasAte(l.dataValidade);
                const isVencido = d < 0;
                return (
                  <div key={l.id}>
                    <div className="flex items-center justify-between" style={{ padding:"9px 0" }}>
                      <div style={{ flex:1, minWidth:0, paddingRight:8 }}>
                        <div style={{ fontSize:12.5, color:t.textSecondary||"#C8C4BC", fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {ing?.emoji} {ing?.nome} — L{l.numero}
                        </div>
                        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.textDim||"#3A3A3A", marginTop:2 }}>
                          {l.quantidadeRestante} {ing?.unidade} restantes
                        </div>
                      </div>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:5, flexShrink:0, background:isVencido?"#EF444412":"#F9731612", color:isVencido?"#EF4444":"#F97316", border:`1px solid ${isVencido?"#EF444428":"#F9731628"}` }}>
                        {isVencido ? "vencido" : `${d}d`}
                      </span>
                    </div>
                    {idx < Math.min(lotesAlerta.length, 4) - 1 && <Divider />}
                  </div>
                );
              })
            )}

            {lotesAlerta.length > 4 && (
              <button onClick={()=>setActive("alertas")} style={{ width:"100%", marginTop:8, padding:"6px", borderRadius:6, background:bgElevated, border:"1px solid #222", fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#444", cursor:"pointer", transition:"color 0.15s,border-color 0.15s" }}
                onMouseEnter={e=>{ e.currentTarget.style.color="#F97316"; e.currentTarget.style.borderColor="#F9731628"; }}
                onMouseLeave={e=>{ e.currentTarget.style.color="#444"; e.currentTarget.style.borderColor="#222"; }}
              >
                + {lotesAlerta.length - 4} lotes
              </button>
            )}
          </Card>

          {/* Estoque baixo */}
          <Card accent={estoqueBaixo.length > 0 ? "red" : null}>
            <div className="flex items-center gap-2.5 mb-4">
              <div style={{ width:24, height:24, borderRadius:7, background:estoqueBaixo.length>0?"#EF444415":"#161616", border:`1px solid ${estoqueBaixo.length>0?"#EF444430":"#1E1E1E"}`, display:"flex", alignItems:"center", justifyContent:"center", color:estoqueBaixo.length>0?"#EF4444":"#333" }}>
                <Icon d={icons.arrowDown} size={12}/>
              </div>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:13, color:t.textSecondary||"#C8C4BC" }}>Estoque baixo</span>
              {estoqueBaixo.length > 0 && (
                <span style={{ marginLeft:"auto", fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:600, padding:"1px 6px", borderRadius:4, background:"#EF444415", color:"#EF4444", border:"1px solid #EF444430" }}>
                  {estoqueBaixo.length}
                </span>
              )}
            </div>

            {estoqueBaixo.length === 0 ? (
              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t.textGhost||"#2A2A2A", textAlign:"center", padding:"10px 0" }}>✓ Estoque OK em todos os itens</p>
            ) : (
              estoqueBaixo.slice(0, 5).map((ing, idx) => {
                const atual = calcEstoque(lotes, ing.id);
                const pct   = ing.minimo > 0 ? Math.min(atual / ing.minimo, 1) : 0;
                const cor   = pct < 0.3 ? "#EF4444" : pct < 0.6 ? "#F97316" : "#FBBF24";
                return (
                  <div key={ing.id}>
                    <div style={{ padding:"9px 0" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize:12.5, color:t.textSecondary||"#C8C4BC", flex:1, paddingRight:8, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {ing.emoji} {ing.nome}
                        </span>
                        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11.5, fontWeight:600, color:cor, flexShrink:0 }}>
                          {atual.toFixed(1)}<span style={{ color:"#2A2A2A", fontSize:10, fontWeight:400 }}>/{ing.minimo}{ing.unidade}</span>
                        </span>
                      </div>
                      <div style={{ height:2, background:bgElevated, borderRadius:2, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct*100}%`, background:cor, borderRadius:2, transition:"width 0.4s ease", boxShadow:`0 0 4px ${cor}50` }}/>
                      </div>
                    </div>
                    {idx < Math.min(estoqueBaixo.length, 5) - 1 && <Divider />}
                  </div>
                );
              })
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}