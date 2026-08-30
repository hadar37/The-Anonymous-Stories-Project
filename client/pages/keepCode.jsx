


import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function PersonalArea() {
  const { user } = useContext(AuthContext);
  useEffect(() => {
  if (user?.token) {
    fetchMyStories();
  }
}, [user]);

  // מצבים לטופס יצירת סיפור חדש
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSuccessStory, setIsSuccessStory] = useState(false);

  // מצבים לניהול סיפורים וטעינה
  const [userStories, setUserStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // מצב לעריכת סיפור קיים
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // טעינת הסיפורים של המשתמש בעת עליות הרכיב
  useEffect(() => {
    fetchMyStories();
  }, []);

 const fetchMyStories = async () => {
  if (!user?.token) return;

  try {
    setLoading(true);
    const res = await fetch('http://localhost:5000/api/stories', {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'שגיאה שטעינת הסיפורים');

    // מזהה המשתמש המחובר כמחרוזת
    const currentUserId = String(user._id || user.id || '');

    // סינון בטוח - המרת מזהה המחבר למחרוזת
    const myStories = data.filter(story => {
      const authorId = typeof story.author === 'object' 
        ? (story.author._id || story.author.id) 
        : story.author;
        
      return String(authorId) === currentUserId;
    });

    setUserStories(myStories);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  // שליחת סיפור חדש
  const handleCreateStory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title.trim() || !content.trim()) {
      setError('נא למלא את הכותרת ותוכן הסיפור');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          title,
          content,
          isSuccessStory,
          storyID: Date.now().toString() // מזהה ייחודי קצר אם נדרש בשרת
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'שגיאה ביצירת הסיפור');

      setSuccessMsg('הסיפור שלך פורסם בהצלחה! ✨');
      setTitle('');
      setContent('');
      setIsSuccessStory(false);

      // רענון רשימת הסיפורים
      fetchMyStories();
    } catch (err) {
      setError(err.message);
    }
  };

  // מחיקת סיפור
  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('האם ברצונך למחוק סיפור זה?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'שגיאה במחיקת הסיפור');

      setUserStories(prev => prev.filter(story => story._id !== storyId));
      setSuccessMsg('הסיפור נמחק בהצלחה');
    } catch (err) {
      setError(err.message);
    }
  };

  // התחלת מצב עריכה
  const startEditing = (story) => {
    setEditingStoryId(story._id);
    setEditTitle(story.title);
    setEditContent(story.content || '');
  };

  // שמירת עריכת סיפור
  const handleUpdateStory = async (storyId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/stories/${storyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'שגיאה בעדכון הסיפור');

      setEditingStoryId(null);
      setSuccessMsg('הסיפור עודכן בהצלחה');
      fetchMyStories();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>🌱 האזור האישי שלך</h2>
        <p>מקום בטוח לכתוב, לשתף ולעקוב אחר הסיפורים שלך</p>
      </header>

      {/* הודעות שגיאה או הצלחה */}
      {error && <div style={styles.errorBanner}>{error}</div>}
      {successMsg && <div style={styles.successBanner}>{successMsg}</div>}

      {/* חלק 1: טופס כתיבת סיפור חדש */}
      <section style={styles.sectionCard}>
        <h3>✍️ כתיבת סיפור חדש</h3>
        <form onSubmit={handleCreateStory} style={styles.form}>
          <input
            type="text"
            placeholder="כותרת הסיפור..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
            required
          />

          <textarea
            placeholder="שתף/י את הסיפור שלך כגון: מה עבר עליך, מה עזר לך או משהו שתרצה/י לפרוק..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={styles.textarea}
            rows={6}
            required
          />

          <div style={styles.checkboxContainer}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isSuccessStory}
                onChange={(e) => setIsSuccessStory(e.target.checked)}
              />
              {' '}תייג כ"סיפור הצלחה" 🌟 (להעצמה והשראה של אחרים)
            </label>
          </div>

          <button type="submit" style={styles.publishBtn}>
            פרסם סיפור אנונימי 🚀
          </button>
        </form>
      </section>

      {/* חלק 2: רשימת הסיפורים שלי */}
      <section style={styles.sectionCard}>
        <h3>📚 הסיפורים שלי ({userStories.length})</h3>

        {loading ? (
          <p style={styles.infoText}>טוען סיפורים...</p>
        ) : userStories.length === 0 ? (
          <p style={styles.infoText}>עדיין לא פרסמת סיפורים. זה הזמן לכתוב את הסיפור הראשון שלך!</p>
        ) : (
          <div style={styles.storiesList}>
            {userStories.map((story) => (
              <div key={story._id} style={styles.storyCard}>
                {editingStoryId === story._id ? (
                  /* מצב עריכה בלייב */
                  <div style={styles.editForm}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={styles.input}
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={styles.textarea}
                      rows={4}
                    />
                    <div style={styles.cardActions}>
                      <button 
                        onClick={() => handleUpdateStory(story._id)} 
                        style={styles.saveBtn}
                      >
                        שמור שינויים
                      </button>
                      <button 
                        onClick={() => setEditingStoryId(null)} 
                        style={styles.cancelBtn}
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                ) : (
                  /* תצוגת סיפור רגילה */
                  <>
                    <div style={styles.storyHeader}>
                      <h4 style={styles.storyTitle}>{story.title}</h4>
                      {story.isSuccessStory && (
                        <span style={styles.badge}>🌟 סיפור הצלחה</span>
                      )}
                    </div>

                    <p style={styles.storyContent}>{story.content}</p>

                    <div style={styles.storyFooter}>
                      <span style={styles.dateText}>
                        {new Date(story.createdAt || Date.now()).toLocaleDateString('he-IL')}
                      </span>

                      <div style={styles.cardActions}>
                        <button 
                          onClick={() => startEditing(story)} 
                          style={styles.editBtn}
                        >
                          ✏️ ערוך
                        </button>
                        <button 
                          onClick={() => handleDeleteStory(story._id)} 
                          style={styles.deleteBtn}
                        >
                          🗑️ מחק
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// עיצוב רך, נקי ומזמין
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '30px 20px',
    direction: 'rtl'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#2b2d42'
  },
  sectionCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
    marginBottom: '30px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '15px'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none'
  },
  textarea: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none'
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#4a7c59',
    cursor: 'pointer'
  },
  publishBtn: {
    background: '#6b8e23',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background 0.2s'
  },
  storiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '15px'
  },
  storyCard: {
    border: '1px solid #eee',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: '#fafbfc'
  },
  storyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  storyTitle: {
    margin: 0,
    fontSize: '18px',
    color: '#1d3557'
  },
  badge: {
    background: '#fefae0',
    color: '#bc6c25',
    border: '1px solid #dda15e',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  storyContent: {
    color: '#4a5568',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    margin: '10px 0'
  },
  storyFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px',
    paddingTop: '10px',
    borderTop: '1px dashed #e2e8f0'
  },
  dateText: {
    fontSize: '12px',
    color: '#a0aec0'
  },
  cardActions: {
    display: 'flex',
    gap: '10px'
  },
  editBtn: {
    background: '#e2e8f0',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  deleteBtn: {
    background: '#fed7d7',
    color: '#c53030',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  saveBtn: {
    background: '#319795',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  cancelBtn: {
    background: '#cbd5e0',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  errorBanner: {
    background: '#fff5f5',
    color: '#c53030',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #feb2b2'
  },
  successBanner: {
    background: '#f0fff4',
    color: '#276749',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #9ae6b4'
  },
  infoText: {
    color: '#718096',
    textAlign: 'center',
    padding: '20px'
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  }
};