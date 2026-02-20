import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, BookOpen, Eye, EyeOff, Users } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const API_URL = 'http://localhost:8000';

  const loadCourses = () => {
    courseService.adminGetAll()
      .then(({ data }) => setCourses(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadCourses, []);

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setDeleting(course.id);
    try {
      await courseService.adminDelete(course.id);
      toast.success('Course deleted');
      setCourses(prev => prev.filter(c => c.id !== course.id));
    } catch {
      toast.error('Failed to delete course');
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (course) => {
    try {
      const formData = new FormData();
      formData.append('is_active', !course.is_active);
      await courseService.adminUpdate(course.id, formData);
      toast.success(course.is_active ? 'Course deactivated' : 'Course activated');
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_active: !c.is_active } : c));
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Courses</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{courses.length} total courses</p>
        </div>
        <Link to="/admin-dashboard/courses/new" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white', padding: '0.7rem 1.25rem',
          borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.875rem',
        }}>
          <Plus size={18} /> Create Course
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : courses.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem',
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        }}>
          <BookOpen size={56} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No courses yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Create your first course to get started</p>
          <Link to="/admin-dashboard/courses/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', padding: '0.7rem 1.5rem',
            borderRadius: 'var(--radius-sm)', fontWeight: 600,
          }}>
            <Plus size={16} /> Create Course
          </Link>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Course', 'Price', 'Students', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '0.875rem 1.25rem', textAlign: 'left',
                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map(course => {
                const thumbnail = course.thumbnail ? `${API_URL}${course.thumbnail}` : null;
                return (
                  <tr key={course.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                          background: thumbnail ? `url(${thumbnail}) center/cover` : 'linear-gradient(135deg, #1e1b4b, #312e81)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {!thumbnail && <BookOpen size={18} color="rgba(99,102,241,0.5)" />}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{course.title}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {course.lectures?.length || 0} lectures
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                        ${parseFloat(course.price).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <Users size={14} /> {course.enrolled_count || 0}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <button
                        onClick={() => toggleActive(course)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6, padding: '0.3rem 0.8rem',
                          borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                          background: course.is_active ? 'var(--success-light)' : 'var(--warning-light)',
                          color: course.is_active ? 'var(--success)' : 'var(--warning)',
                          border: 'none',
                        }}
                      >
                        {course.is_active ? <><Eye size={12} /> Active</> : <><EyeOff size={12} /> Inactive</>}
                      </button>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link
                          to={`/admin-dashboard/courses/${course.id}/edit`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            background: 'var(--accent-light)', color: 'var(--accent)',
                            padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem', fontWeight: 600,
                          }}
                        >
                          <Edit size={13} /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(course)}
                          disabled={deleting === course.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            background: 'var(--danger-light)', color: 'var(--danger)',
                            padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} /> {deleting === course.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
