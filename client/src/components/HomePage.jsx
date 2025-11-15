import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const [pseudo, setPseudo] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  // Liste simple des pseudos et rooms récemment utilisés (en mémoire)
  const getUsedNames = () => {
    const used = JSON.parse(localStorage.getItem('tetris_used_names') || '{"pseudos": [], "rooms": []}');
    return used;
  };

  const saveUsedNames = (pseudos, rooms) => {
    localStorage.setItem('tetris_used_names', JSON.stringify({ pseudos, rooms }));
  };

  const makeUnique = (name, usedList, suffix = '') => {
    const baseName = name.trim();
    let uniqueName = baseName + suffix;
    let counter = suffix ? parseInt(suffix.replace('_', '')) + 1 : 2;
    
    while (usedList.includes(uniqueName)) {
      uniqueName = `${baseName}_${counter}`;
      counter++;
    }
    
    return uniqueName;
  };

  const handleCreateGame = (e) => {
    e.preventDefault();
    
    if (!pseudo.trim()) {
      alert('Veuillez entrer votre pseudo !');
      return;
    }

    // Utiliser les noms tels qu'ils sont saisis
    // Le serveur gérera les rooms existantes naturellement
    const finalPseudo = pseudo.trim();
    const finalRoomId = roomId.trim();
    
    // Sauvegarder dans l'historique local (pour information uniquement)
    const used = getUsedNames();
    const newPseudos = [...used.pseudos, finalPseudo].slice(-50);
    const newRooms = finalRoomId ? [...used.rooms, finalRoomId].slice(-50) : used.rooms;
    saveUsedNames(newPseudos, newRooms);

    // Créer l'URL avec les noms saisis
    const params = new URLSearchParams();
    if (finalRoomId) {
      params.set('roomId', finalRoomId);
    }
    const queryString = params.toString();
    const url = `/modes/${encodeURIComponent(finalPseudo)}${queryString ? '?' + queryString : ''}`;
    
    navigate(url);
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <h1 className="game-title">🎮 Tetris Multijoueur</h1>
        <p className="game-subtitle">Créez ou rejoignez une partie en ligne !</p>
        
        <form onSubmit={handleCreateGame} className="home-form">
          <div className="form-group">
            <label htmlFor="pseudo">Votre pseudo :</label>
            <input
              type="text"
              id="pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Entrez votre pseudo..."
              className="form-input"
              maxLength={20}
              required
            />
            <small className="form-hint">
              <span style={{color: '#888'}}>Vous pouvez rejoindre une room existante avec le même nom</span>
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="roomId">ID de la partie (optionnel) :</label>
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Laissez vide pour créer une nouvelle partie"
              className="form-input"
              maxLength={30}
            />
            <small className="form-hint">
              Laissez vide pour créer automatiquement une nouvelle partie<br/>
              <span style={{color: '#888'}}>Utilisez le même nom pour rejoindre une room existante</span>
            </small>
          </div>

          <button type="submit" className="create-game-btn">
            🚀 Créer une partie
          </button>
        </form>

        <div className="instructions">
          <h3>Comment jouer :</h3>
          <ul>
            <li>🎯 Entrez votre pseudo</li>
            <li>🆕 Créez une nouvelle partie ou rejoignez une existante</li>
            <li>👥 Partagez l'URL avec un ami pour jouer à 2</li>
            <li>🎮 Utilisez les flèches pour jouer !</li>
          </ul>
        </div>
      </div>
    </div>
  );
}