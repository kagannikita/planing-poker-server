import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LobbyService } from '../lobby/lobby.service';
import { SocketStateService } from '../shared/socketState';
import { PlayerService } from '../player/player.service';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  public server: Server;

  private logger: Logger = new Logger('ChatGateway');


  constructor(
    private playerService: PlayerService,
    private chatService:ChatService,
    private lobbyService:LobbyService,
    private socketStateService: SocketStateService
  ) {
  }

  @SubscribeMessage('chat:sendMsg')
  async sendMsg(
      @ConnectedSocket() client: Socket,
    @MessageBody() body: { yourMember: string; lobbyId: string,message:string },
  ): Promise<void> {
      const {yourMember,lobbyId,message}=body
      const members=[]
      const rooms=[]
      const player=await this.playerService.getPlayer(yourMember)
      const room=await this.lobbyService.getById(lobbyId)
      members.push(player)
      rooms.push(room)
      await this.chatService.createMessage({members:members,rooms:rooms,message:message})
      const data=await this.chatService.getMessagesByLobby(lobbyId)
      this.server.to(lobbyId).emit('message:get', data);
    }

  @SubscribeMessage('chat:changeMsg')
  async changeMsg(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { playerId: string; lobbyId: string,message:string,chatId:string },
  ): Promise<void> {
    const {playerId,lobbyId,chatId,message}=body
    const members=[]
    const player=await this.playerService.getPlayer(playerId)
    await this.chatService.putMessage(chatId,{message})
    members.push(player)
    const data=await this.chatService.getMessagesByLobby(lobbyId)
    this.server.to(lobbyId).emit('message:get', data);
  }

  @SubscribeMessage('chat:deleteMsg')
  async deleteMsg(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { lobbyId: string,chatId:string },
  ): Promise<void> {
    const {lobbyId,chatId}=body
    await this.chatService.deleteMessage(chatId)
    const data=await this.chatService.getMessagesByLobby(lobbyId)
    this.server.to(lobbyId).emit('message:get', data);
  }
}
