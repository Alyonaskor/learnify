import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
       const app = await NestFactory.create(AppModule);
       // Allow the frontend to access the API
  app.enableCors({
    origin: "http://localhost:3000", // where Next.js is spinning during dev
    credentials: true,              // allow to transmit cookies, auth-headers
  });

  await app.listen(process.env.PORT ?? 3001); // The API itself listens on port 3001
}
bootstrap();
