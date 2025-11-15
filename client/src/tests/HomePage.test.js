import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../components/HomePage';

// Mock useNavigate
const mockNavigate = jest.fn();

describe('HomePage Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  const renderHomePage = () => {
    return render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
  };

  it('should render all form elements', () => {
    renderHomePage();
    
    expect(screen.getByPlaceholderText('Entrez votre pseudo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Entrez l\'ID de la room (optionnel)')).toBeInTheDocument();
    expect(screen.getByText('Commencer')).toBeInTheDocument();
  });

  it('should handle pseudo input changes', () => {
    renderHomePage();
    
    const pseudoInput = screen.getByPlaceholderText('Entrez votre pseudo');
    fireEvent.change(pseudoInput, { target: { value: 'testuser' } });
    
    expect(pseudoInput.value).toBe('testuser');
  });

  it('should handle room ID input changes', () => {
    renderHomePage();
    
    const roomInput = screen.getByPlaceholderText('Entrez l\'ID de la room (optionnel)');
    fireEvent.change(roomInput, { target: { value: 'testroom' } });
    
    expect(roomInput.value).toBe('testroom');
  });

  it('should prevent form submission without pseudo', () => {
    renderHomePage();
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should navigate to modes when pseudo provided without room ID', () => {
    renderHomePage();
    
    const pseudoInput = screen.getByPlaceholderText('Entrez votre pseudo');
    const form = screen.getByRole('form');
    
    fireEvent.change(pseudoInput, { target: { value: 'testuser' } });
    fireEvent.submit(form);
    
    expect(mockNavigate).toHaveBeenCalledWith('/modes/testuser');
  });

  it('should navigate to game directly when room ID provided', () => {
    renderHomePage();
    
    const pseudoInput = screen.getByPlaceholderText('Entrez votre pseudo');
    const roomInput = screen.getByPlaceholderText('Entrez l\'ID de la room (optionnel)');
    const form = screen.getByRole('form');
    
    fireEvent.change(pseudoInput, { target: { value: 'testuser' } });
    fireEvent.change(roomInput, { target: { value: 'testroom' } });
    fireEvent.submit(form);
    
    expect(mockNavigate).toHaveBeenCalledWith('/testroom/testuser');
  });

  it('should save pseudo to localStorage on form submission', () => {
    renderHomePage();
    
    const pseudoInput = screen.getByPlaceholderText('Entrez votre pseudo');
    const form = screen.getByRole('form');
    
    fireEvent.change(pseudoInput, { target: { value: 'testuser' } });
    fireEvent.submit(form);
    
    expect(localStorage.getItem('playerPseudo')).toBe('testuser');
  });

  it('should trim whitespace from pseudo input', () => {
    renderHomePage();
    
    const pseudoInput = screen.getByPlaceholderText('Entrez votre pseudo');
    const form = screen.getByRole('form');
    
    fireEvent.change(pseudoInput, { target: { value: '  testuser  ' } });
    fireEvent.submit(form);
    
    expect(localStorage.getItem('playerPseudo')).toBe('testuser');
  });

  it('should not navigate with only whitespace pseudo', () => {
    renderHomePage();
    
    const pseudoInput = screen.getByPlaceholderText('Entrez votre pseudo');
    const form = screen.getByRole('form');
    
    fireEvent.change(pseudoInput, { target: { value: '   ' } });
    fireEvent.submit(form);
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle button click navigation', () => {
    renderHomePage();
    
    const pseudoInput = screen.getByPlaceholderText('Entrez votre pseudo');
    const submitButton = screen.getByText('Commencer');
    
    fireEvent.change(pseudoInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/modes/testuser');
  });
});
