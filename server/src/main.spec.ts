import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { bootstrap } from './main';

// Mock NestFactory pour éviter de démarrer réellement l'app
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe('Main Application Bootstrap', () => {
  let mockApp: any;
  let mockConsoleLog: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApp = {
      listen: jest.fn().mockResolvedValue(undefined),
    };
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  it('should bootstrap the application successfully', async () => {
    const app = await bootstrap();
    
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockApp.listen).toHaveBeenCalledWith(3000);
    expect(mockConsoleLog).toHaveBeenCalledWith('Serveur démarré sur le port 3000');
    expect(app).toBe(mockApp);
  });

  it('should create application with correct module', async () => {
    await bootstrap();
    
    expect(NestFactory.create).toHaveBeenCalledTimes(1);
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
  });

  it('should listen on port 3000', async () => {
    await bootstrap();
    
    expect(mockApp.listen).toHaveBeenCalledWith(3000);
  });

  it('should handle bootstrap errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const testError = new Error('Bootstrap failed');
    (NestFactory.create as jest.Mock).mockRejectedValueOnce(testError);

    await expect(bootstrap()).rejects.toThrow('Bootstrap failed');
    
    consoleErrorSpy.mockRestore();
  });
});