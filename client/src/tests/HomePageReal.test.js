import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate et localStorage
const mockNavigate = jest.fn();
const mockAlert = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock alert
const originalAlert = window.alert;

// Import du vrai composant
import HomePage from '../components/HomePage';

describe('HomePage Component Complete Tests', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockAlert.mockClear();
    localStorage.clear();
    window.alert = mockAlert;
  });

  afterAll(() => {
    window.alert = originalAlert;
  });

  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  describe('Rendering and UI', () => {
    it('should render HomePage without crashing', () => {
      renderWithRouter(<HomePage />);
      expect(screen.getByText('🎮 Tetris Multijoueur')).toBeInTheDocument();
    });

    it('should render all form elements', () => {
      renderWithRouter(<HomePage />);
      expect(screen.getByLabelText('Votre pseudo :')).toBeInTheDocument();
      expect(screen.getByLabelText('ID de la partie (optionnel) :')).toBeInTheDocument();
      expect(screen.getByText('🚀 Créer une partie')).toBeInTheDocument();
    });

    it('should display instructions', () => {
      renderWithRouter(<HomePage />);
      
      expect(screen.getByText('Comment jouer :')).toBeInTheDocument();
      expect(screen.getByText(/Entrez votre pseudo/)).toBeInTheDocument();
      expect(screen.getByText(/Créez une nouvelle partie/)).toBeInTheDocument();
      expect(screen.getByText(/Partagez l'URL/)).toBeInTheDocument();
      expect(screen.getByText(/Utilisez les flèches/)).toBeInTheDocument();
    });
  });

  describe('Form interactions', () => {
    it('should handle pseudo input changes', () => {
      renderWithRouter(<HomePage />);
      const pseudoInput = screen.getByPlaceholderText(/pseudo/i);
      
      fireEvent.change(pseudoInput, { target: { value: 'alice' } });
      expect(pseudoInput.value).toBe('alice');
    });

    it('should handle room id input changes', () => {
      renderWithRouter(<HomePage />);
      const roomInput = screen.getByPlaceholderText(/nouvelle partie/i);
      
      fireEvent.change(roomInput, { target: { value: 'room123' } });
      expect(roomInput.value).toBe('room123');
    });

    it('should respect maxLength limits', () => {
      renderWithRouter(<HomePage />);
      const pseudoInput = screen.getByPlaceholderText(/pseudo/i);
      const roomInput = screen.getByPlaceholderText(/nouvelle partie/i);
      
      expect(pseudoInput).toHaveAttribute('maxLength', '20');
      expect(roomInput).toHaveAttribute('maxLength', '30');
    });
  });

  describe('Form submission - valid cases', () => {
    it('should handle form submission with pseudo only', () => {
      renderWithRouter(<HomePage />);
      const pseudoInput = screen.getByPlaceholderText(/pseudo/i);
      const form = document.querySelector('form');
      
      fireEvent.change(pseudoInput, { target: { value: 'alice' } });
      fireEvent.submit(form);
      
      expect(mockNavigate).toHaveBeenCalledWith('/modes/alice');
    });

    it('should handle form submission with pseudo and roomId', () => {
      renderWithRouter(<HomePage />);
      const pseudoInput = screen.getByPlaceholderText(/pseudo/i);
      const roomInput = screen.getByPlaceholderText(/nouvelle partie/i);
      const form = document.querySelector('form');
      
      fireEvent.change(pseudoInput, { target: { value: 'alice' } });
      fireEvent.change(roomInput, { target: { value: 'room123' } });
      fireEvent.submit(form);
      
      expect(mockNavigate).toHaveBeenCalledWith('/modes/alice?roomId=room123');
    });

    it('should handle form submission via button click', () => {
      renderWithRouter(<HomePage />);
      const pseudoInput = screen.getByPlaceholderText(/pseudo/i);
      const createButton = screen.getByText('🚀 Créer une partie');
      
      fireEvent.change(pseudoInput, { target: { value: 'alice' } });
      fireEvent.click(createButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/modes/alice');
    });

    it('should trim whitespace from inputs', () => {
      renderWithRouter(<HomePage />);
      const pseudoInput = screen.getByPlaceholderText(/pseudo/i);
      const roomInput = screen.getByPlaceholderText(/nouvelle partie/i);
      const form = document.querySelector('form');
      
      fireEvent.change(pseudoInput, { target: { value: '  alice  ' } });
      fireEvent.change(roomInput, { target: { value: '  room123  ' } });
      fireEvent.submit(form);
      
      expect(mockNavigate).toHaveBeenCalledWith('/modes/alice?roomId=room123');
    });

    it('should handle special characters in pseudo', () => {
      renderWithRouter(<HomePage />);
      const pseudoInput = screen.getByPlaceholderText(/pseudo/i);
      const form = document.querySelector('form');
      
      fireEvent.change(pseudoInput, { target: { value: 'alice@test#123' } });
      fireEvent.submit(form);
      
      expect(mockNavigate).toHaveBeenCalledWith('/modes/alice%40test%23123');
    });
  });

  describe('Form submission - validation', () => {
    it('should show alert when pseudo is empty', () => {
      renderWithRouter(<HomePage />);
      const createButton = screen.getByText('🚀 Créer une partie');
      
      fireEvent.click(createButton);
      
      expect(mockAlert).toHaveBeenCalledWith('Veuillez entrer votre pseudo !');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show alert when pseudo is only whitespace', () => {
      renderWithRouter(<HomePage />);
      const pseudoInput = screen.getByPlaceholderText(/pseudo/i);
      const form = document.querySelector('form');
      
      fireEvent.change(pseudoInput, { target: { value: '   ' } });
      fireEvent.submit(form);
      
      expect(mockAlert).toHaveBeenCalledWith('Veuillez entrer votre pseudo !');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should prevent default form submission when pseudo is empty', () => {
      renderWithRouter(<HomePage />);
      const form = document.querySelector('form');
      
      // Mock preventDefault to verify it's called
      const originalSubmit = form.submit;
      form.submit = jest.fn();
      
      fireEvent.submit(form);
      
      // Should show alert and not navigate
      expect(mockAlert).toHaveBeenCalledWith('Veuillez entrer votre pseudo !');
      expect(mockNavigate).not.toHaveBeenCalled();
      
      form.submit = originalSubmit;
    });
  });

  describe('LocalStorage functionality', () => {
    it('should save pseudo to localStorage', () => {
      renderWithRouter(<HomePage />);
      const pseudoInput = screen.getByPlaceholderText(/pseudo/i);
      const form = document.querySelector('form');
      
      fireEvent.change(pseudoInput, { target: { value: 'alice' } });
      fireEvent.submit(form);
      
      const saved = JSON.parse(localStorage.getItem('tetris_used_names') || '{}');
      expect(saved.pseudos).toContain('alice');
    });

    it('should save roomId to localStorage when provided', () => {
      renderWithRouter(<HomePage />);
      const pseudoInput = screen.getByPlaceholderText(/pseudo/i);
      const roomInput = screen.getByPlaceholderText(/nouvelle partie/i);
      const form = document.querySelector('form');
      
      fireEvent.change(pseudoInput, { target: { value: 'alice' } });
      fireEvent.change(roomInput, { target: { value: 'room123' } });
      fireEvent.submit(form);
      
      const saved = JSON.parse(localStorage.getItem('tetris_used_names') || '{}');
      expect(saved.rooms).toContain('room123');
    });

    it('should handle existing localStorage data', () => {
      localStorage.setItem('tetris_used_names', JSON.stringify({
        pseudos: ['existing'],
        rooms: ['existingRoom']
      }));
      
      renderWithRouter(<HomePage />);
      const pseudoInput = screen.getByPlaceholderText(/pseudo/i);
      const form = document.querySelector('form');
      
      fireEvent.change(pseudoInput, { target: { value: 'alice' } });
      fireEvent.submit(form);
      
      const saved = JSON.parse(localStorage.getItem('tetris_used_names') || '{}');
      expect(saved.pseudos).toEqual(['existing', 'alice']);
    });

    it('should handle corrupted localStorage gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      localStorage.setItem('tetris_used_names', 'invalid json');
      
      renderWithRouter(<HomePage />);
      const pseudoInput = screen.getByPlaceholderText(/pseudo/i);
      const form = document.querySelector('form');
      
      fireEvent.change(pseudoInput, { target: { value: 'alice' } });
      fireEvent.submit(form);
      
      expect(mockNavigate).toHaveBeenCalledWith('/modes/alice');
      expect(consoleSpy).toHaveBeenCalledWith('Error parsing stored names:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should limit stored entries to 50', () => {
      const longList = Array.from({length: 55}, (_, i) => `user${i}`);
      localStorage.setItem('tetris_used_names', JSON.stringify({
        pseudos: longList,
        rooms: []
      }));
      
      renderWithRouter(<HomePage />);
      const pseudoInput = screen.getByPlaceholderText(/pseudo/i);
      const form = document.querySelector('form');
      
      fireEvent.change(pseudoInput, { target: { value: 'newuser' } });
      fireEvent.submit(form);
      
      const saved = JSON.parse(localStorage.getItem('tetris_used_names') || '{}');
      expect(saved.pseudos.length).toBeLessThanOrEqual(50);
    });
  });
});