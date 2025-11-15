import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }) => <div data-testid="route">{element}</div>,
}));

// Mock des composants pour éviter les dépendances circulaires
jest.mock('../components/HomePage', () => {
  return function MockHomePage() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('../components/TetrisGame', () => {
  return function MockTetrisGame() {
    return <div data-testid="tetris-game">Tetris Game</div>;
  };
});

jest.mock('../components/TetrisSolo', () => {
  return function MockTetrisSolo() {
    return <div data-testid="tetris-solo">Tetris Solo</div>;
  };
});

jest.mock('../components/SoloPage', () => {
  return function MockSoloPage() {
    return <div data-testid="solo-page">Solo Page</div>;
  };
});

jest.mock('../components/GamePage', () => {
  return function MockGamePage() {
    return <div data-testid="game-page">Game Page</div>;
  };
});

// Import du vrai composant App
import App from '../App';

describe('App Component Real Tests', () => {
  it('should render App without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('should render Routes structure', () => {
    render(<App />);
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('should setup routing structure', () => {
    render(<App />);
    
    // Should have routing elements
    expect(screen.getByTestId('router')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('should render route components', () => {
    render(<App />);
    
    // Should render at least one route
    const routes = screen.getAllByTestId('route');
    expect(routes.length).toBeGreaterThan(0);
  });
});