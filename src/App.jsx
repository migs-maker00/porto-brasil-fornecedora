import { useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import QuoteForm from './components/QuoteForm'
import { currentPath, parsePath } from './lib/route'
import { categoryIcons } from './components/Icons'
import Logo from './components/Logo'
import { company } from './data/site'
import { useLang } from './LangContext'
import WorkRoot from './work/WorkRoot'
import './App.css'

export default function App() {
  const [path, setPath] = useState(() =>
    typeof window === 'undefined' ? '/' : currentPath(),
  )

  useEffect(() => {
    const onHash = () => setPath(currentPath())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const route = parsePath(path)
  if (route.name !== 'home') return <WorkRoot route={route} />
  return <PublicSite />
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
              <button type="button" className="btn btn-secondary" onClick={() => scrollToId('como-funciona')}>
                {t.secondaryCta}
              </button>
            </div>
          </div>
        </section>

        <section id="solucoes" className="section">
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow">{t.trustEyebrow}</p>
              <h2>{t.trustTitle}</h2>
              <p>{t.trustLead}</p>
            </div>
            <div className="grid-2 reasons-grid">
              {t.reasons.map((item) => (
                <article key={item.title} className="reason-card reveal">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section maritime">
          <div className="maritime-bg" aria-hidden="true" />
          <div className="container maritime-inner reveal">
            <p className="eyebrow">{t.diffEyebrow}</p>
            <h2>{t.diffTitle}</h2>
            <p>{t.diffLead}</p>
            <div className="maritime-chain" aria-label={t.diffTitle}>
              {t.chain.flatMap((label, i) =>
                i === 0
                  ? [<span key={label}>{label}</span>]
                  : [
                      <span key={`${label}-arrow`} aria-hidden="true">
                        →
                      </span>,
                      <span key={label}>{label}</span>,
                    ],
              )}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="section">
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

        <section className="section section-alt">
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow">{t.caseEyebrow}</p>
              <h2>{t.caseTitle}</h2>
              <p>{t.caseLead}</p>
            </div>
            <div className="grid-4">
              {t.caseItems.map((item) => (
                <article key={item.title} className="card reveal">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="materiais" className="section">
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
                    <div className="icon-wrap"><Icon /></div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container grid-2">
            <article className="reason-card reveal">
              <p className="eyebrow">{t.specificEyebrow}</p>
              <h2>{t.specificTitle}</h2>
              <p>{t.specificLead}</p>
            </article>
            <article className="reason-card reveal">
              <h2>{t.unknownTitle}</h2>
              <p>{t.unknownLead}</p>
              <button type="button" className="btn btn-primary" onClick={() => scrollToId('contato')}>
                {t.sendNeed}
              </button>
            </article>
          </div>
        </section>

        <section id="parceria" className="section">
          <div className="container grid-2 company-grid">
            <div className="reveal">
              <p className="eyebrow">{t.partnerEyebrow}</p>
              <h2>{t.partnerTitle}</h2>
              <p className="lead">{t.partnerLead}</p>
            </div>
            <aside className="company-aside reveal">
              <ul>
                {t.partnerItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section id="empresa" className="section">
          <div className="container grid-2 company-grid">
            <div className="reveal">
              <p className="eyebrow">{t.companyEyebrow}</p>
              <h2>{company.name}</h2>
              <p className="lead">{t.companyLead}</p>
              <dl className="company-facts">
                <div>
                  <dt>{t.factTrade}</dt>
                  <dd>{company.name}</dd>
                </div>
                <div>
                  <dt>{t.factAlso}</dt>
                  <dd>{company.tradeNameAlt}</dd>
                </div>
                <div>
                  <dt>{t.factLegal}</dt>
                  <dd>{company.legalName}</dd>
                </div>
                <div>
                  <dt>{t.factCnpj}</dt>
                  <dd>{company.cnpj}</dd>
                </div>
                <div>
                  <dt>{t.factIe}</dt>
                  <dd>{company.ie}</dd>
                </div>
                <div>
                  <dt>{t.factLocation}</dt>
                  <dd>{t.locationValue}</dd>
                </div>
              </dl>
              <p className="muted-note">{t.companyNote}</p>
            </div>
            <aside className="company-aside reveal">
              <h3>{t.asideTitle}</h3>
              <p>{t.asideLead}</p>
              <ul>
                {t.asideItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="section section-blue cta-band">
          <div className="container cta-band-inner reveal">
            <div>
              <h2>{t.recurTitle}</h2>
              <p>{t.recurLead}</p>
            </div>
            <div className="cta-band-actions">
              <button type="button" className="btn btn-primary" onClick={() => scrollToId('contato')}>
                {t.talkTeam}
              </button>
            </div>
          </div>
        </section>

        <section id="contato" className="section section-alt">
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
                  {t.hoursHint ? <p className="field-hint">{t.hoursHint}</p> : null}
                </div>
              </div>
              <div className="hero-actions">
                <a className="btn btn-ghost" href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer">
                  {t.talkTeam}
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
            {company.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p><a href={`mailto:${company.email}`}>{company.email}</a></p>
            {company.phones.map((p) => (
              <p key={p.href}><a href={p.href}>{p.label}</a></p>
            ))}
          </div>
        </div>
        <div className="container footer-bottom">
          <p>© {new Date().getFullYear()} {company.legalName}. CNPJ {company.cnpj}.</p>
          <a href="#/app" className="footer-team">{t.teamArea}</a>
        </div>
      </footer>
    </div>
  )
}
