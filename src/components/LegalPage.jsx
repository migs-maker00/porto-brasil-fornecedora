import Logo from "./Logo"
import { company } from "../data/site"

const PAGES = {
  privacy: {
    title: "Privacidade",
    body: [
      "Este site institucional não cria conta de visitante e não vende dados.",
      "O formulário de necessidade abre o WhatsApp com o texto que você digitou. A conversa passa a ocorrer no aplicativo da Meta, sujeito à política deles.",
      "A área da equipe guarda pesquisas e fornecedores neste navegador (armazenamento local). Não enviamos essa base para um servidor da SS.",
      "Se quiser excluir dados deixados neste aparelho, limpe o armazenamento do site no navegador.",
      `Dúvidas: ${company.email} ou ${company.phones[0].label}.`,
    ],
  },
  terms: {
    title: "Termos de uso",
    body: [
      "O site apresenta a SS Comércio e Serviços e um canal para enviar necessidades de fornecimento.",
      "Enviar uma mensagem não cria contrato, reserva de estoque, crédito ou prazo automático.",
      "Condições comerciais dependem de análise de cada operação e de cada cliente.",
      "A área da equipe é ferramenta interna. O visitante do site público não precisa usá-la.",
      `Razão social: ${company.legalName}. CNPJ ${company.cnpj}. ${company.addressLines.join(" ")}`,
    ],
  },
}

export default function LegalPage({ kind }) {
  const page = PAGES[kind] || PAGES.privacy

  return (
    <div>
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <a className="btn btn-secondary" href="#/">
            Voltar ao site
          </a>
        </div>
      </header>
      <main className="section">
        <div className="container legal-page">
          <p className="eyebrow">{company.name}</p>
          <h1>{page.title}</h1>
          {page.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
