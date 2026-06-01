// src/data/ingredientes.js
// Lista inicial de ingredientes cadastrados no sistema.
// Em produção: substituir por chamada à API/banco de dados.

export const INGREDIENTES_INIT = [
  { id: "ING01", nome: "Carne bovina",     categoria: "Carnes",      unidade: "kg",  prazoValidade: 5,  minimo: 5,   emoji: "🥩" },
  { id: "ING02", nome: "Pão brioche",      categoria: "Pães",        unidade: "un",  prazoValidade: 3,  minimo: 30,  emoji: "🍞" },
  { id: "ING03", nome: "Queijo cheddar",   categoria: "Queijos",     unidade: "un",  prazoValidade: 7,  minimo: 20,  emoji: "🧀" },
  { id: "ING04", nome: "Bacon",            categoria: "Carnes",      unidade: "g",   prazoValidade: 5,  minimo: 500, emoji: "🥓" },
  { id: "ING05", nome: "Alface",           categoria: "Vegetais",    unidade: "un",  prazoValidade: 4,  minimo: 10,  emoji: "🥬" },
  { id: "ING06", nome: "Batata congelada", categoria: "Congelados",  unidade: "kg",  prazoValidade: 30, minimo: 10,  emoji: "🥔" },
  { id: "ING07", nome: "Tomate",           categoria: "Vegetais",    unidade: "un",  prazoValidade: 4,  minimo: 10,  emoji: "🍅" },
  { id: "ING08", nome: "Molho especial",   categoria: "Condimentos", unidade: "ml",  prazoValidade: 90, minimo: 500, emoji: "🫙" },
  { id: "ING09", nome: "Ovo",              categoria: "Outros",      unidade: "un",  prazoValidade: 14, minimo: 20,  emoji: "🥚" },
  { id: "ING10", nome: "Maionese",         categoria: "Condimentos", unidade: "g",   prazoValidade: 30, minimo: 300, emoji: "🥫" },
];
