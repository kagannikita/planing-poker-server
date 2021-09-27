import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from '../issue/issue.entity';
import { Lobby } from '../lobby/lobby.entity';
import { Player } from '../player/player.entity';
import { Cards, Settings } from '../settings/settings.entity';
import { IssueService } from '../issue/issue.service';
import { CloudinaryProvider } from '../shared/cloudinary.provider';
import { LobbyService } from '../lobby/lobby.service';
import { SettingsService } from '../settings/settings.service';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { AppGateway } from 'src/app.gateway';
import { SocketStateService } from 'src/app.socketState';

@Module({
  imports:[TypeOrmModule.forFeature([Issue,Lobby,Player,Settings,Cards])],
  // controllers: [IssueController],
  providers: [CloudinaryProvider, GameGateway, AppGateway, GameService, LobbyService, SettingsService, IssueService, SocketStateService],
  exports:[CloudinaryProvider,GameGateway]
})
export class GameModule {}
