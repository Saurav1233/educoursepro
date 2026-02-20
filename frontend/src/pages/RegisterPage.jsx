import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Eye, EyeOff, BookMarked, ArrowRight } from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
  background: 'var(--bg-primary)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
  fontSize: '0.875rem', transition: 'border-color 0.2s',
};

function Field({ label, icon: Icon, error, ...props }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          style={{
            ...inputStyle,
            borderColor: error ? 'var(--danger)' : 'var(--border)',
          }}
          onFocus={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
          {...props}
        />
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: 4 }}>{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', username: '', first_name: '', last_name: '',
    password: '', password_confirm: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.password_confirm) {
      setErrors({ password_confirm: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data || {};
      const newErrors = {};
      Object.keys(data).forEach(key => {
        newErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
      });
      setErrors(newErrors);
      toast.error('Registration failed. Please check the form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      padding: '1.5rem',
    }}>
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '2.5rem',
        width: '100%', maxWidth: 460,
        boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.4s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: 56, height: 56,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookMarked size={28} color="white" />
            </div>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create an account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Join EduCoursePro and start learning today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="First name" icon={User} type="text" placeholder="John" value={form.first_name} onChange={set('first_name')} error={errors.first_name} required />
            <Field label="Last name" icon={User} type="text" placeholder="Doe" value={form.last_name} onChange={set('last_name')} error={errors.last_name} required />
          </div>

          <Field label="Email address" icon={Mail} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} required />
          <Field label="Username" icon={User} type="text" placeholder="johndoe" value={form.username} onChange={set('username')} error={errors.username} required />

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={set('password')}
                style={{ ...inputStyle, paddingRight: '2.5rem', borderColor: errors.password ? 'var(--danger)' : 'var(--border)' }}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: 4 }}>{errors.password}</p>}
          </div>

          <Field
            label="Confirm password" icon={Lock}
            type={showPass ? 'text' : 'password'} placeholder="Repeat password"
            value={form.password_confirm} onChange={set('password_confirm')}
            error={errors.password_confirm} required
          />

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '0.8rem',
              background: loading ? 'var(--border)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', borderRadius: 'var(--radius-sm)',
              fontWeight: 600, fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem',
            }}
          >
            {loading ? 'Creating account...' : (<>Create Account <ArrowRight size={16} /></>)}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
