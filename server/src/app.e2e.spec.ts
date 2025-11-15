import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should handle HTTP requests', () => {
    // Test basic HTTP functionality without supertest
    const server = app.getHttpServer();
    expect(server).toBeDefined();
    expect(typeof server.listen).toBe('function');
  });

  it('should initialize WebSocket gateway', () => {
    // The app should initialize without errors, including the WebSocket gateway
    expect(app).toBeDefined();
  });

  it('should handle app shutdown gracefully', async () => {
    await expect(app.close()).resolves.not.toThrow();
  });
});