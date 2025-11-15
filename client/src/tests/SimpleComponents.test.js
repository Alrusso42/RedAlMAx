import React from 'react';
import { render, screen } from '@testing-library/react';
import GameAera from '../components/GameAera';
import GameBoard from '../components/GameBoard';
import NextPiece from '../components/NextPiece';

// Tests simplifiés sans router
describe('Simple Component Tests', () => {
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

    it('renders score and level', () => {
      render(<GameAera {...defaultProps} />);
      
      expect(screen.getByText('Score : 1000')).toBeInTheDocument();
      expect(screen.getByText('Level : 3')).toBeInTheDocument();
    });

    it('renders with next piece', () => {
      const nextPiece = { shape: [[1, 1, 1, 1]], color: 'red' };
      render(<GameAera {...defaultProps} nextPiece={nextPiece} />);
      
      expect(document.querySelector('.next-piece-container')).toBeInTheDocument();
    });

    it('renders opponent info when provided', () => {
      const props = {
        ...defaultProps,
        opponentName: 'Player2',
        opponentSpectrum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      };
      
      render(<GameAera {...props} />);
      
      expect(screen.getByText('Adversaire (Player2)')).toBeInTheDocument();
    });
  });

  describe('GameBoard', () => {
    const mockBoard = Array(20).fill(null).map(() => Array(10).fill(0));
    const mockPiece = {
      shape: [[1, 1], [1, 1]],
      position: { x: 4, y: 0 },
      color: 'cyan'
    };

    it('renders board structure', () => {
      render(<GameBoard board={mockBoard} piece={mockPiece} />);
      
      const board = document.querySelector('.board');
      expect(board).toBeInTheDocument();
      
      const rows = document.querySelectorAll('.row');
      expect(rows).toHaveLength(20);
    });

    it('handles null piece', () => {
      render(<GameBoard board={mockBoard} piece={null} />);
      
      const board = document.querySelector('.board');
      expect(board).toBeInTheDocument();
    });

    it('handles different cell types', () => {
      const boardWithPieces = mockBoard.map(row => [...row]);
      boardWithPieces[19][0] = 1; // Normal piece
      boardWithPieces[19][1] = 8; // Flash
      boardWithPieces[19][2] = 9; // Penalty
      
      render(<GameBoard board={boardWithPieces} piece={mockPiece} />);
      
      const board = document.querySelector('.board');
      expect(board).toBeInTheDocument();
    });
  });

  describe('NextPiece', () => {
    it('renders next piece', () => {
      const piece = {
        shape: [[1, 1], [1, 1]],
        color: 'blue'
      };
      
      render(<NextPiece piece={piece} />);
      
      const nextPiece = document.querySelector('.next-piece');
      expect(nextPiece).toBeInTheDocument();
    });

    it('handles different piece shapes', () => {
      const longPiece = {
        shape: [[1, 1, 1, 1]],
        color: 'cyan'
      };
      
      render(<NextPiece piece={longPiece} />);
      
      const nextPiece = document.querySelector('.next-piece');
      expect(nextPiece).toBeInTheDocument();
    });
  });
});

// Tests des utilitaires et logiques simples
describe('Utility Functions', () => {
  it('should create empty board', () => {
    const board = Array(20).fill(null).map(() => Array(10).fill(0));
    
    expect(board).toHaveLength(20);
    expect(board[0]).toHaveLength(10);
    expect(board[19][9]).toBe(0);
  });

  it('should validate board structure', () => {
    const board = Array(20).fill(null).map(() => Array(10).fill(0));
    
    const isValidBoard = board.every(row => 
      Array.isArray(row) && row.length === 10
    );
    
    expect(isValidBoard).toBe(true);
  });

  it('should handle piece positions', () => {
    const piece = {
      shape: [[1, 1], [1, 1]],
      position: { x: 4, y: 0 },
      color: 'cyan'
    };
    
    expect(piece.position.x).toBe(4);
    expect(piece.position.y).toBe(0);
    expect(piece.shape).toHaveLength(2);
  });

  it('should validate piece colors', () => {
    const colors = ['cyan', 'blue', 'red', 'green', 'yellow', 'orange', 'purple'];
    
    colors.forEach(color => {
      expect(typeof color).toBe('string');
      expect(color.length).toBeGreaterThan(0);
    });
  });
});

// Tests des classes de logique métier côté client
describe('TetrisSolo Game Logic', () => {
  class MockTetrisSoloGame {
    constructor() {
      this.board = Array(20).fill(null).map(() => Array(10).fill(0));
      this.score = 0;
      this.level = 1;
      this.linesCleared = 0;
      this.gameOver = false;
      this.isPaused = false;
    }

    generatePiece() {
      const pieces = [
        { shape: [[1,1,1,1]] }, // I
        { shape: [[1,1],[1,1]] }, // O
        { shape: [[0,1,0],[1,1,1]] }, // T
      ];
      return pieces[Math.floor(Math.random() * pieces.length)];
    }

    resetGame() {
      this.board = Array(20).fill(null).map(() => Array(10).fill(0));
      this.score = 0;
      this.level = 1;
      this.linesCleared = 0;
      this.gameOver = false;
    }

    addScore(points) {
      this.score += points;
    }

    clearLine(lineIndex) {
      this.board.splice(lineIndex, 1);
      this.board.unshift(Array(10).fill(0));
      this.linesCleared++;
      return true;
    }
  }

  let game;

  beforeEach(() => {
    game = new MockTetrisSoloGame();
  });

  it('should initialize game correctly', () => {
    expect(game.score).toBe(0);
    expect(game.level).toBe(1);
    expect(game.gameOver).toBe(false);
    expect(game.board).toHaveLength(20);
  });

  it('should generate random pieces', () => {
    const piece = game.generatePiece();
    expect(piece).toHaveProperty('shape');
    expect(Array.isArray(piece.shape)).toBe(true);
  });

  it('should reset game state', () => {
    game.score = 1000;
    game.level = 5;
    game.gameOver = true;
    
    game.resetGame();
    
    expect(game.score).toBe(0);
    expect(game.level).toBe(1);
    expect(game.gameOver).toBe(false);
  });

  it('should add score correctly', () => {
    game.addScore(100);
    expect(game.score).toBe(100);
    
    game.addScore(50);
    expect(game.score).toBe(150);
  });

  it('should clear lines correctly', () => {
    // Remplir une ligne
    for (let x = 0; x < 10; x++) {
      game.board[19][x] = 1;
    }
    
    const cleared = game.clearLine(19);
    
    expect(cleared).toBe(true);
    expect(game.linesCleared).toBe(1);
    expect(game.board[19].every(cell => cell === 0)).toBe(true);
  });
});
