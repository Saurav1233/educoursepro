import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/api';
import { BookOpen, Play, ArrowRight } from 'lucide-react';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    courseService.getMyCourses()
      .then(({ data }) => setCourses(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>My Courses</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        {courses.length} course{courses.length !== 1 ? 's' : ''} enrolled
      </p>

      {courses.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem',
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        }}>
          <BookOpen size={56} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No courses yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Browse and enroll in courses to start learning</p>
          <Link to="/courses" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', padding: '0.7rem 1.5rem',
            borderRadius: 'var(--radius-sm)', fontWeight: 600,
          }}>
            Browse Courses <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {courses.map(course => {
            const thumbnail = course.thumbnail ? `${API_URL}${course.thumbnail}` : null;
            return (
              <div key={course.id} style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
              }}>
                <div style={{
                  height: 160,
                  background: thumbnail ? `url(${thumbnail}) center/cover` : 'linear-gradient(135deg, #1e1b4b, #312e81)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!thumbnail && <BookOpen size={44} color="rgba(99,102,241,0.4)" />}
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{course.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    {course.lectures_count} lectures
                  </p>
                  <Link
                    to={`/dashboard/course/${course.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white', padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.875rem',
                    }}
                  >
                    <Play size={16} /> Continue Learning
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
