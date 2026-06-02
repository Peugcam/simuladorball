import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GroupStage from "./GroupStage";
import mundial from "../data/mundial.json";

describe("GroupStage", () => {
  it("renderiza os 12 grupos", () => {
    render(<GroupStage mundial={mundial} grupos={{}} terceiros={[]}
      onGruposChange={() => {}} onTerceirosChange={() => {}} onConfirm={() => {}} />);
    expect(screen.getByText("Grupo A")).toBeInTheDocument();
    expect(screen.getByText("Grupo L")).toBeInTheDocument();
  });

  it("clicar num time o move para o topo da ordem do grupo", async () => {
    const onGruposChange = vi.fn();
    render(<GroupStage mundial={mundial} grupos={{}} terceiros={[]}
      onGruposChange={onGruposChange} onTerceirosChange={() => {}} onConfirm={() => {}} />);
    const grupoA = screen.getByTestId("grupo-A");
    await userEvent.click(within(grupoA).getByText(/México/));
    expect(onGruposChange).toHaveBeenCalled();
  });
});
