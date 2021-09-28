import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IssueService } from './issue.service';
import { LobbyService } from '../lobby/lobby.service';
import { Logger } from '@nestjs/common';
import { AppGateway } from 'src/app.gateway';

@WebSocketGateway({namespace: 'issue'})
export class IssueGateway{
  @WebSocketServer()
  public server: Server;

  private logger: Logger = new Logger('IssueGateway');

  constructor(private issueService:IssueService,
              private lobbyService:LobbyService,
              ) {}

  @SubscribeMessage('issue:delete')
  async deleteIssue(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { id: string, lobby_id: string }
  ): Promise<void> {
    await this.issueService.destroy(body.id);
    const data = await this.lobbyService.getById(body.lobby_id);
    this.server.to(body.lobby_id).emit('lobby:get', { data });
    this.logger.log(`Issue with ${body.id} deleted from the lobby ${body.lobby_id}`)
  }

  @SubscribeMessage('issue:added')
  async createIssue(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { name: string, lobby_id: string }
  ): Promise<void> {
    const data = await this.lobbyService.getById(body.lobby_id);
    this.server.to(body.lobby_id).emit('lobby:get', { data: data });
    this.logger.log(`Issue ${body.name} created in the lobby ${body.lobby_id}`)
  }

  @SubscribeMessage('issue:update')
  async updateIssue(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { name: string, lobby_id: string }
  ): Promise<void> {
    const data = await this.lobbyService.getById(body.lobby_id);
    this.server.to(body.lobby_id).emit('lobby:get', { data });
    this.logger.log(`Issue ${body.name} created in the lobby ${body.lobby_id}`)
  }

  @SubscribeMessage('issue:file-added')
  async getData(
    @ConnectedSocket() client: Socket,
    @MessageBody() lobbyId: string
  ): Promise<void> {
    const data = await this.lobbyService.getById(lobbyId);
    client.emit('lobby:get', {data})
  }
}
