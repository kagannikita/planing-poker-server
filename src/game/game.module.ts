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

@Module({
  imports:[TypeOrmModule.forFeature([Issue,Lobby,Player,Settings,Cards])],
  // controllers: [IssueController],
  providers:[CloudinaryProvider,GameGateway,LobbyService,SettingsService,IssueService],
  exports:[CloudinaryProvider,GameGateway]
})
export class GameModule {}
