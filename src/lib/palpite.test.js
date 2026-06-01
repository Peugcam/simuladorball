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
