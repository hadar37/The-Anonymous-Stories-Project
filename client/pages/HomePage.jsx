
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function HomePage({ setCurrentPage }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // מצבי עריכה
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/stories');
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'שגיאה בטעינת הסיפורים');

      setStories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // פונקציית מחיקה (אדמין בלבד)
  const handleDelete = async (storyId) => {
    if (!window.confirm('האם את/ה בטוח/ה שברצונך למחוק סיפור זה?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'נכשל במחיקת הסיפור');

      setStories((prevStories) => prevStories.filter((s) => s._id !== storyId));
    } catch (err) {
      alert(`שגיאה במחיקה: ${err.message}`);
    }
  };

  // התחלת מצב עריכה
  const handleStartEdit = (story) => {
    setEditingStoryId(story._id);
    setEditTitle(story.title);
    setEditContent(story.content);
  };

  // שמירת הסיפור הערוך מול ה-API
  const handleSaveEdit = async (storyId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/stories/${storyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: editTitle, content: editContent })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'עדכון הסיפור נכשל');

      // עדכון ה-State המקומי
      setStories((prev) =>
        prev.map((s) => (s._id === storyId ? { ...s, title: editTitle, content: editContent } : s))
      );
      setEditingStoryId(null);
    } catch (err) {
      alert(`שגיאה בעריכה: ${err.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.heroSection}>
        <h1 style={styles.mainTitle}>המקום לסיפור שלך 🌱</h1>
        <p style={styles.subtitle}>
          פלטפורמה אנונימית ובטוחה לשיתוף סיפורים אישיים, חיזוק הדדי, ומציאת השראה.
        </p>
        <div style={styles.heroButtons}>
          <button style={styles.primaryBtn} onClick={() => setCurrentPage('personal')}>
            ✍️ שתף/י את הסיפור שלך
          </button>
          <button style={styles.secondaryBtn} onClick={() => setCurrentPage('cards')}>
            🎴 קבל/י מסר מחזק
          </button>
        </div>
      </header>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <section style={styles.feedSection}>
        <h2 style={styles.sectionTitle}>💬 סיפורים מן הקהילה</h2>

        {loading ? (
          <p style={styles.loadingText}>טוען סיפורים...</p>
        ) : stories.length === 0 ? (
          <p style={styles.emptyText}>עדיין אין סיפורים בקהילה. היו הראשונים לשתף!</p>
        ) : (
          <div style={styles.storiesGrid}>
            {stories.map((story) => {
              // בדיקת הרשאות עריכה/מחיקה
              const isAuthor = user && (story.author?._id === user._id || story.author === user._id);
              const isAdmin = user?.role === 'admin';
              const canEditOrDelete = isAdmin || isAuthor;

              return (
                <div key={story._id} style={styles.storyCard}>
                  <div>
                    <div style={styles.cardHeader}>
                      <span style={styles.authorName}>
                        👤 {story.author?.name || 'כותב/ת אנונימי/ת'}
                      </span>
                      {story.isSuccessStory && (
                        <span style={styles.badge}>🌟 סיפור הצלחה</span>
                      )}
                    </div>

                    {editingStoryId === story._id ? (
                      /* טופס עריכה בלייב */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          style={styles.editInput}
                        />
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows="4"
                          style={styles.editTextarea}
                        />
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => handleSaveEdit(story._id)} style={styles.saveBtn}>💾 שמור</button>
                          <button onClick={() => setEditingStoryId(null)} style={styles.cancelBtn}>ביטול</button>
                        </div>
                      </div>
                    ) : (
                      /* תצוגה רגילה */
                      <>
                        <h3 style={styles.storyTitle}>{story.title}</h3>
                        <p style={styles.storyContent}>{story.content}</p>
                      </>
                    )}
                  </div>

                  <div style={styles.cardFooter}>
                    <span style={styles.dateText}>
                      {new Date(story.createdAt || Date.now()).toLocaleDateString('he-IL')}
                    </span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* כפתור עריכה למחבר או לאדמין */}
                      {canEditOrDelete && editingStoryId !== story._id && (
                        <button onClick={() => handleStartEdit(story)} style={styles.editBtn}>
                          ✏️ ערוך
                        </button>
                      )}

                      {/* כפתור מחיקה לאדמין */}
                      {isAdmin || isAuthor && (
                        <button onClick={() => handleDelete(story._id)} style={styles.deleteBtn}>
                          🗑️ מחק
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '30px 20px', direction: 'rtl' },
  heroSection: { textAlign: 'center', background: 'linear-gradient(135deg, #fefae0 0%, #e9edc9 100%)', padding: '40px 20px', borderRadius: '20px', marginBottom: '40px' },
  mainTitle: { fontSize: '36px', color: '#2b2d42', marginBottom: '15px', fontWeight: '800' },
  subtitle: { fontSize: '18px', color: '#555', maxWidth: '600px', margin: '0 auto 25px auto', lineHeight: '1.6' },
  heroButtons: { display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' },
  primaryBtn: { background: '#6b8e23', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '25px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  secondaryBtn: { background: '#ffffff', color: '#bc6c25', border: '2px solid #dda15e', padding: '12px 24px', borderRadius: '25px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  feedSection: { marginTop: '20px' },
  sectionTitle: { fontSize: '22px', color: '#1d3557', marginBottom: '20px', borderBottom: '2px solid #e9edc9', paddingBottom: '10px' },
  storiesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  storyCard: { background: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  authorName: { fontSize: '13px', color: '#6c757d', fontWeight: 'bold' },
  badge: { background: '#fefae0', color: '#bc6c25', border: '1px solid #dda15e', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' },
  storyTitle: { fontSize: '18px', color: '#2b2d42', margin: '0 0 10px 0' },
  storyContent: { color: '#4a5568', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '15px' },
  cardFooter: { borderTop: '1px dashed #eee', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: '12px', color: '#a0aec0' },
  deleteBtn: { background: '#e63946', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  editBtn: { background: '#4a5568', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  saveBtn: { background: '#2b8a3e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' },
  cancelBtn: { background: '#868e96', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' },
  editInput: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', width: '100%' },
  editTextarea: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', width: '100%', resize: 'vertical' },
  loadingText: { textAlign: 'center', color: '#888', padding: '30px' },
  emptyText: { textAlign: 'center', color: '#666', padding: '30px' },
  errorBanner: { background: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }
};