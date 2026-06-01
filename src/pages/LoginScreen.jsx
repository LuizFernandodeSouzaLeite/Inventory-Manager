// src/pages/LoginScreen.jsx
// Tela de autenticação. Permite selecionar perfil, informar e-mail e senha.

import { useState } from "react";
import { Card, Input, BtnPrimary } from "../components/UI";

export default function LoginScreen({ onLogin }) {
  const [email,   setEmail]   = useState("admin@barto.com");
  const [senha,   setSenha]   = useState("");
  const [cargo,   setCargo]   = useState("adm_global");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // Simulação de autenticação — substituir por chamada real à API.
    setTimeout(() => onLogin({ nome: "Administrador", cargo, email }), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
      {/* Grid decorativo de fundo */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            <span className="text-2xl font-black text-white">B</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Bartô</h1>
          <p className="text-zinc-500 text-sm mt-1">Gerenciador de Estoque v2</p>
        </div>

        <Card>
          <h2 className="text-white font-semibold mb-5 text-lg">Entrar na conta</h2>

          {/* Seletor de perfil */}
          <div className="mb-4">
            <label className="text-xs text-zinc-500 mb-2 block">Perfil de acesso</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["adm_global",  "Adm Global" ],
                ["gerente",     "Gerente"    ],
                ["funcionario", "Funcionário"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setCargo(v)}
                  className="py-2 px-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: cargo === v ? "#f97316" : "#1e1e1e",
                    color:      cargo === v ? "#fff"    : "#71717a",
                    border:     cargo === v ? "1px solid #f97316" : "1px solid #2a2a2a",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
          <Input label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />

          <BtnPrimary onClick={handleLogin} className="w-full mt-2">
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              "Entrar"
            )}
          </BtnPrimary>
        </Card>

        <p className="text-center text-zinc-700 text-xs mt-6">Bartô © 2024</p>
      </div>
    </div>
  );
}
