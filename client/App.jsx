

import { useState, useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import PersonalArea from './pages/PersonalArea';
import SuccessStories from './pages/SuccessStories';
import CardsPage from './pages/CardsPage';
import About from './pages/About';

function MainApp() {
  const { user } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('home');

  // אם המשתמש לא מחובר, מציגים את דף ההתחברות וההרשמה
  if (!user) {
    return <AuthPage onLoginSuccess={() => setCurrentPage('home')} />;
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Navbar setCurrentPage={setCurrentPage} />

      <main>
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === 'personal' && <PersonalArea />}
        {currentPage === 'success' && <SuccessStories />}
        {currentPage === 'cards' && <CardsPage />}
        { currentPage === 'about' && <About/>}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}