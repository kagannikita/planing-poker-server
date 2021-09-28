import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { AppGateway } from 'src/app.gateway';
import { SocketStateService } from 'src/app.socketState';


@WebSocketGateway()
export class LobbyGateway  {
  @WebSocketServer()
  public server: Server;

  private logger: Logger = new Logger('LobbyGateway');

  private clientKick:Map<string, string[]>=new Map();

  constructor(
    private lobbyService:LobbyService,
    private socketStateService: SocketStateService
    ) {}

  @SubscribeMessage('join')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { player_id: string, lobby_id: string; },
  ): Promise<void> {
    const { player_id, lobby_id } = body
    if(player_id === '') return
    
    client.join(lobby_id)
    this.socketStateService.add(player_id, client)
    const sock = this.socketStateService.get(player_id)
    console.log('New user in that playerId', sock.length)
    const data = await this.lobbyService.getById(lobby_id)
    
    this.server.to(lobby_id).emit('lobby:get', { data, player_id});
    console.log('state lenght ', this.socketStateService.length());
  }

  @SubscribeMessage('leave')
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { player_id: string; lobby_id: string },
  ): Promise<void> {
    client.leave(body.lobby_id)
    client.disconnect(true)
    client.removeAllListeners()
    this.socketStateService.remove(body.player_id, client)
  }

  @SubscribeMessage('player:delete')
  async deletePlayer(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { playerId: string; lobbyId: string },
  ): Promise<void> {
    const { playerId, lobbyId } = body;
    const currClient = this.socketStateService.get(playerId)
    currClient.forEach(soc => this.server.to(soc.id).emit('player:deleted') )

    const data = await this.lobbyService.deleteMember(lobbyId, playerId)
    this.server.to(lobbyId).emit('lobby:get', { data });
    this.logger.log(`Player ${playerId} deleted from the lobby ${lobbyId}`)
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
      const data = await this.lobbyService.deleteMember(lobby_id, voteToKickPlayerId)
      client.to(voteToKickPlayerId).emit('player:deleted')
      client.leave(lobby_id)
      this.server.to(lobby_id).emit('lobby:get', { data });
      this.clientKick.delete(voteToKickPlayerId)
      this.socketStateService.remove(voteToKickPlayerId, client)
      this.logger.log("player with id: ", voteToKickPlayerId, "kicked")
    } else {
      this.clientKick.get(voteToKickPlayerId).push(currentPlayer)
      const kickPlayer = JSON.stringify(Array.from(this.clientKick));
      this.server.to(lobby_id).emit('kick:voted', { kickPlayer, voteToKickPlayerId, playerName, currentPlayer })
      
      this.logger.log("Kick voted: ", kickPlayer)
    }
  }
}
