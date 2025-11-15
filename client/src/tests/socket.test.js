// Mock socket.io-client
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
  connected: true,
  id: 'test-socket-id'
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket)
}));

describe('Socket Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create socket connection with correct URL', () => {
    const { io } = require('socket.io-client');
    require('../socket');
    
    expect(io).toHaveBeenCalledWith('http://localhost:3000', {"transports": ["websocket"]});
  });

  it('should return socket instance', () => {
    const socket = require('../socket');
    
    expect(socket.default).toBe(mockSocket);
  });

  it('should handle socket connection events', () => {
    const socket = require('../socket').default;
    
    // Simulate connection
    expect(socket.on).toBeDefined();
    expect(socket.emit).toBeDefined();
    expect(socket.disconnect).toBeDefined();
  });

  it('should handle socket disconnection', () => {
    const socket = require('../socket').default;
    
    socket.disconnect();
    
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('should allow event emission', () => {
    const socket = require('../socket').default;
    
    socket.emit('test-event', { data: 'test' });
    
    expect(mockSocket.emit).toHaveBeenCalledWith('test-event', { data: 'test' });
  });

  it('should allow event listening', () => {
    const socket = require('../socket').default;
    const callback = jest.fn();
    
    socket.on('test-event', callback);
    
    expect(mockSocket.on).toHaveBeenCalledWith('test-event', callback);
  });

  it('should allow event removal', () => {
    const socket = require('../socket').default;
    const callback = jest.fn();
    
    socket.off('test-event', callback);
    
    expect(mockSocket.off).toHaveBeenCalledWith('test-event', callback);
  });

  it('should provide socket properties', () => {
    const socket = require('../socket').default;
    
    expect(socket.connected).toBe(true);
    expect(socket.id).toBe('test-socket-id');
  });
});
