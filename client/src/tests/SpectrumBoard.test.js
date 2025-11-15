import React from 'react';
import { render, screen } from '@testing-library/react';
import SpectrumBoard from '../components/SpectrumBoard';

describe('SpectrumBoard Component', () => {
  const validSpectrum = Array(20).fill().map(() => Array(10).fill(0));

  it('should render spectrum board with valid data', () => {
    render(<SpectrumBoard spectrum={validSpectrum} />);
    
    // Should not show "En attente..."
    expect(screen.queryByText('En attente...')).not.toBeInTheDocument();
    // Should have spectrum board class
    expect(document.querySelector('.spectrum-board')).toBeInTheDocument();
  });

  it('should render empty state when no spectrum provided', () => {
    render(<SpectrumBoard />);
    
    // Should show "En attente..."
    expect(screen.getByText('En attente...')).toBeInTheDocument();
  });

  it('should handle empty spectrum array', () => {
    render(<SpectrumBoard spectrum={[]} />);
    
    // Should show "En attente..."
    expect(screen.getByText('En attente...')).toBeInTheDocument();
  });

  it('should handle null spectrum', () => {
    render(<SpectrumBoard spectrum={null} />);
    
    // Should show "En attente..."
    expect(screen.getByText('En attente...')).toBeInTheDocument();
  });

  it('should render spectrum rows and cells', () => {
    const spectrum = [
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
    ];
    
    render(<SpectrumBoard spectrum={spectrum} />);
    
    // Should have spectrum rows
    const rows = document.querySelectorAll('.spectrum-row');
    expect(rows).toHaveLength(2);
    
    // Should have spectrum cells
    const cells = document.querySelectorAll('.spectrum-cell');
    expect(cells).toHaveLength(20); // 2 rows * 10 cells
  });

  it('should apply correct CSS classes to cells', () => {
    const spectrum = [
      [0, 1, 9, 5, 0, 0, 0, 0, 0, 0], // empty, filled, penalty, filled
    ];
    
    render(<SpectrumBoard spectrum={spectrum} />);
    
    const cells = document.querySelectorAll('.spectrum-cell');
    expect(cells[0]).toHaveClass('empty');
    expect(cells[1]).toHaveClass('filled');
    expect(cells[2]).toHaveClass('penalty');
    expect(cells[3]).toHaveClass('filled');
  });

  it('should filter out invalid rows', () => {
    const spectrum = [
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0], // valid 10 cells
      [1, 0, 1], // invalid - too short
      null, // invalid - null
      "not array", // invalid - not array
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1], // invalid - too long
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1] // valid 10 cells
    ];
    
    render(<SpectrumBoard spectrum={spectrum} />);
    
    // Should only render valid rows (2 rows)
    const rows = document.querySelectorAll('.spectrum-row');
    expect(rows).toHaveLength(2);
  });

});
