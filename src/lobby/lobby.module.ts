import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryProvider } from '../shared/cloudinary.provider';
import { Lobby } from './lobby.entity';
import { Player } from '../player/player.entity';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';

@Module({
  imports:[TypeOrmModule.forFeature([Lobby,Player])],
  controllers: [LobbyController],
  providers:[LobbyService,CloudinaryProvider],
  exports:[CloudinaryProvider]
})
export class LobbyModule {}
