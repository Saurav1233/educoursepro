import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../services/api';
import { BookOpen, Users, DollarSign, Search, Clock, ArrowRight, CheckCircle } from 'lucide-react';

function CourseCard({ course }) {
  const API_URL = 'http://localhost:8000';
  const thumbnail = course.thumbnail ? `${API_URL}${course.thumbnail}` : null;

  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', overflow: 'hidden',
      transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{
        height: 180, background: thumbnail ? `url(${thumbnail}) center/cover` : 'linear-gradient(135deg, #1e1b4b, #312e81)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        {!thumbnail && <BookOpen size={48} color="rgba(99,102,241,0.5)" />}
        {course.is_purchased && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'var(--success)', color: 'white',
            padding: '0.25rem 0.6rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <CheckCircle size={12} /> Purchased
          </div>
        )}
      </div>

      <div style={{ padding: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem', lineHeight: 1.4 }}>{course.title}</h3>
        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5,
          marginBottom: '1rem',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {course.description}
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={13} /> {course.lectures_count} lectures
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={13} /> {course.enrolled_count} students
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)' }}>
            ${parseFloat(course.price).toFixed(2)}
          </span>
          <Link to={`/courses/${course.id}`} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--accent-light)', color: 'var(--accent)',
            padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem', fontWeight: 600,
          }}>
            View <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    courseService.getAll()
      .then(({ data }) => setCourses(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Browse Courses</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Discover skills that will transform your career</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 480, marginBottom: '2rem' }}>
        <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.75rem',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem',
          }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 340, background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>No courses found</p>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filtered.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        </>
      )}
    </div>
  );
}
