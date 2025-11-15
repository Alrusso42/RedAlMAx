import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GamePage from '../components/GamePage';

// Mock useNavigate and useParams
const mockNavigate = jest.fn();
const mockParams = { pseudo: 'testuser' };

  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

describe('GamePage Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderGamePage = () => {
    return render(
      <MemoryRouter>
        <GamePage />
      </MemoryRouter>
    );
  };

  it('should render game mode selection', () => {
    renderGamePage();
    
    expect(screen.getByText('Choisissez votre mode de jeu')).toBeInTheDocument();
    expect(screen.getByText('Solo')).toBeInTheDocument();
    expect(screen.getByText('Multi')).toBeInTheDocument();
  });

  it('should display user pseudo', () => {
    renderGamePage();
    
    expect(screen.getByText('Bienvenue, testuser!')).toBeInTheDocument();
  });

  it('should navigate to solo mode when Solo button clicked', () => {
    renderGamePage();
    
    const soloButton = screen.getByText('Solo');
    fireEvent.click(soloButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/solo/testuser');
  });

  it('should show room creation form when Multi button clicked', async () => {
    renderGamePage();
    
    const multiButton = screen.getByText('Multi');
    fireEvent.click(multiButton);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('ID de la room (optionnel)')).toBeInTheDocument();
      expect(screen.getByText('Rejoindre/Créer')).toBeInTheDocument();
    });
  });

  it('should handle room form submission with room ID', async () => {
    renderGamePage();
    
    const multiButton = screen.getByText('Multi');
    fireEvent.click(multiButton);
    
    await waitFor(() => {
      const roomInput = screen.getByPlaceholderText('ID de la room (optionnel)');
      const joinButton = screen.getByText('Rejoindre/Créer');
      
      fireEvent.change(roomInput, { target: { value: 'testroom' } });
      fireEvent.click(joinButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/testroom/testuser');
    });
  });

  it('should generate random room ID when none provided', async () => {
    // Mock Math.random to ensure predictable behavior
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.123456789);
    
    renderGamePage();
    
    const multiButton = screen.getByText('Multi');
    fireEvent.click(multiButton);
    
    await waitFor(() => {
      const joinButton = screen.getByText('Rejoindre/Créer');
      fireEvent.click(joinButton);
      
      // Should navigate with generated room ID
      expect(mockNavigate).toHaveBeenCalled();
      const calledWith = mockNavigate.mock.calls[0][0];
      expect(calledWith).toMatch(/^\/[A-Z0-9]{6}\/testuser$/);
    });
    
    Math.random = originalRandom;
  });

  it('should handle room input changes', async () => {
    renderGamePage();
    
    const multiButton = screen.getByText('Multi');
    fireEvent.click(multiButton);
    
    await waitFor(() => {
      const roomInput = screen.getByPlaceholderText('ID de la room (optionnel)');
      fireEvent.change(roomInput, { target: { value: 'myroom' } });
      
      expect(roomInput.value).toBe('myroom');
    });
  });

  it('should not show room form initially', () => {
    renderGamePage();
    
    expect(screen.queryByPlaceholderText('ID de la room (optionnel)')).not.toBeInTheDocument();
  });

  it('should handle form submission via Enter key', async () => {
    renderGamePage();
    
    const multiButton = screen.getByText('Multi');
    fireEvent.click(multiButton);
    
    await waitFor(() => {
      const roomInput = screen.getByPlaceholderText('ID de la room (optionnel)');
      
      fireEvent.change(roomInput, { target: { value: 'testroom' } });
      fireEvent.keyPress(roomInput, { key: 'Enter', code: 13, charCode: 13 });
      
      expect(mockNavigate).toHaveBeenCalledWith('/testroom/testuser');
    });
  });

  it('should handle empty room ID gracefully', async () => {
    renderGamePage();
    
    const multiButton = screen.getByText('Multi');
    fireEvent.click(multiButton);
    
    await waitFor(() => {
      const roomInput = screen.getByPlaceholderText('ID de la room (optionnel)');
      const joinButton = screen.getByText('Rejoindre/Créer');
      
      // Leave room input empty
      fireEvent.click(joinButton);
      
      // Should still navigate with generated room
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});
