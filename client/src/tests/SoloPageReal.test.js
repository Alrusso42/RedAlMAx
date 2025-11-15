import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock useParams et useNavigate
const mockNavigate = jest.fn();
let mockParams = { pseudo: 'testuser' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

// Import du vrai composant
import SoloPage from '../components/SoloPage';

describe('SoloPage Component Complete Tests', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockParams = { pseudo: 'testuser' };
  });

  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  describe('With valid pseudo', () => {
    it('should render SoloPage without crashing', () => {
      renderWithRouter(<SoloPage />);
      expect(screen.getByText(/Mode Solo/)).toBeInTheDocument();
    });

    it('should display welcome message with pseudo', () => {
      renderWithRouter(<SoloPage />);
      expect(screen.getByText(/Bienvenue testuser/)).toBeInTheDocument();
    });

    it('should render all navigation buttons', () => {
      renderWithRouter(<SoloPage />);
      
      expect(screen.getByText('🎮 Jouer maintenant !')).toBeInTheDocument();
      expect(screen.getByText('← Retour aux modes')).toBeInTheDocument();
      expect(screen.getByText('🏠 Accueil')).toBeInTheDocument();
    });

    it('should handle play now button click', () => {
      renderWithRouter(<SoloPage />);
      
      const playButton = screen.getByText('🎮 Jouer maintenant !');
      fireEvent.click(playButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/play-solo/testuser');
    });

    it('should handle back to modes button click', () => {
      renderWithRouter(<SoloPage />);
      
      const backButton = screen.getByText('← Retour aux modes');
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/modes/testuser');
    });

    it('should handle back to home button click', () => {
      renderWithRouter(<SoloPage />);
      
      const homeButton = screen.getByText('🏠 Accueil');
      fireEvent.click(homeButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should render game description and icon', () => {
      renderWithRouter(<SoloPage />);
      
      expect(screen.getByText('🎮')).toBeInTheDocument();
      expect(screen.getByText(/Prêt à jouer en solo/)).toBeInTheDocument();
      expect(screen.getByText(/Battez vos propres records/)).toBeInTheDocument();
    });

    it('should handle pseudo with special characters', () => {
      mockParams = { pseudo: 'test@user#123' };
      renderWithRouter(<SoloPage />);
      
      const playButton = screen.getByText('🎮 Jouer maintenant !');
      fireEvent.click(playButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/play-solo/test%40user%23123');
    });
  });

  describe('Without pseudo (redirect scenario)', () => {
    it('should redirect to home when no pseudo provided', () => {
      mockParams = {}; // No pseudo
      const { container } = renderWithRouter(<SoloPage />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(container.firstChild).toBeNull();
    });

    it('should redirect to home when pseudo is undefined', () => {
      mockParams = { pseudo: undefined };
      renderWithRouter(<SoloPage />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should redirect to home when pseudo is empty string', () => {
      mockParams = { pseudo: '' };
      renderWithRouter(<SoloPage />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should redirect to home when pseudo is null', () => {
      mockParams = { pseudo: null };
      renderWithRouter(<SoloPage />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});