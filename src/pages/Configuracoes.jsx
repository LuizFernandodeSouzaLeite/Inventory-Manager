// src/pages/Configuracoes.jsx
// v3.1 — usa `setPref` do App, mudança é imediata, toast de confirmação.

import { useState, useCallback, useRef } from "react";
import Icon, { icons } from "../components/Icon";
import { Badge, Card } from "../components/UI";
import { cargoColor } from "../utils/helpers";

const TEMAS = [
  { id: "dark",         label: "Escuro",        desc: "Padrão do sistema" },
  { id: "darker",       label: "Mais Escuro",    desc: "Preto absoluto"   },
  { id: "highContrast", label: "Alto Contraste", desc: "Acessibilidade"   },
  { id: "minimal",      label: "Minimalista",    desc: "Sem distrações"   },
];

const CORES = [
  { id: "gold",  label: "Dourado",  hex: "#C9A84C" },
  { id: "ember", label: "Laranja",  hex: "#F97316" },
  { id: "blue",  label: "Azul",     hex: "#3B82F6" },
  { id: "green", label: "Verde",    hex: "#22C55E" },
  { id: "red",   label: "Vermelho", hex: "#EF4444" },
];

const GRAFICOS = [
  { id: "bar",    label: "Barras",  icon: icons.barChart },
  { id: "line",   label: "Linha",   icon: icons.activity },
  { id: "area",   label: "Área",    icon: icons.trending },
  { id: "pie",    label: "Pizza",   icon: icons.pieChart },
  { id: "radial", label: "Radial",  icon: icons.repeat   },
];

const MODOS_DASHBOARD = [
  { id: "numbers", label: "Só Números",  desc: "Métricas sem gráficos"  },
  { id: "charts",  label: "Só Gráficos", desc: "Visual puro"            },
  { id: "both",    label: "Ambos",       desc: "Completo (recomendado)" },
];

const DENSIDADES = [
  { id: "compact",     label: "Compacto",    desc: "Mais info, menos espaço" },
  { id: "normal",      label: "Normal",      desc: "Equilíbrio padrão"       },
  { id: "comfortable", label: "Confortável", desc: "Mais espaçado"           },
];

const ABAS = [
  { id: "aparencia",  label: "Aparência",  icon: icons.eye      },
  { id: "dashboards", label: "Dashboards", icon: icons.dashboard },
  { id: "alertas",    label: "Alertas",    icon: icons.alertas  },
  { id: "sistema",    label: "Sistema",    icon: icons.config   },
  { id: "permissoes", label: "Permissões", icon: icons.lock     },
];

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, visible, t }) {
  const accent = t?.accent || "#C9A84C";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 9,
      padding: "10px 16px", borderRadius: 10,
      background: t?.bgCard || "#0F0F0F",
      border: `1px solid ${accent}35`,
      boxShadow: `0 8px 32px #00000060, 0 0 0 1px ${accent}0C`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.22s ease, transform 0.22s ease",
      pointerEvents: "none",
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: "50%",
        background: `${accent}18`, border: `1px solid ${accent}35`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: accent, flexShrink: 0,
      }}>
        <Icon d={icons.check} size={10} style={{ strokeWidth: 3 }} />
      </span>
      <span style={{ fontSize: 12.5, color: "#C8C4BC", fontFamily: "'DM Sans', sans-serif" }}>
        {msg}
      </span>
    </div>
  );
}

export default function Configuracoes({ user, config, setConfig, prefs, setPref, resetarDados, t = {} }) {
  const podeEditar = user.cargo === "adm_global" || user.cargo === "gerente";
  const [aba,       setAba]       = useState("aparencia");
  const [diasAviso, setDiasAviso] = useState(String(config.diasAviso));
  const [prazos,    setPrazos]    = useState({ ...config.prazosCategoria });

  const [toastMsg,     setToastMsg]     = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  // ── Muda pref: chama setPref do App → prefs muda → t recalcula → re-render
  const mudarPref = useCallback((key, value) => {
    setPref(key, value); // isso já atualiza o estado em App.jsx via setPrefs
    const labels = {
      tema: "Tema", corPrimaria: "Cor", tipoGrafico: "Gráfico",
      modoDashboard: "Dashboard", densidadeVisual: "Densidade", animacoes: "Animações",
    };
    showToast(`${labels[key] || "Preferência"} atualizado ✓`);
  }, [setPref, showToast]);

  const salvarSistema = () => {
    setConfig({ diasAviso: Math.max(1, Number(diasAviso)), prazosCategoria: prazos });
    showToast("Configurações de alertas salvas ✓");
  };

  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const bgCard       = t.bgCard       || "#0F0F0F";
  const bgElevated   = t.bgElevated   || "#141414";
  const border       = t.border       || "#1E1E1E";
  const borderMid    = t.borderMid    || "#252525";

  return (
    <div>
      <Toast msg={toastMsg} visible={toastVisible} t={t} />

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", color: "#EDE9DF" }}>
          Configurações
        </h2>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10.5, color: "#3A3A3A", marginTop: 5, letterSpacing: "0.06em" }}>
          PREFERÊNCIAS · APARÊNCIA · SISTEMA · PERMISSÕES
        </p>
      </div>

      {!podeEditar && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, marginBottom: 20, background: "#13101A", border: "1px solid #7c3aed30" }}>
          <Icon d={icons.lock} size={15} style={{ color: "#A78BFA", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "#A78BFA" }}>Você está como <strong>Funcionário</strong> — algumas configurações são somente leitura.</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 20 }}>

        {/* Abas laterais */}
        <div style={{ width: 160, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          {ABAS.map(a => {
            const sel = aba === a.id;
            return (
              <button key={a.id} onClick={() => setAba(a.id)} style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "9px 12px", borderRadius: 8, width: "100%",
                border: `1px solid ${sel ? accentBorder : "transparent"}`,
                background: sel ? accentDim : "transparent",
                color: sel ? accent : "#444",
                cursor: "pointer", textAlign: "left",
                fontSize: 12.5, fontFamily: "'DM Sans', sans-serif",
                fontWeight: sel ? 500 : 400, transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!sel) { e.currentTarget.style.color = "#777"; e.currentTarget.style.background = bgElevated; } }}
              onMouseLeave={e => { if (!sel) { e.currentTarget.style.color = "#444"; e.currentTarget.style.background = "transparent"; } }}
              >
                <Icon d={a.icon} size={14} />
                {a.label}
              </button>
            );
          })}
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ── APARÊNCIA ───────────────────────────────────────────── */}
          {aba === "aparencia" && <>
            <Card>
              <SecaoHeader icon={icons.eye} title="Tema Visual" desc="Profundidade de cor do sistema" accent={accent} accentDim={accentDim} accentBorder={accentBorder} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                {TEMAS.map(tm => (
                  <OpcaoCard key={tm.id}
                    selecionado={prefs.tema === tm.id}
                    onClick={() => mudarPref("tema", tm.id)}
                    label={tm.label} desc={tm.desc}
                    accent={accent} accentDim={accentDim} accentBorder={accentBorder}
                  />
                ))}
              </div>
            </Card>

            <Card>
              <SecaoHeader icon={icons.tag} title="Cor de Destaque" desc="Cor principal da interface" accent={accent} accentDim={accentDim} accentBorder={accentBorder} />
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                {CORES.map(c => {
                  const sel = prefs.corPrimaria === c.id;
                  return (
                    <button key={c.id} onClick={() => mudarPref("corPrimaria", c.id)} title={c.label}
                      style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: c.hex,
                        border: `2.5px solid ${sel ? "#fff" : "transparent"}`,
                        cursor: "pointer",
                        transform: sel ? "scale(1.18)" : "scale(1)",
                        boxShadow: sel ? `0 0 0 3px ${c.hex}50, 0 4px 14px ${c.hex}40` : "none",
                        transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
                        flexShrink: 0,
                      }}
                    />
                  );
                })}
                <div style={{ marginLeft: 4 }}>
                  <div style={{ fontSize: 13, color: "#C8C4BC", fontWeight: 500 }}>
                    {CORES.find(c => c.id === prefs.corPrimaria)?.label}
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", marginTop: 2 }}>
                    {CORES.find(c => c.id === prefs.corPrimaria)?.hex}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <SecaoHeader icon={icons.menu} title="Densidade Visual" desc="Espaçamento dos elementos" accent={accent} accentDim={accentDim} accentBorder={accentBorder} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
                {DENSIDADES.map(d => (
                  <OpcaoCard key={d.id}
                    selecionado={prefs.densidadeVisual === d.id}
                    onClick={() => mudarPref("densidadeVisual", d.id)}
                    label={d.label} desc={d.desc}
                    accent={accent} accentDim={accentDim} accentBorder={accentBorder}
                  />
                ))}
              </div>
            </Card>
          </>}

          {/* ── DASHBOARDS ──────────────────────────────────────────── */}
          {aba === "dashboards" && <>
            <Card>
              <SecaoHeader icon={icons.dashboard} title="Modo dos Dashboards" desc="Como as informações são exibidas" accent={accent} accentDim={accentDim} accentBorder={accentBorder} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
                {MODOS_DASHBOARD.map(m => (
                  <OpcaoCard key={m.id}
                    selecionado={prefs.modoDashboard === m.id}
                    onClick={() => mudarPref("modoDashboard", m.id)}
                    label={m.label} desc={m.desc}
                    accent={accent} accentDim={accentDim} accentBorder={accentBorder}
                  />
                ))}
              </div>
            </Card>

            <Card>
              <SecaoHeader icon={icons.barChart} title="Tipo de Gráfico" desc="Estilo padrão para visualização de dados" accent={accent} accentDim={accentDim} accentBorder={accentBorder} />
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {GRAFICOS.map(g => {
                  const sel = prefs.tipoGrafico === g.id;
                  return (
                    <button key={g.id} onClick={() => mudarPref("tipoGrafico", g.id)}
                      style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: 7, width: 82, height: 74,
                        borderRadius: 10, position: "relative",
                        border: `1px solid ${sel ? accentBorder : border}`,
                        background: sel ? accentDim : bgCard,
                        color: sel ? accent : "#444",
                        cursor: "pointer",
                        fontSize: 11.5, fontFamily: "'DM Sans', sans-serif",
                        fontWeight: sel ? 600 : 400,
                        transition: "all 0.15s",
                        boxShadow: sel ? `0 0 0 1px ${accentBorder}` : "none",
                      }}
                      onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = borderMid; }}
                      onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = border; }}
                    >
                      <Icon d={g.icon} size={18} />
                      {g.label}
                      {sel && <span style={{ position: "absolute", bottom: 6, width: 5, height: 5, borderRadius: "50%", background: accent }} />}
                    </button>
                  );
                })}
              </div>
            </Card>
          </>}

          {/* ── ALERTAS ─────────────────────────────────────────────── */}
          {aba === "alertas" && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Card>
                <SecaoHeader icon={icons.clock} title="Aviso de Validade" desc="Dias antes do vencimento para alertar" accent={accent} accentDim={accentDim} accentBorder={accentBorder} />
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
                  <input type="number" min="1" max="30" value={diasAviso}
                    onChange={e => setDiasAviso(e.target.value)}
                    disabled={!podeEditar}
                    style={{
                      width: 64, padding: "10px 8px", borderRadius: 8, textAlign: "center",
                      background: bgElevated, border: `1px solid ${borderMid}`,
                      color: "#EDE9DF", fontSize: 22, fontFamily: "'DM Mono', monospace", fontWeight: 600,
                      outline: "none", opacity: podeEditar ? 1 : 0.5,
                    }}
                    onFocus={e => e.target.style.borderColor = accentBorder}
                    onBlur={e => e.target.style.borderColor = borderMid}
                  />
                  <div>
                    <div style={{ fontSize: 13, color: "#C8C4BC", fontWeight: 500 }}>{diasAviso} {Number(diasAviso) === 1 ? "dia" : "dias"} antes</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", marginTop: 2 }}>Atual: {config.diasAviso}d</div>
                  </div>
                </div>
                {podeEditar && (
                  <div style={{ display: "flex", gap: 5, marginTop: 12, flexWrap: "wrap" }}>
                    {[1, 2, 3, 5, 7].map(d => (
                      <button key={d} onClick={() => setDiasAviso(String(d))} style={{
                        padding: "4px 11px", borderRadius: 6, fontSize: 11,
                        fontFamily: "'DM Mono', monospace", cursor: "pointer",
                        background: diasAviso === String(d) ? accent : bgElevated,
                        color:      diasAviso === String(d) ? (t.accentText || "#080808") : "#555",
                        border:     `1px solid ${diasAviso === String(d) ? accent : borderMid}`,
                        transition: "all 0.15s",
                      }}>{d}d</button>
                    ))}
                  </div>
                )}
              </Card>
              <Card>
                <SecaoHeader icon={icons.bell} title="Notificações" desc="Controle de avisos ativos" accent={accent} accentDim={accentDim} accentBorder={accentBorder} />
                <div style={{ marginTop: 10 }}>
                  <ToggleItem label="Badge de alertas" desc="Contador na sidebar e header" ativo={true} disabled accent={accent} />
                </div>
              </Card>
            </div>

            <Card>
              <SecaoHeader icon={icons.calendar} title="Prazos por Categoria" desc="Validade padrão ao registrar entrada de lote (em dias)" accent={accent} accentDim={accentDim} accentBorder={accentBorder} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginTop: 12 }}>
                {Object.entries(prazos).map(([cat, dias]) => (
                  <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: t.bgBody || "#080808", border: `1px solid ${border}` }}>
                    <span style={{ fontSize: 12.5, color: "#C8C4BC" }}>{cat}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="number" min="1" value={dias}
                        onChange={e => setPrazos(prev => ({ ...prev, [cat]: Number(e.target.value) }))}
                        disabled={!podeEditar}
                        style={{ width: 52, padding: "5px 6px", borderRadius: 6, textAlign: "center", background: bgElevated, border: `1px solid ${borderMid}`, color: "#EDE9DF", fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 600, outline: "none", opacity: podeEditar ? 1 : 0.5 }}
                      />
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#333" }}>dias</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {podeEditar && (
              <button onClick={salvarSistema} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 22px", borderRadius: 8, border: "none",
                background: `linear-gradient(135deg, ${accent}, ${t.accentDark || "#9A7A2E"})`,
                color: t.accentText || "#080808",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                cursor: "pointer", boxShadow: `0 2px 12px ${accentDim}`,
                transition: "filter 0.15s, transform 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
              >
                <Icon d={icons.check} size={15} />
                Salvar configurações de alertas
              </button>
            )}
          </>}

          {/* ── SISTEMA ─────────────────────────────────────────────── */}
          {aba === "sistema" && <>
            <Card>
              <SecaoHeader icon={icons.zap} title="Animações" desc="Transições e efeitos visuais" accent={accent} accentDim={accentDim} accentBorder={accentBorder} />
              <div style={{ marginTop: 10 }}>
                <ToggleItem
                  label="Animações de transição"
                  desc="Slide e fade ao navegar entre páginas"
                  ativo={prefs.animacoes}
                  onChange={() => mudarPref("animacoes", !prefs.animacoes)}
                  accent={accent}
                />
              </div>
            </Card>

            {/* Dados e persistência */}
            <Card>
              <SecaoHeader icon={icons.estoque} title="Dados do Sistema" desc="Persistência local e gerenciamento" accent={accent} accentDim={accentDim} accentBorder={accentBorder} />
              <div style={{ marginTop: 12 }}>
                {/* Info de persistência */}
                <div style={{ padding: "10px 14px", borderRadius: 8, background: accentDim, border: `1px solid ${accentBorder}`, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon d={icons.check} size={13} style={{ color: accent, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12.5, color: "#C8C4BC", fontWeight: 500 }}>Dados salvos automaticamente</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", marginTop: 2 }}>
                        Entradas, saídas, pedidos e estoque sobrevivem ao F5 via localStorage.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reset — só para adm */}
                {podeEditar && (
                  <ResetCard resetarDados={resetarDados} border={border} bgBody={t.bgBody || "#080808"} />
                )}
              </div>
            </Card>

            <Card>
              <SecaoHeader icon={icons.info} title="Sobre o Sistema" desc="Versão e informações técnicas" accent={accent} accentDim={accentDim} accentBorder={accentBorder} />
              <div style={{ marginTop: 10 }}>
                {[["Sistema","Bartô — Gestão de Estoque"],["Versão","v3.4"],["Persistência","localStorage (navegador)"],["Stack","React + Vite + Tailwind"],["Dados","Salvos automaticamente"]].map(([k,v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${border}` }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10.5, color: "#3A3A3A", letterSpacing: "0.06em" }}>{k.toUpperCase()}</span>
                    <span style={{ fontSize: 12.5, color: "#C8C4BC" }}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </>}

          {/* ── PERMISSÕES ──────────────────────────────────────────── */}
          {aba === "permissoes" && [
            { cargo: "adm_global",  label: "Adm Global",  ps: ["Ver tudo","Editar configurações","Módulo financeiro","Excluir registros"] },
            { cargo: "gerente",     label: "Gerente",     ps: ["Ver tudo","Editar configurações","Módulo financeiro"] },
            { cargo: "funcionario", label: "Funcionário", ps: ["Ver dashboards","Ver estoque","Registrar pedidos","Ver alertas"] },
          ].map(({ cargo, label, ps }) => (
            <Card key={cargo}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Badge className={cargoColor(cargo)}>{label}</Badge>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A" }}>{ps.length} permissões</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ps.map(p => (
                  <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, padding: "3px 10px", borderRadius: 5, background: t.bgBody || "#0A0A0A", border: `1px solid ${border}`, color: "#666" }}>
                    <Icon d={icons.check} size={10} style={{ color: "#4ADE80" }} />
                    {p}
                  </span>
                ))}
              </div>
            </Card>
          ))}

        </div>
      </div>
    </div>
  );
}

// ── Helpers internos ──────────────────────────────────────────────────────────
function SecaoHeader({ icon, title, desc, accent, accentDim, accentBorder }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: accentDim, border: `1px solid ${accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
        <Icon d={icon} size={14} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#EDE9DF", lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}

function OpcaoCard({ selecionado, onClick, label, desc, accent, accentDim, accentBorder }) {
  return (
    <button onClick={onClick} style={{
      padding: "11px 14px", borderRadius: 9, textAlign: "left", width: "100%", cursor: "pointer",
      border: `1px solid ${selecionado ? accentBorder : "#1A1A1A"}`,
      background: selecionado ? accentDim : "#0A0A0A",
      transition: "all 0.15s",
      boxShadow: selecionado ? `inset 0 0 0 1px ${accentBorder}` : "none",
    }}
    onMouseEnter={e => { if (!selecionado) e.currentTarget.style.borderColor = "#252525"; }}
    onMouseLeave={e => { if (!selecionado) e.currentTarget.style.borderColor = "#1A1A1A"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: selecionado ? accent : "#C8C4BC" }}>{label}</span>
        <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, background: selecionado ? accent : "transparent", border: selecionado ? "none" : "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
          {selecionado && <Icon d={icons.check} size={9} style={{ color: "#080808", strokeWidth: 3 }} />}
        </span>
      </div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: selecionado ? `${accent}70` : "#2A2A2A" }}>{desc}</div>
    </button>
  );
}

// ── ResetCard — botão de reset com confirmação dupla ─────────────────────────
function ResetCard({ resetarDados, border, bgBody }) {
  const [confirmando, setConfirmando] = useState(false);

  const handleReset = () => {
    if (!confirmando) {
      setConfirmando(true);
      setTimeout(() => setConfirmando(false), 4000); // cancela automaticamente em 4s
      return;
    }
    resetarDados();
    setConfirmando(false);
  };

  return (
    <div style={{ padding: "12px 14px", borderRadius: 8, background: bgBody, border: `1px solid ${confirmando ? "#EF444440" : border}`, transition: "border-color 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, color: confirmando ? "#EF4444" : "#C8C4BC", fontWeight: 500, transition: "color 0.2s" }}>
            {confirmando ? "⚠️ Confirmar reset?" : "Resetar dados do sistema"}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", marginTop: 2 }}>
            {confirmando
              ? "Isso apagará todos os dados. Clique novamente para confirmar."
              : "Volta para os dados iniciais (mock). Não afeta preferências visuais."}
          </div>
        </div>
        <button
          onClick={handleReset}
          style={{
            padding: "7px 14px", borderRadius: 8, flexShrink: 0, marginLeft: 12,
            background: confirmando ? "#EF444420" : "#141414",
            border: `1px solid ${confirmando ? "#EF444440" : border}`,
            color: confirmando ? "#EF4444" : "#555",
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#EF444440"; e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "#EF444415"; }}
          onMouseLeave={e => { if (!confirmando) { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = "#555"; e.currentTarget.style.background = "#141414"; } }}
        >
          {confirmando ? "Confirmar reset" : "Resetar"}
        </button>
      </div>
    </div>
  );
}

function ToggleItem({ label, desc, ativo, onChange, disabled, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
      <div>
        <div style={{ fontSize: 13, color: "#C8C4BC", fontWeight: 500 }}>{label}</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3A3A3A", marginTop: 2 }}>{desc}</div>
      </div>
      <button onClick={!disabled ? onChange : undefined} style={{
        width: 42, height: 23, borderRadius: 12, flexShrink: 0,
        background: ativo ? (accent || "#C9A84C") : "#1E1E1E",
        border: `1px solid ${ativo ? `${accent || "#C9A84C"}50` : "#252525"}`,
        cursor: disabled ? "default" : "pointer",
        position: "relative", transition: "background 0.2s, border-color 0.2s",
        opacity: disabled ? 0.5 : 1,
      }}>
        <span style={{ position: "absolute", top: 2, left: ativo ? 21 : 2, width: 17, height: 17, borderRadius: "50%", background: "#fff", transition: "left 0.2s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 1px 4px #00000040" }} />
      </button>
    </div>
  );
}