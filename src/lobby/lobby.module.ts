import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryProvider } from '../shared/cloudinary.provider';
import { Lobby } from './lobby.entity';
import { Player } from '../player/player.entity';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { Issue } from '../issue/issue.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Lobby,Player,Issue])],
  controllers: [LobbyController],
  providers:[LobbyService,CloudinaryProvider],
  exports:[CloudinaryProvider,LobbyService]
})
export class LobbyModule {}
