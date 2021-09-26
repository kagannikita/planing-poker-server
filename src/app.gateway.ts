import { Injectable, Logger } from '@nestjs/common';
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
import { IssueService } from './issue/issue.service';
import { LobbyService } from './lobby/lobby.service';

@Injectable()
@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  users: Map<string, Socket> = new Map();


  constructor(
    private lobbyService: LobbyService,
    private issueService: IssueService) { }
  afterInit(): void {
    this.logger.log('Socket on server init')
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected ${client.id}`)
  }

  @SubscribeMessage('send-message')
  sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { message: string },
  ): void {
    const { name, room_id } = this.users[client.id] || {};
    client.broadcast.to(room_id).emit('receive-message', { ...body, name });
    this.logger.log(body + " " + name)
  }


}
