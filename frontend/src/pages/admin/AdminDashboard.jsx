import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/api';
import { Users, BookOpen, DollarSign, TrendingUp, ShoppingCart, UserCheck, Activity } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function StatCard({ label, value, icon: Icon, color, subtitle }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '1.5rem',
      display: 'flex', alignItems: 'flex-start', gap: '1rem',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-sm)', flexShrink: 0,
        background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>{value}</p>
        {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
      }}>
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color, fontSize: '0.875rem' }}>
            {p.name}: {p.name === 'revenue' ? `$${p.value.toFixed(2)}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboard()
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Admin Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Overview of your platform performance</p>

      {/* Stats Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem', marginBottom: '2rem',
      }}>
        <StatCard label="Total Users" value={stats?.users?.total || 0} icon={Users} color="#6366f1"
          subtitle={`+${stats?.users?.new_this_month || 0} this month`} />
        <StatCard label="Active Students" value={stats?.users?.active_students || 0} icon={UserCheck} color="#10b981" />
        <StatCard label="Total Courses" value={stats?.courses?.total || 0} icon={BookOpen} color="#f59e0b"
          subtitle={`${stats?.courses?.active || 0} active`} />
        <StatCard label="Total Revenue" value={`$${(stats?.revenue?.total || 0).toFixed(2)}`} icon={DollarSign} color="#06b6d4" />
        <StatCard label="Total Purchases" value={stats?.revenue?.total_purchases || 0} icon={ShoppingCart} color="#8b5cf6" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Monthly Revenue */}
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '1.5rem',
        }}>
          <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Monthly Revenue</h2>
          {stats?.revenue?.monthly?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.revenue.monthly}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No revenue data yet
            </div>
          )}
        </div>

        {/* Monthly Purchases */}
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '1.5rem',
        }}>
          <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Monthly Purchases</h2>
          {stats?.revenue?.monthly?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.revenue.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="purchases" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No purchase data yet
            </div>
          )}
        </div>
      </div>

      {/* Top Courses + Recent Purchases */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Top Courses */}
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '1.5rem',
        }}>
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Top Courses</h2>
          {stats?.top_courses?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.top_courses.map((course, idx) => (
                <div key={course.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem', background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--accent-light)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: '0.85rem' }}>{course.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {course.enrollment_count} students · ${parseFloat(course.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No data yet</p>
          )}
        </div>

        {/* Recent Purchases */}
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '1.5rem',
        }}>
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Recent Purchases</h2>
          {stats?.recent_purchases?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {stats.recent_purchases.slice(0, 6).map((purchase, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem', background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0,
                  }}>
                    {purchase.user__email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: '0.8rem' }}>{purchase.user__email}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{purchase.course__title}</p>
                  </div>
                  <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.875rem' }}>
                    ${parseFloat(purchase.amount_paid).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No purchases yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
