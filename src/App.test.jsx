import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App — Bolão da Copa 2026", () => {
  beforeEach(() => { window.history.replaceState(null, "", "/"); });

  it("abre na fase de grupos com os 12 grupos", () => {
    render(<App />);
    expect(screen.getByText("Bolão da Copa")).toBeInTheDocument();
    expect(screen.getByText("Grupo A")).toBeInTheDocument();
    expect(screen.getByText("Grupo L")).toBeInTheDocument();
    expect(screen.getByText("Brasil")).toBeInTheDocument();
  });

  it("navega até o mata-mata e mostra as fases do chaveamento", async () => {
    render(<App />);
    // vai direto pelo stepper (passo 3)
    await userEvent.click(screen.getByText("Mata-mata"));
    expect(screen.getByText("32 avos")).toBeInTheDocument();
    expect(screen.getByText("Final")).toBeInTheDocument();
    expect(screen.getByText("Oitavas")).toBeInTheDocument();
  });
});
