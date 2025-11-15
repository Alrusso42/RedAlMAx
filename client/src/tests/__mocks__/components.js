// Mock components that use react-router-dom to avoid issues
import React from 'react';

export const HomePage = () => <div data-testid="home-page">HomePage Mock</div>;
export const GamePage = () => <div data-testid="game-page">GamePage Mock</div>;
export const TetrisSolo = () => <div data-testid="tetris-solo">TetrisSolo Mock</div>;
export const TetrisGame = () => <div data-testid="tetris-game">TetrisGame Mock</div>;
export const SoloPage = () => <div data-testid="solo-page">SoloPage Mock</div>;