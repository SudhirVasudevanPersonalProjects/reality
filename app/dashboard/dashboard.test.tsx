import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardPage from "./page";

// Mock useAuth hook
const mockSignOut = vi.fn();
const mockUser = { id: "user-123", email: "test@example.com" };

vi.mock("@/lib/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: mockUser,
    signOut: mockSignOut,
  }),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dashboard with my reality heading", () => {
    render(<DashboardPage />);

    expect(screen.getByText(/my reality/i)).toBeInTheDocument();
  });

  it("displays user email in navbar", () => {
    render(<DashboardPage />);

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders logout button", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("calls signOut when logout button is clicked", async () => {
    render(<DashboardPage />);

    const logoutButton = screen.getByRole("button", { name: /log out/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it("renders Reality brand name in navbar", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Reality")).toBeInTheDocument();
  });
});
