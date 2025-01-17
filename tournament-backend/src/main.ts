import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Allow React app to make requests
    credentials: true,               // Allow cookies or auth headers if needed
  });
  await app.listen(5001);
}
bootstrap();
