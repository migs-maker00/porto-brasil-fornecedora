import { company } from '../data/site'

export default function Logo({ compact = false }) {
  return (
    <a className={`brand ${compact ? 'brand-compact' : ''}`} href="#inicio" aria-label={company.name}>
      <img src="/brand/logo-mark.png" alt="" width="44" height="44" />
      <span className="brand-text">
        <strong>Porto Brasil</strong>
        <small>Fornecedora</small>
      </span>
    </a>
  )
}
