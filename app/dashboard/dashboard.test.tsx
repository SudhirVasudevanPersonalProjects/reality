import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardClient from "./DashboardClient";

// Mock Next.js router
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock Supabase client
const mockSignOut = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}));

describe("DashboardClient", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    aud: "authenticated",
    created_at: "2024-01-01",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({ error: null });
  });

  it("renders dashboard with my reality heading", () => {
    render(<DashboardClient user={mockUser as any} captures={[]} />);

    expect(screen.getByText(/my reality/i)).toBeInTheDocument();
  });

  it("displays user email in navbar", () => {
    render(<DashboardClient user={mockUser as any} captures={[]} />);

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders logout button", () => {
    render(<DashboardClient user={mockUser as any} captures={[]} />);

    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("calls signOut when logout button is clicked", async () => {
    render(<DashboardClient user={mockUser as any} captures={[]} />);

    const logoutButton = screen.getByRole("button", { name: /log out/i });
    fireEvent.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("renders Reality brand name in navbar", () => {
    render(<DashboardClient user={mockUser as any} captures={[]} />);

    expect(screen.getByText("Reality")).toBeInTheDocument();
  });

  it("shows empty state when no captures", () => {
    render(<DashboardClient user={mockUser as any} captures={[]} unorganizedCount={0} />);

    expect(screen.getByText(/No captures yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Start capturing your reality/i)).toBeInTheDocument();
  });

  it("renders captures when provided", () => {
    const mockCaptures = [
      {
        id: "capture-1",
        user_id: "user-123",
        content_type: "text",
        text_content: "My first capture",
        created_at: new Date().toISOString(),
        media_url: null,
        latitude: null,
        longitude: null,
        location_name: null,
        metadata: null,
      },
    ];

    render(<DashboardClient user={mockUser as any} captures={mockCaptures as any} unorganizedCount={0} />);

    expect(screen.getByText("My first capture")).toBeInTheDocument();
  });
});
