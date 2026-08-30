import { isOpenStatus } from "../lib/status"
import Dashboard from "./Dashboard"
import NewSearch from "./NewSearch"
import ProcessPage, { ProcessList } from "./ProcessPage"
import SuppliersPage, { SupplierPage } from "./SuppliersPage"
import WorkShell from "./WorkShell"

export default function WorkRoot({ route }) {
  let page = null
  if (route.name === "dashboard") page = <Dashboard />
  else if (route.name === "new-search") page = <NewSearch />
  else if (route.name === "process") page = <ProcessPage id={route.id} />
  else if (route.name === "searches") {
    page = <ProcessList title="Pesquisas" filter={() => true} />
  } else if (route.name === "suppliers") page = <SuppliersPage />
  else if (route.name === "supplier") page = <SupplierPage id={route.id} />
  else if (route.name === "quotes") {
    page = (
      <ProcessList
        title="Cotações"
        filter={(p) =>
          ["selecionados", "enviada", "aguardando", "recebidas"].includes(p.status)
        }
      />
    )
  } else if (route.name === "proposals") {
    page = <ProcessList title="Propostas" filter={(p) => p.proposals.length > 0} />
  } else if (route.name === "analyses") {
    page = (
      <ProcessList
        title="Análises"
        filter={(p) => p.status === "analise" || p.status === "apresentado"}
      />
    )
  } else if (route.name === "history") {
    page = <ProcessList title="Histórico" filter={(p) => !isOpenStatus(p.status)} />
  } else page = <Dashboard />

  return <WorkShell route={route}>{page}</WorkShell>
}
