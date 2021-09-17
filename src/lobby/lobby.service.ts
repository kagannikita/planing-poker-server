import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lobby } from './lobby.entity';
import { Player } from '../player/player.entity';
import { LobbyDTO } from './lobby.dto';
import { ConnectedSocket, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
export class LobbyService {
  private clients=new Map();
  private users:object = {};
  @WebSocketServer()
  private server: Server;
  private logger=new Logger('LobbyModule')
  constructor(@InjectRepository(Lobby)
              private lobbyRepository:Repository<Lobby>,
              @InjectRepository(Player)
  private playerRepository: Repository<Player>) {
  }

  async showAll(){
    const user= await this.lobbyRepository.createQueryBuilder('lobby').leftJoinAndSelect("lobby.players","player")
      .where("player.id=:id",{id:"962a5c3d-afb2-4a68-9a03-eef953d68617"}).getOne()
    console.log(`User: ${user.players[0].role})`)
    return await this.lobbyRepository.find({relations: ['players','issues']})
  }

  async createEmptyLobby(data:LobbyDTO){
    return this.lobbyRepository.save(data);
  }

  async addMembers(lobbyId:string,playerId:string) {
    const lobby=await this.lobbyRepository.findOne({ where: { id: lobbyId },relations: ['players','issues'] }) as Lobby
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
    const lobby=await this.lobbyRepository.findOne({ where: { id: lobbyId },relations: ['players','issues'] }) as Lobby
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
    const lobby=await this.lobbyRepository.findOne({where:{id:id},relations: ['players','issues'] })
    if(!lobby){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    return lobby
  }
  async joinRoom( @ConnectedSocket() client: Socket,body:{name:string,lobby_id:string}){
    const { name, lobby_id } = body
    client.join(lobby_id);
    this.clients.set(name, client)
    this.logger.log('get client', this.clients.get(name).id)
    this.logger.log("lobby id ",lobby_id)
    this.logger.log(`Joined: ${JSON.stringify(body)}`)
    const data = await this.getById(lobby_id)
    client.broadcast.to(lobby_id).emit('joined', { ...data, name });
  }

  sendMessage(@ConnectedSocket() client: Socket,body:{message:string}){
    const { name, room_id } = this.users[client.id] || {};
    client.broadcast.to(room_id).emit('receive-message', { ...body, name });
    this.logger.log(body+" "+name)
  }
  async kickByDealer( @ConnectedSocket() client: Socket,
                      @MessageBody() body: { player_id: string; lobby_id: string }){
    const { player_id, lobby_id } = body;
    const currClient=this.clients.get(player_id);
    this.logger.log(`${currClient.id}`)
    this.users[currClient.id] = { player_id, lobby_id };
    currClient.leave(lobby_id);
    client.broadcast.to(currClient.id).emit('left')
    const data = await this.deleteMembers(lobby_id, player_id)
    client.broadcast.to(lobby_id).emit('lobby:get', { ...data });
  }
  async kickByVoting(@ConnectedSocket() client: Socket,
  @MessageBody() body: { lobby_id: string, player_id: string }){
    let votedQuantity=0
    const votes = ((100 / this.clients.size) * votedQuantity)
    if (votes > 50) {
      const lobby = await this.deleteMembers(body.lobby_id, body.player_id)
      this.server.to(body.lobby_id).emit('leave', lobby);
      votedQuantity = 0;
      this.logger.log("player with id: ", body.player_id, "kicked")
    } else {
      votedQuantity++
      this.server.to(body.lobby_id).emit('kick:voted', votedQuantity);
      this.logger.log("Kick voted: ", votedQuantity)
    }
  }
  async kickPlayer(@ConnectedSocket() client: Socket,
                   @MessageBody() body: { player_id: string,lobby_id: string  }) {
    const user= await this.lobbyRepository.createQueryBuilder('lobby').leftJoinAndSelect("lobby.players","player")
      .where("player.id=:id",{id:"962a5c3d-afb2-4a68-9a03-eef953d68617"}).getOne()
    if(!user){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    if(user.players[0].role==="dealer"){
      await this.kickByDealer(client, body)
    }
    if(user.players[0].role==="member"){
      await this.kickByVoting(client,body)
    }
  }

}
