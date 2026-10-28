import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import commonTranslations from "../translations/common";
import publicTranslations from "../translations/public";
import adminTranslations from "../translations/admin";

const translations = {
  si: {
    ...commonTranslations,
    ...publicTranslations,
    ...adminTranslations,
  },
};

const PreferencesContext = createContext(null);

const getStoredPreference = (key, allowedValues, fallback) => {
  const storedValue = window.localStorage.getItem(key);
  return allowedValues.includes(storedValue) ? storedValue : fallback;
};

export const PreferencesProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const storedLanguage = getStoredPreference("wehs-language", ["en", "si"], "en");
    document.documentElement.lang = storedLanguage;
    return storedLanguage;
  });
  const [theme, setTheme] = useState(() => {
    const storedTheme = getStoredPreference("wehs-theme", ["light", "dark"], "light");
    document.documentElement.dataset.theme = storedTheme;
    return storedTheme;
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("wehs-language", language);
    window.localStorage.setItem("wehs-theme", theme);
  }, [language, theme]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      toggleTheme: () =>
        setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light")),
      t: (text) => (language === "si" ? translations.si[text] || text : text),
    }),
    [language, theme]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
};

export const PreferenceControls = () => {
  const { language, setLanguage, theme, toggleTheme, t } = usePreferences();

  return (
    <div className="preference-controls">
      <button
        type="button"
        className="preference-btn language-btn"
        onClick={() => setLanguage(language === "en" ? "si" : "en")}
        aria-label={t(`Language: ${language === "en" ? "English" : "Sinhala"}`)}
        title={t(`Language: ${language === "en" ? "English" : "Sinhala"}`)}
      >
        {language === "en" ? "සිං" : "EN"}
      </button>
      <button
        type="button"
        className="preference-btn theme-btn"
        onClick={toggleTheme}
        aria-label={t(theme === "light" ? "Switch to dark mode" : "Switch to light mode")}
        title={t(theme === "light" ? "Switch to dark mode" : "Switch to light mode")}
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </div>
  );
};
