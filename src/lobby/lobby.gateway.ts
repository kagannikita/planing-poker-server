import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LobbyService } from './lobby.service';

@WebSocketGateway()
export class LobbyGateway  {
@WebSocketServer()
  private server: Server;
  private logger: Logger = new Logger('LobbyGateway');
  private clientKick:Map<string, string[]>=new Map();
  constructor(private lobbyService:LobbyService) {}


  @SubscribeMessage('join')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { name, lobby_id: string; },
  ): Promise<void> {
    const { name, lobby_id } = body
    await this.lobbyService.joinRoom(client, body)
    const data = await this.lobbyService.getById(lobby_id)
    this.server.to(lobby_id).emit('lobby:get', { data, name });
  }

  @SubscribeMessage('leave')
  async leaveRoom(
      @ConnectedSocket() client: Socket,
    @MessageBody() body: { player_id: string; lobby_id: string },
  ): Promise<void> {
    await this.lobbyService.leaveRoom(client, body)
  }

  @SubscribeMessage('player:delete')
  async deletePlayer(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { player_id: string; lobby_id: string },
  ): Promise<void> {
    const { player_id, lobby_id } = body;
    const currClient=await this.lobbyService.currClientDelete(client,player_id)
    this.server.to(currClient.id).emit('player:deleted')
    const data = await this.lobbyService.deleteMembers(lobby_id, player_id)
    this.server.to(lobby_id).emit('lobby:get', { data });
    this.logger.log(`Player ${player_id} deleted from the lobby ${lobby_id}`)
  }

  @SubscribeMessage('vote-kick')
  async voteKickPlayer(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { lobby_id: string, voteToKickPlayerId: string, playerName: string,currentPlayer:string },
  ): Promise<void> {
    const { lobby_id, voteToKickPlayerId, playerName, currentPlayer } = body
    this.clientKick.get(voteToKickPlayerId)
    if (!this.clientKick.get(voteToKickPlayerId)) {
      this.clientKick.set(voteToKickPlayerId, [])
    }
    const data = await this.lobbyService.getById(lobby_id)
    const votes = ((100 / data.players.filter((player) => player.role === 'player').length)
      * (this.clientKick.get(voteToKickPlayerId).length + 1))
    if (votes > 50) {
      const data = await this.lobbyService.deleteMembers(lobby_id, voteToKickPlayerId)
      client.to(voteToKickPlayerId).emit('player:deleted')
      this.server.to(lobby_id).emit('lobby:get', { data });
      this.clientKick.delete(voteToKickPlayerId)
      this.logger.log("player with id: ", voteToKickPlayerId, "kicked")
    } else {
      this.clientKick.get(voteToKickPlayerId).push(currentPlayer)
      const kickPlayer = JSON.stringify(Array.from(this.clientKick));
      this.server.to(lobby_id).emit('kick:voted', { kickPlayer, voteToKickPlayerId, playerName, currentPlayer })
      this.logger.log("Kick voted: ", kickPlayer)
    }
  }
}
