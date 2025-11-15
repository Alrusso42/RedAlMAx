//main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('Serveur démarré sur le port 3000');
  return app;
}

// Ne démarrer que si le fichier est exécuté directement
if (require.main === module) {
  bootstrap();
}