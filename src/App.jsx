import { useEffect, useRef } from 'react'
import Header from './components/Header'
import QuoteForm from './components/QuoteForm'
import { categoryIcons } from './components/Icons'
import Logo from './components/Logo'
import { categories, company, flowSteps, reasons } from './data/site'
import './App.css'

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

export default function App() {
  const pageRef = useReveal()

  return (
    <div ref={pageRef}>
      <Header onQuote={() => scrollToId('cotacao')} />

      <main>
        <section id="inicio" className="hero">
          <div className="hero-media" aria-hidden="true" />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="container hero-content">
            <p className="eyebrow hero-eyebrow">Porto Brasil Fornecedora · São Sebastião</p>
            <h1>Suprimentos para manter sua operação em movimento.</h1>
            <p className="hero-lead">
              Materiais, ferramentas, equipamentos e suprimentos para operações marítimas,
              industriais e empresariais — com pesquisa, cotação e acompanhamento profissional.
            </p>
            <div className="hero-actions">
              <button type="button" className="btn btn-primary" onClick={() => scrollToId('cotacao')}>
                Solicitar cotação
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => scrollToId('empresa')}>
                Conheça a empresa
              </button>
            </div>
          </div>
        </section>

        <section id="materiais" className="section">
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow">O que fornecemos</p>
              <h2>Amplitude de materiais para a rotina da operação</h2>
              <p>
                Não é um catálogo infinito. É um panorama claro das categorias que atendemos no dia a dia.
              </p>
            </div>
            <div className="grid-4">
              {categories.map((item, i) => {
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

        <section id="solucoes" className="section section-alt">
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow">Por que a Porto Brasil</p>
              <h2>Fornecimento pensado para quem precisa resolver</h2>
              <p>Benefícios concretos — sem frases genéricas de folder.</p>
            </div>
            <div className="grid-2 reasons-grid">
              {reasons.map((item) => (
                <article key={item.title} className="reason-card reveal">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="section">
          <div className="container grid-2 flow-layout">
            <div className="reveal">
              <p className="eyebrow">Cotação</p>
              <h2>Precisa de um material?</h2>
              <p className="lead">
                Você precisa. Nós entendemos a necessidade, pesquisamos, comparamos e cotamos —
                com clareza para a operação decidir.
              </p>
              <ol className="flow-list">
                {flowSteps.map((step) => (
                  <li key={step.step}>
                    <span>{step.step}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <button type="button" className="btn btn-primary" onClick={() => scrollToId('cotacao')}>
                Solicitar cotação
              </button>
            </div>
            <div id="cotacao" className="quote-panel reveal">
              <h3>Solicitar cotação</h3>
              <p>Formulário direto. Sem cadastro. Sem rodeio.</p>
              <QuoteForm />
            </div>
          </div>
        </section>

        <section className="section maritime">
          <div className="maritime-bg" aria-hidden="true" />
          <div className="container maritime-inner reveal">
            <p className="eyebrow">Operações marítimas e portuárias</p>
            <h2>Suprimentos para operações que não podem parar.</h2>
            <p>
              Necessidade → pesquisa → fornecimento → entrega. Uma linha clara de atendimento para
              demandas que exigem prazo, especificação correta e resposta organizada.
            </p>
            <div className="maritime-chain" aria-label="Fluxo operacional">
              <span>Necessidade</span>
              <span aria-hidden="true">→</span>
              <span>Pesquisa</span>
              <span aria-hidden="true">→</span>
              <span>Fornecimento</span>
              <span aria-hidden="true">→</span>
              <span>Entrega</span>
            </div>
          </div>
        </section>

        <section id="empresa" className="section">
          <div className="container grid-2 company-grid">
            <div className="reveal">
              <p className="eyebrow">A Empresa</p>
              <h2>{company.name}</h2>
              <p className="lead">
                Fornecedora profissional em São Sebastião - SP, próxima de quem precisa de materiais
                corretos, no prazo e com atendimento direto.
              </p>
              <dl className="company-facts">
                <div>
                  <dt>Nome fantasia</dt>
                  <dd>{company.name}</dd>
                </div>
                <div>
                  <dt>Também referida como</dt>
                  <dd>{company.tradeNameAlt}</dd>
                </div>
                <div>
                  <dt>Razão social</dt>
                  <dd>{company.legalName}</dd>
                </div>
                <div>
                  <dt>CNPJ</dt>
                  <dd>{company.cnpj}</dd>
                </div>
                <div>
                  <dt>Localização</dt>
                  <dd>São Sebastião - SP</dd>
                </div>
              </dl>
              <p className="muted-note">
                História institucional detalhada: placeholder para texto oficial da empresa
                (missão, trajetória e diferenciais confirmados pelo cliente).
              </p>
            </div>
            <aside className="company-aside reveal">
              <h3>Atendimento próximo</h3>
              <p>
                Base local para apoiar empresas e operações da região com pesquisa de materiais,
                cotação e acompanhamento da solicitação.
              </p>
              <ul>
                <li>Escuta da necessidade antes de cotar</li>
                <li>Atenção a especificação e unidade</li>
                <li>Retorno organizado para decisão</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="section section-blue cta-band">
          <div className="container cta-band-inner reveal">
            <div>
              <h2>Precisa de um fornecedor?</h2>
              <p>Envie a necessidade. Nós pesquisamos, encontramos e cotamos.</p>
            </div>
            <div className="cta-band-actions">
              <button type="button" className="btn btn-primary" onClick={() => scrollToId('cotacao')}>
                Solicitar cotação
              </button>
              <a className="btn btn-secondary" href={`mailto:${company.email}`}>
                Falar com nossa equipe
              </a>
            </div>
          </div>
        </section>

        <section id="contato" className="section section-alt">
          <div className="container grid-2 contact-grid">
            <div className="reveal">
              <p className="eyebrow">Contato</p>
              <h2>Fale com a Porto Brasil</h2>
              <p className="lead">Canais claros para cotação, status e atendimento operacional.</p>
              <div className="contact-list">
                <div>
                  <strong>Endereço</strong>
                  {company.addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <a className="text-link" href={company.mapsUrl} target="_blank" rel="noreferrer">
                    Ver no mapa
                  </a>
                </div>
                <div>
                  <strong>Telefone</strong>
                  {company.phones.map((p) => (
                    <p key={p.href}><a href={p.href}>{p.label}</a></p>
                  ))}
                </div>
                <div>
                  <strong>E-mail</strong>
                  <p><a href={`mailto:${company.email}`}>{company.email}</a></p>
                </div>
                <div>
                  <strong>Horário</strong>
                  <p>{company.hours}</p>
                  <p className="field-hint">Confirmar horário oficial com a equipe se houver variação.</p>
                </div>
              </div>
              <div className="hero-actions">
                <button type="button" className="btn btn-primary" onClick={() => scrollToId('cotacao')}>
                  Solicitar cotação
                </button>
                <a className="btn btn-ghost" href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer">
                  Falar com nossa equipe
                </a>
              </div>
            </div>
            <div className="map-card reveal">
              <iframe
                title="Mapa — Porto Brasil Fornecedora"
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
            <p>
              Fornecimento B2B de materiais e suprimentos em São Sebastião - SP, com foco em
              clareza, prazo e especificação correta.
            </p>
          </div>
          <div>
            <h4>Links</h4>
            <button type="button" onClick={() => scrollToId('empresa')}>Empresa</button>
            <button type="button" onClick={() => scrollToId('solucoes')}>Soluções</button>
            <button type="button" onClick={() => scrollToId('materiais')}>Materiais</button>
            <button type="button" onClick={() => scrollToId('cotacao')}>Cotação</button>
            <button type="button" onClick={() => scrollToId('contato')}>Contato</button>
          </div>
          <div>
            <h4>Contato</h4>
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
          <p>Informações legais adicionais: a confirmar com a empresa.</p>
        </div>
      </footer>
    </div>
  )
}
