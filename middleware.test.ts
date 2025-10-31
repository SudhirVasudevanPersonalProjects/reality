import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { middleware } from "./middleware";

// Mock Supabase SSR
const mockGetSession = vi.fn();
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getSession: mockGetSession,
    },
  })),
}));

describe("Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users from protected route to login", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    const request = new NextRequest(new URL("http://localhost:3000/dashboard"));
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("allows authenticated users to access protected routes", async () => {
    const mockSession = { user: { id: "user-123" }, access_token: "token" };
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });

    const request = new NextRequest(new URL("http://localhost:3000/dashboard"));
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });

  it("redirects authenticated users from login page to dashboard", async () => {
    const mockSession = { user: { id: "user-123" }, access_token: "token" };
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });

    const request = new NextRequest(new URL("http://localhost:3000/login"));
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });

  it("redirects authenticated users from signup page to dashboard", async () => {
    const mockSession = { user: { id: "user-123" }, access_token: "token" };
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });

    const request = new NextRequest(new URL("http://localhost:3000/signup"));
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });

  it("allows unauthenticated users to access login page", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    const request = new NextRequest(new URL("http://localhost:3000/login"));
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });

  it("allows unauthenticated users to access signup page", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    const request = new NextRequest(new URL("http://localhost:3000/signup"));
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });

  it("allows unauthenticated users to access home page", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    const request = new NextRequest(new URL("http://localhost:3000/"));
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });

  it("protects /captures route for unauthenticated users", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    const request = new NextRequest(new URL("http://localhost:3000/captures"));
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });
});
