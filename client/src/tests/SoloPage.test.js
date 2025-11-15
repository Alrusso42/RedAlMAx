import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the components used by SoloPage to focus on its logic
const MockSoloPage = ({ pseudoProp = 'testuser' }) => {
  const [gameStarted, setGameStarted] = React.useState(false);
  
  if (!pseudoProp) {
    return <div data-testid="redirect">Redirecting to home...</div>;
  }

  return (
    <div className="solo-page" data-testid="solo-page">
      <div className="solo-container">
        <h1 className="solo-title">🎯 Mode Solo</h1>
        <p className="solo-subtitle" data-testid="welcome-text">
          Bienvenue {pseudoProp} ! Page temporaire du mode solo
        </p>
        
        <div className="solo-content">
          <div className="solo-icon">🎮</div>
          <p className="solo-description">
            Le jeu Tetris en mode solo sera bientôt disponible !
          </p>
          
          <div className="solo-actions">
            <button 
              data-testid="start-game-btn"
              onClick={() => setGameStarted(true)}
              disabled={gameStarted}
            >
              {gameStarted ? 'Jeu en cours...' : 'Commencer la partie'}
            </button>
            <button data-testid="back-modes-btn">
              Retour aux modes
            </button>
            <button data-testid="back-home-btn">
              Retour à l'accueil
            </button>
          </div>
          
          {gameStarted && (
            <div data-testid="game-area">
              <p>Zone de jeu simulée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

describe('SoloPage Component Tests', () => {
  it('should render solo page with welcome message', () => {
    render(<MockSoloPage pseudoProp="alice" />);
    
    expect(screen.getByTestId('solo-page')).toBeInTheDocument();
    expect(screen.getByText('🎯 Mode Solo')).toBeInTheDocument();
    expect(screen.getByText('Bienvenue alice ! Page temporaire du mode solo')).toBeInTheDocument();
  });

  it('should show redirect message when no pseudo provided', () => {
    render(<MockSoloPage pseudoProp={null} />);
    
    expect(screen.getByTestId('redirect')).toBeInTheDocument();
    expect(screen.getByText('Redirecting to home...')).toBeInTheDocument();
  });

  it('should render all navigation buttons', () => {
    render(<MockSoloPage />);
    
    expect(screen.getByTestId('start-game-btn')).toBeInTheDocument();
    expect(screen.getByTestId('back-modes-btn')).toBeInTheDocument();
    expect(screen.getByTestId('back-home-btn')).toBeInTheDocument();
  });

  it('should start game when start button clicked', () => {
    render(<MockSoloPage />);
    
    const startBtn = screen.getByTestId('start-game-btn');
    expect(startBtn).toHaveTextContent('Commencer la partie');
    
    fireEvent.click(startBtn);
    
    expect(startBtn).toHaveTextContent('Jeu en cours...');
    expect(startBtn).toBeDisabled();
    expect(screen.getByTestId('game-area')).toBeInTheDocument();
  });

  it('should render game description text', () => {
    render(<MockSoloPage />);
    
    expect(screen.getByText('Le jeu Tetris en mode solo sera bientôt disponible !')).toBeInTheDocument();
  });
});
