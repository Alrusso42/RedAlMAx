import React from 'react';
import ReactDOM from 'react-dom/client';

// Mock des dépendances
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn()
  }))
}));

jest.mock('../App', () => {
  return function MockApp() {
    return <div data-testid="mock-app">Mock App</div>;
  };
});

jest.mock('../reportWebVitals', () => jest.fn());

describe('Index.jsx Tests', () => {
  beforeEach(() => {
    // Mock document.getElementById
    document.getElementById = jest.fn(() => ({
      id: 'root'
    }));
  });

  it('should create root and render app', () => {
    const mockRender = jest.fn();
    const mockCreateRoot = jest.fn(() => ({ render: mockRender }));
    ReactDOM.createRoot = mockCreateRoot;

    // Import et exécution du code index
    require('../index.jsx');

    expect(mockCreateRoot).toHaveBeenCalledWith({ id: 'root' });
  });
});