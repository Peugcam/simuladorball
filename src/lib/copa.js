// Chaveamento OFICIAL do mata-mata da Copa do Mundo 2026 (não a aproximação genérica).
// Fonte: bracket oficial FIFA / Wikipedia "2026 FIFA World Cup knockout stage".
//
// Os 16 confrontos do Round of 32 estão em ordem LINEARIZADA: pares consecutivos
// (0,1)(2,3)... formam as oitavas corretas, e assim por diante até a final — o que
// permite reusar montarBracket/sanearWinners (propagação simples de pares).
//
// Cada lado é uma posição de grupo {pos:0=1º|1=2º, grupo} ou um terceiro {terceiro:true}.
export const R32_DEFS = [
  { a: { pos: 0, grupo: "E" }, b: { terceiro: true } }, // 0  M74: 1E x 3º
  { a: { pos: 0, grupo: "I" }, b: { terceiro: true } }, // 1  M77: 1I x 3º
  { a: { pos: 1, grupo: "A" }, b: { pos: 1, grupo: "B" } }, // 2  M73: 2A x 2B
  { a: { pos: 0, grupo: "F" }, b: { pos: 1, grupo: "C" } }, // 3  M75: 1F x 2C
  { a: { pos: 1, grupo: "K" }, b: { pos: 1, grupo: "L" } }, // 4  M83: 2K x 2L
  { a: { pos: 0, grupo: "H" }, b: { pos: 1, grupo: "J" } }, // 5  M84: 1H x 2J
  { a: { pos: 0, grupo: "D" }, b: { terceiro: true } }, // 6  M81: 1D x 3º
  { a: { pos: 0, grupo: "G" }, b: { terceiro: true } }, // 7  M82: 1G x 3º
  { a: { pos: 0, grupo: "C" }, b: { pos: 1, grupo: "F" } }, // 8  M76: 1C x 2F
  { a: { pos: 1, grupo: "E" }, b: { pos: 1, grupo: "I" } }, // 9  M78: 2E x 2I
  { a: { pos: 0, grupo: "A" }, b: { terceiro: true } }, // 10 M79: 1A x 3º
  { a: { pos: 0, grupo: "L" }, b: { terceiro: true } }, // 11 M80: 1L x 3º
  { a: { pos: 0, grupo: "J" }, b: { pos: 1, grupo: "H" } }, // 12 M86: 1J x 2H
  { a: { pos: 1, grupo: "D" }, b: { pos: 1, grupo: "G" } }, // 13 M88: 2D x 2G
  { a: { pos: 0, grupo: "B" }, b: { terceiro: true } }, // 14 M85: 1B x 3º
  { a: { pos: 0, grupo: "K" }, b: { terceiro: true } }, // 15 M87: 1K x 3º
];

// Slots que recebem um 3º colocado, com os grupos cujo 3º é permitido em cada um
// (evita reencontro de mesmo grupo). Determinístico por desenho da FIFA: como há
// C(12,8)=495 combinações e a tabela cobre todas, sempre existe alocação válida.
export const SLOTS_TERCEIRO = [
  { match: 0, allowed: ["A", "B", "C", "D", "F"] },
  { match: 1, allowed: ["C", "D", "F", "G", "H"] },
  { match: 6, allowed: ["B", "E", "F", "I", "J"] },
  { match: 7, allowed: ["A", "E", "H", "I", "J"] },
  { match: 10, allowed: ["C", "E", "F", "H", "I"] },
  { match: 11, allowed: ["E", "H", "I", "J", "K"] },
  { match: 14, allowed: ["E", "F", "G", "I", "J"] },
  { match: 15, allowed: ["D", "E", "I", "J", "L"] },
];

// Atribui os 8 grupos classificados (em 3º) a um slot permitido cada, via backtracking.
// Resolve primeiro os slots com menos opções para convergir rápido. Retorna { matchIdx: grupo }.
export function alocarTerceiros(gruposEscolhidos) {
  const restantes = new Set(gruposEscolhidos);
  const resultado = {};

  const resolver = (slots) => {
    if (slots.length === 0) return restantes.size === 0;
    // escolhe o slot mais restrito (menos candidatos disponíveis)
    const ordenados = [...slots].sort(
      (x, y) =>
        x.allowed.filter((g) => restantes.has(g)).length -
        y.allowed.filter((g) => restantes.has(g)).length
    );
    const slot = ordenados[0];
    const resto = slots.filter((s) => s !== slot);
    for (const g of slot.allowed) {
      if (!restantes.has(g)) continue;
      restantes.delete(g);
      resultado[slot.match] = g;
      if (resolver(resto)) return true;
      restantes.add(g);
      delete resultado[slot.match];
    }
    return false;
  };

  resolver(SLOTS_TERCEIRO);
  return resultado;
}

// Constrói os 16 confrontos do R32 como pares de ids de seleção (ex.: ["E0","C2"]).
// grupos: { A: ["A0","A1","A2","A3"] } na ordem de classificação escolhida.
// terceiros8: array com as 8 letras de grupo cujos 3ºs avançam.
export function montarConfrontos(grupos, terceiros8) {
  const mapaTerceiros = alocarTerceiros(terceiros8);
  const idDe = (lado, matchIdx) =>
    lado.terceiro ? grupos[mapaTerceiros[matchIdx]][2] : grupos[lado.grupo][lado.pos];

  return R32_DEFS.map((def, i) => [idDe(def.a, i), idDe(def.b, i)]);
}

export const FASES = ["32 avos", "Oitavas", "Quartas", "Semifinal", "Final"];
