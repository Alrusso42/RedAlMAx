// TetrisSolo.jsx - Version solo du jeu Tetris
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameAera from "./GameAera";
import "../App.css";

// Logique de jeu simplifiée pour le mode solo
class TetrisSoloGame {
  constructor() {
    this.board = Array(20).fill(null).map(() => Array(10).fill(0));
    this.score = 0;
    this.level = 1;
    this.linesCleared = 0;
    this.currentPiece = this.generatePiece();
    this.nextPiece = this.generatePiece();
    this.gameOver = false;
    this.isPaused = false;
  }

  generatePiece() {
    const pieces = [
      { shape: [[1,1,1,1]], color: "cyan" }, // I
      { shape: [[1,1],[1,1]], color: "yellow" }, // O
      { shape: [[0,1,0],[1,1,1]], color: "purple" }, // T
      { shape: [[0,1,1],[1,1,0]], color: "green" }, // S
      { shape: [[1,1,0],[0,1,1]], color: "red" }, // Z
      { shape: [[1,0,0],[1,1,1]], color: "orange" }, // L
      { shape: [[0,0,1],[1,1,1]], color: "blue" }, // J
    ];
    
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    return {
      ...piece,
      position: { x: 4, y: 0 }
    };
  }

  canMove(piece, dx, dy, newShape = null) {
    const shape = newShape || piece.shape;
    const newX = piece.position.x + dx;
    const newY = piece.position.y + dy;

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] !== 0) {
          const boardX = newX + col;
          const boardY = newY + row;

          if (boardX < 0 || boardX >= 10 || boardY >= 20) {
            return false;
          }
          if (boardY >= 0 && this.board[boardY][boardX] !== 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  movePiece(dx, dy) {
    if (this.canMove(this.currentPiece, dx, dy)) {
      this.currentPiece.position.x += dx;
      this.currentPiece.position.y += dy;
      return true;
    }
    return false;
  }

  rotatePiece() {
    const rotated = this.currentPiece.shape[0].map((_, index) =>
      this.currentPiece.shape.map(row => row[index]).reverse()
    );
    
    if (this.canMove(this.currentPiece, 0, 0, rotated)) {
      this.currentPiece.shape = rotated;
    }
  }

  dropPiece() {
    if (!this.movePiece(0, 1)) {
      this.lockPiece();
    }
  }

  hardDrop() {
    while (this.movePiece(0, 1)) {
      this.score += 2;
    }
    this.lockPiece();
  }

  lockPiece() {
    const { shape, position } = this.currentPiece;
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] !== 0) {
          const boardY = position.y + row;
          const boardX = position.x + col;
          
          if (boardY < 0) {
            this.gameOver = true;
            return;
          }
          
          if (boardY >= 0 && boardY < 20) {
            this.board[boardY][boardX] = shape[row][col];
          }
        }
      }
    }

    this.clearLines();
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.generatePiece();

    if (!this.canMove(this.currentPiece, 0, 0)) {
      this.gameOver = true;
    }
  }

  clearLines() {
    let linesCleared = 0;
    
    for (let row = 19; row >= 0; row--) {
      if (this.board[row].every(cell => cell !== 0)) {
        this.board.splice(row, 1);
        this.board.unshift(Array(10).fill(0));
        linesCleared++;
        row++; // Revérifier cette ligne
      }
    }

    if (linesCleared > 0) {
      this.linesCleared += linesCleared;
      this.score += linesCleared * 100 * this.level;
      this.level = Math.floor(this.linesCleared / 10) + 1;
    }
  }

  getGameState() {
    return {
      board: this.board,
      currentPiece: this.currentPiece,
      nextPiece: this.nextPiece,
      score: this.score,
      level: this.level,
      gameOver: this.gameOver,
      isPaused: this.isPaused
    };
  }
}

export default function TetrisSolo() {
  const { pseudo } = useParams();
  const navigate = useNavigate();
  const [game] = useState(() => new TetrisSoloGame());
  const [gameState, setGameState] = useState(game.getGameState());

  const updateGameState = useCallback(() => {
    setGameState({ ...game.getGameState() });
  }, [game]);

  // Gestion des touches
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (game.gameOver || game.isPaused) return;

      switch (event.code) {
        case "ArrowLeft":
          game.movePiece(-1, 0);
          updateGameState();
          break;
        case "ArrowRight":
          game.movePiece(1, 0);
          updateGameState();
          break;
        case "ArrowUp":
          game.rotatePiece();
          updateGameState();
          break;
        case "ArrowDown":
          game.dropPiece();
          updateGameState();
          break;
        case "Space":
          event.preventDefault();
          game.hardDrop();
          updateGameState();
          break;
        case "KeyP":
          game.isPaused = !game.isPaused;
          updateGameState();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game, updateGameState]);

  // Boucle de jeu
  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (!game.gameOver && !game.isPaused) {
        game.dropPiece();
        updateGameState();
      }
    }, Math.max(50, 500 - (game.level - 1) * 50));

    return () => clearInterval(gameLoop);
  }, [game, updateGameState, gameState.level]);

  const handleRestart = () => {
    const newGame = new TetrisSoloGame();
    Object.assign(game, newGame);
    updateGameState();
  };

  const handleBackToModes = () => {
    navigate(`/modes/${encodeURIComponent(pseudo)}`);
  };

  // Rediriger si pas de pseudo (après tous les hooks)
  if (!pseudo) {
    navigate('/');
    return null;
  }

  return (
    <div className="App">
      <h1>🎯 Mode Solo Tetris</h1>
      <h2>Joueur: {pseudo}</h2>

      {/* Contrôles */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => { game.isPaused = !game.isPaused; updateGameState(); }}
          style={{ 
            marginRight: '10px', 
            padding: '10px 20px', 
            fontSize: '1em',
            backgroundColor: gameState.isPaused ? '#4caf50' : '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {gameState.isPaused ? '▶️ Reprendre' : '⏸️ Pause'}
        </button>
        
        <button 
          onClick={handleBackToModes}
          style={{ 
            marginRight: '10px', 
            padding: '10px 20px', 
            fontSize: '1em',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ← Modes
        </button>
      </div>

      {/* Pause */}
      {gameState.isPaused && !gameState.gameOver && (
        <div style={{ 
          fontSize: '2em', 
          color: '#ff9800', 
          marginBottom: '20px',
          fontWeight: 'bold' 
        }}>
          ⏸️ PAUSE
        </div>
      )}

      {/* Game Over */}
      {gameState.gameOver && (
        <div style={{ 
          backgroundColor: 'rgba(255, 0, 0, 0.1)', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px' 
        }}>
          <h2 style={{ color: '#f44336' }}>🏁 Game Over!</h2>
          <p>Score final: <strong>{gameState.score}</strong></p>
          <p>Niveau atteint: <strong>{gameState.level}</strong></p>
          <button 
            onClick={handleRestart}
            style={{ 
              padding: '10px 20px', 
              fontSize: '1.2em',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔄 Rejouer
          </button>
        </div>
      )}

      {/* Grille de jeu - Version adaptée sans spectrum */}
      <div className="player-container">
        <GameAera
          board={gameState.board}
          currentPiece={gameState.currentPiece}
          nextPiece={gameState.nextPiece}
          score={gameState.score}
          level={gameState.level}
          opponentSpectrum={[]} // Pas de spectrum en solo
          playerName={pseudo}
          // Ne pas passer opponentName pour cacher la section adversaire
        />
      </div>

      {/* Instructions */}
      <div style={{ 
        marginTop: '20px', 
        fontSize: '0.9em', 
        color: '#666',
        textAlign: 'center' 
      }}>
        <p>
          <strong>Contrôles:</strong> ←→ Déplacer | ↑ Tourner | ↓ Descendre | Espace Chute rapide | P Pause
        </p>
      </div>
    </div>
  );
}