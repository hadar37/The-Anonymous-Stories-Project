

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar({ setCurrentPage }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={styles.nav}>
      <div style={styles.logo} onClick={() => setCurrentPage('home')}>
        🌱 המקום לסיפור שלך
      </div>

      <div style={styles.menu}>
        <button style={styles.btn} onClick={() => setCurrentPage('personal')}>
          👤 אזור אישי
        </button>
        <button style={styles.btn} onClick={() => setCurrentPage('success')}>
          🌟 סיפורי הצלחה
        </button>
        <button style={styles.btnHighlight} onClick={() => setCurrentPage('cards')}>
          🎴 קלפי השראה ומוטיבציה
        </button>
        <button button style={styles.btn} onClick={() => setCurrentPage('about')} >אודות
          
        </button>
      </div>

      <div>
        {user && <span style={styles.welcome}>שלום, {user.name}</span>}
        <button onClick={logout} style={styles.logoutBtn}>התנתק</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  logo: { fontSize: '20px', fontWeight: 'bold', color: '#3a5a40', cursor: 'pointer' },
  menu: { display: 'flex', gap: '15px' },
  btn: { background: '#e9edc9', border: 'none', padding: '10px 18px', borderRadius: '20px', cursor: 'pointer', color: '#333', fontSize: '14px' },
  btnHighlight: { background: '#fefae0', border: '2px solid #dda15e', padding: '10px 18px', borderRadius: '20px', cursor: 'pointer', color: '#bc6c25', fontWeight: 'bold', fontSize: '14px' },
  welcome: { marginLeft: '15px', color: '#555' },
  logoutBtn: { background: 'none', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }
};