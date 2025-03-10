import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

// Debug environment variables
console.log('Environment variables in main.ts:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_PATH:', process.env.DB_PATH);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add cookie-parser middleware
  app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
