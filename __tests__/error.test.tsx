import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ErrorPage from "../app/error";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  AlertTriangle: () => <svg data-testid="alert-icon" />,
  RefreshCw: () => <svg data-testid="refresh-icon" />,
  Home: () => <svg data-testid="home-icon" />,
  Terminal: () => <svg data-testid="terminal-icon" />,
}));

// Mock custom Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, variant }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

describe("Global Error Boundary Page", () => {
  it("should render error message and reset triggers correctly", () => {
    const mockReset = vi.fn();
    const mockError = new Error("Failed to load page asset context");
    (mockError as any).digest = "DIGEST-12345";

    render(<ErrorPage error={mockError} reset={mockReset} />);

    // Assert title and error message
    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    expect(screen.getByText("Error: Failed to load page asset context")).toBeInTheDocument();
    expect(screen.getByText("Reference ID: DIGEST-12345")).toBeInTheDocument();

    // Trigger reset callback
    fireEvent.click(screen.getByText("Try Again"));
    expect(mockReset).toHaveBeenCalled();
  });
});
