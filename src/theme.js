// src/theme.js
// Mapa central de temas e cores — usado por App.jsx e Configuracoes.jsx.
// A função `buildTheme` retorna um objeto com todas as cores resolvidas,
// que é passado como prop `t` para todos os componentes que precisam.

// ── Paletas de cor de destaque ────────────────────────────────────────────────
export const COR_PALETAS = {
  gold: {
    accent:        "#C9A84C",
    accentBright:  "#E2C97E",
    accentDim:     "#C9A84C15",
    accentBorder:  "#C9A84C30",
    accentHover:   "#D4AE52",
    accentDark:    "#9A7A2E",
    accentGrad:    "linear-gradient(135deg, #C9A84C, #9A7A2E)",
    accentText:    "#080808",  // texto sobre o accent
  },
  ember: {
    accent:        "#F97316",
    accentBright:  "#FB923C",
    accentDim:     "#F9731615",
    accentBorder:  "#F9731630",
    accentHover:   "#FB923C",
    accentDark:    "#EA580C",
    accentGrad:    "linear-gradient(135deg, #F97316, #EA580C)",
    accentText:    "#fff",
  },
  blue: {
    accent:        "#3B82F6",
    accentBright:  "#60A5FA",
    accentDim:     "#3B82F615",
    accentBorder:  "#3B82F630",
    accentHover:   "#60A5FA",
    accentDark:    "#2563EB",
    accentGrad:    "linear-gradient(135deg, #3B82F6, #2563EB)",
    accentText:    "#fff",
  },
  green: {
    accent:        "#22C55E",
    accentBright:  "#4ADE80",
    accentDim:     "#22C55E15",
    accentBorder:  "#22C55E30",
    accentHover:   "#4ADE80",
    accentDark:    "#16A34A",
    accentGrad:    "linear-gradient(135deg, #22C55E, #16A34A)",
    accentText:    "#080808",
  },
  red: {
    accent:        "#EF4444",
    accentBright:  "#F87171",
    accentDim:     "#EF444415",
    accentBorder:  "#EF444430",
    accentHover:   "#F87171",
    accentDark:    "#B91C1C",
    accentGrad:    "linear-gradient(135deg, #EF4444, #B91C1C)",
    accentText:    "#fff",
  },
};

// ── Paletas de fundo por tema ─────────────────────────────────────────────────
export const TEMA_PALETAS = {
  dark: {
    bgBody:     "#080808",
    bgCard:     "#0F0F0F",
    bgSidebar:  "#0A0A0A",
    bgElevated: "#141414",
    bgInput:    "#141414",
    bgHover:    "#141414",
    bgActive:   "#1A1A1A",
    border:     "#1E1E1E",
    borderSoft: "#161616",
    borderMid:  "#252525",
  },
  light: {
    bgBody:     "#F0EDE8",
    bgCard:     "#FAFAF8",
    bgSidebar:  "#E8E4DE",
    bgElevated: "#EDEAE5",
    bgInput:    "#FAFAF8",
    bgHover:    "#E8E5DF",
    bgActive:   "#DED9D2",
    border:     "#D4CFC6",
    borderSoft: "#DDD9D2",
    borderMid:  "#BDB8AF",
  },
  highContrast: {
    bgBody:     "#000000",
    bgCard:     "#0A0A0A",
    bgSidebar:  "#000000",
    bgElevated: "#111111",
    bgInput:    "#111111",
    bgHover:    "#111111",
    bgActive:   "#1A1A1A",
    border:     "#333333",
    borderSoft: "#222222",
    borderMid:  "#3A3A3A",
  },
  minimal: {
    bgBody:     "#111111",
    bgCard:     "#181818",
    bgSidebar:  "#141414",
    bgElevated: "#1E1E1E",
    bgInput:    "#1E1E1E",
    bgHover:    "#1E1E1E",
    bgActive:   "#252525",
    border:     "#252525",
    borderSoft: "#1E1E1E",
    borderMid:  "#2E2E2E",
  },
};

// ── Cores fixas (não mudam com tema/cor) ──────────────────────────────────────
const FIXAS = {
  textPrimary:   "#EDE9DF",
  textSecondary: "#C8C4BC",
  textMuted:     "#4A4A4A",

  success:       "#22C55E",
  successDim:    "#22C55E15",
  successBorder: "#22C55E30",

  danger:        "#EF4444",
  dangerDim:     "#EF444415",
  dangerBorder:  "#EF444430",

  warning:       "#FBBF24",
  warningDim:    "#FBBF2415",
  warningBorder: "#FBBF2430",

  entrada:       "#4ADE80",
  entradaDim:    "#4ADE8010",
  entradaBorder: "#4ADE8025",

  saida:         "#F87171",
  saidaDim:      "#F8717110",
  saidaBorder:   "#F8717125",
};

// ── buildTheme: resolve prefs → objeto de tema completo ───────────────────────
// textDim e textGhost agora são derivados do accent:
//   textDim   = accent com 35% de opacidade → textos secundários visíveis e temáticos
//   textGhost = accent com 20% de opacidade → textos muito sutis (labels, hints)
export function buildTheme(prefs) {
  const cor  = COR_PALETAS[prefs.corPrimaria] || COR_PALETAS.gold;
  const tema = TEMA_PALETAS[prefs.tema]        || TEMA_PALETAS.dark;

  // Derivados do accent — mudam junto com a cor escolhida
  const derived = {
    textDim:   cor.accent + "80",  // ~50% opacidade — labels, subtítulos, hints
    textGhost: cor.accent + "45",  // ~27% opacidade — textos quase invisíveis
    labelCaps: cor.accent + "60",  // letras maiúsculas de seção
  };

    // No tema claro, inverte as cores de texto e ajusta tokens
  const isLight = prefs.tema === "light";
  const textOverride = isLight ? {
    textPrimary:   "#16130F",
    textSecondary: "#3A3730",
    textMuted:     "#7A7268",
    // Sobrescreve tokens que aparecem hardcoded como cinza escuro
    // Usado por componentes que leem t.textDim / t.textGhost
    textDim:   cor.accent + "CC",   // mais visível no fundo claro
    textGhost: cor.accent + "80",
    labelCaps: cor.accent + "99",
    // Bordas e fundos específicos para modo claro
    bgTableHeader: "#EDEAE4",
    bgRowHover:    "#E8E4DC",
    shadowCard:    "0 1px 3px #00000012, 0 4px 12px #0000000A",
    isLight:       true,
  } : {
    bgTableHeader: "#0A0A0A",
    bgRowHover:    "#141414BB",
    shadowCard:    "none",
    isLight:       false,
  };

  // Aplica CSS variables no :root
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--label-caps-color", textOverride.textDim || derived.textDim);
    // Modo claro: força scrollbar clara e seleção
    if (isLight) {
      document.documentElement.style.setProperty("--scrollbar-thumb", cor.accent + "60");
      document.documentElement.style.setProperty("color-scheme", "light");
    } else {
      document.documentElement.style.setProperty("color-scheme", "dark");
    }
  }

  return { ...cor, ...tema, ...FIXAS, ...derived, ...textOverride };
}