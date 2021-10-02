import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Lobby } from '../lobby/lobby.entity';
import { Player } from '../player/player.entity';
import { Chat } from './chat.entity';
import { ChatDTO } from './chat.dto';

@Injectable()
export class ChatService {
  constructor(@InjectRepository(Player)
              private playerRepository: Repository<Player>,
              @InjectRepository(Chat)
              private chatRepository:Repository<Chat>,
              @InjectRepository(Lobby)
              private lobbyRepository: Repository<Lobby>) {
  }

  async getMessagesByLobby(lobbyId:string){
    const lobby=await this.lobbyRepository.findOne({where:{id:lobbyId},}) as Lobby
    if(!lobby){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    const chat=await this.chatRepository.createQueryBuilder("chat")
      .innerJoin(
        'chat.rooms',
        'rooms',
        'rooms.id = :roomsId',
        { roomsId: lobbyId }
      )
      .innerJoinAndSelect('chat.members', 'members')
      .getMany();
    if(!chat){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    return chat
  }
  async createMessage(data:ChatDTO){
    const room=await this.lobbyRepository.findOne({where:{id:data.rooms[0]}}) as Lobby
    if(!room){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    data.rooms.push(room)
    const member=await this.playerRepository.findOne({where:{id:data.members[0]}}) as Player
    if(!member){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    data.members.push(member)
    return await this.chatRepository.save(data)
  }

  async deleteMessage(id:string){
    const chat=await this.chatRepository.findOne({where:{id}})
    if(!chat){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    await this.chatRepository.delete({id})
    return chat
  }

  async putMessage(id:string,data:Partial<ChatDTO>){
    let chat=await this.chatRepository.findOne({where:{id}})
    if(!chat){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    await this.chatRepository.update({id},data)
    chat=await this.chatRepository.findOne({where:{id}})
    return chat
  }
}
