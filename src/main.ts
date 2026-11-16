import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import  { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule,  {
    instrument: ObserveInstrument,
  });
  app.use(
    (req: { path: string }, res: { setHeader(name: string, value: string): void }, next: () => void) => {
      if (/^\/(admin|auth|orders)(\/|$)/.test(req.path)) {
        res.setHeader('Cache-Control', 'no-store');
      }
      next();
    },
  );
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.listen(process.env.PORT ?? 4000);
}
await bootstrap();