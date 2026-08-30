import { useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import QuoteForm from './components/QuoteForm'
import { currentPath, parsePath } from './lib/route'
import { categoryIcons } from './components/Icons'
import Logo from './components/Logo'
import { company } from './data/site'
import { useLang } from './LangContext'
import WorkRoot from './work/WorkRoot'
import LegalPage from './components/LegalPage'
import './App.css'

export default function App() {
  const [path, setPath] = useState(() =>
    typeof window === 'undefined' ? '/' : currentPath(),
  )

  useEffect(() => {
    const sync = () => setPath(currentPath())
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  const route = parsePath(path)
  if (route.name === 'privacy' || route.name === 'terms') {
    return <LegalPage kind={route.name} />
  }
  if (route.name === 'notfound') return <NotFound />
  if (route.name !== 'home') return <WorkRoot route={route} />
  return <PublicSite />
}

function NotFound() {
  const { t } = useLang()
  return (
    <div>
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
        </div>
      </header>
      <main className="section">
        <div className="container legal-page">
          <h1>{t.notFoundTitle}</h1>
          <p>{t.notFoundLead}</p>
          <a className="btn btn-primary" href="#/">{t.notFoundCta}</a>
        </div>
      </main>
    </div>
  )
}

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return undefined
    const nodes = root.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.12 },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
  return ref
}

function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function PublicSite() {
  const pageRef = useReveal()
  const { t } = useLang()

  return (
    <div ref={pageRef}>
      <Header onQuote={() => scrollToId('contato')} />

      <main>
        <section id="inicio" className="hero">
          <div className="hero-media" aria-hidden="true" />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="container hero-content">
            <p className="eyebrow hero-eyebrow">{t.heroEyebrow}</p>
            <h1 className="hero-title-wide">{t.heroTitle}</h1>
            <p className="hero-lead">{t.heroLead}</p>
            <div className="hero-actions">
              <button type="button" className="btn btn-primary" onClick={() => scrollToId('contato')}>
                {t.quoteCta}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => scrollToId('empresa')}>
                {t.secondaryCta}
              </button>
            </div>
          </div>
        </section>

        <section id="empresa" className="section">
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow">{t.aboutEyebrow}</p>
              <h2>{t.aboutTitle}</h2>
              <p className="lead">{t.aboutLead}</p>
            </div>
            <div className="about-copy reveal">
              {t.aboutBody.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p className="about-need">{t.aboutNeedFirst}</p>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="section section-alt">
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow">{t.flowEyebrow}</p>
              <h2>{t.flowTitle}</h2>
              <p className="lead">{t.flowLead}</p>
            </div>
            <ol className="flow-list flow-list-wide reveal">
              {t.flowSteps.map((step) => (
                <li key={step.step}>
                  <span>{step.step}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section">
          <div className="container reveal">
            <p className="eyebrow">{t.diffEyebrow}</p>
            <h2 className="diff-title">{t.diffTitle}</h2>
            <p className="lead">{t.diffLead}</p>
          </div>
        </section>

        <section id="atuacao" className="section section-alt">
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow">{t.materialsEyebrow}</p>
              <h2>{t.materialsTitle}</h2>
              <p>{t.materialsLead}</p>
            </div>
            <div className="grid-4">
              {t.categories.map((item, i) => {
                const Icon = categoryIcons[i]
                return (
                  <article key={item.title} className="card reveal">
                    {Icon ? <div className="icon-wrap"><Icon /></div> : null}
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section maritime">
          <div className="maritime-bg" aria-hidden="true" />
          <div className="container maritime-inner reveal">
            <p className="eyebrow">{t.seaEyebrow}</p>
            <h2>{t.seaTitle}</h2>
            <p>{t.seaLead}</p>
            <p>{t.seaBody}</p>
          </div>
        </section>

        <section id="compromisso" className="section">
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow">{t.trustEyebrow}</p>
              <h2>{t.trustTitle}</h2>
            </div>
            <div className="grid-2 reasons-grid">
              {t.principles.map((item) => (
                <article key={item.title} className="reason-card reveal">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-blue statement-band">
          <div className="container reveal">
            <p className="eyebrow">{t.visionEyebrow}</p>
            <h2>{t.visionTitle}</h2>
            <p>{t.visionLead}</p>
          </div>
        </section>

        <section className="section">
          <div className="container reveal">
            <p className="eyebrow">{t.partnerEyebrow}</p>
            <h2>{t.partnerTitle}</h2>
            <p className="lead">{t.partnerLead}</p>
          </div>
        </section>

        <section className="section section-alt cta-band">
          <div className="container cta-band-inner reveal">
            <div>
              <h2>{t.ctaTitle}</h2>
              <p>{t.ctaLead}</p>
              <p className="statement-line">{t.statement}</p>
            </div>
            <div className="cta-band-actions">
              <button type="button" className="btn btn-primary" onClick={() => scrollToId('contato')}>
                {t.talkTeam}
              </button>
            </div>
          </div>
        </section>

        <section id="contato" className="section">
          <div className="container grid-2 contact-grid">
            <div className="reveal">
              <p className="eyebrow">{t.contactEyebrow}</p>
              <h2>{t.contactTitle}</h2>
              <p className="lead">{t.contactLead}</p>
              <div className="contact-list">
                <div>
                  <strong>{t.address}</strong>
                  {company.addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <a className="text-link" href={company.mapsUrl} target="_blank" rel="noreferrer">
                    {t.seeMap}
                  </a>
                </div>
                <div>
                  <strong>{t.phone}</strong>
                  {company.phones.map((p) => (
                    <p key={p.href}><a href={p.href}>{p.label}</a></p>
                  ))}
                </div>
                <div>
                  <strong>{t.email}</strong>
                  <p><a href={`mailto:${company.email}`}>{company.email}</a></p>
                </div>
                <div>
                  <strong>{t.hoursLabel}</strong>
                  <p>{t.hours}</p>
                </div>
                <div>
                  <strong>{t.factCnpj}</strong>
                  <p>{company.cnpj}</p>
                </div>
              </div>
              <div className="hero-actions">
                <a className="btn btn-primary" href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer">
                  WhatsApp (12) 99760-2999
                </a>
                <a className="btn btn-secondary" href="tel:+5512997602999">
                  Ligar
                </a>
                <a className="btn btn-ghost" href={`mailto:${company.email}`}>
                  {company.email}
                </a>
              </div>
            </div>
            <div id="necessidade" className="quote-panel reveal">
              <h3>{t.quoteTitle}</h3>
              <p>{t.quoteLead}</p>
              <QuoteForm />
            </div>
          </div>
          <div className="container contact-map">
            <div className="map-card reveal">
              <iframe
                title={t.mapTitle}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=Rua%20Nossa%20Senhora%20da%20Paz%2082%20Vila%20Amelia%20Sao%20Sebastiao%20SP&output=embed"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Logo />
            <p>{t.footerAbout}</p>
            <p>{company.legalName}</p>
            <p>CNPJ {company.cnpj}</p>
          </div>
          <div>
            <h4>{t.footerLinks}</h4>
            {t.nav.map((link) => (
              <button key={link.id} type="button" onClick={() => scrollToId(link.id)}>
                {link.label}
              </button>
            ))}
          </div>
          <div>
            <h4>{t.contactEyebrow}</h4>
            <p>São Sebastião — SP</p>
            <p><a href={`mailto:${company.email}`}>{company.email}</a></p>
            <p><a href="tel:+5512997602999">(12) 99760-2999</a></p>
            <p>
              <a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>
              {' · '}
              <a href={`mailto:${company.email}`}>E-mail</a>
            </p>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>© {new Date().getFullYear()} {company.legalName}. CNPJ {company.cnpj}.</p>
          <div className="footer-legal">
            <a href="#/privacidade">{t.privacy}</a>
            <a href="#/termos">{t.terms}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
