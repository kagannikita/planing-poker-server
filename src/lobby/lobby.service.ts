import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lobby } from './lobby.entity';
import { Player } from '../player/player.entity';
import { LobbyDTO } from './lobby.dto';
import { ConnectedSocket, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SettingsService } from '../settings/settings.service';
import { Settings } from '../settings/settings.entity';

@Injectable()
export class LobbyService {
  private clients=new Map();
  private users:object = {};
  @WebSocketServer()
  private server: Server;
  private clientKick:Map<string, string[]>=new Map();
  private logger=new Logger('LobbyModule')
  constructor(@InjectRepository(Lobby)
              private lobbyRepository:Repository<Lobby>,
              @InjectRepository(Player)
  private playerRepository: Repository<Player>,
  private settingsService:SettingsService) {
  }

  async showAll(){
    return await this.lobbyRepository.find({relations: ['players','issues','settings','settings.cards']})
  }

  async createEmptyLobby(data:LobbyDTO){
    data.settings=await this.settingsService.createSettings() as Settings
    return await this.lobbyRepository.save(data);
  }

  async addMembers(lobbyId:string,playerId:string) {
    const lobby=await this.lobbyRepository.findOne({ where: { id: lobbyId },relations: ['players',
        'issues','settings','settings.cards'] }) as Lobby
    const player=await this.playerRepository.findOne({where:{id:playerId}}) as Player
    Logger.log(`Lobby: ${JSON.stringify(lobby)}`)
    Logger.log(`Player: ${JSON.stringify(player)}`)
    if (!player || !lobby){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    lobby.players.push(player)
    await lobby.save()
    return lobby
  }
  async deleteMembers(lobbyId:string,playerId:string) {
    const lobby=await this.lobbyRepository.findOne({ where: { id: lobbyId },relations: ['players',
        'issues','settings','settings.cards'] }) as Lobby
    const player=await this.playerRepository.findOne({where:{id:playerId}}) as Player
    Logger.log(`Lobby: ${JSON.stringify(lobby)}`)
    Logger.log(`Player: ${JSON.stringify(player)}`)
    if (!player || !lobby){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    const index=lobby.players.findIndex(key=>key.id===playerId)
    lobby.players.splice(index,1)
    await lobby.save()
    return lobby
  }
  async getById(id:string){
    const lobby=await this.lobbyRepository.findOne({where:{id:id},relations: ['players','issues','settings','settings.cards'] })
    if(!lobby){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    return lobby
  }
  async joinRoom( @ConnectedSocket() client: Socket,body:{name:string,lobby_id:string}){
    const { name, lobby_id } = body
    client.join(lobby_id);
    this.clients.set(name, client)
    console.log("lobby id ", lobby_id)
    this.logger.log(`Joined: ${JSON.stringify(body)}`)
    const kickPlayer = JSON.stringify(Array.from(this.clientKick));
    client.emit('vote:data', { kickPlayer })
  }
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    body: { player_id: string; lobby_id: string },
  ): Promise<void> {
    const { player_id, lobby_id } = body;
    const currClient = this.clients.get(player_id);
    this.logger.log(`${currClient}`)
    this.users[currClient.id] = { player_id, lobby_id };
    currClient.leave(lobby_id);
    this.logger.log(`Player ${player_id} left in lobby ${lobby_id}`)
  }
  async currClientDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() player_id: string,
  ): Promise<any> {
    const currClient = this.clients.get(player_id);
    this.logger.log(`${currClient}`)
    return currClient
  }
}
