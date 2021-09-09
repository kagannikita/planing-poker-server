import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lobby } from './lobby.entity';
import { Player } from '../player/player.entity';
import { LobbyDTO } from './lobby.dto';

@Injectable()
export class LobbyService {
  constructor(@InjectRepository(Lobby)
              private lobbyRepository:Repository<Lobby>,
              @InjectRepository(Player)
  private playerRepository: Repository<Player>) {
  }

  async showAll(){
    return await this.lobbyRepository.find({relations: ['players']})
  }

  async createEmptyLobby(data:LobbyDTO){
    return this.lobbyRepository.save(data);
  }

  async addMembers(lobbyId:string,playerId:string) {
    const lobby=await this.lobbyRepository.findOne({ where: { id: lobbyId },relations: ['players'] }) as Lobby
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
  async getById(id:string){
    const lobby=await this.lobbyRepository.findOne({where:{id:id},relations: ['players'] })
    if(!lobby){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    return lobby
  }
}
