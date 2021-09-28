import { Inject, Injectable, Logger } from '@nestjs/common';
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

@Injectable()
@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  private logger: Logger = new Logger('AppGateway');

  constructor() { }
  afterInit(): void {
    this.logger.log('Socket on server init')
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected ${client.id}`)
  }

  // @SubscribeMessage('send-message')
  // sendMessage(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() body: { message: string },
  // ): void {
  //   const { name, room_id } = this.users[client.id] || {};
  //   client.broadcast.to(room_id).emit('receive-message', { ...body, name });
  //   this.logger.log(body + " " + name)
  // }


}
