import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TeamCard from "./TeamCard";

describe("TeamCard", () => {
  it("mostra o nome do time", () => {
    render(<TeamCard team={{ id: "fla", nome: "Flamengo", cor: "#e30613" }} />);
    expect(screen.getByText("Flamengo")).toBeInTheDocument();
  });

  it("mostra 'A definir' quando não há time", () => {
    render(<TeamCard team={null} />);
    expect(screen.getByText("A definir")).toBeInTheDocument();
  });

  it("chama onPick ao clicar quando há time", async () => {
    const onPick = vi.fn();
    render(<TeamCard team={{ id: "fla", nome: "Flamengo", cor: "#000" }} onPick={onPick} />);
    await userEvent.click(screen.getByText("Flamengo"));
    expect(onPick).toHaveBeenCalledWith("fla");
  });
});
