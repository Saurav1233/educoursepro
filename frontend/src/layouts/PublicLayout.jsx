import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { BookOpen, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

// Inside component:
const { theme, toggleTheme } = useTheme();

// Inside JSX (in navbar):
<button
  onClick={toggleTheme}
  className="theme-toggle"
  title="Toggle theme"
/>
export default function PublicLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '0 1.5rem',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '1.2rem' }}>
            <BookOpen size={24} color="var(--accent)" />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EduCoursePro
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/courses" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
              Courses
            </Link>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link
                  to={user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--accent-light)', color: 'var(--accent)',
                    padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem', fontWeight: 500,
                  }}
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--danger-light)', color: 'var(--danger)',
                    padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                  }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to="/login" style={{
                  color: 'var(--text-secondary)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                }}>
                  Login
                </Link>
                <Link to="/register" style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  padding: '0.4rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
      }}>
        <p>© 2024 EduCoursePro. All rights reserved.</p>
      </footer>
    </div>
  );
}
