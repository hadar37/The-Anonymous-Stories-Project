

import { useState } from 'react';

export default function CardsPage() {
  const [currentCard, setCurrentCard] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState('');

  const fetchRandomCard = async () => {
    setIsShuffling(true);
    setIsFlipped(false); // מחזיר לגב הקלף בזמן העירבוב
    setError('');

    try {
      setTimeout(async () => {
        const res = await fetch('http://localhost:5001/api/cards/random');
        if (!res.ok) throw new Error('לא ניתן לשלוף קלף כעת');
        
        const data = await res.json();
        setCurrentCard(data);
        setIsShuffling(false);
        setIsFlipped(true); // מפעיל את היפוך הקלף לצד של המסר
      }, 700);

    } catch (err) {
      setError(err.message);
      setIsShuffling(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>✨ קלפי השראה ומוטיבציה</h2>
      <p>קח/י נשימה עמוקה, לחץ/י על ערבוב החפיסה ושלוף/י את המסר היומי שלך.</p>

      {/* אזור החפיסה והקלף המרכזי */}
      <div style={styles.deckArea}>
        
        {/* קלפי רקע ליצירת תחושת עומק של חפיסה */}
        <div style={{ ...styles.bgCard, transform: 'rotate(-6deg) translate(-10px, 4px)' }} />
        <div style={{ ...styles.bgCard, transform: 'rotate(5deg) translate(8px, 2px)' }} />

        {/* הקלף הראשי המתהפך */}
        <div style={{
          ...styles.cardWrapper,
          transform: isShuffling ? 'scale(0.95) rotate(-3deg)' : 'scale(1)',
          transition: 'transform 0.4s ease'
        }}>
          <div style={{
            ...styles.cardInner,
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}>
            
            {/* צד א' - גב הקלף */}
            <div style={styles.cardFront}>
              <div style={styles.cardPattern}>
                <span style={{ fontSize: '48px' }}>🎴</span>
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>
                  {isShuffling ? 'מערבב...' : 'לחצי על ערבוב'}
                </p>
              </div>
            </div>

            {/* צד ב' - המסר על גבי הקלף */}
            <div style={styles.cardBack}>
              <div style={styles.cardHeader}>💡 המסר היומי שלך</div>
              
              <div style={styles.messageContent}>
                "{currentCard?.message || currentCard?.text}"
              </div>

              {currentCard?.category && (
                <span style={styles.categoryBadge}>{currentCard.category}</span>
              )}
            </div>

          </div>
        </div>

      </div>

      <button onClick={fetchRandomCard} disabled={isShuffling} style={styles.shuffleBtn}>
        {isShuffling ? 'מערבב את החפיסה... 🔀' : (isFlipped ? 'ערבב ושלוף קלף נוסף 🎴' : 'ערבב ושלוף קלף 🎴')}
      </button>

      {error && <p style={{ color: '#e63946', marginTop: '15px' }}>{error}</p>}
    </div>
  );
}

const styles = {
  container: { 
    textAlign: 'center', 
    padding: '40px 20px', 
    maxWidth: '600px', 
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif' 
  },
  deckArea: { 
    height: '340px', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    margin: '20px 0',
    position: 'relative',
    perspective: '1000px' // מעניק את אפקט ה-3D להיפוך
  },
  bgCard: {
    position: 'absolute',
    width: '200px',
    height: '290px',
    background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '2px solid #fff'
  },
  cardWrapper: {
    width: '210px',
    height: '300px',
    position: 'relative',
    zIndex: 2,
    cursor: 'pointer'
  },
  cardInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)'
  },
  cardFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    background: 'linear-gradient(135deg, #a8edd9 0%, #fed6e3 100%)',
    borderRadius: '16px',
    border: '4px solid #fff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box'
  },
  cardPattern: {
    border: '2px dashed rgba(255,255,255,0.7)',
    borderRadius: '10px',
    width: '85%',
    height: '85%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    background: '#fffef0',
    borderRadius: '16px',
    border: '4px solid #dda15e',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    padding: '20px 15px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardHeader: { 
    fontSize: '13px', 
    color: '#bc6c25', 
    fontWeight: 'bold',
    borderBottom: '1px solid #faedcd',
    width: '100%',
    paddingBottom: '8px'
  },
  messageContent: { 
    fontSize: '17px', 
    color: '#2b2d42', 
    lineHeight: '1.4', 
    fontWeight: '500',
    margin: 'auto 0'
  },
  categoryBadge: { 
    fontSize: '11px', 
    background: '#dda15e', 
    color: '#fff', 
    padding: '4px 10px', 
    borderRadius: '10px',
    fontWeight: 'bold'
  },
  shuffleBtn: { 
    background: '#e07a5f', 
    color: '#fff', 
    border: 'none', 
    padding: '14px 28px', 
    fontSize: '16px', 
    borderRadius: '30px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    boxShadow: '0 4px 14px rgba(224, 122, 95, 0.3)',
    transition: 'transform 0.1s ease'
  }
};