import { useState, useEffect } from 'react';
import { adminUserService } from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Search, UserCheck, UserX, Shield, BookOpen } from 'lucide-react';

function Badge({ children, color, bg }) {
  return (
    <span style={{
      padding: '0.2rem 0.6rem', borderRadius: 20,
      fontSize: '0.7rem', fontWeight: 600, color, background: bg,
    }}>{children}</span>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminUserService.getAll()
      .then(({ data }) => setUsers(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (user) => {
    try {
      await adminUserService.update(user.id, { is_active: !user.is_active });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
      toast.success(user.is_active ? 'User deactivated' : 'User activated');
    } catch {
      toast.error('Update failed');
    }
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'STUDENT').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    active: users.filter(u => u.is_active).length,
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Users</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{users.length} registered users</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total', value: stats.total, color: '#6366f1', icon: Users },
          { label: 'Students', value: stats.students, color: '#10b981', icon: BookOpen },
          { label: 'Admins', value: stats.admins, color: '#f59e0b', icon: Shield },
          { label: 'Active', value: stats.active, color: '#06b6d4', icon: UserCheck },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} color={color} />
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
          placeholder="Search users..."
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
                {['User', 'Role', 'Purchased', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '0.875rem 1.25rem', textAlign: 'left',
                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: user.role === 'ADMIN'
                          ? 'linear-gradient(135deg, #f59e0b, #f97316)'
                          : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0,
                      }}>
                        {user.full_name?.[0] || user.email?.[0] || '?'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.full_name || '-'}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {user.role === 'ADMIN'
                      ? <Badge color="#f59e0b" bg="rgba(245,158,11,0.15)">ADMIN</Badge>
                      : <Badge color="#6366f1" bg="rgba(99,102,241,0.15)">STUDENT</Badge>
                    }
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <BookOpen size={13} /> {user.purchased_courses_count || 0}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {user.is_active
                      ? <Badge color="var(--success)" bg="var(--success-light)">Active</Badge>
                      : <Badge color="var(--danger)" bg="var(--danger-light)">Inactive</Badge>
                    }
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <button
                      onClick={() => toggleActive(user)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: user.is_active ? 'var(--danger-light)' : 'var(--success-light)',
                        color: user.is_active ? 'var(--danger)' : 'var(--success)',
                        padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)',
                        fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', border: 'none',
                      }}
                    >
                      {user.is_active ? <><UserX size={12} /> Deactivate</> : <><UserCheck size={12} /> Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
