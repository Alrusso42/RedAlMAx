import React from 'react';
import { render, screen } from '@testing-library/react';
import NextPiece from '../components/NextPiece';

describe('NextPiece Component', () => {
  const testPieces = {
    I: {
      shape: [[1, 1, 1, 1]],
      color: 'cyan'
    },
    O: {
      shape: [[1, 1], [1, 1]],
      color: 'yellow'
    },
    T: {
      shape: [[0, 1, 0], [1, 1, 1]],
      color: 'purple'
    }
  };

  it('should render next piece preview', () => {
    render(<NextPiece piece={testPieces.I} />);
    
    expect(screen.getByText('Next Piece')).toBeInTheDocument();
  });

  it('should render I piece correctly', () => {
    render(<NextPiece piece={testPieces.I} />);
    
    const nextPieceElement = screen.getByText('Next Piece').closest('div');
    expect(nextPieceElement).toBeInTheDocument();
    expect(nextPieceElement).toHaveClass('next-piece');
  });

  it('should render O piece correctly', () => {
    render(<NextPiece piece={testPieces.O} />);
    
    expect(screen.getByText('Next Piece')).toBeInTheDocument();
  });

  it('should render T piece correctly', () => {
    render(<NextPiece piece={testPieces.T} />);
    
    expect(screen.getByText('Next Piece')).toBeInTheDocument();
  });

  it('should handle null piece gracefully', () => {
    const { container } = render(<NextPiece piece={null} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should handle undefined piece gracefully', () => {
    const { container } = render(<NextPiece piece={undefined} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should handle piece without shape', () => {
    const invalidPiece = { shape: [], color: 'red' };
    render(<NextPiece piece={invalidPiece} />);
    
    expect(screen.getByText('Next Piece')).toBeInTheDocument();
  });

  it('should handle empty shape array', () => {
    const emptyPiece = { shape: [], color: 'blue' };
    render(<NextPiece piece={emptyPiece} />);
    
    expect(screen.getByText('Next Piece')).toBeInTheDocument();
  });

  it('should apply correct styling', () => {
    render(<NextPiece piece={testPieces.I} />);
    
    const cells = document.querySelectorAll('.cell');
    expect(cells.length).toBeGreaterThan(0);
    
    // Test that filled cells have the piece color
    const filledCells = Array.from(cells).filter(cell => 
      cell.style.backgroundColor === testPieces.I.color
    );
    expect(filledCells.length).toBeGreaterThan(0);
  });

  it('should handle piece with complex shapes', () => {
    const complexPiece = {
      shape: [
        [1, 0, 1],
        [1, 1, 1],
        [0, 1, 0]
      ],
      color: 'pink'
    };
    
    render(<NextPiece piece={complexPiece} />);
    
    expect(screen.getByText('Next Piece')).toBeInTheDocument();
  });
});
