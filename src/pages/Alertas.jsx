// src/pages/Alertas.jsx
// v3.0 — visual premium, KPIs, cards por nível, retiradas físicas em destaque.

import { useState } from "react";
import Icon, { icons } from "../components/Icon";

export default function Alertas({ alertas, retiradas = [], confirmarRetirada, confirmarTodasRetiradas, t = {} }) {
  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgBody       = t.bgBody       || "#080808";
  const border       = t.border       || "#1E1E1E";
  const bgElevated   = t.bgElevated   || "#141414";

  const pendentes   = retiradas.filter(r => !r.confirmado);
  const confirmadas = retiradas.filter(r => r.confirmado);
  const [verConfirmadas, setVerConfirmadas] = useState(false);

  const criticos = alertas.filter(a => a.nivel === "critico");
  const atencoes = alertas.filter(a => a.nivel === "atencao");
  const avisos   = alertas.filter(a => a.nivel !== "critico" && a.nivel !== "atencao");

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.03em", color:t.textPrimary||"#EDE9DF" }}>
          Central de Alertas
        </h2>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t.textDim||"#3A3A3A", marginTop:5, letterSpacing:"0.06em" }}>
          MONITORAMENTO · VALIDADES · ESTOQUE · RETIRADAS FÍSICAS
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:28 }}>
        {[
          { label:"Retiradas Pendentes", valor:pendentes.length,                      cor:"#EF4444", sub:"confirmação física", pulse:pendentes.length>0 },
          { label:"Alertas Críticos",    valor:criticos.length,                       cor:"#EF4444", sub:"ação imediata"                               },
          { label:"Atenção",             valor:atencoes.length,                       cor:"#F97316", sub:"monitorar"                                   },
          { label:"Total de Alertas",    valor:alertas.length + pendentes.length,     cor:accent,    sub:"ativos no sistema"                           },
        ].map(({ label, valor, cor, sub, pulse }) => (
          <div key={label} style={{ padding:"18px 20px", borderRadius:10, background:bgCard, border:`1px solid ${cor}25`, position:"relative", overflow:"hidden", animation:pulse?"barto-pulse-red 2.5s infinite":"none" }}>
            <div style={{ position:"absolute", top:-1, left:"15%", right:"15%", height:1, background:`linear-gradient(90deg,transparent,${cor}80,transparent)` }}/>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textDim||"#3A3A3A", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>{label}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:28, fontWeight:600, color:cor, letterSpacing:"-0.04em", lineHeight:1 }}>{valor}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:t.textGhost||"#2A2A2A", marginTop:6 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── BLOCO 1: RETIRADAS FÍSICAS PENDENTES ──────────────────────── */}
      {pendentes.length > 0 && (
        <div style={{ marginBottom:28 }}>
          <SecaoLabel label="Retiradas Físicas Pendentes" cor="#EF4444" count={pendentes.length}/>

          <div style={{ background:"#120808", border:"1px solid #EF444450", borderRadius:12, boxShadow:"0 0 0 1px #EF444415, 0 8px 32px #EF444410", overflow:"hidden", animation:"barto-pulse-red 2.5s infinite" }}>
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #EF444420" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:"#EF444420", border:"1px solid #EF444440", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon d={icons.alertas} size={20} style={{ color:"#EF4444" }}/>
                </div>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:"#EF4444" }}>
                    Baixas do Sistema — Retirada Física Pendente
                  </div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#EF444470", marginTop:3, letterSpacing:"0.04em" }}>
                    {pendentes.length} lote{pendentes.length!==1?"s":""} descartado{pendentes.length!==1?"s":""} automaticamente · aguardando confirmação física
                  </div>
                </div>
              </div>
              {pendentes.length > 1 && (
                <button onClick={confirmarTodasRetiradas} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:8, background:"#EF444420", border:"1px solid #EF444440", color:"#EF4444", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0, transition:"all 0.15s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="#EF444435"; e.currentTarget.style.borderColor="#EF444460"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="#EF444420"; e.currentTarget.style.borderColor="#EF444440"; }}
                >
                  <Icon d={icons.check} size={13}/> Confirmar todas
                </button>
              )}
            </div>

            {/* Aviso */}
            <div style={{ padding:"12px 20px", background:"#EF44440A", borderBottom:"1px solid #EF444418" }}>
              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#EF444490", lineHeight:1.7, letterSpacing:"0.02em" }}>
                ⚠️ Os lotes abaixo foram <strong style={{ color:"#EF4444" }}>removidos do estoque virtual automaticamente</strong> por vencimento.
                Confirme que os itens foram <strong style={{ color:"#EF4444" }}>retirados fisicamente</strong> do freezer/estoque para evitar divergências.
              </p>
            </div>

            {/* Lista */}
            <div style={{ padding:"8px 20px" }}>
              {pendentes.map((r, idx) => (
                <div key={r.id}>
                  <LoteRetiradaCard retirada={r} onConfirmar={()=>confirmarRetirada(r.id)} border={border} bgBody={bgBody} bgElevated={bgElevated} t={t}/>
                  {idx < pendentes.length-1 && <div style={{ height:1, background:"#EF44441A" }}/>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BLOCO 2: ALERTAS CRÍTICOS ──────────────────────────────────── */}
      {criticos.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <SecaoLabel label="Críticos" cor="#EF4444" count={criticos.length}/>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {criticos.map((a, i) => <AlertaCard key={i} alerta={a} bgCard={bgCard} border={border} t={t}/>)}
          </div>
        </div>
      )}

      {/* ── BLOCO 3: ATENÇÃO ───────────────────────────────────────────── */}
      {atencoes.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <SecaoLabel label="Atenção" cor="#F97316" count={atencoes.length}/>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {atencoes.map((a, i) => <AlertaCard key={i} alerta={a} bgCard={bgCard} border={border} t={t}/>)}
          </div>
        </div>
      )}

      {/* ── BLOCO 4: AVISOS ────────────────────────────────────────────── */}
      {avisos.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <SecaoLabel label="Avisos" cor="#FBBF24" count={avisos.length}/>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {avisos.map((a, i) => <AlertaCard key={i} alerta={a} bgCard={bgCard} border={border} t={t}/>)}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {alertas.length === 0 && pendentes.length === 0 && (
        <div style={{ padding:"48px 0", textAlign:"center", background:bgCard, borderRadius:12, border:`1px solid ${border}` }}>
          <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:t.textPrimary||"#EDE9DF", marginBottom:6 }}>
            Tudo sob controle
          </div>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:t.textDim||"#3A3A3A" }}>
            Nenhum alerta ativo. Estoque e validades OK.
          </p>
        </div>
      )}

      {/* ── BLOCO 5: HISTÓRICO DE RETIRADAS CONFIRMADAS ─────────────────── */}
      {confirmadas.length > 0 && (
        <div style={{ marginTop:28 }}>
          <button onClick={()=>setVerConfirmadas(v=>!v)} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, background:"none", border:"none", cursor:"pointer", padding:0, width:"100%" }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.14em", color:t.textDim||"#3A3A3A", textTransform:"uppercase", fontWeight:600, whiteSpace:"nowrap" }}>
              Retiradas Confirmadas
            </span>
            <div style={{ flex:1, height:1, background:border }}/>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.textGhost||"#2A2A2A", whiteSpace:"nowrap" }}>
              {confirmadas.length} · {verConfirmadas?"ocultar":"ver histórico"}
            </span>
            <Icon d={icons.arrowDown} size={11} style={{ color:t.textGhost||"#2A2A2A", transform:verConfirmadas?"rotate(180deg)":"none", transition:"transform 0.2s", flexShrink:0 }}/>
          </button>

          {verConfirmadas && (
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {confirmadas.map(r => (
                <div key={r.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 16px", borderRadius:9, background:bgCard, border:`1px solid ${border}`, opacity:0.55 }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{r.ingredienteEmoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, color:t.textSecondary||"#C8C4BC", fontWeight:500 }}>
                      {r.ingredienteNome}
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.textDim||"#3A3A3A", marginLeft:8, fontWeight:400 }}>
                        Lote {r.loteNumero}
                      </span>
                    </div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.textDim||"#3A3A3A", marginTop:2 }}>
                      {r.quantidade} {r.unidade} · {r.dataDescarte}
                    </div>
                  </div>
                  <span style={{ display:"flex", alignItems:"center", gap:5, fontFamily:"'DM Mono',monospace", fontSize:10, color:"#4ADE80", padding:"3px 10px", borderRadius:5, background:"#4ADE8010", border:"1px solid #4ADE8025", flexShrink:0 }}>
                    <Icon d={icons.check} size={10}/> Confirmado
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Label de seção ────────────────────────────────────────────────────────────
function SecaoLabel({ label, cor, count }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
      <div style={{ width:4, height:16, borderRadius:2, background:cor, flexShrink:0 }}/>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.14em", color:cor, textTransform:"uppercase", fontWeight:600 }}>
        {label}
      </span>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, padding:"1px 8px", borderRadius:4, background:cor+"15", color:cor, border:`1px solid ${cor}30` }}>
        {count}
      </span>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${cor}25,transparent)` }}/>
    </div>
  );
}

// ── Card de alerta ────────────────────────────────────────────────────────────
function AlertaCard({ alerta: a, bgCard, border, t={} }) {
  const isCritico = a.nivel === "critico";
  const isAtencao = a.nivel === "atencao";
  const cor = isCritico ? "#EF4444" : isAtencao ? "#F97316" : "#FBBF24";
  const bg  = isCritico ? "#EF444408" : isAtencao ? "#F9731608" : "#FBBF2408";
  const brd = isCritico ? "#EF444428" : isAtencao ? "#F9731628" : "#FBBF2428";

  return (
    <div style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 18px", borderRadius:10, background:bgCard, border:`1px solid ${brd}`, transition:"background 0.15s" }}
      onMouseEnter={e=>e.currentTarget.style.background=bg}
      onMouseLeave={e=>e.currentTarget.style.background=(t?.bgCard||bgCard)}
    >
      {/* Indicador lateral */}
      <div style={{ width:3, height:40, borderRadius:2, background:cor, flexShrink:0 }}/>

      {/* Ícone */}
      <div style={{ width:36, height:36, borderRadius:9, background:cor+"15", border:`1px solid ${cor}30`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon d={isCritico?"M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z":"M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"} size={17} style={{ color:cor }}/>
      </div>

      {/* Conteúdo */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13.5, fontWeight:600, color:t?.textPrimary||"#EDE9DF", marginBottom:3 }}>{a.titulo}</div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:t?.textMuted||"#555", lineHeight:1.6 }}>{a.descricao}</div>
      </div>

      {/* Badge */}
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, padding:"4px 12px", borderRadius:6, background:cor+"18", color:cor, border:`1px solid ${cor}35`, flexShrink:0, letterSpacing:"0.04em" }}>
        {isCritico ? "Crítico" : isAtencao ? "Atenção" : "Aviso"}
      </span>
    </div>
  );
}

// ── Card de retirada física pendente ─────────────────────────────────────────
function LoteRetiradaCard({ retirada: r, onConfirmar, border, bgBody, bgElevated="#141414", t={} }) {
  const [confirmando, setConfirmando] = useState(false);
  const handle = () => { setConfirmando(true); setTimeout(()=>onConfirmar(), 400); };
  const textPrimary = t.textPrimary || "#EDE9DF";

  return (
    <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", opacity:confirmando?0.4:1, transition:"opacity 0.3s" }}>
      <span style={{ fontSize:24, flexShrink:0 }}>{r.ingredienteEmoji}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, color:textPrimary, fontWeight:600 }}>
          {r.ingredienteNome}
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#EF444470", marginLeft:10, fontWeight:400 }}>
            Lote {r.loteNumero}
          </span>
        </div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#EF444455", marginTop:3 }}>
          {r.quantidade} {r.unidade} · descartado em {r.dataDescarte}
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:600, padding:"3px 10px", borderRadius:5, background:"#EF444415", color:"#EF4444", border:"1px solid #EF444430", animation:"barto-pulse-red 2s infinite" }}>
          Não confirmado
        </span>
        <button onClick={handle} disabled={confirmando} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, background:confirmando?bgElevated:"#4ADE8015", border:`1px solid ${confirmando?"#222":"#4ADE8035"}`, color:confirmando?"#333":"#4ADE80", fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:600, cursor:confirmando?"default":"pointer", transition:"all 0.15s" }}
          onMouseEnter={e=>{ if(!confirmando){e.currentTarget.style.background="#4ADE8025";e.currentTarget.style.borderColor="#4ADE8050";} }}
          onMouseLeave={e=>{ if(!confirmando){e.currentTarget.style.background="#4ADE8015";e.currentTarget.style.borderColor="#4ADE8035";} }}
        >
          <Icon d={icons.check} size={13}/>
          {confirmando?"Confirmando...":"Retirada física OK"}
        </button>
      </div>
    </div>
  );
}