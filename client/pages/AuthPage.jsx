

import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AuthPage({ onLoginSuccess }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const { login } = useContext(AuthContext);

  // טופס
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLoginTab && !agreedToTerms) {
      setError('חובה לאשר את תקנון האתר על מנת להירשם');
      return;
    }

    const endpoint = isLoginTab ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'אירעה שגיאה');

      login(data); // שמירה ב-Context
      onLoginSuccess(); // ניווט לדף הבית
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>ברוכים הבאים לפלטפורמת השיתוף</h2>
        
        {/* לשוניות */}
        <div style={styles.tabContainer}>
          <button 
            style={isLoginTab ? styles.activeTab : styles.tab} 
            onClick={() => { setIsLoginTab(true); setError(''); }}
          >
            התחברות
          </button>
          <button 
            style={!isLoginTab ? styles.activeTab : styles.tab} 
            onClick={() => { setIsLoginTab(false); setError(''); }}
          >
            הרשמה
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLoginTab && (
            <input
              type="text"
              placeholder="כינוי/שם (ללא פרטים מזהים)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={styles.input}
            />
          )}

          <input
            type="email"
            placeholder="אימייל"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="סיסמה (לפחות 8 תווים, אותיות, מספרים וסימן)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            style={styles.input}
          />

          {/* תיבת אישור תקנון בלשונית הרשמה בלבד */}
          {!isLoginTab && (
            <div style={styles.termsContainer}>
              <label>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                {' '}קראתי ואני מאשר/ת את{' '}
                <span 
                  onClick={() => setShowTermsModal(true)} 
                  style={styles.termsLink}
                >
                  תקנון האתר והאנונימיות 📋
                </span>
              </label>
            </div>
          )}

          <button type="submit" style={styles.submitBtn}>
            {isLoginTab ? 'התחבר' : 'צור חשבון'}
          </button>
        </form>
      </div>

      {/* מודאל תקנון */}
      {showTermsModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>תקנון האתר ושמירה על אנונימיות 🔒</h3>
            <p>1. הפלטפורמה נועדה לשיתוף סיפורים אישיים בצורה אנונימית ומחזקת.</p>
            <p>2. <strong>חטיבת פרטיות:</strong> חל איסור מוחלט לכתוב שמות של אנשים, כתובות, מספרי טלפון או פרטים מזהים.</p>
            <p>3. <strong>איסור לשון הרע:</strong> אין להפיץ מידע פוגעני, תמונות של אנשים או תכנים משמיצים.</p>
            <p>4. תוכן שמפר את הכללים יימחק לאלתר.</p>
            <button onClick={() => setShowTermsModal(false)} style={styles.closeModalBtn}>
              הבנתי ומאשר/ת
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// עיצוב רך ונעים (Pastel Soft Design)
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' },
  card: { background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', width: '380px', textAlign: 'center' },
  tabContainer: { display: 'flex', justifyContent: 'space-around', marginBottom: '20px', borderBottom: '2px solid #eee' },
  tab: { background: 'none', border: 'none', padding: '10px', cursor: 'pointer', fontSize: '16px', color: '#888' },
  activeTab: { background: 'none', border: 'none', borderBottom: '3px solid #6b8e23', padding: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', color: '#333' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  termsContainer: { fontSize: '13px', textAlign: 'right', margin: '10px 0' },
  termsLink: { color: '#4a7c59', textDecoration: 'underline', cursor: 'pointer' },
  submitBtn: { background: '#6b8e23', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  error: { color: '#d9534f', fontSize: '14px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalContent: { background: '#fff', padding: '24px', borderRadius: '12px', maxWidth: '450px', textAlign: 'right' },
  closeModalBtn: { background: '#4a7c59', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '12px' }
};