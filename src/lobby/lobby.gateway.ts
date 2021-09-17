import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LobbyService } from './lobby.service';

@WebSocketGateway()
export class LobbyGateway  {
@WebSocketServer()
  private server: Server;

  constructor(private lobbyService:LobbyService) {}
  @SubscribeMessage('join')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { name:string, lobby_id: string; },
  ): Promise<void> {
     await this.lobbyService.joinRoom(client, body)
  }

  @SubscribeMessage('leave')
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { player_id: string; lobby_id: string },
  ): Promise<void>  {
    await this.lobbyService.kickPlayer(client,body)
  }

  @SubscribeMessage('send-message')
  sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { message: string },
  ): void {
    this.lobbyService.sendMessage(client,body)
  }
}
