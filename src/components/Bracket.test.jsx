import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Bracket from "./Bracket";
import { montarBracket } from "../lib/montarBracket";

const matchMediaPadrao = window.matchMedia;
function simularTela(matches) {
  window.matchMedia = (query) => ({
    matches, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  });
}
afterEach(() => { window.matchMedia = matchMediaPadrao; });

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

  it("no celular usa o layout vertical com as fases e os times", () => {
    simularTela(true);
    const bracket = montarBracket(comp, {});
    const { container } = render(
      <Bracket bracket={bracket} fases={comp.fases} onPick={() => {}} />
    );
    expect(container.querySelector(".bracket-mobile")).toBeInTheDocument();
    expect(container.querySelector(".bracket")).not.toBeInTheDocument();
    expect(screen.getByText("Final")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
