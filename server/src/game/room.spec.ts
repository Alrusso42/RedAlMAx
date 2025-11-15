import { Room } from './room';
import { Player } from './player';

describe('Room', () => {
  let room: Room;

  beforeEach(() => {
    room = new Room('test-room');
  });

  describe('constructor', () => {
    it('should create room with correct properties', () => {
      expect(room.id).toBe('test-room');
      expect(room.maxPlayers).toBe(2);
      expect(room.players.size).toBe(0);
      expect(room.hostId).toBeNull();
      expect(room.game.status).toBe('waiting');
    });
  });

  describe('addPlayer', () => {
    it('should add first player and make them host', () => {
      const player = room.addPlayer('client-1', 'Player1');
      
      expect(player).not.toBeNull();
      expect(player!.id).toBe('client-1');
      expect(player!.name).toBe('Player1');
      expect(room.players.size).toBe(1);
      expect(room.hostId).toBe('client-1');
    });

    it('should add second player without changing host', () => {
      room.addPlayer('client-1', 'Player1');
      const player2 = room.addPlayer('client-2', 'Player2');
      
      expect(player2).not.toBeNull();
      expect(room.players.size).toBe(2);
      expect(room.hostId).toBe('client-1'); // Host reste le premier
    });

    it('should reject third player when room is full', () => {
      room.addPlayer('client-1', 'Player1');
      room.addPlayer('client-2', 'Player2');
      const player3 = room.addPlayer('client-3', 'Player3');
      
      expect(player3).toBeNull();
      expect(room.players.size).toBe(2);
    });

    it('should handle duplicate names by modifying them', () => {
      const player1 = room.addPlayer('client-1', 'SameName');
      const player2 = room.addPlayer('client-2', 'SameName');
      
      expect(player1!.name).toBe('SameName');
      expect(player2!.name).toBe('SameName_2');
    });

    it('should handle multiple duplicate names', () => {
      room.addPlayer('client-1', 'Test');
      const player2 = room.addPlayer('client-2', 'Test');
      const player3 = room.addPlayer('client-3', 'Test');
      
      expect(player2!.name).toBe('Test_2');
      // Le troisième devrait être rejeté car room pleine
      expect(player3).toBeNull();
    });
  });

  describe('removePlayer', () => {
    beforeEach(() => {
      room.addPlayer('client-1', 'Player1');
      room.addPlayer('client-2', 'Player2');
    });

    it('should remove player from room', () => {
      room.removePlayer('client-1');
      
      expect(room.players.size).toBe(1);
      expect(room.players.has('client-1')).toBe(false);
    });

    it('should set game to waiting when player disconnects during play', () => {
      room.startGame();
      expect(room.game.status).toBe('playing');
      
      room.removePlayer('client-1');
      
      expect(room.game.status).toBe('waiting');
      expect(room.game.winner).toBeNull();
    });

    it('should reset remaining player when other disconnects', () => {
      room.startGame();
      const remainingPlayer = Array.from(room.players.values())[1];
      remainingPlayer.score = 1000;
      remainingPlayer.level = 5;
      
      room.removePlayer('client-1');
      
      expect(remainingPlayer.score).toBe(0);
      expect(remainingPlayer.level).toBe(1);
      expect(remainingPlayer.alive).toBe(true);
    });

    it('should end game when no players remain', () => {
      room.removePlayer('client-1');
      room.removePlayer('client-2');
      
      expect(room.game.status).toBe('ended');
    });
  });

  describe('isEmpty', () => {
    it('should return true when no players', () => {
      expect(room.isEmpty()).toBe(true);
    });

    it('should return false when players exist', () => {
      room.addPlayer('client-1', 'Player1');
      expect(room.isEmpty()).toBe(false);
    });
  });

  describe('isFull', () => {
    it('should return false when not full', () => {
      room.addPlayer('client-1', 'Player1');
      expect(room.isFull()).toBe(false);
    });

    it('should return true when full', () => {
      room.addPlayer('client-1', 'Player1');
      room.addPlayer('client-2', 'Player2');
      expect(room.isFull()).toBe(true);
    });
  });

  describe('startGame', () => {
    it('should start game with 2 players', () => {
      room.addPlayer('client-1', 'Player1');
      room.addPlayer('client-2', 'Player2');
      
      const result = room.startGame();
      
      expect(result).toBe(true);
      expect(room.game.status).toBe('playing');
    });

    it('should not start game with only 1 player', () => {
      room.addPlayer('client-1', 'Player1');
      
      const result = room.startGame();
      
      expect(result).toBe(false);
      expect(room.game.status).toBe('waiting');
    });

    it('should not start game if already started', () => {
      room.addPlayer('client-1', 'Player1');
      room.addPlayer('client-2', 'Player2');
      room.startGame();
      
      const result = room.startGame();
      
      expect(result).toBe(false);
    });
  });

  describe('restartGame', () => {
    beforeEach(() => {
      room.addPlayer('client-1', 'Player1');
      room.addPlayer('client-2', 'Player2');
      room.startGame();
    });

    it('should restart ended game', () => {
      // Simuler fin de partie
      room.game.status = 'ended';
      
      const result = room.restartGame();
      
      expect(result).toBe(true);
      expect(room.game.status).toBe('playing');
    });

    it('should not restart if game not ended', () => {
      const result = room.restartGame();
      
      expect(result).toBe(false);
    });

    it('should preserve player names on restart', () => {
      const originalNames = Array.from(room.players.values()).map(p => p.name);
      room.game.status = 'ended';
      
      room.restartGame();
      
      const newNames = Array.from(room.players.values()).map(p => p.name);
      expect(newNames).toEqual(originalNames);
    });

    it('should not restart with insufficient players', () => {
      room.game.status = 'ended';
      room.removePlayer('client-2');
      
      const result = room.restartGame();
      
      expect(result).toBe(false);
    });
  });

  describe('getGameState', () => {
    beforeEach(() => {
      room.addPlayer('client-1', 'Player1');
      room.addPlayer('client-2', 'Player2');
    });

    it('should return complete game state', () => {
      const gameState = room.getGameState();
      
      expect(gameState.roomId).toBe('test-room');
      expect(gameState.hostId).toBe('client-1');
      expect(gameState.players).toHaveLength(2);
      expect(gameState.status).toBe('waiting');
      expect(gameState.winnerId).toBeNull();
    });

    it('should include player details', () => {
      const gameState = room.getGameState();
      const player = gameState.players[0];
      
      expect(player).toHaveProperty('id');
      expect(player).toHaveProperty('name');
      expect(player).toHaveProperty('board');
      expect(player).toHaveProperty('score');
      expect(player).toHaveProperty('level');
      expect(player).toHaveProperty('alive');
    });

    it('should show winner when game ended', () => {
      room.game.status = 'ended';
      const player1 = Array.from(room.players.values())[0];
      room.game.winner = player1;
      
      const gameState = room.getGameState();
      
      expect(gameState.winnerId).toBe(player1.id);
    });
  });
});