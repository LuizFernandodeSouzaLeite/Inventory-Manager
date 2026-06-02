// src/pages/IngredienteDetalhe.jsx
// Página de detalhe de um ingrediente — métricas, gráficos, histórico, fornecedores.

import { useState, useMemo } from "react";
import Icon, { icons } from "../components/Icon";
import { Badge, Card } from "../components/UI";
import { calcEstoque, calcEstoqueOp } from "../utils/estoque";
import { fmtData, diasAte, corStatus, addDias } from "../utils/helpers";

// ── Gráfico SVG inline ────────────────────────────────────────────────────────
function GraficoLinha({ dados, labels, cor, altura = 120 }) {
  if (!dados || dados.length < 2) return (
    <div style={{ height: altura, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#2A2A2A" }}>Dados insuficientes</span>
    </div>
  );
  const max = Math.max(...dados, 1);
  const W = 500; const pad = 10; const plotW = W - pad * 2; const plotH = altura - 20;
  const toX = i => pad + (i / Math.max(dados.length - 1, 1)) * plotW;
  const toY = v => plotH - (v / max) * plotH;
  const pts = dados.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const area = `${toX(0)},${plotH} ` + pts + ` ${toX(dados.length - 1)},${plotH}`;

  return (
    <svg viewBox={`0 0 ${W} ${altura}`} style={{ width: "100%", height: altura, display: "block" }}>
      <defs>
        <linearGradient id={`g${cor.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cor} stopOpacity={0.3}/>
          <stop offset="100%" stopColor={cor} stopOpacity={0.02}/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#g${cor.replace("#","")})`}/>
      <polyline points={pts} fill="none" stroke={cor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/>
      {dados.map((v, i) => <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill={cor}/>)}
      {labels.map((lbl, i) => (
        <text key={i} x={toX(i)} y={altura - 2} textAnchor="middle" fill="#2A2A2A" fontSize={8} fontFamily="'DM Mono', monospace">{lbl}</text>
      ))}
    </svg>
  );
}

function GraficoBarra({ dados, labels, cor, altura = 120 }) {
  const max = Math.max(...dados, 1);
  const W = 500; const pad = 10; const plotW = W - pad * 2; const plotH = altura - 20;
  const barW = Math.max(8, (plotW / dados.length) - 6);
  return (
    <svg viewBox={`0 0 ${W} ${altura}`} style={{ width: "100%", height: altura, display: "block" }}>
      {dados.map((v, i) => {
        const h = Math.max(2, (v / max) * plotH);
        const x = pad + i * ((plotW / dados.length)) + ((plotW / dados.length) - barW) / 2;
        return (
          <g key={i}>
            <rect x={x} y={plotH - h} width={barW} height={h} fill={cor} opacity={0.8} rx={3}/>
            <text x={x + barW / 2} y={altura - 2} textAnchor="middle" fill="#2A2A2A" fontSize={8} fontFamily="'DM Mono', monospace">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Seção com título ──────────────────────────────────────────────────────────
function Secao({ titulo, sub, children, accent }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: accent, textTransform: "uppercase", fontWeight: 600 }}>{titulo}</span>
        {sub && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, color: "#2A2A2A", letterSpacing: "0.06em" }}>{sub}</span>}
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${accent}25, transparent)` }}/>
      </div>
      {children}
    </div>
  );
}

// ── Stat mini ─────────────────────────────────────────────────────────────────
function MiniStat({ label, value, sub, cor }) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 8, background: "#0A0A0A", border: "1px solid #1A1A1A" }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, color: "#3A3A3A", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 600, color: cor || "#EDE9DF", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, color: "#3A3A3A", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function IngredienteDetalhe({ ingrediente, lotes, movimentos, onVoltar, t = {} }) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const border       = t.border       || "#1E1E1E";

  const ing = ingrediente;

  // ── Lotes deste ingrediente ───────────────────────────────────────────────
  const lotesIng = useMemo(() =>
    lotes.filter(l => l.ingredienteId === ing.id)
      .sort((a, b) => new Date(b.dataEntrada) - new Date(a.dataEntrada)),
    [lotes, ing.id]
  );

  // ── Movimentos deste ingrediente ──────────────────────────────────────────
  const movsIng = useMemo(() =>
    movimentos.filter(m => m.ingredienteId === ing.id)
      .sort((a, b) => b.data.localeCompare(a.data)),
    [movimentos, ing.id]
  );

  const entradasIng  = movsIng.filter(m => m.tipo === "entrada");
  const saidasIng    = movsIng.filter(m => m.tipo === "saida" || m.tipo === "descarte");

  // ── Métricas ──────────────────────────────────────────────────────────────
  const estoqueBase  = calcEstoque(lotes, ing.id);
  const estoqueOp    = calcEstoqueOp(lotes, ing);
  const status       = estoqueBase <= 0 ? "Crítico" : estoqueBase < ing.minimo ? "Baixo" : "Normal";

  const totalEntrado  = entradasIng.reduce((s, m) => s + m.quantidade, 0);
  const totalSaido    = saidasIng.reduce((s, m) => s + m.quantidade, 0);
  const custoTotal    = lotesIng.reduce((s, l) => s + (l.custo || 0), 0);
  const custoMedio    = lotesIng.length > 0 ? custoTotal / lotesIng.length : 0;
  const custoUnitMedio = totalEntrado > 0 ? custoTotal / totalEntrado : 0;

  // Custo médio este mês vs mês passado
  const agora = new Date();
  const mesAtual = agora.getMonth();
  const anoAtual = agora.getFullYear();
  const lotesEsteMes    = lotesIng.filter(l => { const d = new Date(l.dataEntrada); return d.getMonth() === mesAtual && d.getFullYear() === anoAtual; });
  const lotesMesPassado = lotesIng.filter(l => { const d = new Date(l.dataEntrada); const m = mesAtual === 0 ? 11 : mesAtual - 1; const a = mesAtual === 0 ? anoAtual - 1 : anoAtual; return d.getMonth() === m && d.getFullYear() === a; });

  const custoMedioMesAtual    = lotesEsteMes.length > 0    ? lotesEsteMes.reduce((s, l) => s + (l.custo || 0), 0)    / lotesEsteMes.length    : null;
  const custoMedioMesPassado  = lotesMesPassado.length > 0 ? lotesMesPassado.reduce((s, l) => s + (l.custo || 0), 0) / lotesMesPassado.length : null;
  const variacaoPreco = custoMedioMesAtual !== null && custoMedioMesPassado !== null && custoMedioMesPassado > 0
    ? ((custoMedioMesAtual - custoMedioMesPassado) / custoMedioMesPassado) * 100
    : null;

  // ── Fornecedores extraídos das observações ────────────────────────────────
  const fornecedores = useMemo(() => {
    const map = {};
    lotesIng.forEach(l => {
      const f = l.fornecedor || (l.observacao || "").trim() || null;
      if (!f) return;
      if (!map[f]) map[f] = { nome: f, compras: 0, totalGasto: 0, ultimaCompra: "" };
      map[f].compras++;
      map[f].totalGasto += l.custo || 0;
      if (!map[f].ultimaCompra || l.dataEntrada > map[f].ultimaCompra) map[f].ultimaCompra = l.dataEntrada;
    });
    return Object.values(map).sort((a, b) => b.compras - a.compras);
  }, [lotesIng]);

  // ── Dados para gráficos — últimos 8 lotes por data de entrada ─────────────
  const ultLotes = [...lotesIng].sort((a, b) => new Date(a.dataEntrada) - new Date(b.dataEntrada)).slice(-8);
  const dadosCusto    = ultLotes.map(l => l.custo || 0);
  const dadosQtd      = ultLotes.map(l => l.quantidade);
  const labelsCusto   = ultLotes.map(l => fmtData(l.dataEntrada).slice(0, 5));

  // Histórico de estoque (últimos 7 dias)
  const ultDias = Array.from({ length: 7 }, (_, i) => addDias(-(6 - i)));
  const labelsDias = ultDias.map((_, i) => i === 6 ? "hj" : `D-${6 - i}`);
  const dadosEstoque = ultDias.map(d => {
    // Soma do estoque baseado nos lotes ativos naquele dia (aproximação)
    return lotes.filter(l => l.ingredienteId === ing.id && l.dataEntrada <= d).reduce((s, l) => {
      // Lotes que ainda existiam naquele dia
      if (l.dataEntrada <= d) return s + Math.max(0, l.quantidadeRestante);
      return s;
    }, 0);
  });

  // ── Aba ativa ─────────────────────────────────────────────────────────────
  const [aba, setAba] = useState("visao");
  const ABAS = [
    { id: "visao",      label: "Visão Geral" },
    { id: "lotes",      label: "Lotes"       },
    { id: "historico",  label: "Histórico"   },
    { id: "fornecedor", label: "Fornecedor"  },
  ];

  return (
    <div>
      {/* ── Botão voltar + cabeçalho ──────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={onVoltar} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#444", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11, marginBottom: 16, padding: 0, transition: "color 0.15s", letterSpacing: "0.04em" }}
          onMouseEnter={e => e.currentTarget.style.color = accent}
          onMouseLeave={e => e.currentTarget.style.color = "#444"}
        >
          <Icon d={icons.arrowRight} size={12} style={{ transform: "rotate(180deg)" }}/> Voltar para Ingredientes
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: accentDim, border: `1px solid ${accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
            {ing.emoji}
          </div>
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "-0.03em", color: "#EDE9DF", lineHeight: 1.1 }}>
              {ing.nome}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", letterSpacing: "0.06em" }}>{ing.categoria.toUpperCase()}</span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#2A2A2A" }}/>
              <Badge className={corStatus(status)}>{status}</Badge>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#2A2A2A" }}/>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A" }}>
                {ing.fatorConversao !== 1 ? `1 un = ${ing.fatorConversao} ${ing.unidade}` : `unidade: ${ing.unidade}`}
              </span>
            </div>
          </div>

          {/* Estoque atual em destaque */}
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 600, color: status === "Normal" ? accent : status === "Baixo" ? "#F97316" : "#EF4444", letterSpacing: "-0.04em", lineHeight: 1 }}>
              {estoqueOp % 1 === 0 ? estoqueOp.toFixed(0) : estoqueOp.toFixed(1)}
              <span style={{ fontSize: 16, color: "#3A3A3A", marginLeft: 4 }}>un</span>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", marginTop: 3 }}>
              {estoqueBase.toFixed(2)} {ing.unidade} em estoque
            </div>
          </div>
        </div>
      </div>

      {/* ── Abas ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: bgCard, border: `1px solid ${border}`, borderRadius: 10, padding: 4 }}>
        {ABAS.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)} style={{ flex: 1, padding: "7px 0", borderRadius: 7, background: aba === a.id ? accentDim : "transparent", border: `1px solid ${aba === a.id ? accentBorder : "transparent"}`, color: aba === a.id ? accent : "#444", fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, fontWeight: aba === a.id ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ABA: VISÃO GERAL                                                  */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {aba === "visao" && (
        <div>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
            <MiniStat label="Estoque (un)" value={estoqueOp % 1 === 0 ? estoqueOp.toFixed(0) : estoqueOp.toFixed(1)} sub={`mín: ${(ing.minimo / (ing.fatorConversao || 1)).toFixed(0)} un`} cor={status === "Normal" ? accent : status === "Baixo" ? "#F97316" : "#EF4444"}/>
            <MiniStat label="Total entrado" value={`${totalEntrado.toFixed(1)} ${ing.unidade}`} sub={`${entradasIng.length} lotes registrados`} cor="#4ADE80"/>
            <MiniStat label="Total consumido" value={`${totalSaido.toFixed(1)} ${ing.unidade}`} sub={`${saidasIng.length} movimentações`} cor="#F87171"/>
            <MiniStat label="Custo médio/lote" value={`R$${custoMedio.toFixed(2)}`} sub={`R$${custoUnitMedio.toFixed(2)} por ${ing.unidade}`} cor={accent}/>
          </div>

          {/* Comparativo de preço mês a mês */}
          {variacaoPreco !== null && (
            <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 20, background: variacaoPreco > 0 ? "#EF444410" : "#4ADE8010", border: `1px solid ${variacaoPreco > 0 ? "#EF444430" : "#4ADE8030"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon d={variacaoPreco > 0 ? icons.trendingDown : icons.trending} size={16} style={{ color: variacaoPreco > 0 ? "#EF4444" : "#4ADE80" }}/>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: variacaoPreco > 0 ? "#EF4444" : "#4ADE80" }}>
                    {variacaoPreco > 0 ? "+" : ""}{variacaoPreco.toFixed(1)}% em relação ao mês passado
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10.5, color: "#555", marginLeft: 10 }}>
                    Mês atual: R${custoMedioMesAtual?.toFixed(2)} · Mês passado: R${custoMedioMesPassado?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Gráficos */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <Card>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13, color: "#C8C4BC", marginBottom: 12 }}>Custo por lote</div>
              <GraficoBarra dados={dadosCusto} labels={labelsCusto} cor={accent} altura={130}/>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, color: "#2A2A2A", marginTop: 6, letterSpacing: "0.04em" }}>R$ POR LOTE — ÚLTIMAS ENTRADAS</div>
            </Card>
            <Card>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13, color: "#C8C4BC", marginBottom: 12 }}>Quantidade por lote</div>
              <GraficoBarra dados={dadosQtd} labels={labelsCusto} cor="#4ADE80" altura={130}/>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, color: "#2A2A2A", marginTop: 6, letterSpacing: "0.04em" }}>{ing.unidade.toUpperCase()} POR LOTE — ÚLTIMAS ENTRADAS</div>
            </Card>
          </div>

          {/* Lotes ativos */}
          <Secao titulo="Lotes Ativos" accent={accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {lotesIng.filter(l => l.quantidadeRestante > 0).length === 0
                ? <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#2A2A2A", padding: "12px 0" }}>Nenhum lote ativo</p>
                : lotesIng.filter(l => l.quantidadeRestante > 0).map(l => {
                  const dias = diasAte(l.dataValidade);
                  const pct  = l.quantidade > 0 ? (l.quantidadeRestante / l.quantidade) * 100 : 0;
                  const cor  = dias < 0 ? "#EF4444" : dias <= 3 ? "#F97316" : "#4ADE80";
                  return (
                    <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, background: "#0A0A0A", border: `1px solid ${border}` }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", width: 48, flexShrink: 0 }}>Lote {l.numero}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#C8C4BC" }}>{l.quantidadeRestante} / {l.quantidade} {ing.unidade}</span>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: cor }}>{dias < 0 ? `vencido há ${Math.abs(dias)}d` : `vence em ${dias}d`}</span>
                        </div>
                        <div style={{ height: 3, background: "#161616", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: cor, borderRadius: 2, transition: "width 0.4s" }}/>
                        </div>
                      </div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", textAlign: "right", flexShrink: 0 }}>
                        <div>R${l.custo?.toFixed(2) || "—"}</div>
                        <div style={{ color: "#2A2A2A", marginTop: 1 }}>{fmtData(l.dataValidade)}</div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </Secao>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ABA: LOTES                                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {aba === "lotes" && (
        <div>
          <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 1fr 1fr 1fr", padding: "10px 16px", background: bgBody, borderBottom: `1px solid ${border}` }}>
              {["Lote","Entrada","Validade","Dias","Qtd inicial","Restante","Custo"].map(h => (
                <span key={h} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, color: "#2A2A2A", letterSpacing: "0.1em" }}>{h}</span>
              ))}
            </div>
            {lotesIng.map((l, idx) => {
              const dias = diasAte(l.dataValidade);
              const pct  = l.quantidade > 0 ? (l.quantidadeRestante / l.quantidade) * 100 : 0;
              const cor  = dias < 0 ? "#EF4444" : dias <= 3 ? "#F97316" : "#4ADE80";
              return (
                <div key={l.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 1fr 1fr 1fr", padding: "11px 16px", alignItems: "center", borderBottom: idx < lotesIng.length - 1 ? `1px solid ${border}` : "none" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#555" }}>#{l.numero}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#555" }}>{fmtData(l.dataEntrada)}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#C8C4BC" }}>{fmtData(l.dataValidade)}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: cor }}>{dias < 0 ? `${Math.abs(dias)}d atrás` : `${dias}d`}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#555" }}>{l.quantidade} {ing.unidade}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 40, height: 2, background: "#161616", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: cor, borderRadius: 2 }}/>
                      </div>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#C8C4BC" }}>{l.quantidadeRestante}</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: accent }}>R${l.custo?.toFixed(2) || "—"}</span>
                </div>
              );
            })}
            {lotesIng.length === 0 && (
              <div style={{ padding: "24px 0", textAlign: "center" }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#2A2A2A" }}>Nenhum lote registrado</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ABA: HISTÓRICO                                                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {aba === "historico" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            <MiniStat label="Total entradas" value={`${entradasIng.length}`} sub={`${totalEntrado.toFixed(1)} ${ing.unidade} recebidos`} cor="#4ADE80"/>
            <MiniStat label="Total saídas" value={`${saidasIng.length}`} sub={`${totalSaido.toFixed(1)} ${ing.unidade} consumidos`} cor="#F87171"/>
          </div>

          <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1fr 0.7fr 1fr 1fr", padding: "10px 16px", background: bgBody, borderBottom: `1px solid ${border}` }}>
              {["TIPO","DATA","QTD","USUÁRIO","MOTIVO"].map(h => (
                <span key={h} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, color: "#2A2A2A", letterSpacing: "0.1em" }}>{h}</span>
              ))}
            </div>
            {movsIng.slice(0, 30).map((m, idx) => {
              const cor = m.tipo === "entrada" ? "#4ADE80" : m.tipo === "descarte" ? "#FBBF24" : "#F87171";
              return (
                <div key={m.id} style={{ display: "grid", gridTemplateColumns: "0.8fr 1fr 0.7fr 1fr 1fr", padding: "10px 16px", alignItems: "center", borderBottom: idx < Math.min(movsIng.length, 30) - 1 ? `1px solid ${border}` : "none" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", fontFamily: "'DM Mono', monospace", fontSize: 10, padding: "2px 8px", borderRadius: 4, background: cor + "15", color: cor, border: `1px solid ${cor}30` }}>
                    {m.tipo}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#555" }}>{m.data.slice(0, 16)}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: m.tipo === "entrada" ? "#4ADE80" : "#F87171", fontWeight: 600 }}>
                    {m.tipo === "entrada" ? "+" : "-"}{m.quantidade} {ing.unidade}
                  </span>
                  <span style={{ fontSize: 12, color: "#555" }}>{m.usuario}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.motivo || "—"}</span>
                </div>
              );
            })}
            {movsIng.length === 0 && (
              <div style={{ padding: "24px 0", textAlign: "center" }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#2A2A2A" }}>Nenhuma movimentação</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ABA: FORNECEDOR                                                   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {aba === "fornecedor" && (
        <div>
          {fornecedores.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", background: bgCard, borderRadius: 10, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🏭</div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#2A2A2A" }}>
                Nenhum fornecedor registrado ainda.
              </p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#1E1E1E", marginTop: 6 }}>
                Adicione o fornecedor no campo "Observação" ao registrar uma entrada.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {fornecedores.map((f, i) => (
                <div key={f.nome} style={{ padding: "16px 18px", borderRadius: 10, background: bgCard, border: `1px solid ${i === 0 ? accentBorder : border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: i === 0 ? accentDim : "#141414", border: `1px solid ${i === 0 ? accentBorder : border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                        🏭
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#EDE9DF" }}>{f.nome}</div>
                        {i === 0 && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, color: accent, marginTop: 2, letterSpacing: "0.06em" }}>FORNECEDOR PRINCIPAL</div>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 600, color: accent }}>R${f.totalGasto.toFixed(2)}</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", marginTop: 2 }}>total gasto</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <div style={{ padding: "8px 10px", borderRadius: 7, background: bgBody, border: `1px solid ${border}` }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#2A2A2A", letterSpacing: "0.08em" }}>COMPRAS</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: "#C8C4BC", fontWeight: 600, marginTop: 3 }}>{f.compras}</div>
                    </div>
                    <div style={{ padding: "8px 10px", borderRadius: 7, background: bgBody, border: `1px solid ${border}` }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#2A2A2A", letterSpacing: "0.08em" }}>MÉDIA/COMPRA</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: "#C8C4BC", fontWeight: 600, marginTop: 3 }}>R${(f.totalGasto / f.compras).toFixed(2)}</div>
                    </div>
                    <div style={{ padding: "8px 10px", borderRadius: 7, background: bgBody, border: `1px solid ${border}` }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#2A2A2A", letterSpacing: "0.08em" }}>ÚLTIMA COMPRA</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: "#C8C4BC", fontWeight: 600, marginTop: 3 }}>{fmtData(f.ultimaCompra)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Histórico de entradas com fornecedor */}
          <Secao titulo="Histórico de Compras" accent={accent} style={{ marginTop: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {entradasIng.map((m, idx) => {
                const lote = lotes.find(l => l.id === m.loteId);
                const fornecedor = lote?.fornecedor || lote?.observacao || "Não informado";
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, background: "#0A0A0A", border: `1px solid ${border}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, color: "#C8C4BC", fontWeight: 500 }}>{fornecedor}</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", marginTop: 2 }}>
                        {m.data.slice(0, 10).split("-").reverse().join("/")} · Lote {lote?.numero} · {m.quantidade} {ing.unidade}
                      </div>
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: accent, fontWeight: 600, flexShrink: 0 }}>
                      R${lote?.custo?.toFixed(2) || "—"}
                    </div>
                  </div>
                );
              })}
              {entradasIng.length === 0 && (
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#2A2A2A", padding: "12px 0" }}>Nenhuma entrada registrada</p>
              )}
            </div>
          </Secao>
        </div>
      )}
    </div>
  );
}