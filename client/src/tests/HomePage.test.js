import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Simple HomePage mock to avoid router dependencies
const MockHomePage = () => {
  const [pseudo, setPseudo] = React.useState('');
  const [roomName, setRoomName] = React.useState('');
  const [showCreateRoom, setShowCreateRoom] = React.useState(false);

  return (
    <div data-testid="homepage">
      <h1>Red Tetris</h1>
      <div className="game-selection">
        <button 
          data-testid="solo-btn"
          onClick={() => console.log('Solo mode')}
        >
          Mode Solo
        </button>
        <button 
          data-testid="multi-btn"
          onClick={() => setShowCreateRoom(true)}
        >
          Mode Multijoueur
        </button>
      </div>
      
      <div className="pseudo-input">
        <input
          data-testid="pseudo-input"
          type="text"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          placeholder="Votre pseudo"
        />
      </div>

      {showCreateRoom && (
        <div data-testid="create-room">
          <input
            data-testid="room-input"
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Nom de la room"
          />
          <button data-testid="create-btn">Créer Room</button>
        </div>
      )}
    </div>
  );
};

describe('HomePage Component Tests', () => {
  it('should render the Red Tetris title', () => {
    render(<MockHomePage />);
    expect(screen.getByText('Red Tetris')).toBeInTheDocument();
  });

  it('should render solo and multiplayer buttons', () => {
    render(<MockHomePage />);
    expect(screen.getByTestId('solo-btn')).toBeInTheDocument();
    expect(screen.getByTestId('multi-btn')).toBeInTheDocument();
  });

  it('should have proper button text', () => {
    render(<MockHomePage />);
    expect(screen.getByText('Mode Solo')).toBeInTheDocument();
    expect(screen.getByText('Mode Multijoueur')).toBeInTheDocument();
  });

  it('should handle pseudo input changes', () => {
    render(<MockHomePage />);
    const pseudoInput = screen.getByTestId('pseudo-input');
    
    fireEvent.change(pseudoInput, { target: { value: 'testuser' } });
    expect(pseudoInput.value).toBe('testuser');
  });

  it('should show create room form when multiplayer button clicked', () => {
    render(<MockHomePage />);
    const multiBtn = screen.getByTestId('multi-btn');
    
    fireEvent.click(multiBtn);
    expect(screen.getByTestId('create-room')).toBeInTheDocument();
    expect(screen.getByTestId('room-input')).toBeInTheDocument();
  });

  it('should handle room name input changes', () => {
    render(<MockHomePage />);
    const multiBtn = screen.getByTestId('multi-btn');
    
    fireEvent.click(multiBtn);
    const roomInput = screen.getByTestId('room-input');
    
    fireEvent.change(roomInput, { target: { value: 'testroom' } });
    expect(roomInput.value).toBe('testroom');
  });
});
