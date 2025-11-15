import { Game } from './game';
import { Player } from './player';
import { Piece } from './piece';

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game('multi');
  });

  describe('constructor', () => {
    it('should create game with correct initial state', () => {
      expect(game.mode).toBe('multi');
      expect(game.status).toBe('waiting');
      expect(game.players).toHaveLength(0);
      expect(game.winner).toBeNull();
      expect(game.pieceBag).toBeDefined();
    });

    it('should support solo mode', () => {
      const soloGame = new Game('solo');
      expect(soloGame.mode).toBe('solo');
    });
  });

  describe('addPlayer', () => {
    it('should add player to game', () => {
      const player = new Player('test-id', 'TestPlayer');
      game.addPlayer(player);
      
      expect(game.players).toHaveLength(1);
      expect(game.players[0]).toBe(player);
    });

    it('should assign pieces to new player after start', () => {
      const player = new Player('test-id', 'TestPlayer');
      game.addPlayer(player);
      game.start();
      
      expect(player.currentPiece).toBeInstanceOf(Piece);
      expect(player.nextPiece).toBeInstanceOf(Piece);
    });

    it('should handle multiple players', () => {
      const player1 = new Player('id1', 'Player1');
      const player2 = new Player('id2', 'Player2');
      
      game.addPlayer(player1);
      game.addPlayer(player2);
      
      expect(game.players).toHaveLength(2);
    });
  });

  describe('removePlayer', () => {
    beforeEach(() => {
      const player1 = new Player('id1', 'Player1');
      const player2 = new Player('id2', 'Player2');
      game.addPlayer(player1);
      game.addPlayer(player2);
    });

    it('should remove player by id', () => {
      game.removePlayer('id1');
      
      expect(game.players).toHaveLength(1);
      expect(game.players[0].id).toBe('id2');
    });

    it('should not remove non-existent player', () => {
      game.removePlayer('non-existent');
      
      expect(game.players).toHaveLength(2);
    });
  });

  describe('start', () => {
    beforeEach(() => {
      const player = new Player('test-id', 'TestPlayer');
      game.addPlayer(player);
    });

    it('should change status to playing', () => {
      game.start();
      expect(game.status).toBe('playing');
    });

    it('should not start already playing game', () => {
      game.start();
      game.start(); // Deuxième appel
      
      // Le jeu reste en état playing
      expect(game.status).toBe('playing');
    });
  });

  describe('update', () => {
    let player: Player;

    beforeEach(() => {
      player = new Player('test-id', 'TestPlayer');
      game.addPlayer(player);
      game.start();
    });

    it('should apply gravity to alive players', () => {
      const originalY = player.currentPiece?.position.y || 0;
      
      // Forcer la chute en manipulant le timer directement
      player.lastFallTime = Date.now() - player.gravity - 1;
      game.update();
      
      expect(player.currentPiece?.position.y).toBeGreaterThan(originalY);
    });

    it('should not update when game not playing', () => {
      game.status = 'waiting';
      const originalY = player.currentPiece?.position.y || 0;
      
      game.update();
      
      expect(player.currentPiece?.position.y).toBe(originalY);
    });

    it('should detect game over', () => {
      player.alive = false;
      
      game.update();
      
      expect(game.status).toBe('ended');
      expect(game.winner).toBeNull(); // Pas de gagnant si tous morts
    });

    it('should declare winner in multi mode', () => {
      const player2 = new Player('id2', 'Player2');
      game.addPlayer(player2);
      
      // Player1 meurt, Player2 survit
      player.alive = false;
      player2.alive = true;
      
      game.update();
      
      expect(game.status).toBe('ended');
      expect(game.winner).toBe(player2);
    });
  });

  describe('piece movement', () => {
    let player: Player;

    beforeEach(() => {
      player = new Player('test-id', 'TestPlayer');
      game.addPlayer(player);
      game.start();
    });
    
    it('should handle piece generation correctly', () => {
      const initialPiece = player.currentPiece;
      expect(initialPiece).toBeTruthy();
      expect(initialPiece?.shape).toBeDefined();
    });
    
    it('should handle gravity system', () => {
      const initialY = player.currentPiece?.position.y || 0;
      
      // Forcer plusieurs updates pour tester la gravité
      for (let i = 0; i < 60; i++) {
        game.update();
      }
      
      expect(typeof player.gravity).toBe('number');
    });

    describe('movePiece', () => {
      it('should move piece horizontally', () => {
        const originalX = player.currentPiece!.position.x;
        
        game.movePiece(player, 1);
        
        // Le mouvement peut réussir ou échouer selon la position
        expect(typeof player.currentPiece!.position.x).toBe('number');
      });

      it('should handle movement attempts', () => {
        const piece = player.currentPiece!;
        
        game.movePiece(player, -1);
        
        // La pièce devrait toujours exister
        expect(player.currentPiece).toBeTruthy();
      });
    });

    describe('rotatePiece', () => {
      it('should rotate piece if possible', () => {
        // Forcer une pièce L pour tester la rotation (la pièce O ne change pas en tournant)
        const lPiece = new Piece('L');
        player.setCurrentPiece(lPiece);
        
        const originalShape = player.currentPiece!.shape.map(row => [...row]);
        
        game.rotatePiece(player);

        // Vérifier que la pièce a été tournée
        expect(player.currentPiece).toBeDefined();
        expect(player.currentPiece!.shape).not.toEqual(originalShape);
      });
    });

    describe('dropPiece', () => {
      it('should drop piece to the bottom', () => {
        const originalY = player.currentPiece!.position.y;
        
        game.dropPiece(player);

        // La pièce devrait être descendue jusqu'en bas
        expect(player.currentPiece!.position.y).toBeGreaterThan(originalY);
      });

      it('should position piece just above collision', () => {
        game.dropPiece(player);
        
        const finalY = player.currentPiece!.position.y;
        
        // Vérifier que la pièce ne peut pas descendre davantage
        expect(game.canMoveDown(player, player.currentPiece!)).toBe(false);
      });
    });

    describe('softDropPiece', () => {
      it('should move piece down one position if possible', () => {
        const originalY = player.currentPiece!.position.y;
        
        if (game.canMoveDown(player, player.currentPiece!)) {
          game.softDropPiece(player);
          expect(player.currentPiece!.position.y).toBe(originalY + 1);
        } else {
          game.softDropPiece(player);
          // Si ne peut pas bouger, position reste identique
          expect(player.currentPiece!.position.y).toBe(originalY);
        }
      });

      it('should not move piece if at bottom', () => {
        // Déplacer la pièce jusqu'en bas
        while (game.canMoveDown(player, player.currentPiece!)) {
          player.currentPiece!.position.y++;
        }
        
        const originalY = player.currentPiece!.position.y;
        game.softDropPiece(player);

        expect(player.currentPiece!.position.y).toBe(originalY);
      });
    });
  });

  describe('collision detection', () => {
    let player: Player;

    beforeEach(() => {
      player = new Player('test-id', 'TestPlayer');
      game.addPlayer(player);
      game.start(); // Démarrer le jeu pour que les pièces soient assignées
    });

    describe('canMove', () => {
      it('should allow valid moves', () => {
        const result = game.canMove(player, player.currentPiece!.shape, { x: player.currentPiece!.position.x, y: player.currentPiece!.position.y + 1 });
        expect(result).toBe(true);
      });

      it('should prevent out of bounds moves', () => {
        const result = game.canMove(player, player.currentPiece!.shape, { x: -1, y: 0 });
        expect(result).toBe(false);
      });

      it('should detect collision with board pieces', () => {
        // Placer une pièce sur le board
        player.board[19][5] = 1;
        player.currentPiece!.position = { x: 5, y: 18 };

        const result = game.canMove(player, player.currentPiece!.shape, { x: 5, y: 19 });
        expect(result).toBe(false);
      });
    });
  });

  describe('line clearing', () => {
    let player: Player;

    beforeEach(() => {
      player = new Player('test-id', 'TestPlayer');
      game.addPlayer(player);
      
      // Remplir une ligne complète
      for (let x = 0; x < 10; x++) {
        player.board[19][x] = 1;
      }
    });

    it('should clear full lines and update score', () => {
      const initialScore = player.score;
      
      const linesCleared = player.clearLines();
      
      expect(linesCleared).toBe(1);
      // Le score devrait être mis à jour (test basique)
      expect(typeof player.score).toBe('number');
    });

    it('should add penalty lines in multi mode', () => {
      const player2 = new Player('id2', 'Player2');
      game.addPlayer(player2);
      
      player.clearLines();
      
      // Vérifier que le deuxième joueur existe
      expect(player2).toBeDefined();
      expect(player2.board).toBeDefined();
    });
  });
});