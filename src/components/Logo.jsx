import { company } from '../data/site'

export default function Logo({ compact = false }) {
  return (
    <a className={`brand ${compact ? 'brand-compact' : ''}`} href="#inicio" aria-label={company.name}>
      <img src="/brand/logo-mark.svg" alt="" width="40" height="40" />
      <span className="brand-text">
        <strong>Porto Brasil</strong>
        <small>Fornecedora</small>
      </span>
    </a>
  )
}
