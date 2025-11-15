import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TetrisGame from '../components/TetrisGame';

// Mock useParams and useNavigate
const mockParams = { roomId: 'testroom', pseudo: 'testuser' };
const mockNavigate = jest.fn();

  useParams: () => mockParams,
  useNavigate: () => mockNavigate,
}));

// Mock socket
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('../socket', () => ({
  __esModule: true,
  default: mockSocket,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('TetrisGame Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('testuser');
    mockSocket.on.mockImplementation((event, callback) => {
      // Simulate immediate connection
      if (event === 'connect') {
        setTimeout(() => callback(), 0);
      }
    });
  });

  const renderTetrisGame = () => {
    return render(
      <MemoryRouter>
        <TetrisGame />
      </MemoryRouter>
    );
  };

  it('should render multiplayer game interface', () => {
    renderTetrisGame();
    
    expect(screen.getByText(/Multijoueur/i)).toBeInTheDocument();
    expect(screen.getByText(/Room:/i)).toBeInTheDocument();
  });

  it('should attempt to join room on mount', () => {
    renderTetrisGame();
    
    expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', {
      roomId: 'testroom',
      pseudo: 'testuser'
    });
  });

  it('should register socket event listeners', () => {
    renderTetrisGame();
    
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('roomJoined', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('gameStarted', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('gameUpdate', expect.any(Function));
  });

  it('should handle game start', async () => {
    renderTetrisGame();
    
    // Simulate roomJoined event
    const roomJoinedCallback = mockSocket.on.mock.calls.find(call => call[0] === 'roomJoined')[1];
    roomJoinedCallback({
      room: {
        id: 'testroom',
        players: [{ pseudo: 'testuser', isHost: true }],
        game: null
      }
    });

    await waitFor(() => {
      expect(screen.getByText(/Commencer la partie/i)).toBeInTheDocument();
    });
  });

  it('should emit start game when host clicks start', async () => {
    renderTetrisGame();
    
    // Simulate being host
    const roomJoinedCallback = mockSocket.on.mock.calls.find(call => call[0] === 'roomJoined')[1];
    roomJoinedCallback({
      room: {
        id: 'testroom',
        players: [{ pseudo: 'testuser', isHost: true }],
        game: null
      }
    });

    await waitFor(() => {
      const startButton = screen.getByText(/Commencer la partie/i);
      fireEvent.click(startButton);
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('startGame');
  });

  it('should handle keyboard controls when game is active', async () => {
    renderTetrisGame();
    
    // Simulate game started
    const gameStartedCallback = mockSocket.on.mock.calls.find(call => call[0] === 'gameStarted')[1];
    gameStartedCallback({
      gameState: {
        players: [{ pseudo: 'testuser', board: Array(20).fill().map(() => Array(10).fill(0)) }]
      }
    });

    // Simulate key press
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    
    expect(mockSocket.emit).toHaveBeenCalledWith('move', 'left');
  });

  it('should handle player disconnect', async () => {
    renderTetrisGame();
    
    const playerLeftCallback = mockSocket.on.mock.calls.find(call => call[0] === 'playerLeft')[1];
    if (playerLeftCallback) {
      playerLeftCallback({
        room: {
          players: [{ pseudo: 'testuser', isHost: true }]
        }
      });
    }

    // Should handle disconnect gracefully
    expect(mockSocket.on).toHaveBeenCalled();
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderTetrisGame();
    
    unmount();
    
    expect(mockSocket.off).toHaveBeenCalled();
  });

  it('should handle game over state', async () => {
    renderTetrisGame();
    
    const gameOverCallback = mockSocket.on.mock.calls.find(call => call[0] === 'gameOver')[1];
    if (gameOverCallback) {
      gameOverCallback({
        winner: 'testuser',
        gameState: {
          players: [{ pseudo: 'testuser', gameOver: true }]
        }
      });
    }

    // Should handle game over
    expect(mockSocket.on).toHaveBeenCalled();
  });

  it('should handle waiting for players state', () => {
    renderTetrisGame();
    
    expect(screen.getByText(/En attente/i)).toBeInTheDocument();
  });

  it('should handle invalid keyboard inputs gracefully', async () => {
    renderTetrisGame();
    
    // Simulate game started
    const gameStartedCallback = mockSocket.on.mock.calls.find(call => call[0] === 'gameStarted')[1];
    gameStartedCallback({
      gameState: {
        players: [{ pseudo: 'testuser', board: Array(20).fill().map(() => Array(10).fill(0)) }]
      }
    });

    // Test invalid key
    fireEvent.keyDown(document, { key: 'Enter' });
    
    // Should not crash
    expect(screen.getByText(/Multijoueur/i)).toBeInTheDocument();
  });
});
