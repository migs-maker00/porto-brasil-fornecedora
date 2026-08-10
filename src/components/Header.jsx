import { useEffect, useState } from 'react'
import { navLinks } from '../data/site'
import Logo from './Logo'

export default function Header({ onQuote }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  function go(id) {
    setOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <Logo />
        <nav className="nav-desktop" aria-label="Principal">
          {navLinks.map((link) => (
            <button key={link.id} type="button" className="nav-link" onClick={() => go(link.id)}>
              {link.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button type="button" className="btn btn-primary header-cta" onClick={onQuote}>
            Solicitar cotação
          </button>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-panel ${open ? 'is-open' : ''}`}>
        <nav aria-label="Mobile">
          {navLinks.map((link) => (
            <button key={link.id} type="button" onClick={() => go(link.id)}>
              {link.label}
            </button>
          ))}
          <button type="button" className="btn btn-primary btn-block" onClick={() => { setOpen(false); onQuote() }}>
            Solicitar cotação
          </button>
        </nav>
      </div>
    </header>
  )
}
