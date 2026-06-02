import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Match from "./Match";

const match = {
  id: "m0",
  a: { id: "cru", nome: "Cruzeiro", cor: "#1a3a8f" },
  b: { id: "fla", nome: "Flamengo", cor: "#e30613" },
  winner: null,
};

describe("Match", () => {
  it("renderiza os dois times", () => {
    render(<Match match={match} onPick={() => {}} />);
    expect(screen.getByText("Cruzeiro")).toBeInTheDocument();
    expect(screen.getByText("Flamengo")).toBeInTheDocument();
  });

  it("ao clicar num time, chama onPick com matchId e teamId", async () => {
    const onPick = vi.fn();
    render(<Match match={match} onPick={onPick} />);
    await userEvent.click(screen.getByText("Flamengo"));
    expect(onPick).toHaveBeenCalledWith("m0", "fla");
  });
});
