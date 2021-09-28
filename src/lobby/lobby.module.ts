import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryProvider } from '../shared/cloudinary.provider';
import { Lobby } from './lobby.entity';
import { Player } from '../player/player.entity';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { Issue } from '../issue/issue.entity';
import { LobbyGateway } from './lobby.gateway';
import { Cards, Settings } from '../settings/settings.entity';
import { PlayerService } from '../player/player.service';
import { IssueService } from '../issue/issue.service';
import { SettingsService } from '../settings/settings.service';
import { SocketStateService } from 'src/app.socketState';
import { AppGateway } from 'src/app.gateway';


@Module({
  imports:[TypeOrmModule.forFeature([Lobby,Player,Issue,Settings,Cards])],
  controllers: [LobbyController],
  providers: [LobbyService, PlayerService, IssueService, SettingsService, CloudinaryProvider, LobbyGateway, SocketStateService],

  exports:[CloudinaryProvider,LobbyService,LobbyGateway]
})
export class LobbyModule {}
