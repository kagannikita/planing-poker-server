import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryProvider } from '../shared/cloudinary.provider';
import { Cards, Settings } from './settings.entity';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports:[TypeOrmModule.forFeature([Settings,Cards])],
  controllers: [SettingsController],
  providers:[SettingsService,CloudinaryProvider],
  exports:[CloudinaryProvider]
})
export class SettingsModule {}
