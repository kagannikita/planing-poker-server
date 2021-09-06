import 'dotenv/config'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { setupAdminPanel } from './admin-panel/admin-panel.plugin';
const port=process.env.PORT || 4000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await setupAdminPanel(app);
  await app.listen(port);
  Logger.log(`Server running on http;//localhost:${port}`,'Bootstrap')
}
bootstrap();
