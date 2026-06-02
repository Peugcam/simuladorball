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
