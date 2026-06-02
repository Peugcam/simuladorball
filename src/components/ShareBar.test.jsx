import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShareBar from "./ShareBar";

describe("ShareBar", () => {
  it("copia o link ao clicar em Copiar link", async () => {
    const writeText = vi.fn().mockResolvedValue();
    Object.assign(navigator, { clipboard: { writeText } });
    render(<ShareBar getLink={() => "https://x/?c=lib&p=ABC"} targetRef={{ current: null }} />);
    await userEvent.click(screen.getByText(/copiar link/i));
    expect(writeText).toHaveBeenCalledWith("https://x/?c=lib&p=ABC");
  });
});
