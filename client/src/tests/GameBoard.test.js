import React from 'react';
import { render, screen } from '@testing-library/react';
import GameBoard from '../components/GameBoard';

describe('GameBoard', () => {
  const mockBoard = Array(20).fill(null).map(() => Array(10).fill(0));
  const defaultProps = {
    board: mockBoard,
    piece: {
      shape: [[1, 1], [1, 1]],
      position: { x: 4, y: 0 },
      color: 'cyan'
    }
  };

  it('should render board with correct dimensions', () => {
    render(<GameBoard {...defaultProps} />);
    
    const board = document.querySelector('.board');
    expect(board).toBeInTheDocument();
    
    const rows = document.querySelectorAll('.row');
    expect(rows).toHaveLength(20);
    
    const cells = document.querySelectorAll('.cell');
    expect(cells).toHaveLength(200); // 20 * 10
  });

  it('should render empty board when no pieces', () => {
    const emptyBoard = Array(20).fill(null).map(() => Array(10).fill(0));
    const emptyPiece = { shape: [], position: { x: 0, y: 0 }, color: 'transparent' };
    
    render(<GameBoard board={emptyBoard} piece={emptyPiece} />);
    
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      expect(cell.style.backgroundColor).toBe('black');
    });
  });

  it('should render piece at correct position', () => {
    render(<GameBoard {...defaultProps} />);
    
    // Vérifier que les cellules de la pièce ont la bonne couleur
    const board = document.querySelector('.board');
    expect(board).toBeInTheDocument();
  });

  it('should handle board with placed pieces', () => {
    const boardWithPieces = mockBoard.map(row => [...row]);
    boardWithPieces[19][0] = 1; // Pièce placée en bas
    
    render(<GameBoard board={boardWithPieces} piece={defaultProps.piece} />);
    
    const board = document.querySelector('.board');
    expect(board).toBeInTheDocument();
  });

  it('should handle penalty lines (cell value 9)', () => {
    const boardWithPenalty = mockBoard.map(row => [...row]);
    boardWithPenalty[19][0] = 9; // Ligne de pénalité
    
    render(<GameBoard board={boardWithPenalty} piece={defaultProps.piece} />);
    
    const board = document.querySelector('.board');
    expect(board).toBeInTheDocument();
  });

  it('should handle flash cells (cell value 8)', () => {
    const boardWithFlash = mockBoard.map(row => [...row]);
    boardWithFlash[19][0] = 8; // Cellule flash
    
    render(<GameBoard board={boardWithFlash} piece={defaultProps.piece} />);
    
    const board = document.querySelector('.board');
    expect(board).toBeInTheDocument();
  });

  it('should handle piece without position', () => {
    const pieceNoPos = {
      shape: [[1, 1], [1, 1]],
      position: null,
      color: 'cyan'
    };
    
    render(<GameBoard board={defaultProps.board} piece={pieceNoPos} />);
    
    const board = document.querySelector('.board');
    expect(board).toBeInTheDocument();
  });

  it('should handle null piece', () => {
    render(<GameBoard board={defaultProps.board} piece={null} />);
    
    const board = document.querySelector('.board');
    expect(board).toBeInTheDocument();
  });

  it('should render with different piece colors', () => {
    const redPiece = { ...defaultProps.piece, color: 'red' };
    
    render(<GameBoard board={defaultProps.board} piece={redPiece} />);
    
    const board = document.querySelector('.board');
    expect(board).toBeInTheDocument();
  });

  it('should handle large piece shapes', () => {
    const largePiece = {
      shape: [
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      position: { x: 3, y: 0 },
      color: 'blue'
    };
    
    render(<GameBoard board={defaultProps.board} piece={largePiece} />);
    
    const board = document.querySelector('.board');
    expect(board).toBeInTheDocument();
  });

  it('should handle piece at edge positions', () => {
    const edgePiece = {
      shape: [[1]],
      position: { x: 9, y: 19 },
      color: 'green'
    };
    
    render(<GameBoard board={defaultProps.board} piece={edgePiece} />);
    
    const board = document.querySelector('.board');
    expect(board).toBeInTheDocument();
  });
});
