import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";
import { authApi } from "@/lib/api";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/api", () => ({
  authApi: {
    signup: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}));

const refreshMock = vi.fn();
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    refresh: refreshMock,
    logout: vi.fn(),
    user: null,
    status: "unauthenticated",
  }),
}));

function okResponse(body: unknown = {}) {
  return { ok: true, status: 200, json: async () => body } as Response;
}

function errResponse(status: number, body: unknown) {
  return { ok: false, status, json: async () => body } as Response;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LoginForm", () => {
  it("renders email and password fields with a submit control", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("shows an inline error for an invalid email and makes no network call", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/password/i), "whatever");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it("shows an inline error when the password is empty and makes no network call", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "person@example.com");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it("calls the login API and transitions to a logged-in state on success", async () => {
    vi.mocked(authApi.login).mockResolvedValue(okResponse());
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "person@example.com");
    await user.type(screen.getByLabelText(/password/i), "correcthorsebattery");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() =>
      expect(authApi.login).toHaveBeenCalledWith("person@example.com", "correcthorsebattery")
    );
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
  });

  it("surfaces an error message and does not transition to a logged-in state on a failed login (401)", async () => {
    vi.mocked(authApi.login).mockResolvedValue(
      errResponse(401, { message: "Invalid email or password" })
    );
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "person@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(refreshMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
