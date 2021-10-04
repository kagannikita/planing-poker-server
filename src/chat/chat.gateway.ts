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
    @MessageBody() body: { player_id: string; lobby_id: string,message:string },
  ): Promise<void> {
      const {player_id,lobby_id,message}=body
      const members=[]
      const rooms=[]
      const player=await this.playerService.getPlayer(player_id)
      const room=await this.lobbyService.getById(lobby_id)
      members.push(player)
      rooms.push(room)
      await this.chatService.createMessage({members:members,rooms:rooms,message:message})
      this.server.to(lobby_id).emit('message:get', { player,message});
    }

  @SubscribeMessage('chat:changeMsg')
  async changeMsg(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { player_id: string; lobby_id: string,message:string,chat_id:string },
  ): Promise<void> {
    const {player_id,lobby_id,chat_id,message}=body
    const data=await this.playerService.getPlayer(player_id)
    await this.chatService.putMessage(chat_id,{message})
    this.server.to(lobby_id).emit('message:get', { data,message, lobby_id});
  }

  @SubscribeMessage('chat:deleteMsg')
  async deleteMsg(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { lobby_id: string,chat_id:string },
  ): Promise<void> {
    const {lobby_id,chat_id}=body
    await this.chatService.deleteMessage(chat_id)
    this.server.to(lobby_id).emit('message:remove', {msg:'Message removed'});
  }
}
