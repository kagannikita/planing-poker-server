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
  @WebSocketServer()
  private server: Server;
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
  async deleteMember(lobbyId:string,playerId:string) {
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

}
