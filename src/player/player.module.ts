import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { CloudinaryProvider } from '../shared/cloudinary.provider';

@Module({
  imports:[TypeOrmModule.forFeature([Player])],
  controllers: [PlayerController],
  providers:[PlayerService,CloudinaryProvider],
  exports:[CloudinaryProvider]
})
export class PlayerModule {}
