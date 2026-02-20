import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService, paymentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  BookOpen, Play, Lock, CheckCircle, ArrowLeft,
  FileText, Users, Clock, DollarSign, Star
} from 'lucide-react';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    courseService.getById(id)
      .then(({ data }) => setCourse(data))
      .catch(() => navigate('/courses'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please login to purchase this course');
      navigate('/login');
      return;
    }
    setPurchasing(true);
    try {
      await paymentService.purchase(course.id);
      toast.success('Course purchased successfully! 🎉');
      // Reload course to get full access
      const { data } = await courseService.getById(id);
      setCourse(data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Purchase failed. Please try again.';
      toast.error(msg);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!course) return null;

  const thumbnail = course.thumbnail ? `${API_URL}${course.thumbnail}` : null;
  // const introVideo = course.intro_video ? `${API_URL}${course.intro_video}` : null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link to="/courses" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to courses
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
        {/* Main Content */}
        <div>
          {/* Header */}
          <div style={{
            height: 300, background: thumbnail ? `url(${thumbnail}) center/cover` : 'linear-gradient(135deg, #1e1b4b, #312e81)',
            borderRadius: 'var(--radius)', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            {!thumbnail && <BookOpen size={72} color="rgba(99,102,241,0.4)" />}
            {course.is_purchased && (
              <div style={{
                position: 'absolute', top: 16, right: 16,
                background: 'var(--success)', color: 'white',
                padding: '0.4rem 1rem', borderRadius: 20, fontWeight: 600, fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <CheckCircle size={14} /> Enrolled
              </div>
            )}
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>{course.title}</h1>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <BookOpen size={15} /> {course.lectures_count} lectures
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <Users size={15} /> {course.enrolled_count} students
            </span>
          </div>

          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem',
          }}>
            <h2 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>About This Course</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{course.description}</p>
          </div>

          {/* Intro Video */}
          {/* Intro Video - YouTube or File */}
          {(course.youtube_intro_embed || course.intro_video) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Course Preview</h2>
              {course.youtube_intro_embed ? (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <iframe
                    src={course.youtube_intro_embed}
                    title="Course Preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  />
                </div>
              ) : (
                <video controls
                  style={{ width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                  src={`http://localhost:8000${course.intro_video}`}
                />
              )}
            </div>
          )}
          {/* Lectures */}
          <div>
            <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Course Content</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {course.lectures?.map((lecture, idx) => (
                <div key={lecture.id} style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: lecture.is_free ? 'var(--success-light)' : 'var(--accent-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {lecture.is_free || course.is_purchased
                      ? <Play size={16} color={lecture.is_free ? 'var(--success)' : 'var(--accent)'} />
                      : <Lock size={16} color="var(--text-muted)" />
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      {idx + 1}. {lecture.title}
                    </p>
                    {lecture.duration_minutes > 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                        {lecture.duration_minutes} min
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {lecture.is_free && (
                      <span style={{
                        background: 'var(--success-light)', color: 'var(--success)',
                        padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
                      }}>
                        FREE
                      </span>
                    )}
                    {lecture.notes_pdf && (
                      <span style={{ color: 'var(--text-muted)' }}><FileText size={15} /></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '1.75rem',
          }}>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '1.5rem' }}>
              ${parseFloat(course.price).toFixed(2)}
            </p>

            {course.is_purchased ? (
              <div>
                <div style={{
                  background: 'var(--success-light)', border: '1px solid var(--success)',
                  borderRadius: 'var(--radius-sm)', padding: '1rem',
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem',
                  color: 'var(--success)', fontWeight: 600,
                }}>
                  <CheckCircle size={18} /> You're enrolled!
                </div>
                {user && (
                  <Link
                    to={`/dashboard/course/${course.id}`}
                    style={{
                      display: 'block', textAlign: 'center',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white', padding: '0.9rem',
                      borderRadius: 'var(--radius-sm)', fontWeight: 700,
                    }}
                  >
                    Continue Learning
                  </Link>
                )}
              </div>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                style={{
                  width: '100%', padding: '0.9rem',
                  background: purchasing ? 'var(--border)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', borderRadius: 'var(--radius-sm)',
                  fontWeight: 700, fontSize: '1rem', cursor: purchasing ? 'not-allowed' : 'pointer',
                  marginBottom: '1rem',
                }}
              >
                {purchasing ? 'Processing...' : 'Enroll Now'}
              </button>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {[
                { icon: BookOpen, text: `${course.lectures_count} lectures` },
                { icon: Users, text: `${course.enrolled_count} students enrolled` },
                { icon: Clock, text: 'Lifetime access' },
                { icon: FileText, text: 'Downloadable resources' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <Icon size={16} color="var(--accent)" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
