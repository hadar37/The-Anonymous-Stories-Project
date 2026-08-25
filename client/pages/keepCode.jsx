



import { useState, useEffect } from 'react';

export default function HomePage({ setCurrentPage }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div style={styles.container}>
      {/* באנר ראשי */}
      <header style={styles.heroSection}>
        <h1 style={styles.mainTitle}>המקום לסיפור שלך 🌱</h1>
        <p style={styles.subtitle}>
          פלטפורמה אנונימית ובטוחה לשיתוף סיפורים אישיים, חיזוק הדדי, ומציאת השראה מחוויות של אחרים.
        </p>
        <div style={styles.heroButtons}>
          <button 
            style={styles.primaryBtn} 
            onClick={() => setCurrentPage('personal')}
          >
            ✍️ שתף/י את הסיפור שלך
          </button>
          <button 
            style={styles.secondaryBtn} 
            onClick={() => setCurrentPage('cards')}
          >
            🎴 קבל/י מסר מחזק
          </button>
        </div>
      </header>

      {/* הודעת שגיאה במידה ויש */}
      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* רשימת הסיפורים מהקהילה */}
      <section style={styles.feedSection}>
        <h2 style={styles.sectionTitle}>💬 סיפורים מן הקהילה</h2>

        {loading ? (
          <p style={styles.loadingText}>טוען סיפורים...</p>
        ) : stories.length === 0 ? (
          <p style={styles.emptyText}>עדיין אין סיפורים בקהילה. היו הראשונים לשתף!</p>
        ) : (
          <div style={styles.storiesGrid}>
            {stories.map((story) => (
              <div key={story._id} style={styles.storyCard}>
                <div style={styles.cardHeader}>
                  <span style={styles.authorName}>
                    👤 {story.author?.name || 'כותב/ת אנונימי/ת'}
                  </span>
                  {story.isSuccessStory && (
                    <span style={styles.badge}>🌟 סיפור הצלחה</span>
                  )}
                </div>

                <h3 style={styles.storyTitle}>{story.title}</h3>
                <p style={styles.storyContent}>{story.content}</p>

                <div style={styles.cardFooter}>
                  <span style={styles.dateText}>
                    {new Date(story.createdAt || Date.now()).toLocaleDateString('he-IL')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '30px 20px',
    direction: 'rtl'
  },
  heroSection: {
    textAlign: 'center',
    background: 'linear-gradient(135deg, #fefae0 0%, #e9edc9 100%)',
    padding: '40px 20px',
    borderRadius: '20px',
    marginBottom: '40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
  },
  mainTitle: {
    fontSize: '36px',
    color: '#2b2d42',
    marginBottom: '15px',
    fontWeight: '800'
  },
  subtitle: {
    fontSize: '18px',
    color: '#555',
    maxWidth: '600px',
    margin: '0 auto 25px auto',
    lineHeight: '1.6'
  },
  heroButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    flexWrap: 'wrap'
  },
  primaryBtn: {
    background: '#6b8e23',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  secondaryBtn: {
    background: '#ffffff',
    color: '#bc6c25',
    border: '2px solid #dda15e',
    padding: '12px 24px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  feedSection: {
    marginTop: '20px'
  },
  sectionTitle: {
    fontSize: '22px',
    color: '#1d3557',
    marginBottom: '20px',
    borderBottom: '2px solid #e9edc9',
    paddingBottom: '10px'
  },
  storiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  storyCard: {
    background: '#ffffff',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  authorName: {
    fontSize: '13px',
    color: '#6c757d',
    fontWeight: 'bold'
  },
  badge: {
    background: '#fefae0',
    color: '#bc6c25',
    border: '1px solid #dda15e',
    padding: '3px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  storyTitle: {
    fontSize: '18px',
    color: '#2b2d42',
    margin: '0 0 10px 0'
  },
  storyContent: {
    color: '#4a5568',
    fontSize: '14px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    marginBottom: '15px'
  },
  cardFooter: {
    borderTop: '1px dashed #eee',
    paddingTop: '10px',
    textAlign: 'left'
  },
  dateText: {
    fontSize: '12px',
    color: '#a0aec0'
  },
  loadingText: {
    textAlign: 'center',
    color: '#888',
    padding: '30px'
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
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