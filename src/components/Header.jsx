import { useEffect, useState } from "react";
import { useLang } from "../LangContext";
import Logo from "./Logo";

export default function Header({ onQuote }) {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, lang]);

  function go(id) {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container header-inner">
        <Logo />
        <nav className="nav-desktop" aria-label={lang === "en" ? "Main" : "Principal"}>
          {t.nav.map((link) => (
            <button
              key={link.id}
              type="button"
              className="nav-link"
              onClick={() => go(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <div className="lang-switch" role="group" aria-label="Language">
            <button
              type="button"
              className={lang === "pt" ? "is-active" : ""}
              onClick={() => setLang("pt")}
            >
              PT
            </button>
            <button
              type="button"
              className={lang === "en" ? "is-active" : ""}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>
          <button type="button" className="btn btn-primary header-cta" onClick={onQuote}>
            {t.quoteCta}
          </button>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{t.menu}</span>
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-panel ${open ? "is-open" : ""}`}>
        <nav aria-label="Mobile">
          {t.nav.map((link) => (
            <button key={link.id} type="button" onClick={() => go(link.id)}>
              {link.label}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              setOpen(false);
              onQuote();
            }}
          >
            {t.quoteCta}
          </button>
        </nav>
      </div>
    </header>
  );
}
