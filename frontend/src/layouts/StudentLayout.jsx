import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LayoutDashboard, BookOpen, LogOut, BookMarked, User } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/my-courses', icon: BookOpen, label: 'My Courses' },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <aside style={{
        width: 240,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
      }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookMarked size={22} color="var(--accent)" />
            <span style={{ fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EduCoursePro
            </span>
          </Link>
        </div>

        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0.75rem', background: 'var(--bg-hover)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.875rem', fontWeight: 700, color: 'white',
            }}>
              {user?.full_name?.[0] || user?.email?.[0] || 'S'}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user?.full_name || user?.email}
              </p>
              <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Student</span>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0.75rem 0.5rem' }}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
                marginBottom: 4,
                background: isActive ? 'var(--accent-light)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400, fontSize: '0.875rem',
                transition: 'all 0.2s',
              })}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          <Link
            to="/courses"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
              marginBottom: 4, background: 'transparent',
              color: 'var(--text-secondary)', fontSize: '0.875rem',
            }}
          >
            <BookOpen size={18} />
            <span>Browse Courses</span>
          </Link>
        </nav>

        <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
              background: 'transparent', color: 'var(--danger)',
              fontSize: '0.875rem', width: '100%',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
