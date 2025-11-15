import React from 'react';
import { render, screen } from '@testing-library/react';
import GameAera from '../components/GameAera';

describe('GameAera', () => {
  const mockBoard = Array(20).fill(null).map(() => Array(10).fill(0));
  const mockPiece = {
    shape: [[1, 1], [1, 1]],
    position: { x: 4, y: 0 },
    color: 'cyan'
  };
  
  const defaultProps = {
    board: mockBoard,
    currentPiece: mockPiece,
    nextPiece: null,
    score: 1000,
    level: 3,
    opponentSpectrum: [],
    opponentName: undefined
  };

  it('should render game area with score and level', () => {
    render(<GameAera {...defaultProps} />);
    
    expect(screen.getByText('Score : 1000')).toBeInTheDocument();
    expect(screen.getByText('Level : 3')).toBeInTheDocument();
  });

  it('should render GameBoard component', () => {
    render(<GameAera {...defaultProps} />);
    
    // Le GameBoard devrait être rendu (on peut vérifier la structure)
    expect(document.querySelector('.board-container')).toBeInTheDocument();
  });

  it('should render NextPiece when provided', () => {
    const nextPiece = {
      shape: [[1, 1, 1, 1]],
      color: 'red'
    };
    
    render(<GameAera {...defaultProps} nextPiece={nextPiece} />);
    
    expect(document.querySelector('.next-piece-container')).toBeInTheDocument();
  });

  it('should not render NextPiece when null', () => {
    render(<GameAera {...defaultProps} nextPiece={null} />);
    
    expect(document.querySelector('.next-piece-container')).not.toBeInTheDocument();
  });

  it('should render opponent spectrum in multiplayer', () => {
    const props = {
      ...defaultProps,
      opponentName: 'Player2',
      opponentSpectrum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    };
    
    render(<GameAera {...props} />);
    
    expect(screen.getByText('Adversaire (Player2)')).toBeInTheDocument();
    expect(document.querySelector('.spectrum-container')).toBeInTheDocument();
  });

  it('should show waiting message when no opponent spectrum', () => {
    const props = {
      ...defaultProps,
      opponentName: 'Player2',
      opponentSpectrum: []
    };
    
    render(<GameAera {...props} />);
    
    expect(screen.getByText('En attente...')).toBeInTheDocument();
  });

  it('should not render opponent section in solo mode', () => {
    render(<GameAera {...defaultProps} />);
    
    expect(document.querySelector('.spectrum-container')).not.toBeInTheDocument();
  });

  it('should handle missing current piece gracefully', () => {
    const props = {
      ...defaultProps,
      currentPiece: null
    };
    
    render(<GameAera {...props} />);
    
    // Should not crash and still render other elements
    expect(screen.getByText('Score : 1000')).toBeInTheDocument();
  });

  it('should render correct game area structure', () => {
    render(<GameAera {...defaultProps} />);
    
    expect(document.querySelector('.game-aera')).toBeInTheDocument();
    expect(document.querySelector('.board-container')).toBeInTheDocument();
    expect(document.querySelector('.column-info')).toBeInTheDocument();
  });

  it('should display opponent name correctly', () => {
    const props = {
      ...defaultProps,
      opponentName: 'TestOpponent'
    };
    
    render(<GameAera {...props} />);
    
    expect(screen.getByText('Adversaire (TestOpponent)')).toBeInTheDocument();
  });

  it('should handle zero score and level', () => {
    const props = {
      ...defaultProps,
      score: 0,
      level: 1
    };
    
    render(<GameAera {...props} />);
    
    expect(screen.getByText('Score : 0')).toBeInTheDocument();
    expect(screen.getByText('Level : 1')).toBeInTheDocument();
  });
});
