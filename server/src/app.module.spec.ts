import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { TetrisGateway } from './tetris.gateway';

describe('AppModule', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should provide TetrisGateway', () => {
    const gateway = app.get<TetrisGateway>(TetrisGateway);
    expect(gateway).toBeDefined();
  });

  it('should compile module without errors', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef).toBeDefined();
    await moduleRef.close();
  });
});