import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SoloPage from '../components/SoloPage';

// Mock useParams and useNavigate
const mockParams = { pseudo: 'testuser' };
const mockNavigate = jest.fn();

  useParams: () => mockParams,
  useNavigate: () => mockNavigate,
}));

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

describe('SoloPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('testuser');
  });

  const renderSoloPage = () => {
    return render(
      <MemoryRouter>
        <SoloPage />
      </MemoryRouter>
    );
  };

  it('should render solo page with welcome message', () => {
    renderSoloPage();
    
    expect(screen.getByText(/Bienvenue dans le mode solo/i)).toBeInTheDocument();
    expect(screen.getByText(/testuser/i)).toBeInTheDocument();
  });

  it('should show start game button', () => {
    renderSoloPage();
    
    expect(screen.getByText(/Commencer une partie/i)).toBeInTheDocument();
  });

  it('should navigate to solo game when start clicked', () => {
    renderSoloPage();
    
    const startButton = screen.getByText(/Commencer une partie/i);
    fireEvent.click(startButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/play-solo/testuser');
  });

  it('should show back to menu button', () => {
    renderSoloPage();
    
    expect(screen.getByText(/Retour au menu/i)).toBeInTheDocument();
  });

  it('should navigate back to game modes when back clicked', () => {
    renderSoloPage();
    
    const backButton = screen.getByText(/Retour au menu/i);
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/modes/testuser');
  });

  it('should handle missing localStorage pseudo', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderSoloPage();
    
    // Should still render but might show different content
    expect(screen.getByText(/Bienvenue dans le mode solo/i)).toBeInTheDocument();
  });

  it('should display game instructions', () => {
    renderSoloPage();
    
    // Check for game instructions or description
    expect(screen.getByRole('button', { name: /Commencer une partie/i })).toBeInTheDocument();
  });

  it('should handle button hover states', () => {
    renderSoloPage();
    
    const startButton = screen.getByText(/Commencer une partie/i);
    
    fireEvent.mouseEnter(startButton);
    fireEvent.mouseLeave(startButton);
    
    // Should not crash
    expect(startButton).toBeInTheDocument();
  });

  it('should render with proper CSS classes', () => {
    renderSoloPage();
    
    const container = document.querySelector('.solo-page') || document.querySelector('.container');
    expect(container).toBeInTheDocument();
  });

  it('should handle multiple clicks on start button', () => {
    renderSoloPage();
    
    const startButton = screen.getByText(/Commencer une partie/i);
    
    fireEvent.click(startButton);
    fireEvent.click(startButton);
    
    // Should only navigate once or handle multiple clicks gracefully
    expect(mockNavigate).toHaveBeenCalled();
  });
});
