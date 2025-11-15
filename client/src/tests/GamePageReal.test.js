import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// Mock des hooks de navigation
const mockNavigate = jest.fn();
let mockParams = { pseudo: 'testuser' };
let mockLocation = { search: '' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
  useLocation: () => mockLocation,
}));

// Import du vrai composant
import GamePage from '../components/GamePage';

describe('GamePage Component Complete Tests', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockParams = { pseudo: 'testuser' };
    mockLocation = { search: '' };
    // Mock Date.now for consistent timestamps
    jest.spyOn(Date, 'now').mockReturnValue(1234567890123);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  describe('With valid pseudo', () => {
    it('should render GamePage without crashing', () => {
      renderWithRouter(<GamePage />);
      expect(screen.getByText('🎮 Choisissez votre mode')).toBeInTheDocument();
    });

    it('should display user information', () => {
      renderWithRouter(<GamePage />);
      expect(screen.getByText(/Salut testuser/)).toBeInTheDocument();
    });

    it('should render both mode cards', () => {
      renderWithRouter(<GamePage />);
      
      expect(screen.getByText('Mode Solo')).toBeInTheDocument();
      expect(screen.getByText('Mode Multijoueur')).toBeInTheDocument();
      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('👥')).toBeInTheDocument();
    });

    it('should display mode descriptions', () => {
      renderWithRouter(<GamePage />);
      
      expect(screen.getByText(/Jouez seul et battez vos records/)).toBeInTheDocument();
      expect(screen.getByText(/Affrontez d'autres joueurs en ligne/)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      renderWithRouter(<GamePage />);
      
      expect(screen.getByText('Jouer en Solo')).toBeInTheDocument();
      expect(screen.getByText('Jouer en Multi')).toBeInTheDocument();
      expect(screen.getByText('← Retour à l\'accueil')).toBeInTheDocument();
    });
  });

  describe('Navigation actions', () => {
    it('should handle solo mode button click', () => {
      renderWithRouter(<GamePage />);
      
      const soloButton = screen.getByText('Jouer en Solo');
      fireEvent.click(soloButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/play-solo/testuser');
    });

    it('should handle solo mode card click', () => {
      renderWithRouter(<GamePage />);
      
      const soloCard = screen.getByText('Mode Solo').closest('.mode-card');
      fireEvent.click(soloCard);
      
      expect(mockNavigate).toHaveBeenCalledWith('/play-solo/testuser');
    });

    it('should handle multi mode button click without roomId', () => {
      renderWithRouter(<GamePage />);
      
      const multiButton = screen.getByText('Jouer en Multi');
      fireEvent.click(multiButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/room_1234567890123/testuser');
    });

    it('should handle multi mode card click without roomId', () => {
      renderWithRouter(<GamePage />);
      
      const multiCard = screen.getByText('Mode Multijoueur').closest('.mode-card');
      fireEvent.click(multiCard);
      
      expect(mockNavigate).toHaveBeenCalledWith('/room_1234567890123/testuser');
    });

    it('should handle back to home button click', () => {
      renderWithRouter(<GamePage />);
      
      const backButton = screen.getByText('← Retour à l\'accueil');
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('With roomId in query params', () => {
    beforeEach(() => {
      mockLocation = { search: '?roomId=customroom123' };
    });

    it('should display custom room information', () => {
      renderWithRouter(<GamePage />);
      
      expect(screen.getByText(/Room personnalisée : customroom123/)).toBeInTheDocument();
      expect(screen.getByText(/Room : customroom123/)).toBeInTheDocument();
    });

    it('should use custom roomId for multi mode navigation', () => {
      renderWithRouter(<GamePage />);
      
      const multiButton = screen.getByText('Jouer en Multi');
      fireEvent.click(multiButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/customroom123/testuser');
    });

    it('should show room auto-generated text when no roomId', () => {
      mockLocation = { search: '' };
      renderWithRouter(<GamePage />);
      
      expect(screen.getByText(/Room auto-générée/)).toBeInTheDocument();
    });
  });

  describe('Without pseudo (redirect scenario)', () => {
    it('should redirect to home when no pseudo provided', () => {
      mockParams = {};
      const { container } = renderWithRouter(<GamePage />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(container.firstChild).toBeNull();
    });

    it('should redirect to home when pseudo is undefined', () => {
      mockParams = { pseudo: undefined };
      renderWithRouter(<GamePage />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should redirect to home when pseudo is empty', () => {
      mockParams = { pseudo: '' };
      renderWithRouter(<GamePage />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should redirect to home when pseudo is null', () => {
      mockParams = { pseudo: null };
      renderWithRouter(<GamePage />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Special characters in pseudo', () => {
    it('should handle special characters in solo navigation', () => {
      mockParams = { pseudo: 'test@user#123' };
      renderWithRouter(<GamePage />);
      
      const soloButton = screen.getByText('Jouer en Solo');
      fireEvent.click(soloButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/play-solo/test%40user%23123');
    });

    it('should handle special characters in multi navigation', () => {
      mockParams = { pseudo: 'test@user#123' };
      mockLocation = { search: '?roomId=room@test#456' };
      renderWithRouter(<GamePage />);
      
      const multiButton = screen.getByText('Jouer en Multi');
      fireEvent.click(multiButton);
      
      // roomId is used as-is, pseudo is encoded
      expect(mockNavigate).toHaveBeenCalledWith('/room@test#456/test%40user%23123');
    });
  });

  describe('URLSearchParams functionality', () => {
    it('should parse roomId from query string correctly', () => {
      mockLocation = { search: '?roomId=test123&other=value' };
      renderWithRouter(<GamePage />);
      
      expect(screen.getByText(/Room : test123/)).toBeInTheDocument();
    });

    it('should handle empty query string', () => {
      mockLocation = { search: '' };
      renderWithRouter(<GamePage />);
      
      expect(screen.getByText(/Room auto-générée/)).toBeInTheDocument();
    });

    it('should handle query string without roomId', () => {
      mockLocation = { search: '?other=value&another=param' };
      renderWithRouter(<GamePage />);
      
      expect(screen.getByText(/Room auto-générée/)).toBeInTheDocument();
    });
  });
});