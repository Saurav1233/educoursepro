import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Plus, Trash2, Upload, Youtube, Play } from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem',
  background: 'var(--bg-primary)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
  fontSize: '0.875rem',
};

const labelStyle = {
  display: 'block', fontSize: '0.8rem', fontWeight: 600,
  color: 'var(--text-secondary)', marginBottom: '0.5rem',
};

function getYouTubeEmbed(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}

function LectureForm({ courseId, onSaved }) {
  const [form, setForm] = useState({
    title: '', description: '', is_free: false,
    order: 0, duration_minutes: 0, youtube_url: ''
  });
  const [notes, setNotes] = useState(null);
  const [saving, setSaving] = useState(false);
  const embedUrl = getYouTubeEmbed(form.youtube_url);

  const handleSave = async () => {
    if (!form.title) { toast.error('Lecture title required'); return; }
    if (!form.youtube_url) { toast.error('YouTube URL required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (notes) fd.append('notes_pdf', notes);
      await courseService.adminCreateLecture(courseId, fd);
      toast.success('Lecture added!');
      setForm({ title: '', description: '', is_free: false, order: 0, duration_minutes: 0, youtube_url: '' });
      setNotes(null);
      onSaved?.();
    } catch {
      toast.error('Failed to add lecture');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-primary)', border: '1px dashed var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '1.25rem', marginTop: '0.75rem',
    }}>
      <h4 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.875rem' }}>Add New Lecture</h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={labelStyle}>Lecture Title *</label>
          <input style={inputStyle} value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Introduction to React" />
        </div>
        <div>
          <label style={labelStyle}>Order</label>
          <input type="number" style={inputStyle} value={form.order}
            onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Youtube size={14} color="#ff0000" /> YouTube Video URL *
          </span>
        </label>
        <input
          style={{ ...inputStyle, borderColor: form.youtube_url ? 'var(--success)' : 'var(--border)' }}
          value={form.youtube_url}
          onChange={e => setForm({ ...form, youtube_url: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=xxxxxxxxxx"
        />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 4 }}>
          Paste your YouTube video link here
        </p>
      </div>

      {embedUrl && (
        <div style={{ marginBottom: '1rem', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--success)' }}>
          <iframe width="100%" height="200" src={embedUrl} title="Preview"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={labelStyle}>Duration (mins)</label>
          <input type="number" style={inputStyle} value={form.duration_minutes}
            onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
        </div>
        <div>
          <label style={labelStyle}>Notes PDF (optional)</label>
          <input type="file" accept=".pdf" onChange={e => setNotes(e.target.files[0])}
            style={{ ...inputStyle, padding: '0.5rem' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_free}
              onChange={e => setForm({ ...form, is_free: e.target.checked })} />
            <span style={{ fontSize: '0.875rem' }}>Free preview</span>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Description</label>
        <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="What will students learn in this lecture?" />
      </div>

      <button onClick={handleSave} disabled={saving} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--success-light)', color: 'var(--success)',
        padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)',
        fontWeight: 600, fontSize: '0.8rem',
        cursor: saving ? 'not-allowed' : 'pointer', border: 'none',
      }}>
        <Plus size={14} /> {saving ? 'Saving...' : 'Add Lecture'}
      </button>
    </div>
  );
}

export default function AdminCourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '', description: '', price: '',
    is_active: true, youtube_intro_url: ''
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [showLectureForm, setShowLectureForm] = useState(false);

  const introEmbedUrl = getYouTubeEmbed(form.youtube_intro_url);

  useEffect(() => {
    if (isEdit) {
      courseService.adminGetAll()
        .then(({ data }) => {
          const courses = data.results || data;
          const course = courses.find(c => c.id === Number(id));
          if (course) {
            setForm({
              title: course.title,
              description: course.description,
              price: course.price,
              is_active: course.is_active,
              youtube_intro_url: course.youtube_intro_url || '',
            });
            setLectures(course.lectures || []);
          }
        })
        .catch(() => navigate('/admin-dashboard/courses'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const loadLectures = async () => {
    if (!isEdit) return;
    try {
      const { data } = await courseService.adminGetLectures(id);
      setLectures(data.results || data);
    } catch {}
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) { toast.error('Title and price are required'); return; }
    setSaving(true);
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('is_active', form.is_active);
    fd.append('youtube_intro_url', form.youtube_intro_url);
    if (thumbnail) fd.append('thumbnail', thumbnail);

    try {
      if (isEdit) {
        await courseService.adminUpdate(id, fd);
        toast.success('Course updated!');
      } else {
        const { data } = await courseService.adminCreate(fd);
        toast.success('Course created! Now add your lectures.');
        navigate(`/admin-dashboard/courses/${data.id}/edit`);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLecture = async (lecture) => {
    if (!window.confirm('Delete this lecture?')) return;
    try {
      await courseService.adminDeleteLecture(id, lecture.id);
      toast.success('Lecture deleted');
      loadLectures();
    } catch {
      toast.error('Failed to delete lecture');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/admin-dashboard/courses" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Courses
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{isEdit ? 'Edit Course' : 'Create Course'}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
        <form onSubmit={handleSave}>

          {/* Course Details */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Course Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Course Title *</label>
                <input style={inputStyle} value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Complete React Developer Course" required />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What will students learn?" />
              </div>
              <div>
                <label style={labelStyle}>Price ($) *</label>
                <input type="number" step="0.01" min="0" style={inputStyle}
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="29.99" required />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                <span style={{ fontSize: '0.875rem' }}>Publish course (visible to students)</span>
              </label>
            </div>
          </div>

          {/* Media */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Media</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Course Thumbnail Image</label>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', textAlign: 'center' }}>
                <Upload size={22} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>JPG, PNG image</p>
                <input type="file" accept="image/*" onChange={e => setThumbnail(e.target.files[0])}
                  style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                {thumbnail && <p style={{ color: 'var(--success)', fontSize: '0.75rem', marginTop: 6 }}>✓ {thumbnail.name}</p>}
              </div>
            </div>

            <div>
              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Youtube size={15} color="#ff0000" /> Course Intro Video — YouTube URL (FREE preview)
                </span>
              </label>
              <input
                style={{ ...inputStyle, borderColor: form.youtube_intro_url ? 'var(--success)' : 'var(--border)' }}
                value={form.youtube_intro_url}
                onChange={e => setForm({ ...form, youtube_intro_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=xxxxxxxxxx"
              />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 4 }}>
                This video is FREE — anyone can watch it as a course preview
              </p>
              {introEmbedUrl && (
                <div style={{ marginTop: '0.75rem', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--success)' }}>
                  <iframe width="100%" height="220" src={introEmbedUrl} title="Intro Preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen />
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: saving ? 'var(--border)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', padding: '0.8rem 2rem',
            borderRadius: 'var(--radius-sm)', fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', border: 'none',
          }}>
            <Save size={18} /> {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Course'}
          </button>
        </form>

        {/* Lectures Panel */}
        <div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Lectures ({lectures.length})</h2>
              {isEdit && (
                <button onClick={() => setShowLectureForm(!showLectureForm)} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: showLectureForm ? 'var(--danger-light)' : 'var(--accent-light)',
                  color: showLectureForm ? 'var(--danger)' : 'var(--accent)',
                  padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                  fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', border: 'none',
                }}>
                  <Plus size={14} /> {showLectureForm ? 'Cancel' : 'Add Lecture'}
                </button>
              )}
            </div>

            {!isEdit && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1.5rem' }}>
                Save the course first, then add lectures
              </p>
            )}

            {isEdit && showLectureForm && (
              <LectureForm courseId={id} onSaved={() => { loadLectures(); setShowLectureForm(false); }} />
            )}

            {lectures.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: showLectureForm ? '1rem' : 0, maxHeight: 450, overflowY: 'auto' }}>
                {lectures.map((lecture, idx) => (
                  <div key={lecture.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: lecture.youtube_url ? '#ff000020' : 'var(--bg-hover)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {lecture.youtube_url
                        ? <Youtube size={14} color="#ff0000" />
                        : <Play size={14} color="var(--text-muted)" />}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontWeight: 500, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {idx + 1}. {lecture.title}
                      </p>
                      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                        {lecture.is_free && <span style={{ fontSize: '0.65rem', color: 'var(--success)' }}>FREE</span>}
                        {lecture.youtube_url && <span style={{ fontSize: '0.65rem', color: '#ff4444' }}>YouTube</span>}
                      </div>
                    </div>
                    {isEdit && (
                      <button onClick={() => handleDeleteLecture(lecture)}
                        style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {lectures.length === 0 && isEdit && !showLectureForm && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1.5rem 0' }}>
                No lectures yet. Click "Add Lecture" to add your YouTube videos.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}