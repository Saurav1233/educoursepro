import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { courseService } from '../../services/api';
import { Play, Lock, FileText, Youtube } from 'lucide-react';

function getYouTubeEmbed(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
  return null;
}

export default function CoursePlayer() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [lectureData, setLectureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    courseService.getById(courseId)
      .then(({ data }) => {
        setCourse(data);
        if (data.lectures?.length > 0) {
          const first = data.lectures[0];
          setSelectedLecture(first);
          loadLecture(first.id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId]);

  const loadLecture = async (lectureId) => {
    try {
      const { data } = await courseService.getLectureAccess(courseId, lectureId);
      setLectureData(data);
    } catch {
      setLectureData(null);
    }
  };

  const handleLectureSelect = (lecture) => {
    setSelectedLecture(lecture);
    loadLecture(lecture.id);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!course) return <Navigate to="/dashboard/my-courses" />;

  const embedUrl = lectureData ? getYouTubeEmbed(lectureData.youtube_url) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', minHeight: '80vh' }}>

      {/* Video Player */}
      <div>
        <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.75rem' }}>{course.title}</h1>

        {lectureData ? (
          <div>
            {embedUrl ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <iframe
                  key={embedUrl}
                  src={embedUrl}
                  title={lectureData.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </div>
            ) : lectureData.video_file ? (
              <div style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <video key={lectureData.video_file} controls
                  style={{ width: '100%', maxHeight: 480, background: '#000' }}
                  src={`${API_URL}${lectureData.video_file}`} />
              </div>
            ) : (
              <div style={{ height: 240, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <Youtube size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p>No video for this lecture</p>
              </div>
            )}

            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: '1.5rem', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                {lectureData.youtube_url && <Youtube size={18} color="#ff0000" />}
                <h2 style={{ fontWeight: 700 }}>{lectureData.title}</h2>
                {lectureData.is_free && (
                  <span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '0.15rem 0.6rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>FREE</span>
                )}
              </div>
              {lectureData.description && (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>{lectureData.description}</p>
              )}
              {lectureData.notes_pdf && (
                <a href={`${API_URL}${lectureData.notes_pdf}`} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-light)', color: 'var(--accent)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.875rem' }}>
                  <FileText size={16} /> Download Notes PDF
                </a>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Lock size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>Select a lecture to start watching</p>
          </div>
        )}
      </div>

      {/* Lecture List */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', height: 'fit-content', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            Course Content ({course.lectures?.length} lectures)
          </h3>
        </div>
        <div style={{ maxHeight: 600, overflowY: 'auto' }}>
          {course.lectures?.map((lecture, idx) => {
            const isSelected = selectedLecture?.id === lecture.id;
            return (
              <button key={lecture.id} onClick={() => handleLectureSelect(lecture)} style={{
                width: '100%', display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '1rem 1.25rem',
                background: isSelected ? 'var(--accent-light)' : 'transparent',
                borderBottom: '1px solid var(--border)',
                color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                textAlign: 'left', cursor: 'pointer', transition: 'background 0.2s', border: 'none',
              }}>
                <div style={{
                  width: 30, height: 30, flexShrink: 0, borderRadius: '50%',
                  background: isSelected ? 'var(--accent)' : lecture.youtube_url ? '#ff000015' : 'var(--bg-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {lecture.youtube_url
                    ? <Youtube size={14} color={isSelected ? 'white' : '#ff0000'} />
                    : <Play size={13} color={isSelected ? 'white' : 'var(--text-muted)'} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: isSelected ? 600 : 400, lineHeight: 1.4 }}>
                    {idx + 1}. {lecture.title}
                  </p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    {lecture.is_free && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--success)', background: 'var(--success-light)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>FREE</span>
                    )}
                    {lecture.duration_minutes > 0 && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{lecture.duration_minutes} min</span>
                    )}
                    {lecture.notes_pdf && <FileText size={12} color="var(--text-muted)" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}