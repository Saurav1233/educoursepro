import { useState, useEffect } from 'react';
import { paymentService } from '../../services/api';
import { CreditCard, Search, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

function StatusBadge({ status }) {
  const map = {
    COMPLETED: { color: 'var(--success)', bg: 'var(--success-light)' },
    PENDING: { color: 'var(--warning)', bg: 'var(--warning-light)' },
    FAILED: { color: 'var(--danger)', bg: 'var(--danger-light)' },
    REFUNDED: { color: 'var(--text-muted)', bg: 'var(--bg-hover)' },
  };
  const { color, bg } = map[status] || map.PENDING;
  return (
    <span style={{
      padding: '0.2rem 0.6rem', borderRadius: 20,
      fontSize: '0.7rem', fontWeight: 600, color, background: bg,
    }}>{status}</span>
  );
}

export default function AdminPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    paymentService.adminGetAll()
      .then(({ data }) => setPurchases(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = purchases.filter(p =>
    p.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    p.course_title?.toLowerCase().includes(search.toLowerCase()) ||
    p.payment_status?.toLowerCase().includes(search.toLowerCase())
  );

  const completedPurchases = purchases.filter(p => p.payment_status === 'COMPLETED');
  const totalRevenue = completedPurchases.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Purchases</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{purchases.length} total transactions</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: '#10b981' },
          { label: 'Total Purchases', value: purchases.length, icon: ShoppingCart, color: '#6366f1' },
          { label: 'Completed', value: completedPurchases.length, icon: TrendingUp, color: '#06b6d4' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 380, marginBottom: '1.5rem' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          placeholder="Search purchases..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.5rem',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem',
          }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['User', 'Course', 'Amount', 'Status', 'Method', 'Date'].map(h => (
                  <th key={h} style={{
                    padding: '0.875rem 1.25rem', textAlign: 'left',
                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(purchase => (
                <tr key={purchase.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0,
                      }}>
                        {purchase.user_email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.8rem' }}>{purchase.user_name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{purchase.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <p style={{ fontWeight: 500, fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {purchase.course_title}
                    </p>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                      ${parseFloat(purchase.amount_paid || 0).toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <StatusBadge status={purchase.payment_status} />
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {purchase.payment_method}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(purchase.purchased_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <CreditCard size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>No purchases found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
