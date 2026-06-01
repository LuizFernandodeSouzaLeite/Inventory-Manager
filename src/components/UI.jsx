// src/components/UI.jsx
// Primitivas de UI — tema preto/dourado/laranja técnico premium.
// v3.0 — StatCard com accent "green" adicionado, novos helpers.

import Icon, { icons } from "./Icon";

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, className = "", style = {} }) {
  return (
    <span
      className={`inline-flex items-center ${className}`}
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.04em",
        padding: "2px 8px",
        borderRadius: 4,
        border: "1px solid",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", style = {}, accent = null, hoverable = false }) {
  const accentColors = {
    gold:  "#C9A84C",
    ember: "#F97316",
    red:   "#EF4444",
    green: "#22C55E",
    blue:  "#3B82F6",
  };
  const accentColor = accent ? accentColors[accent] : null;

  return (
    <div
      className={`relative barto-card ${hoverable ? "barto-card-hover" : ""} ${className}`}
      style={{
        background: "#0F0F0F",
        border: "1px solid #1E1E1E",
        borderRadius: 10,
        padding: "16px 18px",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        ...(accentColor ? { borderTopColor: accentColor + "50" } : {}),
        ...style,
      }}
    >
      {accentColor && (
        <div style={{
          position: "absolute", top: -1, left: "12%", right: "12%", height: 1,
          background: `linear-gradient(90deg, transparent, ${accentColor}90, transparent)`,
          borderRadius: 1,
        }} />
      )}
      {children}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, iconColor = "#C9A84C", accent = null, onClick }) {
  const accentColors = {
    gold:  "#C9A84C",
    ember: "#F97316",
    red:   "#EF4444",
    green: "#22C55E",
    blue:  "#3B82F6",
  };
  const accentColor = accent ? accentColors[accent] : null;

  return (
    <div
      className="relative barto-stat-card"
      onClick={onClick}
      style={{
        background: "#0F0F0F",
        border: "1px solid #1E1E1E",
        borderRadius: 10,
        padding: "18px 20px",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.25s, box-shadow 0.25s, transform 0.25s",
        ...(accentColor ? { borderTopColor: accentColor + "50" } : {}),
      }}
    >
      {accentColor && (
        <div style={{
          position: "absolute", top: -1, left: "12%", right: "12%", height: 1,
          background: `linear-gradient(90deg, transparent, ${accentColor}90, transparent)`,
          borderRadius: 1,
        }} />
      )}

      <div className="flex items-start justify-between mb-4">
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#494949", fontWeight: 500,
        }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: iconColor + "14", border: "1px solid " + iconColor + "22",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: iconColor, flexShrink: 0,
          }}>
            <Icon d={icon} size={15} />
          </div>
        )}
      </div>

      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 28, fontWeight: 400,
        letterSpacing: "-0.04em",
        color: accentColor || "#EDE9DF",
        lineHeight: 1, marginBottom: sub ? 8 : 0,
      }}>
        {value}
      </div>

      {sub && (
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10, color: "#3A3A3A",
          letterSpacing: "0.04em", marginTop: 2,
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", animation: "barto-fade-in 0.15s ease" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full ${width} flex flex-col`}
        style={{
          background: "#0F0F0F",
          border: "1px solid #C9A84C22",
          borderRadius: 12,
          maxHeight: "90vh",
          boxShadow: "0 0 0 1px #C9A84C0C, 0 32px 80px #00000096",
          animation: "barto-slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #C9A84C70, transparent)", borderRadius: "12px 12px 0 0" }} />
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid #1A1A1A" }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#EDE9DF", letterSpacing: "-0.01em" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #222", background: "#161616", color: "#555", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
          >
            <Icon d={icons.x} size={14} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, helper, error, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: error ? "#EF4444AA" : "#555", display: "block", marginBottom: 7, fontWeight: 500 }}>
          {label}
        </label>
      )}
      <input
        {...props}
        className="barto-input"
        style={{
          width: "100%", padding: "9px 12px", borderRadius: 7,
          background: "#141414", border: `1px solid ${error ? "#EF444440" : "#252525"}`,
          color: "#D4D0C8", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      />
      {helper && !error && <p style={{ fontSize: 11, color: "#3A3A3A", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{helper}</p>}
      {error && <p style={{ fontSize: 11, color: "#EF4444AA", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{error}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", display: "block", marginBottom: 7, fontWeight: 500 }}>
          {label}
        </label>
      )}
      <select
        {...props}
        className="barto-input"
        style={{
          width: "100%", padding: "9px 12px", borderRadius: 7,
          background: "#141414", border: "1px solid #252525",
          color: "#D4D0C8", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          outline: "none", appearance: "none",
        }}
      >
        {children}
      </select>
    </div>
  );
}

// ── BtnPrimary ────────────────────────────────────────────────────────────────
export function BtnPrimary({ children, onClick, className = "", disabled = false, style = {}, variant = "gold" }) {
  const variants = {
    gold:  { background: disabled ? "#2A2A2A" : "linear-gradient(135deg, #C9A84C, #9A7A2E)", color: disabled ? "#555" : "#080808", boxShadow: disabled ? "none" : "0 2px 12px #C9A84C25" },
    ember: { background: disabled ? "#2A2A2A" : "linear-gradient(135deg, #F97316, #EA580C)", color: disabled ? "#555" : "#fff",    boxShadow: disabled ? "none" : "0 2px 12px #F9731625" },
  };
  const v = variants[variant] || variants.gold;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 barto-btn-primary ${className}`}
      style={{
        padding: "9px 18px", borderRadius: 8, border: "none",
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        letterSpacing: "0.01em",
        transition: "filter 0.15s, transform 0.15s, box-shadow 0.15s",
        ...v, ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── BtnGhost ──────────────────────────────────────────────────────────────────
export function BtnGhost({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 barto-btn-ghost ${className}`}
      style={{
        padding: "9px 16px", borderRadius: 8,
        background: "#141414", border: "1px solid #252525",
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400,
        color: "#666", cursor: "pointer",
        transition: "color 0.15s, border-color 0.15s, background 0.15s",
      }}
    >
      {children}
    </button>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, sub, children }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: "#EDE9DF", lineHeight: 1.1 }}>
          {title}
        </h2>
        {sub && (
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3A3A3A", marginTop: 5, letterSpacing: "0.06em" }}>
            {sub}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ gold = false }) {
  return (
    <div style={{
      height: 1,
      background: gold ? "linear-gradient(90deg, transparent, #C9A84C35, transparent)" : "#161616",
    }} />
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ padding: "32px 16px", gap: 8 }}>
      {icon && (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#161616", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", marginBottom: 4 }}>
          <Icon d={icon} size={18} />
        </div>
      )}
      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, color: "#333", fontWeight: 600 }}>{title}</p>
      {sub && <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10.5, color: "#2A2A2A", letterSpacing: "0.04em", textAlign: "center" }}>{sub}</p>}
    </div>
  );
}