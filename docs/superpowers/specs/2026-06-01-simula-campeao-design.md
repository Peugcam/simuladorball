# Simula Campeão — Documento de Design

**Data:** 2026-06-01
**Status:** Aprovado para planejamento

## Visão geral

Site onde o usuário monta, de forma interativa, o caminho de um time até o título
em três competições de futebol, clicando para escolher quem avança em cada
confronto. Ao final, gera uma imagem e um link para compartilhar nas redes.

Inspirado no simulador do ge.globo (Copa do Mundo), mas com identidade própria
para não configurar plágio nem violar marcas de terceiros.

## Decisões fechadas

| Tema | Decisão |
|---|---|
| Competições | Copa do Mundo, Libertadores, Copa do Brasil |
| Interação | Simular individual + compartilhar (imagem e link) |
| Stack | Vite + React, 100% client-side (sem backend) |
| Copa do Mundo | Simula desde a fase de grupos |
| Liberta / Copa do BR | Mata-mata direto (16 times, oitavas → final) |
| Identidade dos times | Nome + cor do clube no card (sem escudo/imagem) |
| Layout | Chaveamento espelhado: esquerda e direita convergindo para a final no centro |
| Nome do site | Simula Campeão |
| Dados | Arquivos JSON por competição |

## Competições e estrutura de dados

Cada competição é um arquivo JSON em `src/data/`. Separar dados de código
permite atualizar confrontos (quando sair um resultado real) ou adicionar uma
competição nova sem mexer no componente de bracket.

### Dois formatos de chave

1. **Mata-mata direto** — Libertadores e Copa do Brasil.
   16 times já sorteados: oitavas → quartas → semi → final.
   Dados reais (sorteios de 26/05 e 29/05/2026).

2. **Grupos → mata-mata** — Copa do Mundo 2026 (48 times, 12 grupos).
   Fluxo:
   - O usuário define a classificação final (1º/2º/3º) de cada um dos 12 grupos.
   - O usuário marca quais **8 melhores terceiros** avançam (limite de 8).
   - O sistema monta o **Round of 32** posicionando os classificados conforme uma
     tabela de confrontos por posição (versão determinística simplificada do
     chaveamento oficial da FIFA).
   - Round of 32 → 16-avos → oitavas → quartas → semi → final.

### Esquema do JSON (esboço)

```json
{
  "id": "libertadores",
  "nome": "Libertadores",
  "tipo": "mata-mata",            // ou "grupos"
  "cor": "#0a7d33",
  "times": [
    { "id": "fla", "nome": "Flamengo", "sigla": "FLA", "cor": "#e30613" }
  ],
  "confrontos": [
    { "fase": "oitavas", "casa": "cru", "fora": "fla" }
  ]
}
```

Para a Copa do Mundo, o JSON traz os 12 grupos (`grupos: [{ id, times[] }]`) e a
tabela de montagem do Round of 32.

## Layout do bracket

Chaveamento **espelhado**, como na referência:

```
ESQUERDA                  CENTRO                   DIREITA
oitavas  quartas  semi   [ FINAL ]   semi  quartas  oitavas
  ──┐                                              ┌──
    ├──┐                                        ┌──┤
  ──┘  ├──┐          ┌──────────┐          ┌──┤  └──
       │  ├───────►  │ CAMPEÃO  │  ◄───────┤  │
  ──┐  │  │          └──────────┘          │  │  ┌──
    ├──┘  │                                │  └──┤
  ──┘     │                                │     └──
```

- Metade dos confrontos sobe pela esquerda, metade pela direita.
- A final fica no centro; o campeão é destacado no meio.
- Responsivo: em telas pequenas, vira rolagem horizontal ou empilha verticalmente.

### Card do time (sem escudo)

```
┌──────────────┐
│ ▌ FLAMENGO   │   ← faixa lateral na cor do clube + nome/sigla
└──────────────┘
```

Clicar no card o marca como vencedor do confronto e o propaga para a fase
seguinte. Clicar de novo permite trocar a escolha.

## Componentes (React)

- `Home` — escolha da competição (3 cards).
- `Simulador` — orquestra o estado do palpite de uma competição.
- `Bracket` — desenha o chaveamento espelhado a partir dos dados + escolhas.
- `Match` — um confronto (dois cards + conector).
- `TeamCard` — nome + cor do clube; estados: normal / vencedor / vazio.
- `GroupStage` — (só Copa do Mundo) edição dos grupos e seleção dos 8 terceiros.
- `ShareBar` — botões de gerar imagem e copiar link.

## Estado e compartilhamento

- O palpite vive em estado React e é **serializado na URL** (query string
  compacta, ex.: `?c=libertadores&p=<código>`). Abrir o link reconstrói o palpite.
- **Imagem**: `html-to-image` captura o nó do `Bracket` e gera um PNG para download
  ou compartilhamento.
- Persistência local opcional via `localStorage` (retomar o último palpite).
- Sem backend, sem banco, sem custo de servidor.

## Identidade visual e mitigação de risco legal

- Tema **próprio** (não copiar o visual do ge): sugestão de dark mode com
  **cor-tema por competição** (Liberta vermelho, Copa do BR verde/amarelo,
  Mundo azul) e tipografia própria.
- **Não usar** emblema/logo oficial do torneio, troféu oficial, nem logos de
  FIFA/CONMEBOL/CBF. Ícone de taça/chave genérico e próprio.
- **Não usar escudos** — apenas nome + cor do clube (cor não é marca protegida
  na prática).
- **Disclaimer** no rodapé: "Site não-oficial, feito por fãs. Sem vínculo com
  FIFA, CONMEBOL ou CBF."
- Sem monetização sobre as marcas (sem anúncios colados, sem venda).

## Stack e estrutura de arquivos

```
simula-campeao/
  index.html
  package.json
  vite.config.js
  src/
    main.jsx
    App.jsx
    data/
      mundial.json
      libertadores.json
      copa-brasil.json
    components/
      Home.jsx
      Simulador.jsx
      Bracket.jsx
      Match.jsx
      TeamCard.jsx
      GroupStage.jsx
      ShareBar.jsx
    lib/
      encodePalpite.js     // serializa/deserializa o palpite na URL
      montarBracket.js     // monta confrontos por fase a partir das escolhas
    styles/
  public/
  docs/superpowers/specs/
```

Deploy: Vercel ou Netlify (plano grátis, build estático).

## Fora de escopo (YAGNI)

- Login / contas de usuário.
- Ranking global ou enquete coletiva de palpites.
- Copa Sul-Americana (tem playoffs pendentes; adicionar depois só com novo JSON).
- Escudos/imagens dos times.
- Backend ou banco de dados.

## Critérios de sucesso (verificáveis)

1. Abrir o site → escolher uma competição → simular até o campeão, nas três.
2. Libertadores e Copa do Brasil exibem os 16 times reais já sorteados.
3. Copa do Mundo permite definir os grupos, escolher 8 terceiros e seguir até a final.
4. Bracket renderiza espelhado com a final no centro.
5. Gerar imagem PNG do chaveamento funciona.
6. Copiar o link e abri-lo em outra aba reconstrói o mesmo palpite.
7. Rodapé com disclaimer presente; nenhum emblema/troféu oficial usado.

## Dados a coletar na implementação

- Composição dos 12 grupos da Copa do Mundo 2026 (48 seleções).
- Os 8 confrontos completos das oitavas da Libertadores 2026.
- Os 8 confrontos completos das oitavas da Copa do Brasil 2026.
- Cor principal de cada clube/seleção.
