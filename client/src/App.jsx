// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import TetrisGame from './components/TetrisGame';
import TetrisSolo from './components/TetrisSolo';
import GamePage from './components/GamePage';
import SoloPage from './components/SoloPage';
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Page d'accueil */}
        <Route path="/" element={<HomePage />} />
        
        {/* Page de sélection de mode */}
        <Route path="/modes/:pseudo" element={<GamePage />} />
        
        {/* Jeu Tetris solo */}
        <Route path="/play-solo/:pseudo" element={<TetrisSolo />} />
        
        {/* Page mode solo avec pseudo (page temporaire) */}
        <Route path="/solo/:pseudo" element={<SoloPage />} />
        
        {/* Route du jeu Tetris avec room et playerName */}
        <Route path="/:roomId/:playerName" element={<TetrisGame />} />
      </Routes>
    </Router>
  );
}
