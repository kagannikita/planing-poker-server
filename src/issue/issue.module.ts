import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryProvider } from '../shared/cloudinary.provider';
import { Issue } from './issue.entity';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';
import { Lobby } from '../lobby/lobby.entity';
import { IssueGateway } from './issue.gateway';
import { LobbyService } from '../lobby/lobby.service';
import { Player } from '../player/player.entity';
import { Cards, Settings } from '../settings/settings.entity';
import { SettingsService } from '../settings/settings.service';

@Module({
  imports:[TypeOrmModule.forFeature([Issue,Lobby,Player,Settings,Cards])],
  controllers: [IssueController],
  providers: [IssueService, CloudinaryProvider, IssueGateway, LobbyService, SettingsService],
  exports:[CloudinaryProvider,IssueGateway,IssueService]
})
export class IssueModule {}
