import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./auth-context";
import { authApi } from "./api";

vi.mock("./api", () => ({
  authApi: {
    signup: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}));

function okResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as Response;
}

function errResponse(status: number) {
  return { ok: false, status, json: async () => ({}) } as Response;
}

function Consumer() {
  const { user, status, logout } = useAuth();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="email">{user?.email ?? "none"}</span>
      <button onClick={() => logout()}>Log out</button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useAuth", () => {
  it("throws when used outside an AuthProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(/useAuth must be used within AuthProvider/);
    consoleSpy.mockRestore();
  });
});

describe("AuthProvider", () => {
  it("starts in the loading state before /api/auth/me resolves", () => {
    vi.mocked(authApi.me).mockReturnValue(new Promise(() => {})); // never resolves during this test
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("status").textContent).toBe("loading");
  });

  it("transitions to authenticated with the session user when /api/auth/me succeeds", async () => {
    vi.mocked(authApi.me).mockResolvedValue(okResponse({ id: "1", email: "person@example.com" }));
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("authenticated"));
    expect(screen.getByTestId("email").textContent).toBe("person@example.com");
  });

  it("transitions to unauthenticated when /api/auth/me fails (no valid session)", async () => {
    vi.mocked(authApi.me).mockResolvedValue(errResponse(401));
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("unauthenticated"));
    expect(screen.getByTestId("email").textContent).toBe("none");
  });

  it("logout() clears the user and moves status back to unauthenticated", async () => {
    vi.mocked(authApi.me).mockResolvedValue(okResponse({ id: "1", email: "person@example.com" }));
    vi.mocked(authApi.logout).mockResolvedValue(okResponse({}));
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("authenticated"));
    await user.click(screen.getByRole("button", { name: /log out/i }));

    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("unauthenticated"));
    expect(authApi.logout).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("email").textContent).toBe("none");
  });
});
