import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "./signup-form";
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

describe("SignupForm", () => {
  it("renders email and password fields with a submit control", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("shows an inline error for an invalid email and makes no network call", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/password/i), "validpassword123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
    expect(authApi.signup).not.toHaveBeenCalled();
  });

  it("shows an inline error when the password is too short and makes no network call", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "person@example.com");
    await user.type(screen.getByLabelText(/password/i), "short");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(authApi.signup).not.toHaveBeenCalled();
  });

  it("calls the signup API and transitions to a logged-in state on success", async () => {
    vi.mocked(authApi.signup).mockResolvedValue(okResponse());
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "person@example.com");
    await user.type(screen.getByLabelText(/password/i), "validpassword123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() =>
      expect(authApi.signup).toHaveBeenCalledWith("person@example.com", "validpassword123")
    );
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
  });

  it("surfaces a server error message and does not transition to a logged-in state when signup fails", async () => {
    vi.mocked(authApi.signup).mockResolvedValue(
      errResponse(409, { message: "Email already registered" })
    );
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "person@example.com");
    await user.type(screen.getByLabelText(/password/i), "validpassword123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
    expect(refreshMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
