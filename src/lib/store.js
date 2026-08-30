import { useSyncExternalStore } from "react"
import { parseNeed } from "./parseNeed"
import { buildQuoteMessage } from "./quoteMessage"
import { company } from "../data/site"

const KEY = "ss-comercio-work-v1"
const listeners = new Set()

function blank() {
  return {
    version: 1,
    nextRef: 1,
    suppliers: [],
    processes: [],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return blank()
    const data = JSON.parse(raw)
    if (!data || !Array.isArray(data.processes)) return blank()
    return data
  } catch {
    return blank()
  }
}

let state = typeof window === "undefined" ? blank() : load()

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
  listeners.forEach((fn) => fn())
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function padRef(n) {
  return String(n).padStart(5, "0")
}

export function getState() {
  return state
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useWorkStore() {
  return useSyncExternalStore(subscribe, getState, getState)
}

export function createProcess(rawNeed, extra = {}) {
  const parsed = parseNeed(rawNeed)
  const now = {
    id: uid("p"),
    ref: padRef(state.nextRef),
    rawNeed: String(rawNeed || "").trim(),
    parsed,
    client: extra.client || "",
    status: "pesquisando",
    selectedSupplierIds: [],
    contactedSupplierIds: [],
    quoteMessage: "",
    proposals: [],
    presentedIds: [],
    chosenSupplierId: "",
    chosenValue: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  process.quoteMessage = buildQuoteMessage(process, company)
  state = {
    ...state,
    nextRef: state.nextRef + 1,
    processes: [process, ...state.processes],
  }
  emit()
  return process
}

export function updateProcess(id, patch) {
  state = {
    ...state,
    processes: state.processes.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
    ),
  }
  emit()
}

export function reparseProcess(id, rawNeed) {
  const parsed = parseNeed(rawNeed)
  const current = state.processes.find((p) => p.id === id)
  if (!current) return
  updateProcess(id, {
    rawNeed,
    parsed,
    quoteMessage: buildQuoteMessage({ ...current, rawNeed, parsed }, company),
  })
}

export function upsertSupplier(data) {
  const now = Date.now()
  if (data.id) {
    state = {
      ...state,
      suppliers: state.suppliers.map((s) =>
        s.id === data.id ? { ...s, ...data, updatedAt: now } : s,
      ),
    }
    emit()
    return data.id
  }
  const supplier = {
    id: uid("s"),
    name: "",
    type: "Distribuidor",
    categories: [],
    brands: [],
    products: [],
    location: "",
    phone: "",
    email: "",
    website: "",
    b2b: null,
    favorite: false,
    notes: "",
    evidence: [],
    createdAt: now,
    updatedAt: now,
    ...data,
  }
  state = { ...state, suppliers: [supplier, ...state.suppliers] }
  emit()
  return supplier.id
}

export function toggleFavorite(id) {
  state = {
    ...state,
    suppliers: state.suppliers.map((s) =>
      s.id === id ? { ...s, favorite: !s.favorite, updatedAt: Date.now() } : s,
    ),
  }
  emit()
}

export function addEvidence(supplierId, evidence) {
  state = {
    ...state,
    suppliers: state.suppliers.map((s) =>
      s.id === supplierId
        ? { ...s, evidence: [...(s.evidence || []), { id: uid("e"), ...evidence }] }
        : s,
    ),
  }
  emit()
}

export function addProposal(processId, proposal) {
  const process = state.processes.find((p) => p.id === processId)
  if (!process) return
  const next = {
    id: uid("q"),
    supplierId: "",
    brand: "",
    price: "",
    leadDays: "",
    payment: "",
    availability: "",
    freight: "",
    warranty: "",
    spec: "",
    notes: "",
    ...proposal,
  }
  let status = process.status
  if (["enviada", "aguardando"].includes(status)) status = "recebidas"
  if (process.proposals.length + 1 >= 1 && status === "recebidas") status = "recebidas"
  updateProcess(processId, {
    proposals: [...process.proposals, next],
    status,
  })
}

export function processById(id) {
  return state.processes.find((p) => p.id === id)
}

export function supplierById(id) {
  return state.suppliers.find((s) => s.id === id)
}
