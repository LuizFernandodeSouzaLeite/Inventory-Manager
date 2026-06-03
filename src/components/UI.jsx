// src/components/UI.jsx
// v4.0 — tema-aware: Card, StatCard, Modal, Input, Select, Btn leem CSS variables
//         para funcionar corretamente tanto no modo escuro quanto no claro.

import { useState } from "react";
import Icon, { icons } from "./Icon";

// ── CSS variables injetadas pelo buildTheme no :root ──────────────────────────
// Componentes leem via getComputedStyle ou via variáveis CSS diretamente.
// Para simplicidade, usamos um hook que lê as variáveis do :root.

function useThemeVars() {
  const el = typeof document !== "undefined" ? document.documentElement : null;
  const cs = el ? getComputedStyle(el) : null;
  const isLight = el?.style.getPropertyValue("color-scheme") === "light" ||
                  cs?.getPropertyValue("color-scheme")?.trim() === "light";
  return {
    isLight,
    bgCard:     isLight ? "#FAFAF8" : "#0F0F0F",
    bgBody:     isLight ? "#F0EDE8" : "#080808",
    bgElevated: isLight ? "#EDEAE5" : "#141414",
    border:     isLight ? "#D4CFC6" : "#1E1E1E",
    borderMid:  isLight ? "#BDB8AF" : "#252525",
    textPrim:   isLight ? "#16130F" : "#EDE9DF",
    textSec:    isLight ? "#3A3730" : "#C8C4BC",
    textMuted:  isLight ? "#7A7268" : "#4A4A4A",
    textDim:    isLight ? "#8A8278" : "#3A3A3A",
    textGhost:  isLight ? "#B0AA9F" : "#2A2A2A",
    inputBg:    isLight ? "#FFFFFF" : "#141414",
    inputColor: isLight ? "#16130F" : "#D4D0C8",
  };
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, className = "", style = {} }) {
  return (
    <span className={`inline-flex items-center ${className}`} style={{
      fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:500,
      letterSpacing:"0.04em", padding:"2px 8px", borderRadius:4, border:"1px solid",
      ...style,
    }}>
      {children}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", style = {}, accent = null, hoverable = false }) {
  const th = useThemeVars();
  const accentColors = {
    gold:"#C9A84C", ember:"#F97316", red:"#EF4444", green:"#22C55E", blue:"#3B82F6",
  };
  const accentColor = accent ? accentColors[accent] : null;

  return (
    <div className={`relative barto-card ${hoverable?"barto-card-hover":""} ${className}`} style={{
      background: th.bgCard,
      border: `1px solid ${accentColor ? accentColor+"40" : th.border}`,
      borderRadius:10, padding:"16px 18px",
      boxShadow: th.isLight ? "0 1px 3px #00000010, 0 4px 12px #0000000A" : "none",
      transition:"border-color 0.2s, box-shadow 0.2s",
      ...style,
    }}>
      {accentColor && (
        <div style={{ position:"absolute", top:-1, left:"12%", right:"12%", height:1, background:`linear-gradient(90deg,transparent,${accentColor}90,transparent)`, borderRadius:1 }}/>
      )}
      {children}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, iconColor="#C9A84C", accent=null, onClick }) {
  const th = useThemeVars();
  const accentColors = {
    gold:"#C9A84C", ember:"#F97316", red:"#EF4444", green:"#22C55E", blue:"#3B82F6",
  };
  const accentColor = accent ? accentColors[accent] : null;

  return (
    <div className="relative barto-stat-card" onClick={onClick} style={{
      background: th.bgCard,
      border: `1px solid ${accentColor ? accentColor+"40" : th.border}`,
      borderRadius:10, padding:"18px 20px",
      cursor: onClick?"pointer":"default",
      boxShadow: th.isLight ? "0 1px 3px #00000010, 0 4px 16px #0000000C" : "none",
      transition:"border-color 0.25s, box-shadow 0.25s, transform 0.25s",
    }}>
      {accentColor && (
        <div style={{ position:"absolute", top:-1, left:"12%", right:"12%", height:1, background:`linear-gradient(90deg,transparent,${accentColor}90,transparent)`, borderRadius:1 }}/>
      )}
      <div className="flex items-start justify-between mb-4">
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:th.textDim, fontWeight:500 }}>
          {label}
        </span>
        {icon && (
          <div style={{ width:30, height:30, borderRadius:8, background:iconColor+"14", border:"1px solid "+iconColor+"22", display:"flex", alignItems:"center", justifyContent:"center", color:iconColor, flexShrink:0 }}>
            <Icon d={icon} size={15}/>
          </div>
        )}
      </div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:28, fontWeight:400, letterSpacing:"-0.04em", color:accentColor||th.textPrim, lineHeight:1, marginBottom:sub?8:0 }}>
        {value}
      </div>
      {sub && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:th.textGhost, letterSpacing:"0.04em", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width="max-w-lg" }) {
  const th = useThemeVars();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: th.isLight ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.92)", animation:"barto-fade-in 0.15s ease" }}
      onClick={e => e.target===e.currentTarget && onClose()}
    >
      <div className={`w-full ${width} flex flex-col`} style={{
        background: th.bgCard,
        border: `1px solid ${th.border}`,
        borderRadius:12, maxHeight:"90vh",
        boxShadow: th.isLight
          ? "0 8px 32px #00000025, 0 2px 8px #0000001A"
          : "0 0 0 1px #C9A84C0C, 0 32px 80px #00000096",
        animation:"barto-slide-up 0.2s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${th.border},transparent)`, borderRadius:"12px 12px 0 0" }}/>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom:`1px solid ${th.border}` }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:th.textPrim, letterSpacing:"-0.01em" }}>
            {title}
          </h3>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:6, border:`1px solid ${th.border}`, background:th.bgElevated, color:th.textDim, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
            <Icon d={icons.x} size={14}/>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, helper, error, ...props }) {
  const th = useThemeVars();
  return (
    <div className="mb-4">
      {label && <label style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, letterSpacing:"0.1em", textTransform:"uppercase", color:error?"#EF4444AA":th.textDim, display:"block", marginBottom:7, fontWeight:500 }}>{label}</label>}
      <input {...props} className="barto-input" style={{
        width:"100%", padding:"9px 12px", borderRadius:7,
        background:th.inputBg, border:`1px solid ${error?"#EF444440":th.borderMid}`,
        color:th.inputColor, fontSize:13, fontFamily:"'DM Sans',sans-serif",
        outline:"none", transition:"border-color 0.15s, box-shadow 0.15s",
      }}/>
      {helper && !error && <p style={{ fontSize:11, color:th.textGhost, marginTop:4, fontFamily:"'DM Mono',monospace" }}>{helper}</p>}
      {error && <p style={{ fontSize:11, color:"#EF4444AA", marginTop:4, fontFamily:"'DM Mono',monospace" }}>{error}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  const th = useThemeVars();
  return (
    <div className="mb-4">
      {label && <label style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, letterSpacing:"0.1em", textTransform:"uppercase", color:th.textDim, display:"block", marginBottom:7, fontWeight:500 }}>{label}</label>}
      <select {...props} className="barto-input" style={{
        width:"100%", padding:"9px 12px", borderRadius:7,
        background:th.inputBg, border:`1px solid ${th.borderMid}`,
        color:th.inputColor, fontSize:13, fontFamily:"'DM Sans',sans-serif",
        outline:"none", appearance:"none",
      }}>
        {children}
      </select>
    </div>
  );
}

// ── BtnPrimary ────────────────────────────────────────────────────────────────
export function BtnPrimary({ children, onClick, className="", disabled=false, style={}, variant="gold" }) {
  const variants = {
    gold:    { background:disabled?"#2A2A2A":"linear-gradient(135deg,#C9A84C,#9A7A2E)", color:disabled?"#555":"#080808", boxShadow:disabled?"none":"0 2px 12px #C9A84C25" },
    ember:   { background:disabled?"#2A2A2A":"linear-gradient(135deg,#F97316,#EA580C)", color:disabled?"#555":"#fff",    boxShadow:disabled?"none":"0 2px 12px #F9731625" },
    confirm: { background:disabled?"#2A2A2A":"linear-gradient(135deg,#34D399,#10B981)", color:disabled?"#555":"#fff",    boxShadow:disabled?"none":"0 2px 16px #10B98130" },
  };
  const v = variants[variant]||variants.gold;
  return (
    <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-2 barto-btn-primary ${className}`} style={{
      padding:"9px 18px", borderRadius:8, border:"none",
      fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600,
      cursor:disabled?"not-allowed":"pointer", letterSpacing:"0.01em",
      transition:"filter 0.15s, transform 0.15s, box-shadow 0.15s",
      ...v, ...style,
    }}>
      {children}
    </button>
  );
}

// ── BtnGhost ──────────────────────────────────────────────────────────────────
export function BtnGhost({ children, onClick, className="" }) {
  const th = useThemeVars();
  return (
    <button onClick={onClick} className={`flex items-center gap-2 barto-btn-ghost ${className}`} style={{
      padding:"9px 16px", borderRadius:8,
      background:th.bgElevated, border:`1px solid ${th.borderMid}`,
      fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:400,
      color:th.textMuted, cursor:"pointer",
      transition:"color 0.15s, border-color 0.15s, background 0.15s",
    }}>
      {children}
    </button>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, sub, children }) {
  const th = useThemeVars();
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:20, letterSpacing:"-0.02em", color:th.textPrim, lineHeight:1.1 }}>{title}</h2>
        {sub && <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:th.textGhost, marginTop:5, letterSpacing:"0.06em" }}>{sub}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ gold=false }) {
  const th = useThemeVars();
  return <div style={{ height:1, background:gold?"linear-gradient(90deg,transparent,#C9A84C35,transparent)":th.border }}/>;
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub }) {
  const th = useThemeVars();
  return (
    <div className="flex flex-col items-center justify-center" style={{ padding:"32px 16px", gap:8 }}>
      {icon && (
        <div style={{ width:36, height:36, borderRadius:10, background:th.bgElevated, border:`1px solid ${th.border}`, display:"flex", alignItems:"center", justifyContent:"center", color:th.textDim, marginBottom:4 }}>
          <Icon d={icon} size={18}/>
        </div>
      )}
      <p style={{ fontFamily:"'Syne',sans-serif", fontSize:13, color:th.textMuted, fontWeight:600 }}>{title}</p>
      {sub && <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:th.textGhost, letterSpacing:"0.04em", textAlign:"center" }}>{sub}</p>}
    </div>
  );
}