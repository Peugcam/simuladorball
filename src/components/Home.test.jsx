import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./Home";

describe("Home", () => {
  it("mostra as três competições", () => {
    render(<Home onSelect={() => {}} />);
    expect(screen.getByText("Copa do Mundo")).toBeInTheDocument();
    expect(screen.getByText("Libertadores")).toBeInTheDocument();
    expect(screen.getByText("Copa do Brasil")).toBeInTheDocument();
  });

  it("ao clicar numa competição, chama onSelect com o id", async () => {
    const onSelect = vi.fn();
    render(<Home onSelect={onSelect} />);
    await userEvent.click(screen.getByText("Libertadores"));
    expect(onSelect).toHaveBeenCalledWith("libertadores");
  });
});
