import { chromium } from "playwright"

const base = process.env.E2E_URL || "http://127.0.0.1:5176"
const examples = [
  "Preciso de 10 rolamentos 6317 ZZ C3 SKF.",
  "Capitão pediu uma bomba hidráulica para o sistema X.",
  "Preciso de 5 válvulas esfera de inox.",
]

const browser = await chromium.launch({
  headless: true,
  channel: process.env.E2E_CHANNEL || "msedge",
})
const page = await browser.newPage()
const log = []

function ok(name, pass, extra = "") {
  log.push(`${pass ? "OK" : "FALHOU"}  ${name}${extra ? ` — ${extra}` : ""}`)
}

try {
  await page.goto(base + "/", { waitUntil: "networkidle" })
  const wa = await page.locator('a[href*="wa.me/5512997602999"]').count()
  const mail = await page.locator('a[href*="sscomercio.servico@gmail.com"]').count()
  const tel = await page.locator('a[href="tel:+5512997602999"]').count()
  ok("WhatsApp oficial no site", wa > 0, String(wa))
  ok("E-mail oficial no site", mail > 0, String(mail))
  ok("Telefone oficial no site", tel > 0, String(tel))

  const teamLink = await page.locator('a[href="#/app"]').count()
  ok("App interno fora da vitrine", teamLink === 0)

  await page.getByRole("button", { name: /falar com nossa equipe/i }).first().click()
  await page.waitForTimeout(400)
  ok("CTA vai ao contato", await page.locator("#contato").count() > 0)

  await page.getByRole("button", { name: /conheça a ss/i }).first().click()
  await page.waitForTimeout(300)
  ok("Conheça a SS", await page.locator("#empresa").count() > 0)

  ok("Sem exemplo de rolamento na home", !(await page.locator("body").innerText()).includes("6317"))

  await page.locator('a[href="#/privacidade"]').first().click()
  await page.waitForTimeout(400)
  ok("Privacidade", /privacidade/i.test(await page.locator("h1").innerText()))

  await page.goto(base + "/#/app")
  await page.waitForTimeout(400)
  ok("Dashboard", /precisa ser feito/i.test(await page.locator("h1").innerText().catch(() => "")))

  await page.getByRole("button", { name: /nova pesquisa/i }).first().click()
  await page.waitForTimeout(300)

  await page.locator("textarea").first().fill(examples[0])
  await page.getByLabel("Navio").fill("MV Example")
  await page.getByLabel("Cliente").fill("Empresa XYZ")
  await page.getByRole("button", { name: /pesquisar fornecedores/i }).click()
  await page.waitForTimeout(1500)
  const heading = await page.locator("h2").filter({ hasText: /empresa/i }).first().innerText()
  ok("Pesquisa rolamento SKF", /empresa/i.test(heading), heading)

  await page.getByRole("button", { name: /^Selecionar$/ }).first().click()
  await page.getByRole("button", { name: "Cotação", exact: true }).click()
  await page.waitForTimeout(300)
  const quote = await page.locator("textarea").inputValue()
  ok("Mensagem de cotação", /solicito cotação/i.test(quote) && /6317/i.test(quote))

  await page.getByRole("button", { name: /copiar mensagem/i }).click()
  await page.getByRole("button", { name: /marcar cotação enviada/i }).click()
  ok("Marcou cotação enviada", true)

  await page.locator(".work-tabs").getByRole("button", { name: "Propostas", exact: true }).click()
  await page.locator('select').first().selectOption({ index: 1 }).catch(() => {})
  await page.getByLabel("Preço (R$)").fill("480")
  await page.getByLabel("Prazo (dias)").fill("7")
  await page.getByRole("button", { name: /incluir proposta/i }).click()
  await page.waitForTimeout(300)
  ok("Proposta registrada", await page.locator("table").count() > 0)

  await page.locator(".work-tabs").getByRole("button", { name: "Análise", exact: true }).click()
  const analysis = await page.locator(".work-panel p").first().innerText()
  ok("Análise objetiva", /proposta/i.test(analysis), analysis.slice(0, 120))

  await page.getByRole("button", { name: "Nova pesquisa", exact: true }).click()
  await page.locator("textarea").first().fill(examples[1])
  await page.getByRole("button", { name: /pesquisar fornecedores/i }).click()
  await page.waitForTimeout(1500)
  const h2 = await page.locator("h2").filter({ hasText: /empresa/i }).first().innerText()
  ok("Pesquisa bomba hidráulica", /empresa/i.test(h2), h2)

  await page.goto(base + "/#/termos")
  await page.waitForTimeout(300)
  ok("Termos", /termos/i.test(await page.locator("h1").innerText()))

  await page.goto(base + "/")
  await page.getByRole("button", { name: /falar com nossa equipe/i }).first().click()
  await page.waitForTimeout(300)
  await page.locator("#necessidade").getByRole("button", { name: /enviar uma necessidade/i }).click()
  ok("Formulário valida campos", await page.locator(".form-feedback.bad").count() > 0)
} catch (err) {
  ok("Exceção no fluxo", false, String(err.message || err))
} finally {
  await browser.close()
  console.log(log.join("\n"))
}
