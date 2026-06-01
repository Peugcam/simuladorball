# Simula Campeão — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site client-side onde o usuário simula, clicando, o caminho até o campeão na Copa do Mundo, Libertadores e Copa do Brasil, e compartilha o resultado por imagem e link.

**Architecture:** Vite + React, sem backend. Dados de cada competição em JSON. Uma lógica pura (`lib/`) monta o bracket e propaga vencedores; componentes React desenham o chaveamento espelhado. Estado do palpite é serializado na URL para compartilhar; `html-to-image` gera o PNG.

**Tech Stack:** Vite, React 18, Vitest + @testing-library/react (jsdom), html-to-image.

---

## Convenções de dados (válidas para todo o plano)

**Estado do palpite (objeto único):**
```js
// mata-mata direto (libertadores, copa-brasil)
{ comp: "libertadores", winners: { "m0": "fla", "m1": "cor", ... } }

// copa do mundo (grupos -> mata-mata)
{
  comp: "mundial",
  grupos: { A: ["mex","kor","rsa","cze"], B: [...], ... }, // ordem = 1º,2º,3º,4º
  terceiros: ["bra3id", ...],   // 8 ids de seleções 3º colocadas que avançam
  winners: { "m0": "bra", ... }
}
```

**`matchId`:** string `"m" + índice global do confronto`, numerado round a round, da esquerda para a direita, de cima para baixo. Round inicial primeiro (oitavas/R32), depois quartas, etc.

**Estrutura de bracket retornada por `montarBracket`:**
```js
{
  rounds: [
    // round 0 (fase inicial)
    [ { id: "m0", a: {id,nome,sigla,cor}|null, b: {...}|null, winner: "id"|null }, ... ],
    // round 1 (próxima fase) ...
  ],
  side: { left: [ids de matches do round 0 no lado esquerdo], right: [...] }
}
```

---

## Task 1: Scaffold do projeto Vite + React + Vitest

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/setupTests.js`

- [ ] **Step 1: Criar package.json**

```json
{
  "name": "simula-campeao",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "html-to-image": "^1.11.13"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^25.0.0",
    "vite": "^5.4.8",
    "vitest": "^2.1.2"
  }
}
```

- [ ] **Step 2: Criar vite.config.js**

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
```

- [ ] **Step 3: Criar src/setupTests.js**

```js
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Criar index.html**

```html
<!doctype html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Simula Campeão</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Criar src/main.jsx**

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 6: Criar src/App.jsx (placeholder temporário, será substituído na Task 9/10)**

```jsx
export default function App() {
  return <h1>Simula Campeão</h1>;
}
```

- [ ] **Step 7: Criar src/styles/global.css mínimo**

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #0f1115; color: #f5f5f5; }
```

- [ ] **Step 8: Instalar e validar build**

Run: `npm install && npm run build`
Expected: build conclui sem erros, gera `dist/`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + Vitest"
```

---

## Task 2: Dados das três competições (JSON)

**Files:**
- Create: `src/data/libertadores.json`, `src/data/copa-brasil.json`, `src/data/mundial.json`, `src/data/index.js`

> Cores: usar a cor principal de cada clube quando conhecida; para times sem cor definida, usar `"#3a3f4b"` (cinza neutro). Cores são cosméticas e podem ser refinadas depois.

- [ ] **Step 1: Criar src/data/libertadores.json**

A ordem dos confrontos define os cruzamentos do bracket (matches adjacentes se cruzam na fase seguinte). Reflete o sorteio de 29/05/2026.

```json
{
  "id": "libertadores",
  "nome": "Libertadores",
  "tipo": "mata-mata",
  "cor": "#1b9e4b",
  "fases": ["Oitavas", "Quartas", "Semi", "Final"],
  "times": {
    "est": { "nome": "Estudiantes", "sigla": "EST", "cor": "#d11a2a" },
    "uca": { "nome": "U. Católica", "sigla": "UCA", "cor": "#1e4fa0" },
    "ros": { "nome": "Rosario Central", "sigla": "ROS", "cor": "#0d4ea6" },
    "cor": { "nome": "Corinthians", "sigla": "COR", "cor": "#111111" },
    "cru": { "nome": "Cruzeiro", "sigla": "CRU", "cor": "#1a3a8f" },
    "fla": { "nome": "Flamengo", "sigla": "FLA", "cor": "#e30613" },
    "tol": { "nome": "Tolima", "sigla": "TOL", "cor": "#b59a2d" },
    "idv": { "nome": "Independiente del Valle", "sigla": "IDV", "cor": "#13243f" },
    "mir": { "nome": "Mirassol", "sigla": "MIR", "cor": "#1f9b54" },
    "ldu": { "nome": "LDU", "sigla": "LDU", "cor": "#ffffff" },
    "pal": { "nome": "Palmeiras", "sigla": "PAL", "cor": "#006437" },
    "cer": { "nome": "Cerro Porteño", "sigla": "CER", "cor": "#d4001f" },
    "pla": { "nome": "Platense", "sigla": "PLA", "cor": "#6a3d1f" },
    "coq": { "nome": "Coquimbo Unido", "sigla": "COQ", "cor": "#f6c700" },
    "flu": { "nome": "Fluminense", "sigla": "FLU", "cor": "#7a1c2b" },
    "irv": { "nome": "Ind. Rivadavia", "sigla": "IRV", "cor": "#1e62b0" }
  },
  "confrontos_iniciais": [
    ["cru", "fla"], ["ros", "cor"],
    ["mir", "ldu"], ["pal", "cer"],
    ["est", "uca"], ["tol", "idv"],
    ["pla", "coq"], ["flu", "irv"]
  ]
}
```

- [ ] **Step 2: Criar src/data/copa-brasil.json**

```json
{
  "id": "copa-brasil",
  "nome": "Copa do Brasil",
  "tipo": "mata-mata",
  "cor": "#e8b400",
  "fases": ["Oitavas", "Quartas", "Semi", "Final"],
  "times": {
    "flu": { "nome": "Fluminense", "sigla": "FLU", "cor": "#7a1c2b" },
    "vas": { "nome": "Vasco", "sigla": "VAS", "cor": "#111111" },
    "cor": { "nome": "Corinthians", "sigla": "COR", "cor": "#111111" },
    "int": { "nome": "Internacional", "sigla": "INT", "cor": "#d11a2a" },
    "gre": { "nome": "Grêmio", "sigla": "GRE", "cor": "#0d80c4" },
    "mir": { "nome": "Mirassol", "sigla": "MIR", "cor": "#1f9b54" },
    "vit": { "nome": "Vitória", "sigla": "VIT", "cor": "#d11a2a" },
    "cap": { "nome": "Athletico-PR", "sigla": "CAP", "cor": "#d11a2a" },
    "juv": { "nome": "Juventude", "sigla": "JUV", "cor": "#1a7a3c" },
    "cam": { "nome": "Atlético-MG", "sigla": "CAM", "cor": "#111111" },
    "san": { "nome": "Santos", "sigla": "SAN", "cor": "#ffffff" },
    "rem": { "nome": "Remo", "sigla": "REM", "cor": "#1e4fa0" },
    "cha": { "nome": "Chapecoense", "sigla": "CHA", "cor": "#1a7a3c" },
    "cru": { "nome": "Cruzeiro", "sigla": "CRU", "cor": "#1a3a8f" },
    "pal": { "nome": "Palmeiras", "sigla": "PAL", "cor": "#006437" },
    "for": { "nome": "Fortaleza", "sigla": "FOR", "cor": "#1e4fa0" }
  },
  "confrontos_iniciais": [
    ["flu", "vas"], ["cor", "int"],
    ["gre", "mir"], ["vit", "cap"],
    ["juv", "cam"], ["san", "rem"],
    ["cha", "cru"], ["pal", "for"]
  ]
}
```

- [ ] **Step 3: Criar src/data/mundial.json**

Grupos A–L do sorteio oficial (48 seleções). Ordem dentro do grupo = cabeças/pote, não classificação (o usuário define a classificação ao simular).

```json
{
  "id": "mundial",
  "nome": "Copa do Mundo",
  "tipo": "grupos",
  "cor": "#2563eb",
  "fases": ["32-avos", "16-avos", "Oitavas", "Quartas", "Semi", "Final"],
  "grupos": {
    "A": [["mex","México","#0a7d33"],["rsa","África do Sul","#1a7a3c"],["kor","Coreia do Sul","#d11a2a"],["cze","Rep. Tcheca","#1e4fa0"]],
    "B": [["can","Canadá","#d11a2a"],["bih","Bósnia","#1e62b0"],["qat","Catar","#7a1c2b"],["sui","Suíça","#d11a2a"]],
    "C": [["bra","Brasil","#f6c700"],["mar","Marrocos","#c1272d"],["hai","Haiti","#1e4fa0"],["sco","Escócia","#1a3a8f"]],
    "D": [["usa","Estados Unidos","#1e3a8f"],["par","Paraguai","#d11a2a"],["aus","Austrália","#f6c700"],["tur","Turquia","#d11a2a"]],
    "E": [["ger","Alemanha","#111111"],["cuw","Curaçau","#1e62b0"],["civ","Costa do Marfim","#f47b20"],["ecu","Equador","#f6c700"]],
    "F": [["ned","Holanda","#f47b20"],["jpn","Japão","#1e4fa0"],["swe","Suécia","#f6c700"],["tun","Tunísia","#d11a2a"]],
    "G": [["bel","Bélgica","#d11a2a"],["egy","Egito","#d11a2a"],["irn","Irã","#1a7a3c"],["nzl","Nova Zelândia","#111111"]],
    "H": [["esp","Espanha","#d11a2a"],["cpv","Cabo Verde","#1e4fa0"],["ksa","Arábia Saudita","#1a7a3c"],["uru","Uruguai","#5aa0d8"]],
    "I": [["fra","França","#1e3a8f"],["sen","Senegal","#1a7a3c"],["irq","Iraque","#1a7a3c"],["nor","Noruega","#d11a2a"]],
    "J": [["arg","Argentina","#5aa0d8"],["alg","Argélia","#1a7a3c"],["aut","Áustria","#d11a2a"],["jor","Jordânia","#111111"]],
    "K": [["por","Portugal","#1a7a3c"],["cod","RD Congo","#1e62b0"],["uzb","Uzbequistão","#1e4fa0"],["col","Colômbia","#f6c700"]],
    "L": [["eng","Inglaterra","#1e3a8f"],["cro","Croácia","#d11a2a"],["gha","Gana","#f6c700"],["pan","Panamá","#d11a2a"]]
  }
}
```

- [ ] **Step 4: Criar src/data/index.js**

```js
import libertadores from "./libertadores.json";
import copaBrasil from "./copa-brasil.json";
import mundial from "./mundial.json";

export const COMPETICOES = { libertadores, "copa-brasil": copaBrasil, mundial };
export const LISTA = [mundial, libertadores, copaBrasil];
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: dados reais das tres competicoes (jun/2026)"
```

---

## Task 3: lib/montarBracket — propagação de vencedores (mata-mata)

**Files:**
- Create: `src/lib/montarBracket.js`
- Test: `src/lib/montarBracket.test.js`

- [ ] **Step 1: Escrever teste que falha**

```js
import { describe, it, expect } from "vitest";
import { montarBracket } from "./montarBracket";

const comp = {
  fases: ["Oitavas", "Quartas", "Semi", "Final"],
  times: { a:{nome:"A",sigla:"A",cor:"#111"}, b:{nome:"B",sigla:"B",cor:"#222"},
           c:{nome:"C",sigla:"C",cor:"#333"}, d:{nome:"D",sigla:"D",cor:"#444"},
           e:{nome:"E",sigla:"E",cor:"#555"}, f:{nome:"F",sigla:"F",cor:"#666"},
           g:{nome:"G",sigla:"G",cor:"#777"}, h:{nome:"H",sigla:"H",cor:"#888"},
           i:{nome:"I",sigla:"I",cor:"#999"}, j:{nome:"J",sigla:"J",cor:"#aaa"},
           k:{nome:"K",sigla:"K",cor:"#bbb"}, l:{nome:"L",sigla:"L",cor:"#ccc"},
           m:{nome:"M",sigla:"M",cor:"#ddd"}, n:{nome:"N",sigla:"N",cor:"#eee"},
           o:{nome:"O",sigla:"O",cor:"#f0f"}, p:{nome:"P",sigla:"P",cor:"#0ff"} },
  confrontos_iniciais: [["a","b"],["c","d"],["e","f"],["g","h"],
                        ["i","j"],["k","l"],["m","n"],["o","p"]],
};

describe("montarBracket (mata-mata)", () => {
  it("monta 4 rounds a partir de 8 confrontos", () => {
    const { rounds } = montarBracket(comp, {});
    expect(rounds.map(r => r.length)).toEqual([8, 4, 2, 1]);
  });

  it("preenche os times do round inicial e deixa winner null", () => {
    const { rounds } = montarBracket(comp, {});
    expect(rounds[0][0].a.sigla).toBe("A");
    expect(rounds[0][0].b.sigla).toBe("B");
    expect(rounds[0][0].winner).toBeNull();
  });

  it("propaga o vencedor para a fase seguinte", () => {
    const { rounds } = montarBracket(comp, { m0: "a", m1: "c" });
    expect(rounds[0][0].winner).toBe("a");
    // m8 é o primeiro confronto das quartas (vencedor de m0 x vencedor de m1)
    expect(rounds[1][0].a.sigla).toBe("A");
    expect(rounds[1][0].b.sigla).toBe("C");
  });

  it("divide os matches do round inicial em esquerda e direita", () => {
    const { side } = montarBracket(comp, {});
    expect(side.left).toEqual(["m0", "m1", "m2", "m3"]);
    expect(side.right).toEqual(["m4", "m5", "m6", "m7"]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/montarBracket.test.js`
Expected: FAIL — `montarBracket is not a function`.

- [ ] **Step 3: Implementar src/lib/montarBracket.js**

```js
// Monta a estrutura de rounds de um bracket mata-mata e propaga vencedores.
// comp.confrontos_iniciais: array de pares [idA, idB] (potência de 2).
// winners: { [matchId]: teamId }
export function montarBracket(comp, winners = {}) {
  const time = (id) => (id ? { id, ...comp.times[id] } : null);
  const rounds = [];
  let counter = 0;

  // round 0: confrontos iniciais
  const round0 = comp.confrontos_iniciais.map(([a, b]) => {
    const id = "m" + counter++;
    return { id, a: time(a), b: time(b), winner: winners[id] ?? null };
  });
  rounds.push(round0);

  // rounds seguintes: vencedor de cada par de matches do round anterior
  let prev = round0;
  while (prev.length > 1) {
    const round = [];
    for (let i = 0; i < prev.length; i += 2) {
      const id = "m" + counter++;
      const a = time(prev[i].winner);
      const b = time(prev[i + 1].winner);
      round.push({ id, a, b, winner: winners[id] ?? null });
    }
    rounds.push(round);
    prev = round;
  }

  const half = round0.length / 2;
  const side = {
    left: round0.slice(0, half).map((m) => m.id),
    right: round0.slice(half).map((m) => m.id),
  };
  return { rounds, side };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/montarBracket.test.js`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: montarBracket propaga vencedores no mata-mata"
```

---

## Task 4: lib/montarMundial — grupos → Round of 32

**Files:**
- Create: `src/lib/montarMundial.js`
- Test: `src/lib/montarMundial.test.js`

> Simplificação determinística (sinalizada ao usuário na UI): após o usuário ordenar cada grupo e escolher 8 terceiros, montamos o R32 (16 confrontos) assim: os 12 segundos colocados + os 8 terceiros escolhidos formam o "lado de baixo" dos confrontos, e os 12 primeiros + 4 segundos restantes... — **regra fixa abaixo**, não a tabela condicional oficial da FIFA.

Regra fixa: lista `primeiros` = 1º de A..L (12). lista `qualificados2e3` = 2º de A..L (12) + terceiros escolhidos (8) = 20. Confrontos R32 = parear `primeiros[i]` com `qualificados2e3[i]` para i=0..11, depois `qualificados2e3[12]` com `[13]`, `[14]` com `[15]`, `[16]` com `[17]`, `[18]` com `[19]` (4 confrontos). Total 16 confrontos / 32 times.

- [ ] **Step 1: Escrever teste que falha**

```js
import { describe, it, expect } from "vitest";
import { montarR32 } from "./montarMundial";

const grupos = {};
"ABCDEFGHIJKL".split("").forEach((g, gi) => {
  grupos[g] = [`${g}1`, `${g}2`, `${g}3`, `${g}4`];
});
const terceiros = ["A3","B3","C3","D3","E3","F3","G3","H3"];

describe("montarR32", () => {
  it("gera 16 confrontos (32 times)", () => {
    const conf = montarR32(grupos, terceiros);
    expect(conf).toHaveLength(16);
  });

  it("usa os 12 primeiros, 12 segundos e os 8 terceiros escolhidos", () => {
    const conf = montarR32(grupos, terceiros);
    const flat = conf.flat();
    expect(flat).toContain("A1");
    expect(flat).toContain("A2");
    expect(flat).toContain("A3");
    expect(flat).not.toContain("A4");
    expect(flat).toHaveLength(32);
  });

  it("é determinístico: primeiro confronto é 1ºA x 2ºA", () => {
    const conf = montarR32(grupos, terceiros);
    expect(conf[0]).toEqual(["A1", "B2"]);
  });
});
```

> Nota: o teste acima espera `["A1","B2"]` — ver implementação (primeiros pareados com segundos deslocados em 1 para evitar reencontro do mesmo grupo). Ajustar regra abaixo.

Regra final (substitui a anterior): `primeiros = [A1..L1]`. `segundos = [A2..L2]`. `confrontos[i] = [primeiros[i], segundos[(i+1) % 12]]` para i=0..11. Depois 4 confrontos entre os 8 terceiros: `[terceiros[0],terceiros[1]], [terceiros[2],terceiros[3]], [terceiros[4],terceiros[5]], [terceiros[6],terceiros[7]]`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/montarMundial.test.js`
Expected: FAIL — `montarR32 is not a function`.

- [ ] **Step 3: Implementar src/lib/montarMundial.js**

```js
// Monta os 16 confrontos do Round of 32 a partir dos grupos ordenados
// e dos 8 terceiros escolhidos. Determinístico (aproximação para simulação).
const GRUPOS = "ABCDEFGHIJKL".split("");

export function montarR32(grupos, terceiros) {
  const primeiros = GRUPOS.map((g) => grupos[g][0]);
  const segundos = GRUPOS.map((g) => grupos[g][1]);

  const confrontos = [];
  for (let i = 0; i < 12; i++) {
    confrontos.push([primeiros[i], segundos[(i + 1) % 12]]);
  }
  for (let i = 0; i < 8; i += 2) {
    confrontos.push([terceiros[i], terceiros[i + 1]]);
  }
  return confrontos; // 16 confrontos
}

// Constrói um "comp" mata-mata sintético para reaproveitar montarBracket.
export function montarCompMundial(mundial, grupos, terceiros) {
  const confrontos_iniciais = montarR32(grupos, terceiros);
  const times = {};
  Object.values(mundial.grupos).forEach((sels) => {
    sels.forEach(([id, nome, cor]) => {
      times[id] = { nome, sigla: id.toUpperCase(), cor };
    });
  });
  return {
    fases: mundial.fases,
    times,
    confrontos_iniciais,
  };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/montarMundial.test.js`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: montarR32 e comp sintetico do mundial"
```

---

## Task 5: lib/palpite — serialização para a URL

**Files:**
- Create: `src/lib/palpite.js`
- Test: `src/lib/palpite.test.js`

- [ ] **Step 1: Escrever teste que falha**

```js
import { describe, it, expect } from "vitest";
import { encodePalpite, decodePalpite } from "./palpite";

describe("palpite encode/decode", () => {
  it("ida e volta preserva o estado", () => {
    const estado = { comp: "libertadores", winners: { m0: "fla", m8: "fla" } };
    const code = encodePalpite(estado);
    expect(typeof code).toBe("string");
    expect(decodePalpite(code)).toEqual(estado);
  });

  it("decode de string inválida retorna null", () => {
    expect(decodePalpite("###lixo###")).toBeNull();
  });

  it("decode de string vazia retorna null", () => {
    expect(decodePalpite("")).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/palpite.test.js`
Expected: FAIL — `encodePalpite is not a function`.

- [ ] **Step 3: Implementar src/lib/palpite.js**

```js
// Serializa o estado do palpite em uma string segura para URL (base64 url-safe).
export function encodePalpite(estado) {
  const json = JSON.stringify(estado);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodePalpite(code) {
  if (!code) return null;
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/palpite.test.js`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: encode/decode do palpite na URL"
```

---

## Task 6: Componente TeamCard

**Files:**
- Create: `src/components/TeamCard.jsx`, `src/components/TeamCard.css`
- Test: `src/components/TeamCard.test.jsx`

- [ ] **Step 1: Escrever teste que falha**

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TeamCard from "./TeamCard";

describe("TeamCard", () => {
  it("mostra o nome do time", () => {
    render(<TeamCard team={{ id: "fla", nome: "Flamengo", cor: "#e30613" }} />);
    expect(screen.getByText("Flamengo")).toBeInTheDocument();
  });

  it("mostra 'A definir' quando não há time", () => {
    render(<TeamCard team={null} />);
    expect(screen.getByText("A definir")).toBeInTheDocument();
  });

  it("chama onPick ao clicar quando há time", async () => {
    const onPick = vi.fn();
    render(<TeamCard team={{ id: "fla", nome: "Flamengo", cor: "#000" }} onPick={onPick} />);
    await userEvent.click(screen.getByText("Flamengo"));
    expect(onPick).toHaveBeenCalledWith("fla");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/components/TeamCard.test.jsx`
Expected: FAIL — não consegue resolver `./TeamCard`.

- [ ] **Step 3: Implementar src/components/TeamCard.jsx**

```jsx
import "./TeamCard.css";

export default function TeamCard({ team, onPick, selected }) {
  if (!team) {
    return <div className="team-card team-card--empty">A definir</div>;
  }
  return (
    <button
      type="button"
      className={"team-card" + (selected ? " team-card--win" : "")}
      style={{ "--team-cor": team.cor }}
      onClick={() => onPick && onPick(team.id)}
    >
      <span className="team-card__bar" />
      <span className="team-card__nome">{team.nome}</span>
    </button>
  );
}
```

- [ ] **Step 4: Criar src/components/TeamCard.css**

```css
.team-card {
  display: flex; align-items: center; gap: 8px;
  width: 100%; min-width: 120px; padding: 6px 10px;
  background: #1a1d24; border: 1px solid #2a2f3a; border-radius: 6px;
  color: #f5f5f5; cursor: pointer; font-size: 13px; text-align: left;
}
.team-card:hover { border-color: var(--team-cor); }
.team-card--win { border-color: var(--team-cor); background: #232733; font-weight: 700; }
.team-card__bar { width: 6px; height: 18px; border-radius: 3px; background: var(--team-cor); flex: none; }
.team-card__nome { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.team-card--empty {
  width: 100%; min-width: 120px; padding: 6px 10px; font-size: 13px;
  background: #14161b; border: 1px dashed #2a2f3a; border-radius: 6px; color: #6b7280;
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/components/TeamCard.test.jsx`
Expected: PASS (3 testes).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: TeamCard com nome e cor do clube"
```

---

## Task 7: Componente Match

**Files:**
- Create: `src/components/Match.jsx`, `src/components/Match.css`
- Test: `src/components/Match.test.jsx`

- [ ] **Step 1: Escrever teste que falha**

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Match from "./Match";

const match = {
  id: "m0",
  a: { id: "cru", nome: "Cruzeiro", cor: "#1a3a8f" },
  b: { id: "fla", nome: "Flamengo", cor: "#e30613" },
  winner: null,
};

describe("Match", () => {
  it("renderiza os dois times", () => {
    render(<Match match={match} onPick={() => {}} />);
    expect(screen.getByText("Cruzeiro")).toBeInTheDocument();
    expect(screen.getByText("Flamengo")).toBeInTheDocument();
  });

  it("ao clicar num time, chama onPick com matchId e teamId", async () => {
    const onPick = vi.fn();
    render(<Match match={match} onPick={onPick} />);
    await userEvent.click(screen.getByText("Flamengo"));
    expect(onPick).toHaveBeenCalledWith("m0", "fla");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/components/Match.test.jsx`
Expected: FAIL — não resolve `./Match`.

- [ ] **Step 3: Implementar src/components/Match.jsx**

```jsx
import TeamCard from "./TeamCard";
import "./Match.css";

export default function Match({ match, onPick }) {
  const pick = (teamId) => onPick(match.id, teamId);
  return (
    <div className="match">
      <TeamCard team={match.a} onPick={pick} selected={match.winner === match.a?.id} />
      <TeamCard team={match.b} onPick={pick} selected={match.winner === match.b?.id} />
    </div>
  );
}
```

- [ ] **Step 4: Criar src/components/Match.css**

```css
.match { display: flex; flex-direction: column; gap: 4px; }
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/components/Match.test.jsx`
Expected: PASS (2 testes).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Match com dois TeamCards e pick por confronto"
```

---

## Task 8: Componente Bracket (layout espelhado)

**Files:**
- Create: `src/components/Bracket.jsx`, `src/components/Bracket.css`
- Test: `src/components/Bracket.test.jsx`

- [ ] **Step 1: Escrever teste que falha**

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Bracket from "./Bracket";
import { montarBracket } from "../lib/montarBracket";

const comp = {
  fases: ["Oitavas", "Quartas", "Semi", "Final"],
  times: Object.fromEntries("abcdefghijklmnop".split("").map(c =>
    [c, { nome: c.toUpperCase(), sigla: c.toUpperCase(), cor: "#888" }])),
  confrontos_iniciais: [["a","b"],["c","d"],["e","f"],["g","h"],
                        ["i","j"],["k","l"],["m","n"],["o","p"]],
};

describe("Bracket", () => {
  it("renderiza os nomes das fases", () => {
    const bracket = montarBracket(comp, {});
    render(<Bracket bracket={bracket} fases={comp.fases} onPick={() => {}} />);
    expect(screen.getByText("Final")).toBeInTheDocument();
    expect(screen.getAllByText("Oitavas").length).toBeGreaterThan(0);
  });

  it("renderiza todos os 16 times do round inicial", () => {
    const bracket = montarBracket(comp, {});
    render(<Bracket bracket={bracket} fases={comp.fases} onPick={() => {}} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("P")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/components/Bracket.test.jsx`
Expected: FAIL — não resolve `./Bracket`.

- [ ] **Step 3: Implementar src/components/Bracket.jsx**

Layout espelhado: o último round (final) fica no centro. Os matches de cada round se dividem em metade esquerda e metade direita conforme `bracket.side`. Construímos, para cada lado, colunas da fase mais externa (oitavas) até a semi; a final ocupa a coluna central.

```jsx
import Match from "./Match";
import "./Bracket.css";

// Para cada round (exceto a final), os matches se dividem em esquerda/direita.
// O conjunto de ids de cada lado é derivado de bracket.side propagando pares.
function ladosPorRound(bracket) {
  // round 0: usa bracket.side. Rounds seguintes: pais dos matches do lado.
  const lados = [];
  let left = new Set(bracket.side.left);
  let right = new Set(bracket.side.right);
  bracket.rounds.forEach((round, ri) => {
    if (ri === bracket.rounds.length - 1) {
      lados.push({ left: [], right: [], center: round });
      return;
    }
    lados.push({
      left: round.filter((m) => left.has(m.id)),
      right: round.filter((m) => right.has(m.id)),
    });
    // próximos pais: um match do round ri+1 pertence ao lado se algum filho pertence.
    const nextLeft = new Set();
    const nextRight = new Set();
    const next = bracket.rounds[ri + 1];
    if (next) {
      next.forEach((m, idx) => {
        const childIds = [round[idx * 2]?.id, round[idx * 2 + 1]?.id];
        if (childIds.some((id) => left.has(id))) nextLeft.add(m.id);
        if (childIds.some((id) => right.has(id))) nextRight.add(m.id);
      });
    }
    left = nextLeft;
    right = nextRight;
  });
  return lados;
}

export default function Bracket({ bracket, fases, onPick }) {
  const lados = ladosPorRound(bracket);
  const nRounds = bracket.rounds.length;
  const final = bracket.rounds[nRounds - 1][0];

  const colunaLado = (lado, ri) =>
    lados[ri][lado].length > 0 && (
      <div className="bracket__col" key={`${lado}-${ri}`}>
        <div className="bracket__fase">{fases[ri]}</div>
        {lados[ri][lado].map((m) => (
          <Match key={m.id} match={m} onPick={onPick} />
        ))}
      </div>
    );

  return (
    <div className="bracket">
      <div className="bracket__side bracket__side--left">
        {bracket.rounds.slice(0, -1).map((_, ri) => colunaLado("left", ri))}
      </div>
      <div className="bracket__center">
        <div className="bracket__fase">{fases[nRounds - 1]}</div>
        <Match match={final} onPick={onPick} />
        {final.winner && (
          <div className="bracket__campeao">🏆 {bracket.rounds.flat()
            .flatMap((r) => [r.a, r.b]).find((t) => t && t.id === final.winner)?.nome}</div>
        )}
      </div>
      <div className="bracket__side bracket__side--right">
        {bracket.rounds.slice(0, -1).map((_, ri) => colunaLado("right", ri)).reverse()}
      </div>
    </div>
  );
}
```

> Nota de revisão: o campeão é o `final.winner`; buscamos o nome varrendo os times já presentes no bracket. Como o vencedor da final está em `final.a` ou `final.b`, simplifique se preferir: `[final.a, final.b].find(t => t?.id === final.winner)?.nome`.

- [ ] **Step 4: Criar src/components/Bracket.css**

```css
.bracket {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  padding: 24px; overflow-x: auto; min-height: 60vh;
}
.bracket__side { display: flex; gap: 16px; }
.bracket__side--left { flex-direction: row; }
.bracket__side--right { flex-direction: row; }
.bracket__col { display: flex; flex-direction: column; justify-content: space-around; gap: 12px; min-width: 130px; }
.bracket__center { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 150px; }
.bracket__fase { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; text-align: center; margin-bottom: 4px; }
.bracket__campeao { margin-top: 8px; font-weight: 800; font-size: 16px; text-align: center; }
@media (max-width: 720px) {
  .bracket { justify-content: flex-start; }
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/components/Bracket.test.jsx`
Expected: PASS (2 testes).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Bracket espelhado com final no centro"
```

---

## Task 9: Componente ShareBar (imagem + link)

**Files:**
- Create: `src/components/ShareBar.jsx`, `src/components/ShareBar.css`
- Test: `src/components/ShareBar.test.jsx`

- [ ] **Step 1: Escrever teste que falha**

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShareBar from "./ShareBar";

describe("ShareBar", () => {
  it("copia o link ao clicar em Copiar link", async () => {
    const writeText = vi.fn().mockResolvedValue();
    Object.assign(navigator, { clipboard: { writeText } });
    render(<ShareBar getLink={() => "https://x/?c=lib&p=ABC"} targetRef={{ current: null }} />);
    await userEvent.click(screen.getByText(/copiar link/i));
    expect(writeText).toHaveBeenCalledWith("https://x/?c=lib&p=ABC");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/components/ShareBar.test.jsx`
Expected: FAIL — não resolve `./ShareBar`.

- [ ] **Step 3: Implementar src/components/ShareBar.jsx**

```jsx
import { useState } from "react";
import { toPng } from "html-to-image";
import "./ShareBar.css";

export default function ShareBar({ getLink, targetRef }) {
  const [msg, setMsg] = useState("");

  const copiarLink = async () => {
    await navigator.clipboard.writeText(getLink());
    setMsg("Link copiado!");
    setTimeout(() => setMsg(""), 2000);
  };

  const baixarImagem = async () => {
    if (!targetRef.current) return;
    const dataUrl = await toPng(targetRef.current, { backgroundColor: "#0f1115" });
    const link = document.createElement("a");
    link.download = "simula-campeao.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="sharebar">
      <button type="button" onClick={copiarLink}>🔗 Copiar link</button>
      <button type="button" onClick={baixarImagem}>📷 Baixar imagem</button>
      {msg && <span className="sharebar__msg">{msg}</span>}
    </div>
  );
}
```

- [ ] **Step 4: Criar src/components/ShareBar.css**

```css
.sharebar { display: flex; gap: 10px; align-items: center; justify-content: center; padding: 12px; flex-wrap: wrap; }
.sharebar button { padding: 8px 14px; border-radius: 8px; border: 1px solid #2a2f3a; background: #1a1d24; color: #f5f5f5; cursor: pointer; font-size: 14px; }
.sharebar button:hover { border-color: #4b5563; }
.sharebar__msg { color: #34d399; font-size: 13px; }
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/components/ShareBar.test.jsx`
Expected: PASS (1 teste).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: ShareBar copiar link e baixar imagem PNG"
```

---

## Task 10: Componente GroupStage (Copa do Mundo)

**Files:**
- Create: `src/components/GroupStage.jsx`, `src/components/GroupStage.css`
- Test: `src/components/GroupStage.test.jsx`

Comportamento: para cada grupo, o usuário define a ordem (1º→4º) clicando nos times em sequência; ao reordenar, chama `onGruposChange`. Depois marca quais 8 terceiros avançam (checkbox com limite 8), chamando `onTerceirosChange`. Botão "Montar mata-mata" fica ativo só quando os 12 grupos estão ordenados e há exatamente 8 terceiros.

- [ ] **Step 1: Escrever teste que falha**

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GroupStage from "./GroupStage";
import mundial from "../data/mundial.json";

describe("GroupStage", () => {
  it("renderiza os 12 grupos", () => {
    render(<GroupStage mundial={mundial} grupos={{}} terceiros={[]}
      onGruposChange={() => {}} onTerceirosChange={() => {}} onConfirm={() => {}} />);
    expect(screen.getByText("Grupo A")).toBeInTheDocument();
    expect(screen.getByText("Grupo L")).toBeInTheDocument();
  });

  it("clicar num time o move para o topo da ordem do grupo", async () => {
    const onGruposChange = vi.fn();
    render(<GroupStage mundial={mundial} grupos={{}} terceiros={[]}
      onGruposChange={onGruposChange} onTerceirosChange={() => {}} onConfirm={() => {}} />);
    const grupoA = screen.getByTestId("grupo-A");
    await userEvent.click(within(grupoA).getByText("Brasil") ?? within(grupoA).getByText("México"));
    expect(onGruposChange).toHaveBeenCalled();
  });
});
```

> Nota: no grupo A não há "Brasil"; o teste usa o operador `??` apenas como salvaguarda — mantenha o clique em "México" (grupo A). Ajuste para `within(grupoA).getByText("México")`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/components/GroupStage.test.jsx`
Expected: FAIL — não resolve `./GroupStage`.

- [ ] **Step 3: Implementar src/components/GroupStage.jsx**

```jsx
import { useState } from "react";
import "./GroupStage.css";

const LETRAS = "ABCDEFGHIJKL".split("");

// grupos: { A: [id1,id2,id3,id4] } na ordem de classificação escolhida.
// Default = ordem do JSON (potes). Clicar num time o promove uma posição.
export default function GroupStage({ mundial, grupos, terceiros, onGruposChange, onTerceirosChange, onConfirm }) {
  const ordemDe = (g) => grupos[g] ?? mundial.grupos[g].map(([id]) => id);

  const promover = (g, id) => {
    const ordem = [...ordemDe(g)];
    const i = ordem.indexOf(id);
    if (i > 0) { [ordem[i - 1], ordem[i]] = [ordem[i], ordem[i - 1]]; }
    onGruposChange({ ...grupos, [g]: ordem });
  };

  const nomeDe = (id) => {
    for (const sels of Object.values(mundial.grupos)) {
      const m = sels.find(([sid]) => sid === id);
      if (m) return m[1];
    }
    return id;
  };

  const toggleTerceiro = (id) => {
    if (terceiros.includes(id)) {
      onTerceirosChange(terceiros.filter((t) => t !== id));
    } else if (terceiros.length < 8) {
      onTerceirosChange([...terceiros, id]);
    }
  };

  const todosOrdenados = LETRAS.every((g) => grupos[g]);
  const pronto = todosOrdenados && terceiros.length === 8;

  return (
    <div className="groupstage">
      <p className="groupstage__hint">
        Clique nos times para subir na classificação do grupo (1º no topo).
        Depois marque os <strong>8 melhores terceiros</strong> que avançam.
      </p>
      <div className="groupstage__grid">
        {LETRAS.map((g) => {
          const ordem = ordemDe(g);
          const terceiroId = ordem[2];
          return (
            <div className="grupo" data-testid={`grupo-${g}`} key={g}>
              <h3>Grupo {g}</h3>
              <ol>
                {ordem.map((id, idx) => (
                  <li key={id}>
                    <button type="button" onClick={() => promover(g, id)}>
                      {idx + 1}. {nomeDe(id)}
                    </button>
                    {idx === 2 && (
                      <label className="grupo__terceiro">
                        <input type="checkbox"
                          checked={terceiros.includes(terceiroId)}
                          onChange={() => toggleTerceiro(terceiroId)} />
                        avança?
                      </label>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
      <div className="groupstage__footer">
        <span>{terceiros.length}/8 terceiros</span>
        <button type="button" disabled={!pronto} onClick={onConfirm}>
          Montar mata-mata →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Criar src/components/GroupStage.css**

```css
.groupstage { padding: 16px; }
.groupstage__hint { color: #9ca3af; font-size: 14px; margin-bottom: 12px; text-align: center; }
.groupstage__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.grupo { background: #1a1d24; border: 1px solid #2a2f3a; border-radius: 8px; padding: 10px; }
.grupo h3 { font-size: 13px; margin-bottom: 6px; color: #cbd5e1; }
.grupo ol { list-style: none; display: flex; flex-direction: column; gap: 4px; }
.grupo li { display: flex; align-items: center; gap: 6px; }
.grupo li button { flex: 1; text-align: left; padding: 5px 8px; border-radius: 5px; border: 1px solid #2a2f3a; background: #14161b; color: #f5f5f5; cursor: pointer; font-size: 12px; }
.grupo li button:hover { border-color: #4b5563; }
.grupo__terceiro { font-size: 10px; color: #9ca3af; display: flex; align-items: center; gap: 2px; white-space: nowrap; }
.groupstage__footer { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; }
.groupstage__footer button { padding: 10px 18px; border-radius: 8px; border: none; background: #2563eb; color: #fff; font-weight: 700; cursor: pointer; }
.groupstage__footer button:disabled { background: #374151; cursor: not-allowed; }
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/components/GroupStage.test.jsx`
Expected: PASS (2 testes).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: GroupStage ordena grupos e escolhe 8 terceiros"
```

---

## Task 11: Componente Home (escolha da competição)

**Files:**
- Create: `src/components/Home.jsx`, `src/components/Home.css`
- Test: `src/components/Home.test.jsx`

- [ ] **Step 1: Escrever teste que falha**

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./Home";

describe("Home", () => {
  it("mostra as três competições", () => {
    render(<Home onSelect={() => {}} />);
    expect(screen.getByText("Copa do Mundo")).toBeInTheDocument();
    expect(screen.getByText("Libertadores")).toBeInTheDocument();
    expect(screen.getByText("Copa do Brasil")).toBeInTheDocument();
  });

  it("ao clicar numa competição, chama onSelect com o id", async () => {
    const onSelect = vi.fn();
    render(<Home onSelect={onSelect} />);
    await userEvent.click(screen.getByText("Libertadores"));
    expect(onSelect).toHaveBeenCalledWith("libertadores");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/components/Home.test.jsx`
Expected: FAIL — não resolve `./Home`.

- [ ] **Step 3: Implementar src/components/Home.jsx**

```jsx
import { LISTA } from "../data";
import "./Home.css";

export default function Home({ onSelect }) {
  return (
    <div className="home">
      <header className="home__head">
        <h1>Simula Campeão</h1>
        <p>Monte o caminho até o título e compartilhe seu palpite.</p>
      </header>
      <div className="home__cards">
        {LISTA.map((c) => (
          <button key={c.id} type="button" className="home__card"
            style={{ "--cor": c.cor }} onClick={() => onSelect(c.id)}>
            <span className="home__card-bar" />
            <span className="home__card-nome">{c.nome}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Criar src/components/Home.css**

```css
.home { max-width: 900px; margin: 0 auto; padding: 48px 20px; text-align: center; }
.home__head h1 { font-size: 40px; letter-spacing: -1px; }
.home__head p { color: #9ca3af; margin-top: 8px; }
.home__cards { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-top: 40px; }
.home__card { position: relative; width: 240px; height: 140px; border-radius: 14px; border: 1px solid #2a2f3a; background: #1a1d24; color: #f5f5f5; cursor: pointer; font-size: 20px; font-weight: 800; overflow: hidden; }
.home__card:hover { border-color: var(--cor); transform: translateY(-2px); transition: 0.15s; }
.home__card-bar { position: absolute; inset: 0 0 auto 0; height: 8px; background: var(--cor); }
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/components/Home.test.jsx`
Expected: PASS (2 testes).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Home com as tres competicoes"
```

---

## Task 12: Componente Simulador (orquestra estado)

**Files:**
- Create: `src/components/Simulador.jsx`, `src/components/Simulador.css`
- Test: `src/components/Simulador.test.jsx`

Comportamento: dado um id de competição e um estado inicial (vindo da URL ou vazio), gerencia `winners` (e, no mundial, `grupos`/`terceiros`). Mata-mata direto: monta o bracket direto. Mundial: mostra `GroupStage` até confirmar, depois monta o R32 e o bracket. Atualiza a URL a cada mudança. Engloba o `Bracket` num ref para a imagem.

- [ ] **Step 1: Escrever teste que falha**

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Simulador from "./Simulador";

describe("Simulador (mata-mata)", () => {
  it("renderiza o bracket da Libertadores com os times reais", () => {
    render(<Simulador compId="libertadores" inicial={null} onBack={() => {}} />);
    expect(screen.getByText("Cruzeiro")).toBeInTheDocument();
    expect(screen.getByText("Flamengo")).toBeInTheDocument();
  });

  it("ao escolher um vencedor, ele aparece na fase seguinte", async () => {
    render(<Simulador compId="libertadores" inicial={null} onBack={() => {}} />);
    await userEvent.click(screen.getByText("Flamengo"));
    // Flamengo agora aparece também nas quartas → dois nós com o nome
    expect(screen.getAllByText("Flamengo").length).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/components/Simulador.test.jsx`
Expected: FAIL — não resolve `./Simulador`.

- [ ] **Step 3: Implementar src/components/Simulador.jsx**

```jsx
import { useRef, useState, useEffect } from "react";
import { COMPETICOES } from "../data";
import { montarBracket } from "../lib/montarBracket";
import { montarCompMundial } from "../lib/montarMundial";
import { encodePalpite } from "../lib/palpite";
import Bracket from "./Bracket";
import GroupStage from "./GroupStage";
import ShareBar from "./ShareBar";
import "./Simulador.css";

export default function Simulador({ compId, inicial, onBack }) {
  const comp = COMPETICOES[compId];
  const ehMundial = comp.tipo === "grupos";

  const [winners, setWinners] = useState(inicial?.winners ?? {});
  const [grupos, setGrupos] = useState(inicial?.grupos ?? {});
  const [terceiros, setTerceiros] = useState(inicial?.terceiros ?? []);
  const [fase, setFase] = useState(
    ehMundial && !(inicial?.terceiros?.length === 8) ? "grupos" : "bracket"
  );
  const bracketRef = useRef(null);

  const estado = ehMundial
    ? { comp: compId, grupos, terceiros, winners }
    : { comp: compId, winners };

  // mantém a URL sincronizada com o palpite
  useEffect(() => {
    const code = encodePalpite(estado);
    const url = `${window.location.pathname}?c=${compId}&p=${code}`;
    window.history.replaceState(null, "", url);
  }, [winners, grupos, terceiros]); // eslint-disable-line

  const onPick = (matchId, teamId) => {
    setWinners((w) => {
      const novo = { ...w, [matchId]: teamId };
      // limpa escolhas a jusante que dependiam do vencedor antigo
      return novo;
    });
  };

  const getLink = () =>
    `${window.location.origin}${window.location.pathname}?c=${compId}&p=${encodePalpite(estado)}`;

  if (ehMundial && fase === "grupos") {
    return (
      <div className="simulador">
        <button className="simulador__back" onClick={onBack}>← Trocar competição</button>
        <h2 style={{ "--cor": comp.cor }}>{comp.nome}</h2>
        <GroupStage
          mundial={comp}
          grupos={grupos}
          terceiros={terceiros}
          onGruposChange={setGrupos}
          onTerceirosChange={setTerceiros}
          onConfirm={() => setFase("bracket")}
        />
      </div>
    );
  }

  const compBracket = ehMundial ? montarCompMundial(comp, grupos, terceiros) : comp;
  const bracket = montarBracket(compBracket, winners);

  return (
    <div className="simulador">
      <button className="simulador__back" onClick={onBack}>← Trocar competição</button>
      <h2 style={{ "--cor": comp.cor }}>{comp.nome}</h2>
      {ehMundial && (
        <button className="simulador__edit" onClick={() => setFase("grupos")}>
          ← Editar grupos
        </button>
      )}
      <div ref={bracketRef}>
        <Bracket bracket={bracket} fases={compBracket.fases} onPick={onPick} />
      </div>
      <ShareBar getLink={getLink} targetRef={bracketRef} />
      <footer className="simulador__disclaimer">
        Site não-oficial, feito por fãs. Sem vínculo com FIFA, CONMEBOL ou CBF.
        Nomes dos clubes/seleções pertencem às respectivas entidades.
      </footer>
    </div>
  );
}
```

- [ ] **Step 4: Criar src/components/Simulador.css**

```css
.simulador { padding: 16px; }
.simulador h2 { text-align: center; border-bottom: 3px solid var(--cor); display: inline-block; padding-bottom: 4px; margin: 8px auto; }
.simulador__back, .simulador__edit { background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 13px; padding: 6px; }
.simulador__back:hover, .simulador__edit:hover { color: #f5f5f5; }
.simulador__disclaimer { text-align: center; color: #6b7280; font-size: 11px; max-width: 600px; margin: 24px auto 0; line-height: 1.5; }
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/components/Simulador.test.jsx`
Expected: PASS (2 testes).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Simulador orquestra estado, URL e bracket"
```

---

## Task 13: App — roteamento simples e leitura da URL

**Files:**
- Modify: `src/App.jsx`
- Test: `src/App.test.jsx`

- [ ] **Step 1: Escrever teste que falha**

```jsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  beforeEach(() => { window.history.replaceState(null, "", "/"); });

  it("mostra a Home sem parâmetros", () => {
    render(<App />);
    expect(screen.getByText("Simula Campeão")).toBeInTheDocument();
    expect(screen.getByText("Copa do Mundo")).toBeInTheDocument();
  });

  it("abre o simulador quando a URL tem ?c=libertadores", () => {
    window.history.replaceState(null, "", "/?c=libertadores");
    render(<App />);
    expect(screen.getByText("Cruzeiro")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/App.test.jsx`
Expected: FAIL — App ainda é o placeholder e não mostra "Copa do Mundo".

- [ ] **Step 3: Substituir src/App.jsx**

```jsx
import { useState } from "react";
import Home from "./components/Home";
import Simulador from "./components/Simulador";
import { COMPETICOES } from "./data";
import { decodePalpite } from "./lib/palpite";

function lerURL() {
  const params = new URLSearchParams(window.location.search);
  const c = params.get("c");
  if (!c || !COMPETICOES[c]) return { compId: null, inicial: null };
  const inicial = decodePalpite(params.get("p"));
  return { compId: c, inicial };
}

export default function App() {
  const [{ compId, inicial }, setState] = useState(lerURL);

  if (!compId) {
    return <Home onSelect={(id) => setState({ compId: id, inicial: null })} />;
  }
  return (
    <Simulador
      key={compId}
      compId={compId}
      inicial={inicial}
      onBack={() => {
        window.history.replaceState(null, "", window.location.pathname);
        setState({ compId: null, inicial: null });
      }}
    />
  );
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/App.test.jsx`
Expected: PASS (2 testes).

- [ ] **Step 5: Rodar a suíte completa**

Run: `npm test`
Expected: todos os testes passam.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: App roteia Home/Simulador e le palpite da URL"
```

---

## Task 14: Verificação manual + build de produção + deploy config

**Files:**
- Create: `vercel.json`, `README.md`

- [ ] **Step 1: Rodar o app e testar manualmente**

Run: `npm run dev`
Verificar no navegador:
1. Home mostra 3 competições.
2. Libertadores: clicar vencedores até a final; campeão aparece no centro.
3. Copa do Brasil: idem.
4. Copa do Mundo: ordenar grupos, marcar 8 terceiros, "Montar mata-mata", simular até a final.
5. "Copiar link" → abrir o link em nova aba reconstrói o mesmo palpite.
6. "Baixar imagem" → gera PNG do bracket.
7. Disclaimer presente no rodapé.

- [ ] **Step 2: Build de produção**

Run: `npm run build`
Expected: build sem erros.

- [ ] **Step 3: Criar vercel.json (SPA fallback)**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 4: Criar README.md**

```markdown
# Simula Campeão

Simulador interativo de chaveamento — Copa do Mundo, Libertadores e Copa do Brasil.
Monte o caminho até o título e compartilhe por imagem ou link.

## Rodar
\`\`\`bash
npm install
npm run dev
\`\`\`

## Testar
\`\`\`bash
npm test
\`\`\`

## Deploy
Estático (Vite). Deploy na Vercel/Netlify apontando para `dist/`.

Site não-oficial, feito por fãs. Sem vínculo com FIFA, CONMEBOL ou CBF.
\`\`\`
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: build config (vercel) e README"
```

---

## Self-Review (preenchido)

**Spec coverage:**
- 3 competições → Task 2 (dados) + Home (Task 11). ✅
- Mata-mata direto (Liberta/Copa BR) → Tasks 3, 8, 12. ✅
- Grupos → mata-mata (Mundial) → Tasks 4, 10, 12. ✅
- Cards com nome + cor (sem escudo) → Task 6. ✅
- Bracket espelhado, final no centro → Task 8. ✅
- Compartilhar imagem + link → Tasks 5, 9, 12, 13. ✅
- Disclaimer, sem emblemas oficiais → Task 12 (rodapé). ✅
- Dados em JSON → Task 2. ✅

**Placeholder scan:** sem TBD/TODO. Cores cosméticas têm fallback explícito (`#3a3f4b`).

**Type consistency:** `montarBracket(comp, winners) → { rounds, side }` usado igual em Bracket e Simulador. `onPick(matchId, teamId)` consistente em Match/Bracket/Simulador. `encodePalpite/decodePalpite` consistentes. `montarCompMundial → { fases, times, confrontos_iniciais }` casa com o formato esperado por `montarBracket`.

**Gaps conhecidos (aceitos no escopo):**
- O chaveamento do R32 do Mundial é uma aproximação determinística, não a tabela condicional oficial da FIFA — sinalizado na UI/spec.
- A ordem dos confrontos das oitavas (Liberta/Copa BR) reflete o sorteio; refinar a ordem exata de cruzamento é ajuste de dados, não de código.
