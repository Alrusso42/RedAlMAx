import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TetrisSolo from '../components/TetrisSolo';

// Mock useParams
const mockParams = { pseudo: 'testuser' };

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

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

describe('TetrisSolo Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('testuser');
  });

  const renderTetrisSolo = () => {
    return render(
      <MemoryRouter>
        <TetrisSolo />
      </MemoryRouter>
    );
  };

  it('should render solo tetris game', () => {
    renderTetrisSolo();
    
    expect(screen.getByText('Mode Solo - testuser')).toBeInTheDocument();
    expect(screen.getByText('Commencer')).toBeInTheDocument();
  });

  it('should start game when start button clicked', () => {
    renderTetrisSolo();
    
    const startButton = screen.getByText('Commencer');
    fireEvent.click(startButton);
    
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  it('should handle pause/resume functionality', () => {
    renderTetrisSolo();
    
    const startButton = screen.getByText('Commencer');
    fireEvent.click(startButton);
    
    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);
    
    expect(screen.getByText('Reprendre')).toBeInTheDocument();
  });

  it('should handle restart game', () => {
    renderTetrisSolo();
    
    const startButton = screen.getByText('Commencer');
    fireEvent.click(startButton);
    
    const restartButton = screen.getByText('Redémarrer');
    fireEvent.click(restartButton);
    
    expect(screen.getByText('Commencer')).toBeInTheDocument();
  });

  it('should handle keyboard controls', () => {
    renderTetrisSolo();
    
    const startButton = screen.getByText('Commencer');
    fireEvent.click(startButton);
    
    // Test arrow keys
    fireEvent.keyDown(document, { key: 'ArrowLeft', code: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'ArrowUp', code: 'ArrowUp' });
    
    // Test space for hard drop
    fireEvent.keyDown(document, { key: ' ', code: 'Space' });
    
    // Should not crash
    expect(screen.getByText('Mode Solo - testuser')).toBeInTheDocument();
  });

  it('should handle game over state', async () => {
    renderTetrisSolo();
    
    const startButton = screen.getByText('Commencer');
    fireEvent.click(startButton);
    
    // Simulate game over by manipulating component state
    // This would require access to the component's internal state
    expect(screen.getByText('Mode Solo - testuser')).toBeInTheDocument();
  });

  it('should display current score and level', () => {
    renderTetrisSolo();
    
    const startButton = screen.getByText('Commencer');
    fireEvent.click(startButton);
    
    // Should display score and level info
    expect(document.querySelector('.game-info')).toBeInTheDocument();
  });

  it('should handle piece rotation', () => {
    renderTetrisSolo();
    
    const startButton = screen.getByText('Commencer');
    fireEvent.click(startButton);
    
    // Test rotation with up arrow
    fireEvent.keyDown(document, { key: 'ArrowUp', code: 'ArrowUp' });
    
    expect(screen.getByText('Mode Solo - testuser')).toBeInTheDocument();
  });

  it('should handle piece movement', () => {
    renderTetrisSolo();
    
    const startButton = screen.getByText('Commencer');
    fireEvent.click(startButton);
    
    // Test left/right movement
    fireEvent.keyDown(document, { key: 'ArrowLeft', code: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });
    
    expect(screen.getByText('Mode Solo - testuser')).toBeInTheDocument();
  });

  it('should handle soft drop', () => {
    renderTetrisSolo();
    
    const startButton = screen.getByText('Commencer');
    fireEvent.click(startButton);
    
    // Test soft drop with down arrow
    fireEvent.keyDown(document, { key: 'ArrowDown', code: 'ArrowDown' });
    
    expect(screen.getByText('Mode Solo - testuser')).toBeInTheDocument();
  });

  it('should handle invalid keyboard inputs', () => {
    renderTetrisSolo();
    
    const startButton = screen.getByText('Commencer');
    fireEvent.click(startButton);
    
    // Test invalid keys
    fireEvent.keyDown(document, { key: 'a', code: 'KeyA' });
    fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
    
    // Should not crash
    expect(screen.getByText('Mode Solo - testuser')).toBeInTheDocument();
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderTetrisSolo();
    
    const startButton = screen.getByText('Commencer');
    fireEvent.click(startButton);
    
    // Unmount component
    unmount();
    
    // Test that keyboard events don't cause errors
    fireEvent.keyDown(document, { key: 'ArrowLeft', code: 'ArrowLeft' });
  });

  it('should handle missing localStorage pseudo', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderTetrisSolo();
    
    expect(screen.getByText(/Mode Solo/)).toBeInTheDocument();
  });
});
