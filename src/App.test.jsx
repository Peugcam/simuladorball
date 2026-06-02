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
