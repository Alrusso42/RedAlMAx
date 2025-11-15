import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './GamePage.css';

export default function GamePage() {
  const navigate = useNavigate();
  const { pseudo } = useParams();
  const location = useLocation();
  
  // Récupérer le roomId depuis les query params
  const searchParams = new URLSearchParams(location.search);
  const userRoomId = searchParams.get('roomId');

  // Si pas de pseudo ou pseudo vide, rediriger vers l'accueil
  if (!pseudo || !pseudo.trim()) {
    navigate('/');
    return null;
  }

  const handleSoloMode = () => {
    navigate(`/play-solo/${encodeURIComponent(pseudo)}`);
  };

  const handleMultiMode = () => {
    // Utiliser le roomId de l'utilisateur ou en créer un nouveau basé sur timestamp
    const finalRoomId = userRoomId || `room_${Date.now()}`;
    navigate(`/${finalRoomId}/${encodeURIComponent(pseudo)}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="game-page">
      <div className="mode-selection-container">
        <h1 className="game-title">🎮 Choisissez votre mode</h1>
        <p className="game-subtitle">
          Salut {pseudo} ! Solo ou Multijoueur ?
          {userRoomId && <><br/><small style={{color: '#888'}}>Room personnalisée : {userRoomId}</small></>}
        </p>
        
        <div className="mode-buttons">
          <div className="mode-card" onClick={handleSoloMode}>
            <div className="mode-icon">🎯</div>
            <h3>Mode Solo</h3>
            <p>Jouez seul et battez vos records !</p>
            <button className="mode-btn solo-btn">
              Jouer en Solo
            </button>
          </div>

          <div className="mode-card" onClick={handleMultiMode}>
            <div className="mode-icon">👥</div>
            <h3>Mode Multijoueur</h3>
            <p>
              Affrontez d'autres joueurs en ligne !<br/>
              {userRoomId ? 
                <small style={{color: '#4ecdc4', fontWeight: '600'}}>Room : {userRoomId}</small> : 
                <small style={{color: '#888'}}>Room auto-générée</small>
              }
            </p>
            <button className="mode-btn multi-btn">
              Jouer en Multi
            </button>
          </div>
        </div>

        <button className="back-btn" onClick={handleBackToHome}>
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  );
}