import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './SoloPage.css';

export default function SoloPage() {
  const navigate = useNavigate();
  const { pseudo } = useParams();

  // Si pas de pseudo ou pseudo vide, rediriger vers l'accueil
  if (!pseudo || !pseudo.trim()) {
    navigate('/');
    return null;
  }

  const handleBackToModes = () => {
    navigate(`/modes/${encodeURIComponent(pseudo)}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="solo-page">
      <div className="solo-container">
        <h1 className="solo-title">🎯 Mode Solo</h1>
        <p className="solo-subtitle">Bienvenue {pseudo} ! Page temporaire du mode solo</p>
        
        <div className="solo-content">
          <div className="solo-icon">🎮</div>
          <p className="solo-description">
            Prêt à jouer en solo ?<br/>
            Battez vos propres records et perfectionnez vos techniques !
          </p>
        </div>

        <div className="solo-buttons">
          <button 
            className="back-modes-btn" 
            onClick={() => navigate(`/play-solo/${encodeURIComponent(pseudo)}`)}
            style={{ background: 'linear-gradient(45deg, #4caf50, #45a049)' }}
          >
            🎮 Jouer maintenant !
          </button>
          <button className="back-modes-btn" onClick={handleBackToModes}>
            ← Retour aux modes
          </button>
          <button className="back-home-btn" onClick={handleBackToHome}>
            🏠 Accueil
          </button>
        </div>
      </div>
    </div>
  );
}