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
