import { NestFactory } from '@nestjs/core';
import { ValidationPipe, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply middleware (using Express middleware pattern)
  const requestIdMiddleware = new RequestIdMiddleware();
  const loggerMiddleware = new LoggerMiddleware();
  
  app.use((req, res, next) => requestIdMiddleware.use(req, res, next));
  app.use((req, res, next) => loggerMiddleware.use(req, res, next));

  // Get config service
  const configService = app.get(AppConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Enterprise POS Backend API')
    .setDescription('Enterprise Point of Sale System - Multi-Store, Multi-Tenant Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Groups', 'Group management with hierarchy')
    .addTag('Permissions', 'Permission management')
    .addTag('Stores', 'Store management (Company-owned, Licensed, Joint Venture)')
    .addTag('Categories', 'Product category management')
    .addTag('Products', 'Product/menu management')
    .addTag('Orders', 'Order processing and management')
    .addTag('Inventory', 'Inventory and stock management')
    .addTag('Customers', 'Customer and loyalty management')
    .addTag('Audit', 'Audit logging and tracking')
    .addTag('Sync', 'Data synchronization (Store → Regional → Global)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.port;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
