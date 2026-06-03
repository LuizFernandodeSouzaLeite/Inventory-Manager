// src/pages/LoginScreen.jsx
// v2.0 — lê prefs do localStorage antes do login e aplica o tema escolhido.

import { useState, useMemo } from "react";
import { buildTheme } from "../theme";

const PREFS_PADRAO = { tema:"dark", corPrimaria:"gold" };

const PERFIS = [
  { cargo:"adm_global",  label:"Adm Global",  email:"admin@barto.com",   nome:"Administrador" },
  { cargo:"gerente",     label:"Gerente",      email:"gerente@barto.com", nome:"Carlos Matos"  },
  { cargo:"funcionario", label:"Funcionário",  email:"func@barto.com",    nome:"Maria Lima"    },
];

export default function LoginScreen({ onLogin }) {
  // Lê prefs do localStorage antes do login — sem precisar estar autenticado
  const prefs = useMemo(() => {
    try {
      const s = localStorage.getItem("barto_prefs");
      return s ? { ...PREFS_PADRAO, ...JSON.parse(s) } : PREFS_PADRAO;
    } catch { return PREFS_PADRAO; }
  }, []);

  const t = useMemo(() => buildTheme(prefs), [prefs]);

  const isLight    = t.isLight     || false;
  const accent     = t.accent      || "#C9A84C";
  const accentGrad = t.accentGrad  || "linear-gradient(135deg,#C9A84C,#9A7A2E)";
  const accentText = t.accentText  || "#080808";
  const accentDim  = t.accentDim   || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const bgBody     = t.bgBody      || "#080808";
  const bgCard     = t.bgCard      || "#0F0F0F";
  const bgElevated = t.bgElevated  || "#141414";
  const border     = t.border      || "#1E1E1E";
  const borderMid  = t.borderMid   || "#252525";
  const textPrim   = t.textPrimary || "#EDE9DF";
  const textDim    = t.textDim     || "#3A3A3A";
  const textMuted  = t.textMuted   || "#4A4A4A";

  const [cargo,   setCargo]   = useState("adm_global");
  const [email,   setEmail]   = useState("admin@barto.com");
  const [senha,   setSenha]   = useState("");
  const [loading, setLoading] = useState(false);

  const selecionarPerfil = (p) => {
    setCargo(p.cargo);
    setEmail(p.email);
  };

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const p = PERFIS.find(x => x.cargo === cargo) || PERFIS[0];
      onLogin({ nome: p.nome, cargo: p.cargo, email });
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background: bgBody, fontFamily:"'DM Sans',sans-serif",
      position:"relative", overflow:"hidden",
    }}>

      {/* Grid decorativo — adapta cor ao tema */}
      <div style={{
        position:"absolute", inset:0, opacity: isLight ? 0.04 : 0.025, pointerEvents:"none",
        backgroundImage:`linear-gradient(${accent} 1px,transparent 1px),linear-gradient(90deg,${accent} 1px,transparent 1px)`,
        backgroundSize:"40px 40px",
      }}/>

      {/* Brilho central suave */}
      <div style={{
        position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)",
        width:500, height:500, borderRadius:"50%",
        background:`radial-gradient(circle,${accentDim} 0%,transparent 70%)`,
        pointerEvents:"none",
      }}/>

      <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:400, padding:"0 20px" }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{
            width:68, height:68, borderRadius:20, background:accentGrad,
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            boxShadow:`0 0 0 1px ${accentBorder}, 0 8px 32px ${accentDim}`,
            marginBottom:16,
          }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:30, color:accentText }}>B</span>
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, letterSpacing:"-0.03em", color:textPrim, margin:0, lineHeight:1 }}>
            Bart<span style={{ color:accent }}>ô</span>
          </h1>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:textDim, marginTop:7, letterSpacing:"0.1em" }}>
            GESTÃO DE ESTOQUE
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: bgCard,
          border:`1px solid ${border}`,
          borderRadius:16,
          boxShadow: isLight
            ? "0 8px 40px #00000018, 0 2px 8px #0000000E"
            : "0 0 0 1px #ffffff05, 0 24px 64px #00000080",
          overflow:"hidden",
        }}>
          <div style={{ height:2, background:`linear-gradient(90deg,transparent,${accent}90,transparent)` }}/>

          <div style={{ padding:"28px 28px 32px" }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17, color:textPrim, marginBottom:22, letterSpacing:"-0.02em" }}>
              Entrar na conta
            </h2>

            {/* Seletor de perfil */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:textDim, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>
                Perfil de acesso
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {PERFIS.map(p => {
                  const sel = cargo === p.cargo;
                  return (
                    <button key={p.cargo} onClick={() => selecionarPerfil(p)} style={{
                      padding:"9px 4px", borderRadius:9, fontSize:12.5, fontWeight:sel?600:400,
                      fontFamily:"'DM Sans',sans-serif", cursor:"pointer", transition:"all 0.15s",
                      background: sel ? accentGrad : bgElevated,
                      color:      sel ? accentText : textMuted,
                      border:     `1px solid ${sel ? "transparent" : border}`,
                      boxShadow:  sel ? `0 2px 12px ${accentDim}` : "none",
                    }}>
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:textDim, letterSpacing:"0.12em", textTransform:"uppercase", display:"block", marginBottom:7 }}>
                Email
              </label>
              <input value={email} onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                style={{
                  width:"100%", padding:"10px 13px", borderRadius:9, fontSize:13.5,
                  fontFamily:"'DM Sans',sans-serif",
                  background: isLight ? "#fff" : bgElevated,
                  border:`1px solid ${borderMid}`,
                  color: textPrim, outline:"none", boxSizing:"border-box",
                  transition:"border-color 0.15s",
                }}
                onFocus={e=>e.target.style.borderColor=accentBorder}
                onBlur={e=>e.target.style.borderColor=borderMid}
              />
            </div>

            {/* Senha */}
            <div style={{ marginBottom:24 }}>
              <label style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:textDim, letterSpacing:"0.12em", textTransform:"uppercase", display:"block", marginBottom:7 }}>
                Senha
              </label>
              <input type="password" value={senha} onChange={e=>setSenha(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                placeholder="••••••••"
                style={{
                  width:"100%", padding:"10px 13px", borderRadius:9, fontSize:13.5,
                  fontFamily:"'DM Sans',sans-serif",
                  background: isLight ? "#fff" : bgElevated,
                  border:`1px solid ${borderMid}`,
                  color: textPrim, outline:"none", boxSizing:"border-box",
                  transition:"border-color 0.15s",
                }}
                onFocus={e=>e.target.style.borderColor=accentBorder}
                onBlur={e=>e.target.style.borderColor=borderMid}
              />
            </div>

            {/* Botão */}
            <button onClick={handleLogin} disabled={loading} style={{
              width:"100%", padding:"13px", borderRadius:10, border:"none",
              background: loading ? borderMid : accentGrad,
              color: loading ? textMuted : accentText,
              fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15,
              cursor: loading ? "default" : "pointer",
              letterSpacing:"0.01em",
              boxShadow: loading ? "none" : `0 4px 20px ${accentDim}`,
              display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              transition:"filter 0.15s, transform 0.1s",
            }}
              onMouseEnter={e=>{ if(!loading) e.currentTarget.style.filter="brightness(1.1)"; }}
              onMouseLeave={e=>e.currentTarget.style.filter="none"}
              onMouseDown={e=>{ if(!loading) e.currentTarget.style.transform="scale(0.98)"; }}
              onMouseUp={e=>e.currentTarget.style.transform="none"}
            >
              {loading
                ? <><span style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${accentText}`, borderTopColor:"transparent", display:"inline-block", animation:"spin 0.7s linear infinite" }}/> Entrando...</>
                : "Entrar"
              }
            </button>

            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:textDim, textAlign:"center", marginTop:14, lineHeight:1.6 }}>
              Selecione o perfil para preencher o email automaticamente.
            </p>
          </div>
        </div>

        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:textDim, textAlign:"center", marginTop:24, letterSpacing:"0.06em" }}>
          Bartô © {new Date().getFullYear()}
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}