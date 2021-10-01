import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lobby } from '../lobby/lobby.entity';
import { Player } from '../player/player.entity';
import { CloudinaryProvider } from '../shared/cloudinary.provider';
import { LobbyService } from '../lobby/lobby.service';
import { Chat } from './chat.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { PlayerService } from '../player/player.service';
import { SocketStateService } from '../shared/socketState';
import { SettingsService } from '../settings/settings.service';
import { Cards, Settings } from '../settings/settings.entity';



@Module({
  imports:[TypeOrmModule.forFeature([Lobby,Player,Chat,Settings,Cards])],
  controllers: [ChatController],
  providers: [ChatService, CloudinaryProvider, ChatGateway,SocketStateService,
    LobbyService,PlayerService,SettingsService],
  exports:[CloudinaryProvider,ChatGateway,ChatService]
})
export class ChatModule {}
