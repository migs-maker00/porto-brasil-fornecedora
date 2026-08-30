import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { messages } from "./i18n";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState("pt");

  useEffect(() => {
    const saved = window.localStorage.getItem("porto-lang");
    if (saved === "en" || saved === "pt") setLangState(saved);
  }, []);

  useEffect(() => {
    document.title = messages[lang].pageTitle
    const meta = document.querySelector('meta[name="description"]')
    if (meta && messages[lang].pageDescription) {
      meta.setAttribute("content", messages[lang].pageDescription)
    }
  }, [lang]);

  const setLang = (next) => {
    setLangState(next);
    window.localStorage.setItem("porto-lang", next);
  };

  const value = useMemo(
    () => ({ lang, setLang, t: messages[lang] }),
    [lang],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
