import { fireEvent, render, screen } from "@testing-library/react";
import {
  PreferenceControls,
  PreferencesProvider,
} from "./contexts/PreferencesContext";

beforeEach(() => {
  window.localStorage.removeItem("wehs-language");
  window.localStorage.removeItem("wehs-theme");
});

afterEach(() => {
  window.localStorage.removeItem("wehs-language");
  window.localStorage.removeItem("wehs-theme");
  document.documentElement.lang = "en";
  delete document.documentElement.dataset.theme;
});

test("saves language and theme preferences when toggled", () => {
  const { container } = render(
    <PreferencesProvider>
      <PreferenceControls />
    </PreferencesProvider>
  );

  fireEvent.click(screen.getByRole("button", { name: "Language: English" }));
  fireEvent.click(container.querySelector(".theme-btn"));

  expect(document.documentElement.lang).toBe("si");
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(window.localStorage.getItem("wehs-language")).toBe("si");
  expect(window.localStorage.getItem("wehs-theme")).toBe("dark");
});
