// src/data/ingredientes.js
// v2.0 — adicionado fatorConversao (quantidade da unidade base por "un" operacional)
// Exemplo: Carne bovina — 1 unidade operacional = 150g = 0.15kg
// O sistema armazena estoque em `unidade` (kg, g, ml),
// mas pedidos e receitas usam sempre "un" (unidade operacional).

export const INGREDIENTES_INIT = [
  // fatorConversao = quanto da `unidade` equivale a 1 "un" operacional
  { id:"ING01", nome:"Carne bovina",    categoria:"Carnes",      unidade:"kg",  fatorConversao:0.15,  prazoValidade:5,  minimo:5,   emoji:"🥩" },
  { id:"ING02", nome:"Pão brioche",     categoria:"Pães",        unidade:"un",  fatorConversao:1,     prazoValidade:3,  minimo:30,  emoji:"🍞" },
  { id:"ING03", nome:"Queijo cheddar",  categoria:"Queijos",     unidade:"un",  fatorConversao:1,     prazoValidade:7,  minimo:20,  emoji:"🧀" },
  { id:"ING04", nome:"Bacon",           categoria:"Carnes",      unidade:"g",   fatorConversao:50,    prazoValidade:5,  minimo:500, emoji:"🥓" },
  { id:"ING05", nome:"Alface",          categoria:"Vegetais",    unidade:"un",  fatorConversao:1,     prazoValidade:4,  minimo:10,  emoji:"🥬" },
  { id:"ING06", nome:"Batata congelada",categoria:"Congelados",  unidade:"kg",  fatorConversao:0.2,   prazoValidade:30, minimo:10,  emoji:"🥔" },
  { id:"ING07", nome:"Tomate",          categoria:"Vegetais",    unidade:"un",  fatorConversao:1,     prazoValidade:4,  minimo:10,  emoji:"🍅" },
  { id:"ING08", nome:"Molho especial",  categoria:"Condimentos", unidade:"ml",  fatorConversao:20,    prazoValidade:90, minimo:500, emoji:"🫙" },
  { id:"ING09", nome:"Ovo",             categoria:"Outros",      unidade:"un",  fatorConversao:1,     prazoValidade:14, minimo:20,  emoji:"🥚" },
  { id:"ING10", nome:"Maionese",        categoria:"Condimentos", unidade:"g",   fatorConversao:15,    prazoValidade:30, minimo:300, emoji:"🥫" },
];