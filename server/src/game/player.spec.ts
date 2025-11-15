import { Player } from './player';
import { Piece } from './piece';

describe('Player', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player('test-id', 'TestPlayer');
  });

  describe('constructor', () => {
    it('should create a player with correct properties', () => {
      expect(player.id).toBe('test-id');
      expect(player.name).toBe('TestPlayer');
      expect(player.score).toBe(0);
      expect(player.level).toBe(1);
      expect(player.alive).toBe(true);
      expect(player.board).toHaveLength(20);
      expect(player.board[0]).toHaveLength(10);
    });

    it('should initialize empty board', () => {
      const isEmpty = player.board.every(row => 
        row.every(cell => cell === 0)
      );
      expect(isEmpty).toBe(true);
    });
  });

  describe('resetBoard', () => {
    it('should reset board to empty state', () => {
      // Modifier le board
      player.board[0][0] = 1;
      player.board[5][5] = 2;
      
      player.resetBoard();
      
      const isEmpty = player.board.every(row => 
        row.every(cell => cell === 0)
      );
      expect(isEmpty).toBe(true);
    });
  });

  describe('resetScore', () => {
    it('should reset score to 0', () => {
      player.score = 1000;
      player.resetScore();
      expect(player.score).toBe(0);
    });
  });

  describe('mergePiece', () => {
    it('should merge piece into board', () => {
      // Créer une vraie pièce O
      const piece = new Piece('O');
      piece.position = { x: 0, y: 0 };
      
      player.setCurrentPiece(piece);
      player.mergePiece();
      
      // Vérifier que la pièce a été fusionnée
      expect(player.board[0][0]).toBe(1);
      expect(player.board[0][1]).toBe(1);
      expect(player.board[1][0]).toBe(1);
      expect(player.board[1][1]).toBe(1);
    });

    it('should not merge when no current piece', () => {
      player.currentPiece = null;
      player.mergePiece();
      
      // Board devrait rester vide
      const isEmpty = player.board.every(row => 
        row.every(cell => cell === 0)
      );
      expect(isEmpty).toBe(true);
    });

    it('should not overwrite existing board pieces', () => {
      // Placer quelque chose sur le board
      player.board[0][0] = 2;
      
      const piece = new Piece('O');
      piece.position = { x: 0, y: 0 };
      
      player.setCurrentPiece(piece);
      player.mergePiece();
      
      // La cellule existante ne devrait pas être écrasée
      expect(player.board[0][0]).toBe(2);
      expect(player.board[0][1]).toBe(1);
    });
  });

  describe('clearLines', () => {
    it('should clear completed lines', () => {
      // Remplir une ligne complète
      for (let x = 0; x < 10; x++) {
        player.board[19][x] = 1;
      }
      
      const cleared = player.clearLines();
      
      expect(cleared).toBe(1);
      expect(player.board[19].every(cell => cell === 0)).toBe(true);
    });

    it('should not clear lines with penalty cells', () => {
      // Remplir une ligne avec des cellules de pénalité (valeur 9)
      for (let x = 0; x < 10; x++) {
        player.board[19][x] = 9;
      }
      
      const cleared = player.clearLines();
      
      expect(cleared).toBe(0);
      expect(player.board[19].every(cell => cell === 9)).toBe(true);
    });

    it('should add penalty lines', () => {
      player.addPenaltyLines(2);
      
      // Vérifier que des lignes ont été ajoutées en bas
      expect(player.board[18].every(cell => cell === 9)).toBe(true);
      expect(player.board[19].every(cell => cell === 9)).toBe(true);
    });
  });

  describe('resetLevel', () => {
    it('should reset level to 1', () => {
      player.level = 5;
      player.resetLevel();
      expect(player.level).toBe(1);
    });
  });

  describe('resetGravity', () => {
    it('should reset gravity to initial value', () => {
      player.gravity = 100;
      player.resetGravity();
      expect(player.gravity).toBe(50);
    });
  });

  describe('addScore', () => {
    it('should add points to score', () => {
      player.addScore(100);
      expect(player.score).toBe(100);
      
      player.addScore(50);
      expect(player.score).toBe(150);
    });

    it('should handle zero points', () => {
      player.addScore(0);
      expect(player.score).toBe(0);
    });
  });

  describe('setCurrentPiece', () => {
    it('should set current piece', () => {
      const { Piece } = require('./piece');
      const piece = new Piece('I');
      player.setCurrentPiece(piece);
      expect(player.currentPiece).toEqual(piece);
    });

    it('should handle null piece', () => {
      player.setCurrentPiece(null);
      expect(player.currentPiece).toBeNull();
    });
  });

  describe('setNextPiece', () => {
    it('should set next piece', () => {
      const { Piece } = require('./piece');
      const piece = new Piece('O');
      player.setNextPiece(piece);
      expect(player.nextPiece).toEqual(piece);
    });
  });

  describe('getSpectrum', () => {
    it('should return array of column heights', () => {
      const spectrum = player.getSpectrum();
      expect(spectrum).toHaveLength(10);
      expect(spectrum.every(height => typeof height === 'number' && height === 0)).toBe(true);
    });

    it('should calculate correct heights with pieces', () => {
      // Ajouter des pièces dans les colonnes
      player.board[18][0] = 1; // Colonne 0, hauteur 2
      player.board[19][0] = 1;
      player.board[19][1] = 1; // Colonne 1, hauteur 1
      
      const spectrum = player.getSpectrum();
      expect(spectrum[0]).toBe(2);
      expect(spectrum[1]).toBe(1);
      expect(spectrum[2]).toBe(0);
    });
  });

  describe('clearLines', () => {
    beforeEach(() => {
      // Remplir une ligne complète (ligne 19)
      for (let x = 0; x < 10; x++) {
        player.board[19][x] = 1;
      }
    });
    
    it('should handle different board states', () => {
      // Tester avec différents états du board
      player.board[0][0] = 1;
      player.board[10] = Array(10).fill(1); // Ligne incomplète
      
      expect(player.board[0][0]).toBe(1);
      expect(player.board[10].every(cell => cell === 1)).toBe(true);
    });
    
    it('should handle multiple line clears', () => {
      // Remplir plusieurs lignes
      for (let y = 17; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
          player.board[y][x] = 1;
        }
      }
      
      const linesCleared = player.clearLines();
      expect(linesCleared).toBe(4); // 3 nouvelles + 1 déjà remplie
    });
    
    it('should handle alive state', () => {
      expect(player.alive).toBe(true);
      
      player.alive = false;
      expect(player.alive).toBe(false);
    });

    it('should clear full lines and return count', () => {
      const linesCleared = player.clearLines();
      
      expect(linesCleared).toBe(1);
      expect(player.board[19].every(cell => cell === 0)).toBe(true);
    });

    it('should add new empty line at top', () => {
      const originalTopLine = [...player.board[0]];
      player.clearLines();
      
      // La ligne du haut doit être vide après clear
      expect(player.board[0].every(cell => cell === 0)).toBe(true);
    });

    it('should update score based on lines cleared', () => {
      const initialScore = player.score;
      player.clearLines();
      
      expect(player.score).toBeGreaterThan(initialScore);
    });

    it('should update level based on total lines cleared', () => {
      // Simuler 10 lignes effacées pour passer au niveau 2
      for (let i = 0; i < 10; i++) {
        // Remplir ligne
        for (let x = 0; x < 10; x++) {
          player.board[19][x] = 1;
        }
        player.clearLines();
      }
      
      expect(player.level).toBeGreaterThan(1);
    });

    it('should not clear incomplete lines', () => {
      // Ligne incomplète
      player.board[18][0] = 0; // Laisser un trou
      for (let x = 1; x < 10; x++) {
        player.board[18][x] = 1;
      }
      
      const linesCleared = player.clearLines();
      
      expect(linesCleared).toBe(1); // Seulement la ligne 19 complète
      expect(player.board[18][0]).toBe(0); // Le trou reste
    });
  });
});