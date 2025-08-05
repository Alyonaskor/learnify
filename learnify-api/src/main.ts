import { NestFactory, } from '@nestjs/core';
import { AppModule,  } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';


async function bootstrap() {
       const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); //  cookie-parser to work with cookies

       // Allow the frontend to access the API
  app.enableCors({
    origin: "http://localhost:3000", // where Next.js is spinning during dev
    credentials: true,              // allow to transmit cookies, auth-headers
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // throw out fields that are not in the DTO
      forbidNonWhitelisted: true, // if extra fields arrived — 400
      transform: true,            // convert types according to DTO (string -> number, etc.)
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: true,     // stop at the first error
    }),
  );
  await app.listen(process.env.PORT ?? 3001); // The API itself listens on port 3001
}
bootstrap();
