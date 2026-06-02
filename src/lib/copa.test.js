import { describe, it, expect } from "vitest";
import { alocarTerceiros, montarConfrontos, SLOTS_TERCEIRO } from "./copa";
import { montarBracket } from "./montarBracket";
import { GRUPOS, LETRAS, TIMES } from "../data/mundial";

// ordem padrão: cada grupo na ordem dos potes (A0=1º, A1=2º, A2=3º...)
const gruposPadrao = Object.fromEntries(
  LETRAS.map((g) => [g, GRUPOS[g].map((_, i) => `${g}${i}`)])
);

describe("alocarTerceiros", () => {
  it("aloca os 8 grupos a slots permitidos (bijeção)", () => {
    const escolhidos = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const mapa = alocarTerceiros(escolhidos);
    const slots = Object.keys(mapa).map(Number);
    expect(slots.length).toBe(8);
    // cada grupo cai num slot que o permite
    for (const [slotIdx, grupo] of Object.entries(mapa)) {
      const def = SLOTS_TERCEIRO.find((s) => s.match === Number(slotIdx));
      expect(def.allowed).toContain(grupo);
    }
    // bijeção: 8 grupos distintos
    expect(new Set(Object.values(mapa)).size).toBe(8);
  });

  it("resolve combinação forçada com K e L (cada um cabe em um único slot)", () => {
    const escolhidos = ["E", "H", "I", "J", "K", "L", "D", "C"];
    const mapa = alocarTerceiros(escolhidos);
    expect(Object.values(mapa)).toContain("K");
    expect(Object.values(mapa)).toContain("L");
    expect(new Set(Object.values(mapa)).size).toBe(8);
  });

  it("TODAS as 495 combinações de 8 grupos têm alocação válida", () => {
    const combinacoes = (arr, k) =>
      k === 0
        ? [[]]
        : arr.flatMap((v, i) => combinacoes(arr.slice(i + 1), k - 1).map((c) => [v, ...c]));
    const todas = combinacoes(LETRAS, 8);
    expect(todas.length).toBe(495);
    for (const combo of todas) {
      const mapa = alocarTerceiros(combo);
      // bijeção completa: 8 grupos atribuídos, todos os escolhidos cobertos
      expect(new Set(Object.values(mapa)).size).toBe(8);
      expect(new Set(Object.values(mapa))).toEqual(new Set(combo));
    }
  });
});

describe("montarConfrontos (R32 oficial)", () => {
  const terceiros8 = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const confrontos = montarConfrontos(gruposPadrao, terceiros8);

  it("gera 16 confrontos", () => {
    expect(confrontos).toHaveLength(16);
  });

  it("respeita um confronto de posição fixo: índice 2 = 2ºA vs 2ºB", () => {
    // M73 na ordem linearizada: segundo de A x segundo de B
    expect(confrontos[2]).toEqual(["A1", "B1"]);
  });

  it("o índice 3 é 1ºF vs 2ºC", () => {
    expect(confrontos[3]).toEqual(["F0", "C1"]);
  });

  it("monta bracket de 5 fases reusando montarBracket", () => {
    const comp = { fases: ["32 avos", "Oitavas", "Quartas", "Semi", "Final"], times: TIMES, confrontos_iniciais: confrontos };
    const { rounds } = montarBracket(comp, {});
    expect(rounds.map((r) => r.length)).toEqual([16, 8, 4, 2, 1]);
  });
});
