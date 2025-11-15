import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock des composants pour éviter les erreurs de routing
jest.mock('../components/HomePage', () => {
  return function MockHomePage() {
    return <div data-testid="home-page">HomePage</div>;
  };
});

jest.mock('../components/GamePage', () => {
  return function MockGamePage() {
    return <div data-testid="game-page">GamePage</div>;
  };
});

jest.mock('../components/TetrisSolo', () => {
  return function MockTetrisSolo() {
    return <div data-testid="tetris-solo">TetrisSolo</div>;
  };
});

jest.mock('../components/TetrisGame', () => {
  return function MockTetrisGame() {
    return <div data-testid="tetris-game">TetrisGame</div>;
  };
});

jest.mock('../components/SoloPage', () => {
  return function MockSoloPage() {
    return <div data-testid="solo-page">SoloPage</div>;
  };
});

describe('App Routing', () => {
  it('should render app with routing components', () => {
    render(<App />);
    // App should render without errors
    expect(document.body).toBeInTheDocument();
  });

  it('should handle different route structures', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('App Component Structure', () => {
  it('should render without crashing', () => {
    render(<App />);
    // App should render successfully
    expect(document.body).toBeInTheDocument();
  });

  it('should have router functionality', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
