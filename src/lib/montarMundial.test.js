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

  it("é determinístico: primeiro confronto é 2ºA x 2ºB", () => {
    const conf = montarR32(grupos, terceiros);
    expect(conf[0]).toEqual(["A2", "B2"]);
  });
});
