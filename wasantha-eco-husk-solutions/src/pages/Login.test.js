import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Login from "./Login";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  Link: ({ children }) => <span>{children}</span>,
  useNavigate: () => mockNavigate,
}), { virtual: true });

const submit = () => {
  fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
    target: { value: "test@example.invalid" },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
    target: { value: "test-password" },
  });
  return screen.getByRole("button", { name: "Login" }).closest("form");
};

beforeEach(() => {
  global.fetch = jest.fn();
  mockNavigate.mockClear();
  sessionStorage.clear();
});

test("shows the backend 401 message and blocks submissions while pending", async () => {
  let respond;
  fetch.mockReturnValue(new Promise((resolve) => { respond = resolve; }));
  render(<Login />);
  const form = submit();
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
    email: "test@example.invalid", password: "test-password",
  });
  respond({ ok: false, json: async () => ({ success: false, message: "Invalid email or password" }) });
  await screen.findByText("Invalid email or password");
  expect(mockNavigate).not.toHaveBeenCalled();
});

test("handles an HTML response without exposing it", async () => {
  fetch.mockResolvedValue({ ok: false, json: async () => { throw new SyntaxError("HTML response"); } });
  render(<Login />);
  fireEvent.submit(submit());
  await screen.findByText("The login server returned an invalid response. Please try again later.");
});

test.each([
  ["admin", "/admin/dashboard"],
  ["delivery", "/delivery/dashboard"],
  ["customer", "/"],
])("preserves %s session and redirect", async (role, path) => {
  const user = { id: 1, email: "test@example.invalid", role };
  fetch.mockResolvedValue({ ok: true, json: async () => ({ success: true, user }) });
  render(<Login />);
  fireEvent.submit(submit());
  await screen.findByText("Login successful!");
  expect(JSON.parse(sessionStorage.getItem("user"))).toEqual(user);
  expect(sessionStorage.getItem("user_id")).toBe("1");
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(path), { timeout: 2000 });
});
