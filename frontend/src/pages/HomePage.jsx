import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, TrendingUp, ArrowRight, Play, Star } from 'lucide-react';

const stats = [
  { label: 'Students Enrolled', value: '10,000+', icon: Users },
  { label: 'Expert Courses', value: '500+', icon: BookOpen },
  { label: 'Completion Rate', value: '94%', icon: Award },
  { label: 'Student Growth', value: '200%', icon: TrendingUp },
];

const features = [
  { title: 'Learn at Your Pace', desc: 'Access course content 24/7 on any device. Pause, rewind, and replay as needed.' },
  { title: 'Expert Instructors', desc: 'Learn from industry professionals with real-world experience and expertise.' },
  { title: 'HD Video Content', desc: 'Crystal clear videos with downloadable resources to enhance your learning.' },
  { title: 'Certificate of Completion', desc: 'Earn recognized certificates to showcase your skills and achievements.' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: '90vh',
        display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: '4rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background effects */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(139,92,246,0.1) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--accent-light)', color: 'var(--accent)',
              padding: '0.4rem 1rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
              marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.3)',
            }}>
              <Star size={14} fill="currentColor" />
              #1 Online Learning Platform
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 800, lineHeight: 1.1,
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #f1f5f9 0%, #c7d2fe 50%, #a5b4fc 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Learn Skills That<br />Shape Your Future
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480 }}>
              Join thousands of students mastering new skills with expert-led courses.
              High-quality content, flexible learning, real results.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/courses" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', padding: '0.9rem 2rem',
                borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '1rem',
                boxShadow: '0 0 20px rgba(99,102,241,0.4)',
              }}>
                Explore Courses <ArrowRight size={18} />
              </Link>
              <Link to="/register" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                border: '1px solid var(--border)',
                color: 'var(--text-primary)', padding: '0.9rem 2rem',
                borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '1rem',
              }}>
                <Play size={18} /> Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '3rem 1.5rem',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem',
        }}>
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52, margin: '0 auto 1rem',
                background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={24} color="var(--accent)" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{value}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Why Choose EduCoursePro?</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
              Everything you need to accelerate your learning journey
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem',
          }}>
            {features.map(({ title, desc }, i) => (
              <div key={i} style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '1.75rem',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{
                  width: 44, height: 44, background: 'var(--accent-light)',
                  borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)',
                }}>
                  {i + 1}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        padding: '4rem 1.5rem', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: 'white' }}>
            Ready to Start Learning?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Join thousands of students already transforming their careers.
          </p>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'white', color: '#4f46e5',
            padding: '0.9rem 2.5rem', borderRadius: 'var(--radius-sm)',
            fontWeight: 700, fontSize: '1rem',
          }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
