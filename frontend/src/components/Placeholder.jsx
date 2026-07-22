export default function Placeholder({ title }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: 400, gap: 12
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'var(--gold-glow)', border: '1px solid var(--border-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28
      }}>🚧</div>
      <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title} Module</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Coming in Phase 2 — stay tuned!</p>
    </div>
  )
}
