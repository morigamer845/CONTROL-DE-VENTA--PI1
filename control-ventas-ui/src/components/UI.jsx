/* =====================================================
   UI Components — reutilizables en toda la app
   ===================================================== */
import { X, AlertTriangle, Loader2 } from 'lucide-react'

// ── BUTTON ────────────────────────────────────────────
const btnStyles = {
  base: {
    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
    padding: '0.55rem 1.15rem', borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.875rem',
    cursor: 'pointer', border: 'none', transition: 'all var(--transition)',
    whiteSpace: 'nowrap',
  },
  primary: { background: 'var(--accent)', color: '#fff' },
  secondary: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1.5px solid var(--border)' },
  danger: { background: 'var(--danger-bg)', color: 'var(--danger)', border: '1.5px solid var(--danger)' },
  success: { background: 'var(--success-bg)', color: 'var(--success)', border: '1.5px solid var(--success)' },
  ghost: { background: 'transparent', color: 'var(--text-secondary)', padding: '0.4rem 0.6rem' },
}

export function Button({ children, variant = 'primary', size, loading, style, ...props }) {
  const sz = size === 'sm' ? { padding: '0.35rem 0.75rem', fontSize: '0.8rem' } : {}
  return (
    <button
      style={{ ...btnStyles.base, ...btnStyles[variant], ...sz, ...style,
        opacity: loading || props.disabled ? 0.6 : 1,
        cursor: loading || props.disabled ? 'not-allowed' : 'pointer',
      }}
      {...props}
    >
      {loading ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
      {children}
    </button>
  )
}

// ── BADGE ─────────────────────────────────────────────
const badgeColors = {
  green: { background: 'var(--success-bg)', color: 'var(--success)' },
  red: { background: 'var(--danger-bg)', color: 'var(--danger)' },
  yellow: { background: 'var(--warning-bg)', color: 'var(--warning)' },
  blue: { background: 'var(--accent-glow)', color: 'var(--accent)' },
  gray: { background: 'rgba(139,144,164,0.12)', color: 'var(--text-secondary)' },
}

export function Badge({ children, color = 'blue' }) {
  return (
    <span style={{
      ...badgeColors[color],
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '0.2rem 0.6rem', borderRadius: '99px',
      fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.02em',
    }}>
      {children}
    </span>
  )
}

// ── SPINNER ────────────────────────────────────────────
export function Spinner({ size = 32, label = 'Cargando...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '3rem', color: 'var(--text-secondary)' }}>
      <Loader2 size={size} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--accent)' }} />
      <span style={{ fontSize: '0.875rem' }}>{label}</span>
    </div>
  )
}

// ── EMPTY STATE ────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
      {Icon && <Icon size={42} style={{ color: 'var(--border)' }} />}
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-secondary)' }}>{title}</p>
      {description && <p style={{ fontSize: '0.85rem' }}>{description}</p>}
    </div>
  )
}

// ── MODAL ──────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(3px)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '1.75rem',
          width: '100%', maxWidth: width, maxHeight: '90vh',
          overflowY: 'auto', boxShadow: 'var(--shadow-card)',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{title}</h3>
          <Button variant="ghost" onClick={onClose} style={{ padding: '0.3rem' }}>
            <X size={18} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── CONFIRM DIALOG ─────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={400}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={22} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{message}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>Confirmar</Button>
        </div>
      </div>
    </Modal>
  )
}

// ── CARD ────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '1.5rem',
      boxShadow: 'var(--shadow-card)',
      animation: 'fadeIn 0.25s ease',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── FORM FIELD ──────────────────────────────────────────
export function Field({ label, children, error, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {label && (
        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
          {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
        </label>
      )}
      {children}
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{error}</span>}
    </div>
  )
}

// ── DATA TABLE ─────────────────────────────────────────
export function DataTable({ columns, data, emptyIcon, emptyTitle, emptyDesc }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '0.75rem 1rem', textAlign: col.align || 'left',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.75rem',
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em',
                borderBottom: '1.5px solid var(--border)', whiteSpace: 'nowrap',
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState icon={emptyIcon} title={emptyTitle || 'Sin registros'} description={emptyDesc} />
              </td>
            </tr>
          ) : (
            data.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid var(--border)', transition: 'background var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', textAlign: col.align || 'left', whiteSpace: col.nowrap ? 'nowrap' : 'normal' }}>
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── PAGE HEADER ────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)' }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  )
}

// ── STAT CARD ──────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = 'blue', trend }) {
  const colors = {
    blue: { accent: 'var(--accent)', bg: 'var(--accent-glow)' },
    green: { accent: 'var(--success)', bg: 'var(--success-bg)' },
    yellow: { accent: 'var(--warning)', bg: 'var(--warning-bg)' },
    red: { accent: 'var(--danger)', bg: 'var(--danger-bg)' },
  }
  const c = colors[color]
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '1.35rem 1.5rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{ background: c.bg, borderRadius: 'var(--radius)', padding: '0.75rem', flexShrink: 0 }}>
        <Icon size={22} style={{ color: c.accent }} />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</p>
        <p style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1.2 }}>{value}</p>
        {trend && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{trend}</p>}
      </div>
    </div>
  )
}

// ── SEARCH INPUT ───────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div style={{ position: 'relative', maxWidth: 280 }}>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: '2.25rem' }}
      />
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    </div>
  )
}
