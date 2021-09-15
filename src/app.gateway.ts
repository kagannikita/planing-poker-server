import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LobbyService } from './lobby/lobby.service';


@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private logger: Logger = new Logger('AppGateway');

  private users = {};

  private clients=new Map();
  constructor(private lobbyService:LobbyService) {}
  afterInit(server: any): any {
    this.logger.log('Socket on server init')
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected ${client.id}`)
  }

  handleDisconnect(client:Socket,...args:any[]){
    this.logger.log(`Client disconnected ${client.id}`)
  }

  @SubscribeMessage('join')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { name, lobby_id: string; },
  ): Promise<void> {
    const { name, lobby_id } = body
    client.join(lobby_id);
    this.clients.set(name, client)
    console.log(this.clients.get(name).id)
    console.log(lobby_id)
    this.logger.log(`Joined: ${JSON.stringify(body)}`)
    const data = await this.lobbyService.getById(lobby_id)
    client.broadcast.to(lobby_id).emit('joined', { ...data, name });
  }

  @SubscribeMessage('leave')
  leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { player_id: string; lobby_id: string },
  ): void {
    const { player_id, lobby_id } = body;
    const currClient=this.clients.get(player_id);
    this.logger.log(`${currClient}`)
    this.users[currClient.id] = { player_id, lobby_id };
    currClient.leave(lobby_id);
    this.logger.log(`Player ${player_id} left in lobby ${lobby_id}`)
  }

  @SubscribeMessage('send-message')
  sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { message: string },
  ): void {
    const { name, room_id } = this.users[client.id] || {};
    client.broadcast.to(room_id).emit('receive-message', { ...body, name });
    this.logger.log(body+" "+name)
  }

}
