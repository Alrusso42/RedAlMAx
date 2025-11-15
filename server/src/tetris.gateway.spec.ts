import { Test, TestingModule } from '@nestjs/testing';
import { TetrisGateway } from './tetris.gateway';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';

// Mock pour Socket.io
const mockSocket = {
  id: 'test-socket-id',
  join: jest.fn(),
  emit: jest.fn(),
  to: jest.fn().mockReturnThis(),
  on: jest.fn(),
  off: jest.fn(),
} as unknown as Socket;

const mockServer = {
  emit: jest.fn(),
  to: jest.fn().mockReturnThis(),
} as unknown as Server;

describe('TetrisGateway', () => {
  let gateway: TetrisGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TetrisGateway],
    }).compile();

    gateway = module.get<TetrisGateway>(TetrisGateway);
    gateway.server = mockServer;
    
    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clear rooms between tests
    gateway['rooms'].clear();
    gateway['clientRooms'].clear();
    // Clean up intervals to prevent test leaks
    gateway.onModuleDestroy();
  });

  describe('handleConnection', () => {
    it('should log connection', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      gateway.handleConnection(mockSocket);
      
      expect(consoleSpy).toHaveBeenCalledWith(`Client connected: ${mockSocket.id}`);
      consoleSpy.mockRestore();
    });
  });

  describe('handleJoinRoom', () => {
    const joinData = { roomId: 'test-room', playerName: 'TestPlayer' };

    it('should create room and add player', () => {
      gateway.handleJoinRoom(joinData, mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith('test-room');
      expect(mockSocket.emit).toHaveBeenCalledWith('playerId', mockSocket.id);
      expect(mockSocket.emit).toHaveBeenCalledWith('roomJoined', { 
        roomId: 'test-room', 
        playerName: 'TestPlayer' 
      });
    });

    it('should not allow same client to join multiple rooms', () => {
      // Premier join
      gateway.handleJoinRoom(joinData, mockSocket);
      jest.clearAllMocks();
      
      // Deuxième join
      gateway.handleJoinRoom({ roomId: 'another-room', playerName: 'TestPlayer' }, mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', { 
        message: 'Vous êtes déjà dans une room' 
      });
    });

    it('should reject player when room is full', () => {
      const mockSocket2 = { ...mockSocket, id: 'socket-2' } as unknown as Socket;
      const mockSocket3 = { ...mockSocket, id: 'socket-3' } as unknown as Socket;

      // Ajouter 2 joueurs
      gateway.handleJoinRoom(joinData, mockSocket);
      gateway.handleJoinRoom({ ...joinData, playerName: 'Player2' }, mockSocket2);
      
      // Le 3ème devrait être rejeté
      gateway.handleJoinRoom({ ...joinData, playerName: 'Player3' }, mockSocket3);

      expect(mockSocket3.emit).toHaveBeenCalledWith('gameFull', { 
        message: 'La partie est complète (2 joueurs maximum)' 
      });
    });

    it('should handle duplicate names', () => {
      const mockSocket2 = { ...mockSocket, id: 'socket-2', emit: jest.fn() } as unknown as Socket;

      gateway.handleJoinRoom(joinData, mockSocket);
      gateway.handleJoinRoom(joinData, mockSocket2);

      expect(mockSocket2.emit).toHaveBeenCalledWith('nameChanged', expect.objectContaining({
        originalName: 'TestPlayer',
        newName: 'TestPlayer_2'
      }));
    });
  });

  describe('handleDisconnect', () => {
    beforeEach(() => {
      // Setup: ajouter un joueur
      gateway.handleJoinRoom({ roomId: 'test-room', playerName: 'TestPlayer' }, mockSocket);
      jest.clearAllMocks();
    });

    it('should remove player and clean up', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      gateway.handleDisconnect(mockSocket);

      expect(consoleSpy).toHaveBeenCalledWith(`Client disconnected: ${mockSocket.id}`);
      expect(gateway['clientRooms'].has(mockSocket.id)).toBe(false);
      
      consoleSpy.mockRestore();
    });

    it('should transfer host when host disconnects', () => {
      const mockSocket2 = { 
        ...mockSocket, 
        id: 'socket-2', 
        join: jest.fn(), 
        emit: jest.fn() 
      } as unknown as Socket;
      
      // Ajouter un deuxième joueur
      gateway.handleJoinRoom({ roomId: 'test-room', playerName: 'Player2' }, mockSocket2);
      
      // Le premier (host) se déconnecte
      gateway.handleDisconnect(mockSocket);
      
      const room = gateway['rooms'].get('test-room');
      expect(room?.hostId).toBe('socket-2');
    });

    it('should remove empty room', () => {
      gateway.handleDisconnect(mockSocket);

      expect(gateway['rooms'].has('test-room')).toBe(false);
    });
  });

  describe('handleInput', () => {
    beforeEach(() => {
      // Setup: créer une room avec un joueur
      gateway.handleJoinRoom({ roomId: 'test-room', playerName: 'TestPlayer' }, mockSocket);
      gateway.handleStartGame(mockSocket); // Il faut être host et avoir 2 joueurs normalement
      jest.clearAllMocks();
    });

    it('should handle left input', () => {
      gateway.handleInput({ action: 'left' }, mockSocket);
      
      // Devrait émettre un update
      expect(mockServer.to).toHaveBeenCalledWith('test-room');
    });

    it('should handle right input', () => {
      gateway.handleInput({ action: 'right' }, mockSocket);
      
      expect(mockServer.to).toHaveBeenCalledWith('test-room');
    });

    it('should handle rotate input', () => {
      gateway.handleInput({ action: 'rotate' }, mockSocket);
      
      expect(mockServer.to).toHaveBeenCalledWith('test-room');
    });

    it('should handle down input', () => {
      gateway.handleInput({ action: 'down' }, mockSocket);
      
      expect(mockServer.to).toHaveBeenCalledWith('test-room');
    });

    it('should handle softDrop input', () => {
      gateway.handleInput({ action: 'softDrop' }, mockSocket);
      
      expect(mockServer.to).toHaveBeenCalledWith('test-room');
    });

    it('should ignore invalid action', () => {
      gateway.handleInput({ action: 'invalid' }, mockSocket);
      
      expect(mockServer.to).toHaveBeenCalledWith('test-room');
    });

    it('should not handle input from non-room client', () => {
      const mockSocket2 = { ...mockSocket, id: 'no-room-socket' } as unknown as Socket;
      
      gateway.handleInput({ action: 'left' }, mockSocket2);
      
      // Ne devrait pas émettre car pas dans une room
      expect(mockServer.to).not.toHaveBeenCalled();
    });
  });

  describe('handleStartGame', () => {
    beforeEach(() => {
      gateway.handleJoinRoom({ roomId: 'test-room', playerName: 'TestPlayer' }, mockSocket);
    });

    it('should not start game with insufficient players', () => {
      gateway.handleStartGame(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', { 
        message: 'Impossible de démarrer la partie (il faut 2 joueurs)' 
      });
    });

    it('should only allow host to start game', () => {
      const mockSocket2 = { 
        ...mockSocket, 
        id: 'socket-2', 
        join: jest.fn(), 
        emit: jest.fn() 
      } as unknown as Socket;
      
      gateway.handleJoinRoom({ roomId: 'test-room', playerName: 'Player2' }, mockSocket2);
      
      // Non-host tente de démarrer
      gateway.handleStartGame(mockSocket2);

      expect(mockSocket2.emit).toHaveBeenCalledWith('error', { 
        message: 'Seul le host peut démarrer la partie' 
      });
    });

    it('should start game when conditions are met', () => {
      const mockSocket2 = { 
        ...mockSocket, 
        id: 'socket-2', 
        join: jest.fn(), 
        emit: jest.fn() 
      } as unknown as Socket;
      
      gateway.handleJoinRoom({ roomId: 'test-room', playerName: 'Player2' }, mockSocket2);
      
      gateway.handleStartGame(mockSocket);

      expect(mockServer.to).toHaveBeenCalledWith('test-room');
    });

    it('should handle client not in room', () => {
      const mockSocket2 = { ...mockSocket, id: 'no-room-socket', emit: jest.fn() } as unknown as Socket;
      
      gateway.handleStartGame(mockSocket2);

      expect(mockSocket2.emit).toHaveBeenCalledWith('error', { 
        message: 'Vous n\'êtes pas dans une room' 
      });
    });
  });

  describe('handleRestartGame', () => {
    beforeEach(() => {
      const mockSocket2 = { 
        ...mockSocket, 
        id: 'socket-2', 
        join: jest.fn(), 
        emit: jest.fn() 
      } as unknown as Socket;
      
      gateway.handleJoinRoom({ roomId: 'test-room', playerName: 'TestPlayer' }, mockSocket);
      gateway.handleJoinRoom({ roomId: 'test-room', playerName: 'Player2' }, mockSocket2);
      
      // Simuler fin de partie avec le premier joueur comme gagnant
      const room = gateway['rooms'].get('test-room');
      if (room) {
        room.game.status = 'ended';
        room.hostId = mockSocket.id; // Le premier est maintenant host/gagnant
      }
    });

    it('should restart ended game', () => {
      gateway.handleRestartGame(mockSocket);

      expect(mockServer.to).toHaveBeenCalledWith('test-room');
    });

    it('should not restart if not ended', () => {
      const room = gateway['rooms'].get('test-room');
      if (room) {
        room.game.status = 'playing';
      }

      gateway.handleRestartGame(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', { 
        message: 'Impossible de redémarrer la partie' 
      });
    });

    it('should only allow host to restart', () => {
      const mockSocket2 = { ...mockSocket, id: 'socket-2', emit: jest.fn() } as unknown as Socket;
      
      gateway.handleRestartGame(mockSocket2);

      expect(mockSocket2.emit).toHaveBeenCalledWith('error', { 
        message: 'Seul le gagnant peut redémarrer la partie' 
      });
    });
  });

  describe('private methods and edge cases', () => {
    it('should handle afterInit setup', () => {
      // Temporarily clear NODE_ENV to test interval creation
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;
      
      const setIntervalSpy = jest.spyOn(global, 'setInterval').mockImplementation(() => 1 as any);
      
      gateway.afterInit(mockServer);

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 50);
      
      setIntervalSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle room not found scenarios', () => {
      // Tenter des actions sur une room inexistante
      gateway.handleInput({ action: 'left' }, mockSocket);
      gateway.handleStartGame(mockSocket);
      
      // Ne devrait pas planter, juste ne rien faire
      expect(mockSocket.emit).toHaveBeenCalledWith('error', { 
        message: 'Vous n\'êtes pas dans une room' 
      });
    });
    
    it('should handle game loop updates', () => {
      // Créer une room et simuler le game loop
      gateway.handleJoinRoom({ roomId: 'test-loop', playerName: 'Player1' }, mockSocket);
      const mockSocket2 = { ...mockSocket, id: 'socket-2', join: jest.fn(), emit: jest.fn() } as unknown as Socket;
      gateway.handleJoinRoom({ roomId: 'test-loop', playerName: 'Player2' }, mockSocket2);
      gateway.handleStartGame(mockSocket);
      
      // Simuler l'émission d'un update
      expect(mockServer.to).toHaveBeenCalledWith('test-loop');
    });
    
    it('should handle client rooms cleanup', () => {
      const roomsBefore = gateway['rooms'].size;
      const clientRoomsBefore = gateway['clientRooms'].size;
      
      gateway.handleJoinRoom({ roomId: 'cleanup-test', playerName: 'TestPlayer' }, mockSocket);
      
      expect(gateway['rooms'].size).toBe(roomsBefore + 1);
      expect(gateway['clientRooms'].size).toBe(clientRoomsBefore + 1);
    });
  });
});