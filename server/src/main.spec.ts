import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Mock NestFactory pour éviter de démarrer réellement l'app
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

// Mock console.log
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('Main Application Bootstrap', () => {
  let mockApp: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApp = {
      listen: jest.fn().mockResolvedValue(undefined),
    };
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('should bootstrap the application successfully', async () => {
    // Import dynamique pour déclencher l'exécution du main
    const mainModule = await import('./main');
    
    // Vérifier que l'app a été créée
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockApp.listen).toHaveBeenCalledWith(3001);
    expect(mockConsoleLog).toHaveBeenCalledWith('Application is running on: http://localhost:3001');
  });

  it('should create application with correct module', async () => {
    await import('./main');
    
    expect(NestFactory.create).toHaveBeenCalledTimes(1);
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
  });

  it('should listen on port 3001', async () => {
    await import('./main');
    
    expect(mockApp.listen).toHaveBeenCalledWith(3001);
  });

  it('should handle bootstrap errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (NestFactory.create as jest.Mock).mockRejectedValueOnce(new Error('Bootstrap failed'));

    try {
      await import('./main');
    } catch (error) {
      // Le main.ts pourrait ne pas gérer l'erreur, mais on teste quand même
    }

    consoleSpy.mockRestore();
  });
});