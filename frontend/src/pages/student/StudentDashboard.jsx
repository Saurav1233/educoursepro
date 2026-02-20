import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { courseService, paymentService } from '../../services/api';
import { BookOpen, Play, TrendingUp, Award, ArrowRight, Clock } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    Promise.all([
      courseService.getMyCourses(),
      paymentService.myPurchases(),
    ])
      .then(([coursesRes, purchasesRes]) => {
        setCourses(coursesRes.data.results || coursesRes.data);
        setPurchases(purchasesRes.data.results || purchasesRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Enrolled Courses', value: courses.length, icon: BookOpen, color: '#6366f1' },
    { label: 'Purchases', value: purchases.length, icon: TrendingUp, color: '#10b981' },
    { label: 'Certificates', value: 0, icon: Award, color: '#f59e0b' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        borderRadius: 'var(--radius)', padding: '2rem', marginBottom: '2rem',
        border: '1px solid rgba(99,102,241,0.3)',
      }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Welcome back, {user?.first_name || user?.email?.split('@')[0]}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Continue your learning journey. You have {courses.length} course{courses.length !== 1 ? 's' : ''} enrolled.
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem', marginBottom: '2rem',
      }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '1.5rem',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-sm)',
              background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <Icon size={22} color={color} />
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 800 }}>{value}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Courses */}
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 700 }}>My Courses</h2>
          <Link to="/dashboard/my-courses" style={{ color: 'var(--accent)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            {[1, 2].map(i => (
              <div key={i} style={{ height: 80, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ marginBottom: '1rem' }}>No courses enrolled yet</p>
            <Link to="/courses" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.875rem',
            }}>
              Browse Courses <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {courses.slice(0, 5).map(course => {
              const thumbnail = course.thumbnail ? `${API_URL}${course.thumbnail}` : null;
              return (
                <Link key={course.id} to={`/dashboard/course/${course.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem', background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                  transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{
                    width: 56, height: 56, flexShrink: 0,
                    background: thumbnail ? `url(${thumbnail}) center/cover` : 'linear-gradient(135deg, #1e1b4b, #312e81)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!thumbnail && <BookOpen size={22} color="rgba(99,102,241,0.6)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{course.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {course.lectures_count} lectures
                    </p>
                  </div>
                  <div style={{
                    width: 36, height: 36, background: 'var(--accent-light)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Play size={16} color="var(--accent)" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
