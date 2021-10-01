import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Player } from './player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerDTO } from './player.dto';
import { uploadImage } from '../shared/upload.function';

@Injectable()
export class PlayerService {
  constructor(@InjectRepository(Player)
              private playerRepository:Repository<Player>) {
  }

  async showAll(){
    return await this.playerRepository.find()
  }
  async getPlayer(playerId:string){
    return await this.playerRepository.findOne({where: { id: playerId }})
  }

  async create(data:PlayerDTO,image:Express.Multer.File){
    Logger.log(`File: ${image}`)
    if (image!==undefined){
      const link=await uploadImage(image)
      data.image=link.url
    }
    const player=this.playerRepository.create(data)
    await this.playerRepository.save(player)
    return player
  }

  async read(id:string){
    const player=await this.playerRepository.findOne({where:{id:id}})
    if(!player){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    return player
  }

  async update(id:string,data:Partial<PlayerDTO>){
    let player=await this.playerRepository.findOne({where:{id}})
    if(!player){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    await this.playerRepository.update({id},data)
    player=await this.playerRepository.findOne({where:{id}})
    return player
  }

  async destroy(id:string){
    const player=await this.playerRepository.findOne({where:{id}})
    if(!player){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    await this.playerRepository.delete({id})
    return player
  }

}
