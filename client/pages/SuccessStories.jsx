

import { useState, useEffect } from 'react';

export default function SuccessStories() {
  const [successStories, setSuccessStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSuccessStories();
  }, []);

  const fetchSuccessStories = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/stories');
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'שגיאה בטעינת הסיפורים');

      // סינון אך ורק סיפורים המסומנים כסיפורי הצלחה
      const filtered = data.filter((story) => story.isSuccessStory === true);
      setSuccessStories(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>🌟 סיפורי הצלחה והתגברות</h2>
        <p>חוויות מעצימות של חברי הקהילה שהתגברו על אתגרים ומזכירים לנו שיש תמיד תקווה.</p>
      </header>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {loading ? (
        <p style={styles.loadingText}>טוען סיפורי הצלחה מעצימים...</p>
      ) : successStories.length === 0 ? (
        <div style={styles.emptyCard}>
          <p>עדיין לא פורסמו סיפורי הצלחה.</p>
          <p style={styles.emptySubtext}>עברת/ן משבר והצלחתם להתגבר? היכנסו ל"אזור האישי" ושתפו את הסיפור שלכם!</p>
        </div>
      ) : (
        <div style={styles.storiesContainer}>
          {successStories.map((story) => (
            <div key={story._id} style={styles.successCard}>
              <div style={styles.cardTop}>
                <span style={styles.starIcon}>⭐</span>
                <span style={styles.author}>מאת: {story.author?.name || 'משתמש/ת אנונימי/ת'}</span>
              </div>

              <h3 style={styles.title}>{story.title}</h3>
              <p style={styles.content}>{story.content}</p>

              <div style={styles.cardBottom}>
                <span style={styles.date}>
                  {new Date(story.createdAt || Date.now()).toLocaleDateString('he-IL')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '30px 20px',
    direction: 'rtl'
  },
  header: {
    textAlign: 'center',
    marginBottom: '35px',
    color: '#2b2d42'
  },
  storiesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  successCard: {
    background: '#fffdf5',
    border: '2px solid #f2cc8f',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 6px 18px rgba(242, 204, 143, 0.15)',
    position: 'relative'
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px'
  },
  starIcon: {
    fontSize: '18px'
  },
  author: {
    fontSize: '13px',
    color: '#8d99ae',
    fontWeight: 'bold'
  },
  title: {
    fontSize: '20px',
    color: '#3d405b',
    margin: '0 0 12px 0'
  },
  content: {
    color: '#4a5568',
    fontSize: '15px',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap'
  },
  cardBottom: {
    marginTop: '15px',
    paddingTop: '10px',
    borderTop: '1px dashed #e0d8b0',
    textAlign: 'left'
  },
  date: {
    fontSize: '12px',
    color: '#b0b0b0'
  },
  emptyCard: {
    textAlign: 'center',
    padding: '40px 20px',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
    color: '#555'
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#888',
    marginTop: '8px'
  },
  loadingText: {
    textAlign: 'center',
    color: '#888',
    padding: '30px'
  },
  errorBanner: {
    background: '#fff5f5',
    color: '#c53030',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center'
  }
};