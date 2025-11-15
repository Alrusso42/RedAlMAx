import { Module } from '@nestjs/common';
import { TetrisGateway } from './tetris.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [TetrisGateway],
})
export class AppModule {}