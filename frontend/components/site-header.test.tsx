import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteHeader } from "./site-header";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const useAuthMock = vi.fn();
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => useAuthMock(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SiteHeader", () => {
  it("renders no auth links or user info while the auth status is loading", () => {
    useAuthMock.mockReturnValue({ user: null, status: "loading", logout: vi.fn() });
    render(<SiteHeader />);

    expect(screen.queryByRole("link", { name: /log in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /wallets/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /log out/i })).not.toBeInTheDocument();
  });

  it("shows Log in / Sign up entry points when unauthenticated", () => {
    useAuthMock.mockReturnValue({ user: null, status: "unauthenticated", logout: vi.fn() });
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
    // The "Sign up" entry point is styled as a button (via base-ui's polymorphic
    // render prop) but still navigates to /signup, so it exposes role="button"
    // rather than "link" — assert on the accessible name and href together.
    const signUpControl = screen.getByRole("button", { name: /sign up/i });
    expect(signUpControl).toBeInTheDocument();
    expect(signUpControl).toHaveAttribute("href", "/signup");
    expect(screen.queryByRole("button", { name: /log out/i })).not.toBeInTheDocument();
  });

  it("shows the signed-in user's email and a Log out control when authenticated", () => {
    useAuthMock.mockReturnValue({
      user: { id: "1", email: "person@example.com" },
      status: "authenticated",
      logout: vi.fn(),
    });
    render(<SiteHeader />);

    expect(screen.getByText("person@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^log in$/i })).not.toBeInTheDocument();
  });

  it("calls logout when the Log out control is clicked", async () => {
    const logoutMock = vi.fn();
    useAuthMock.mockReturnValue({
      user: { id: "1", email: "person@example.com" },
      status: "authenticated",
      logout: logoutMock,
    });
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /log out/i }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
