# Bartô v2 — Gerenciador de Estoque

**Bartô** (junção de **Bar** + **Es**t**ô**que) é um sistema web para gerenciamento de estoque de restaurantes/bares. Ele permite controlar ingredientes, rastrear lotes com validade, registrar movimentações de entrada e saída, cadastrar produtos com receitas, emitir pedidos com baixa automática de estoque via FIFO, e visualizar alertas de vencimento e estoque baixo.

> ⚠️ **Versão atual:** protótipo funcional **frontend-only**. Todos os dados são mantidos em memória (estado React) com dados mockados. Em produção, os comentários `// Em produção: substituir por chamada à API/banco de dados` indicam os pontos de integração.

---

## Índice

- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Visão Geral do Sistema](#visão-geral-do-sistema)
  - [Autenticação e Perfis](#autenticação-e-perfis)
  - [Fluxo de Dados](#fluxo-de-dados)
  - [Regra de Negócio: FIFO](#regra-de-negócio-fifo)
- [Páginas (Módulos)](#páginas-módulos)
  - [Login](#-login)
  - [Dashboard](#-dashboard)
  - [Estoque (Ingredientes)](#-estoque-ingredientes)
  - [Lotes](#-lotes)
  - [Entradas](#-entradas)
  - [Saídas](#-saídas)
  - [Produtos](#-produtos)
  - [Pedidos](#-pedidos)
  - [Alertas](#-alertas)
  - [Configurações](#-configurações)
- [Estrutura de Cada Arquivo](#estrutura-de-cada-arquivo)
  - [`src/`](#src)
  - [`src/components/`](#srccomponents)
  - [`src/pages/`](#srcpages)
  - [`src/data/`](#srcdata)
  - [`src/hooks/`](#srchooks)
  - [`src/utils/`](#srcutils)
  - [`public/`](#public)
  - [Raiz do Projeto](#raiz-do-projeto)
- [Modelos de Dados](#modelos-de-dados)
- [Personalização e Temas](#personalização-e-temas)
- [Próximos Passos (Roadmap)](#próximos-passos-roadmap)
- [Contribuição](#contribuição)

---

## Tecnologias

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **React** | ^19.2.6 | Biblioteca de interface |
| **Vite** | ^8.0.12 | Bundler e servidor de desenvolvimento |
| **Tailwind CSS** | ^3.4.19 | Framework CSS utilitário |
| **PostCSS** + **Autoprefixer** | — | Processamento de CSS |
| **ESLint** | ^10.3.0 | Linter de código |
| **JavaScript (JSX)** | — | Linguagem (sem TypeScript) |

**Dependências de produção:** apenas `react` e `react-dom`. Zero dependências de roteador, estado global ou HTTP client.

---

## Estrutura do Projeto

```
barto-v2/
├── public/
│   ├── favicon.svg            # Ícone da aba do navegador
│   └── icons.svg              # Sprites SVG (Discord, GitHub, X, etc.)
├── src/
│   ├── components/
│   │   ├── Icon.jsx           # Sistema de ícones SVG inline
│   │   ├── Layout.jsx         # Layout autenticado (sidebar + header)
│   │   └── UI.jsx             # Primitivas de UI (Badge, Card, Modal, Input, Select, BtnPrimary, BtnGhost)
│   ├── data/
│   │   ├── ingredientes.js    # Mock inicial de ingredientes
│   │   ├── lotes.js           # Mock inicial de lotes
│   │   ├── movimentos.js      # Mock inicial de movimentações
│   │   ├── pedidos.js         # Mock inicial de pedidos + prazos padrão por categoria
│   │   └── produtos.js        # Mock inicial de produtos com receitas
│   ├── hooks/
│   │   └── useAlertas.js      # Hook que calcula alertas ativos dinamicamente
│   ├── pages/
│   │   ├── Alertas.jsx        # Central de alertas
│   │   ├── Configuracoes.jsx  # Configurações do sistema
│   │   ├── Dashboard.jsx      # Visão geral com métricas
│   │   ├── Entradas.jsx       # Registro de entrada de lotes
│   │   ├── Estoque.jsx        # Ingredientes cadastrados
│   │   ├── LoginScreen.jsx    # Tela de autenticação
│   │   ├── Lotes.jsx          # Controle de lotes
│   │   ├── Pedidos.jsx        # Pedidos com baixa de estoque
│   │   ├── Produtos.jsx       # Produtos e receitas
│   │   └── Saidas.jsx         # Saídas e descartes manuais
│   ├── utils/
│   │   ├── estoque.js         # Lógica de negócio (cálculo de estoque, FIFO)
│   │   └── helpers.js         # Funções utilitárias (datas, IDs, status, cores)
│   ├── App.jsx                # Componente raiz (auth, estado global, roteamento)
│   ├── index.css              # Diretivas Tailwind
│   └── main.jsx               # Entry point
├── index.html                 # HTML de entrada
├── vite.config.js             # Configuração do Vite
├── tailwind.config.js         # Configuração do Tailwind
├── postcss.config.js          # Configuração do PostCSS
├── eslint.config.js           # Configuração do ESLint
├── package.json
└── README.md
```

---

## Pré-requisitos

- **Node.js** ^18 ou superior
- **npm** ^9 ou superior

---

## Instalação e Execução

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Abrir no navegador
# http://localhost:5173
```

Para gerar a build de produção:

```bash
npm run build      # Gera os arquivos em dist/
npm run preview    # Servir a build localmente
```

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor Vite com HMR |
| `npm run build` | Gera build de produção em `dist/` |
| `npm run preview` | Servir a build de produção localmente |
| `npm run lint` | Executa ESLint em todo o projeto |

---

## Visão Geral do Sistema

### Autenticação e Perfis

O login é simulado (sem backend). Três perfis de acesso:

| Perfil | Acesso |
|---|---|
| **Adm Global** (`adm_global`) | Acesso total ao sistema |
| **Gerente** (`gerente`) | Pode editar configurações |
| **Funcionário** (`funcionario`) | Visualização geral; **não pode** alterar configurações |

Na tela de login, selecione o perfil desejado e clique em "Entrar" — a senha não é validada no protótipo.

### Fluxo de Dados

1. **Ingredientes** são a base do sistema (ex: "Carne bovina", "Pão brioche").
2. **Lotes** são unidades rastreáveis de um ingrediente com quantidade, validade e custo.
3. **Movimentações** registram entradas, saídas e descartes de lotes.
4. **Produtos** são itens do cardápio que possuem uma **receita** (lista de ingredientes com quantidades).
5. **Pedidos** consomem produtos; ao confirmar um pedido, o sistema **baixa automaticamente** o estoque dos ingredientes usados.
6. **Alertas** são calculados dinamicamente: lotes vencidos/vencendo e ingredientes com estoque abaixo do mínimo.

### Regra de Negócio: FIFO

O consumo de estoque (saídas e pedidos) usa a estratégia **FIFO com prioridade por validade**: lotes com vencimento mais próximo são consumidos primeiro, minimizando o desperdício. A lógica está em `src/utils/estoque.js:28` na função `consumirLotesFIFO`.

---

## Páginas (Módulos)

### 🔐 Login

**Arquivo:** `src/pages/LoginScreen.jsx`

Seleção de perfil (Adm Global / Gerente / Funcionário), e-mail e senha. Simula autenticação com `setTimeout` de 1s e retorna um objeto usuário simples.

### 📊 Dashboard

**Arquivo:** `src/pages/Dashboard.jsx`

Visão geral com:
- 4 cards de métricas (itens em estoque, lotes vencendo, pedidos hoje, alertas ativos)
- Tabela das 6 últimas movimentações
- Lista de lotes com vencimento crítico
- Lista de ingredientes com estoque abaixo do mínimo

### 🥩 Estoque (Ingredientes)

**Arquivo:** `src/pages/Estoque.jsx`

Tabela de todos os ingredientes cadastrados com:
- Quantidade atual em estoque (calculada somando todos os lotes)
- Status (Crítico / Baixo / Normal)
- Categoria, prazo de validade padrão, unidade
- Busca por nome
- Modal de cadastro de novo ingrediente

### 📦 Lotes

**Arquivo:** `src/pages/Lotes.jsx`

Rastreamento individual de cada lote:
- Filtros por ingrediente e status (Normal, Atenção, Crítico, Vencido, Esgotado)
- Barra de progresso do consumo do lote
- Validade, dias até vencer, quantidade inicial e restante

### 📥 Entradas

**Arquivo:** `src/pages/Entradas.jsx`

Registro de entrada de novos lotes:
- Validade pode ser **automática** (calculada com base no prazo da categoria do ingrediente) ou **manual** (data escolhida pelo usuário)
- Gera automaticamente um novo lote e uma movimentação de entrada

### 📤 Saídas

**Arquivo:** `src/pages/Saidas.jsx`

Registro de saídas manuais e descartes:
- Consome estoque via FIFO automaticamente
- Motivos predefinidos: "Uso produção", "Produto vencido", "Perda/quebra", "Teste/degustação", "Outro"
- Se o estoque for insuficiente, exibe um alerta e cancela a operação

### 🍔 Produtos

**Arquivo:** `src/pages/Produtos.jsx`

Cadastro de produtos com receitas:
- Cards com emoji, nome, categoria, preço e preview dos ingredientes
- Modal de cadastro com lista dinâmica de ingredientes (adicionar/remover)
- Modal de visualização da receita completa

### 🧾 Pedidos

**Arquivo:** `src/pages/Pedidos.jsx`

Registro de pedidos com baixa automática de estoque:
- Seleção de produtos em grid visual
- Ajuste de quantidade (+/-)
- **Ajustes inline de ingredientes**: é possível adicionar ou remover ingredientes extras no pedido (ex: "carne dupla", "sem cebola")
- Ao confirmar, o sistema calcula o consumo de cada ingrediente (receita base × quantidade + ajustes) e baixa via FIFO, registrando movimentações individuais por lote

### ⚠️ Alertas

**Arquivo:** `src/pages/Alertas.jsx`

Central de alertas com dois tipos:
- **Lotes vencidos** ou **vencendo nos próximos N dias** (configurável)
- **Estoque zerado** ou **abaixo do mínimo** por ingrediente

### ⚙️ Configurações

**Arquivo:** `src/pages/Configuracoes.jsx`

Configurações do sistema:
- **Dias de aviso de validade**: quantos dias antes do vencimento começar a alertar
- **Prazos por categoria**: validade padrão para cada categoria de ingrediente
- **Permissões**: exibição das regras de acesso por cargo
- **Restrição**: apenas Adm Global e Gerente podem editar; Funcionário vê apenas leitura

---

## Estrutura de Cada Arquivo

### `src/`

| Arquivo | Função |
|---|---|
| `main.jsx` | Entry point — renderiza `<App />` no `#root` |
| `App.jsx` | Componente raiz: controla autenticação, estado global (useState para cada entidade), roteamento manual via `switch` no estado `active`, e propaga `shared` com todos os dados e setters |
| `index.css` | Apenas as 3 diretivas do Tailwind (`@tailwind base; components; utilities`) |

### `src/components/`

| Arquivo | Função |
|---|---|
| `Layout.jsx` | Sidebar retrátil + header com perfil do usuário + botão de logout + badge de alertas. A navegação é definida no array `NAV` (9 itens). Ícone "B" com gradiente laranja |
| `UI.jsx` | 6 componentes primitivos: `Badge`, `Card`, `Modal`, `Input`, `Select`, `BtnPrimary`, `BtnGhost`. Todos seguem o tema escuro laranja |
| `Icon.jsx` | Sistema de ícones SVG inline. O objeto `icons` centraliza todos os paths SVG (ícones Feather-style). O componente `<Icon>` recebe `d` (path ou array de paths), `size`, `className` e `style` |

### `src/pages/`

Cada arquivo corresponde a uma "rota" (definida no `switch` do `App.jsx`). Recebem o objeto `shared` via props com todos os dados e setters necessários.

| Arquivo | active | Descrição |
|---|---|---|
| `LoginScreen.jsx` | — | Tela de login (renderizada antes do Layout) |
| `Dashboard.jsx` | `"dashboard"` | Métricas e visão geral |
| `Estoque.jsx` | `"estoque"` | Tabela de ingredientes |
| `Lotes.jsx` | `"lotes"` | Controle de lotes |
| `Entradas.jsx` | `"entradas"` | Registro de entradas |
| `Saidas.jsx` | `"saidas"` | Registro de saídas/descartes |
| `Produtos.jsx` | `"produtos"` | Produtos e receitas |
| `Pedidos.jsx` | `"pedidos"` | Pedidos com baixa de estoque |
| `Alertas.jsx` | `"alertas"` | Central de alertas |
| `Configuracoes.jsx` | `"config"` | Configurações do sistema |

### `src/data/`

Arquivos de dados mockados (em memória). Cada um exporta uma constante (`INGREDIENTES_INIT`, `LOTES_INIT`, etc.) usada como estado inicial no `App.jsx`.

| Arquivo | Conteúdo |
|---|---|
| `ingredientes.js` | 10 ingredientes (carnes, pães, queijos, vegetais, congelados, condimentos) |
| `lotes.js` | 6 lotes com datas relativas (usa `addDias()` e `hoje()`) |
| `movimentos.js` | 6 movimentações (entradas, saídas, descarte) |
| `pedidos.js` | 2 pedidos + objeto `PRAZOS_PADRAO` com prazos por categoria |
| `produtos.js` | 3 produtos (X-Bacon, X-Burguer, Fritas P) com receitas |

### `src/hooks/`

| Arquivo | Função |
|---|---|
| `useAlertas.js` | Hook que recebe `lotes`, `ingredientes` e `diasAviso` e retorna uma lista de alertas calculada via `useMemo`. Reage automaticamente a mudanças nos dados de entrada |

### `src/utils/`

| Arquivo | Funções exportadas |
|---|---|
| `helpers.js` | `hoje()`, `addDias(n)`, `diasAte(data)`, `fmtData(data)`, `fmtDataHora()`, `uid()`, `statusValidade(data, diasAviso)`, `corStatus(s)`, `cargoLabel(c)`, `cargoColor(c)` |
| `estoque.js` | `calcEstoque(lotes, ingredienteId)` — calcula quantidade total disponível; `consumirLotesFIFO(lotes, ingredienteId, quantidade)` — consome via FIFO retornando lotes atualizados, consumidos e sucesso |

### `public/`

| Arquivo | Finalidade |
|---|---|
| `favicon.svg` | Ícone SVG da aba do navegador |
| `icons.svg` | Sprites SVG para links sociais (não utilizado no app atualmente — são sprites genéricos de redes sociais) |

### Raiz do Projeto

| Arquivo | Finalidade |
|---|---|
| `index.html` | HTML entry point com `<div id="root">` e script apontando para `src/main.jsx` |
| `vite.config.js` | Plug-in React do Vite |
| `tailwind.config.js` | Scan em `index.html` e `src/**/*.{js,jsx}` |
| `postcss.config.js` | Tailwind + Autoprefixer |
| `eslint.config.js` | Configuração flat do ESLint com regras para React Hooks e React Refresh |
| `package.json` | Dependências e scripts |

---

## Modelos de Dados

### Ingrediente

```js
{
  id: "ING01",
  nome: "Carne bovina",
  categoria: "Carnes",        // Categorias: Carnes, Pães, Queijos, Vegetais, Congelados, Condimentos, Outros
  unidade: "kg",               // kg, un, g, ml...
  prazoValidade: 5,            // dias
  minimo: 5,                   // quantidade mínima em estoque (alerta)
  emoji: "🥩"
}
```

### Lote

```js
{
  id: "LOT001",
  ingredienteId: "ING01",
  numero: 1,                   // número sequencial por ingrediente
  quantidade: 8,               // quantidade inicial
  quantidadeRestante: 8,       // quantidade consumida é descontada aqui
  dataEntrada: "2026-05-22",
  dataValidade: "2026-05-27",
  custo: 120.00,
  usuario: "João Silva",
  observacao: ""
}
```

### Movimentação

```js
{
  id: "MOV001",
  tipo: "entrada",             // "entrada" | "saida" | "descarte"
  loteId: "LOT001",
  ingredienteId: "ING01",
  quantidade: 8,
  data: "2026-05-22 14:22",
  usuario: "João Silva",
  motivo: "Compra fornecedor",
  pedidoId: null               // preenchido quando a saída é de um pedido
}
```

### Produto

```js
{
  id: "PRD001",
  nome: "X-Bacon",
  categoria: "Lanches",
  preco: 28.00,
  emoji: "🍔",
  receita: [
    { ingredienteId: "ING02", quantidade: 1,    unidade: "un" },
    { ingredienteId: "ING01", quantidade: 0.15, unidade: "kg" },
    // ...
  ]
}
```

### Pedido

```js
{
  id: "PED001",
  numero: 1,
  status: "entregue",
  mesa: "02",
  itens: [
    {
      produtoId: "PRD001",
      quantidade: 2,
      ajustes: [
        { ingredienteId: "ING01", delta: 0.15, label: "🥩 Carne bovina: +0.15 kg" }
      ]
    }
  ],
  total: 56.00,
  data: "2026-05-23 19:30",
  usuario: "Maria Lima",
  observacao: ""
}
```

### Usuário (inferido do LoginScreen)

```js
{
  nome: "Administrador",
  cargo: "adm_global",        // "adm_global" | "gerente" | "funcionario"
  email: "admin@barto.com"
}
```

---

## Personalização e Temas

O tema é **escuro** com detalhes em **laranja** (`#f97316`):

```css
/* Cores principais do sistema */
--bg-body:      #0d0d0d
--bg-card:      #141414
--bg-elevated:  #1e1e1e
--border:       #1e1e1e / #252525 / #2a2a2a
--accent:       #f97316
--accent-hover: #ea580c
--text:         #ffffff
--text-muted:   #71717a
--font:         'DM Sans', sans-serif
```

Para alterar o tema, modifique as cores inline nos componentes (não há um arquivo de tema centralizado — as cores são definidas diretamente nos `style={{}}` e classes Tailwind em cada componente).

---

## Próximos Passos (Roadmap)

- [ ] **Backend real** — API REST com banco de dados (PostgreSQL/MySQL)
- [ ] **Autenticação real** — JWT, OAuth ou sessão
- [ ] **React Router** — substituir o roteamento manual por `react-router-dom`
- [ ] **Context API ou Zustand** — estado global mais organizado
- [ ] **TypeScript** — migrar para tipagem estática
- [ ] **Testes** — Vitest + React Testing Library
- [ ] **Docker** — conteinerização para deploy
- [ ] **Relatórios** — exportação CSV/PDF, gráficos
- [ ] **Múltiplos estabelecimentos** — suporte a filiais
- [ ] **Notificações** — push ou e-mail para alertas críticos

---

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## Licença

Este projeto é privado e de uso interno. © 2024
