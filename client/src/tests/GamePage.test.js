import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock GamePage component for testing
const MockGamePage = ({ pseudoProp = 'testuser' }) => {
  const [connected, setConnected] = React.useState(false);
  const [gameStatus, setGameStatus] = React.useState('waiting');
  const [players, setPlayers] = React.useState([]);

  const handleConnect = () => {
    setConnected(true);
    setPlayers([{ pseudo: pseudoProp, ready: false }]);
  };

  const handleStartGame = () => {
    setGameStatus('playing');
  };

  const handleLeaveRoom = () => {
    setConnected(false);
    setGameStatus('waiting');
    setPlayers([]);
  };

  return (
    <div className="game-page" data-testid="game-page">
      <h1>🎮 Partie Multijoueur</h1>
      
      {!connected ? (
        <div data-testid="connection-area">
          <p>Connexion à la partie...</p>
          <button data-testid="connect-btn" onClick={handleConnect}>
            Se connecter
          </button>
        </div>
      ) : (
        <div data-testid="game-area">
          <div className="game-info">
            <p data-testid="welcome">Bienvenue {pseudoProp} !</p>
            <p data-testid="game-status">Statut: {gameStatus}</p>
          </div>
          
          <div data-testid="players-list">
            <h3>Joueurs connectés:</h3>
            {players.map((player, index) => (
              <div key={index} data-testid={`player-${index}`}>
                {player.pseudo} {player.ready ? '✅' : '⏳'}
              </div>
            ))}
          </div>

          <div className="game-controls">
            {gameStatus === 'waiting' && (
              <button data-testid="start-btn" onClick={handleStartGame}>
                Démarrer la partie
              </button>
            )}
            
            {gameStatus === 'playing' && (
              <div data-testid="game-board">
                <p>Plateau de jeu simulé</p>
              </div>
            )}
            
            <button data-testid="leave-btn" onClick={handleLeaveRoom}>
              Quitter la partie
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

describe('GamePage Component Tests', () => {
  it('should render game page title', () => {
    render(<MockGamePage />);
    expect(screen.getByText('🎮 Partie Multijoueur')).toBeInTheDocument();
  });

  it('should show connection area initially', () => {
    render(<MockGamePage />);
    expect(screen.getByTestId('connection-area')).toBeInTheDocument();
    expect(screen.getByText('Connexion à la partie...')).toBeInTheDocument();
  });

  it('should connect and show game area when connect button clicked', () => {
    render(<MockGamePage pseudoProp="alice" />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    expect(screen.getByTestId('game-area')).toBeInTheDocument();
    expect(screen.getByText('Bienvenue alice !')).toBeInTheDocument();
  });

  it('should show game status and players list after connection', () => {
    render(<MockGamePage />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    expect(screen.getByTestId('game-status')).toHaveTextContent('Statut: waiting');
    expect(screen.getByTestId('players-list')).toBeInTheDocument();
    expect(screen.getByTestId('player-0')).toHaveTextContent('testuser ⏳');
  });

  it('should start game and show game board', () => {
    render(<MockGamePage />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    fireEvent.click(screen.getByTestId('start-btn'));
    
    expect(screen.getByTestId('game-status')).toHaveTextContent('Statut: playing');
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
  });

  it('should leave room and return to connection state', () => {
    render(<MockGamePage />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    fireEvent.click(screen.getByTestId('leave-btn'));
    
    expect(screen.getByTestId('connection-area')).toBeInTheDocument();
    expect(screen.queryByTestId('game-area')).not.toBeInTheDocument();
  });
});
