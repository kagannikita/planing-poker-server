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
import { IssueService } from './issue/issue.service';
import { LobbyService } from './lobby/lobby.service';


@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private logger: Logger = new Logger('AppGateway');

  private users: object = {};

  private clients = new Map();

  private clientKick:Map<string, string[]>=new Map();

  private votesPlayers=[]

  constructor(
    private lobbyService: LobbyService,
    private issueService: IssueService) { }
  afterInit(server: any): any {
    this.logger.log('Socket on server init')
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected ${client.id}`)
  }

  handleDisconnect(client: Socket, ...args: any[]) {
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
    console.log('get client', this.clients.get(name).id)
    console.log("lobby id ", lobby_id)
    this.logger.log(`Joined: ${JSON.stringify(body)}`)
    const data = await this.lobbyService.getById(lobby_id)

    this.server.to(lobby_id).emit('lobby:get', { data, name });
  }

  @SubscribeMessage('leave')
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { player_id: string; lobby_id: string },
  ): Promise<void> {
    const { player_id, lobby_id } = body;
    const currClient = this.clients.get(player_id);
    this.logger.log(`${currClient}`)
    this.users[currClient.id] = { player_id, lobby_id };
    currClient.leave(lobby_id);

    this.logger.log(`Player ${player_id} left in lobby ${lobby_id}`)
  }

  @SubscribeMessage('player:delete')
  async deletePlayer(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { player_id: string; lobby_id: string },
  ): Promise<void> {
    const { player_id, lobby_id } = body;
    const currClient = this.clients.get(player_id);
    this.logger.log(`${currClient}`)
    this.users[currClient.id] = { player_id, lobby_id };
    this.server.to(currClient.id).emit('player:deleted')
    const data = await this.lobbyService.deleteMembers(lobby_id, player_id)

    this.server.to(lobby_id).emit('lobby:get', { data });
    this.logger.log(`Player ${player_id} deleted from the lobby ${lobby_id}`)
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

  @SubscribeMessage('vote-kick')
  async voteKickPlayer(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { lobby_id: string, voteToKickPlayerId: string, playerName: string,currentPlayer:string },
  ): Promise<void> {
    const { lobby_id, voteToKickPlayerId, playerName,currentPlayer } = body
    this.clientKick.get(voteToKickPlayerId)
    if(!this.clientKick.get(voteToKickPlayerId)){
      this.clientKick.set(voteToKickPlayerId,[])
    }
    const data=await this.lobbyService.getById(lobby_id)
    const votes = ((100 / data.players.filter((player)=>player.role==='player').length)
      * (this.clientKick.get(voteToKickPlayerId).length+1))
    console.log(votes)
    if (votes > 50) {
      const lobby = await this.lobbyService.deleteMembers(lobby_id, voteToKickPlayerId)
      this.server.to(lobby_id).emit('leave', lobby);
      this.server.to(lobby_id).emit('lobby:get', lobby);
      this.clientKick.delete(voteToKickPlayerId)
      this.logger.log("player with id: ", voteToKickPlayerId, "kicked")
    } else {
      this.clientKick.get(voteToKickPlayerId).push(currentPlayer)
      const kickPlayer = JSON.stringify(Array.from(this.clientKick));
      this.server.to(lobby_id).emit('kick:voted', {kickPlayer,voteToKickPlayerId, playerName,currentPlayer })
      this.logger.log("Kick voted: ", kickPlayer)
    }
  }

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


  // this.client.broadcast.to(lobby_id).emit('kick:voted', {
  //   modalIsOpen: true,
  //   playerId,
  //   playerName,
  //   votesQuanity
  // })

}
