import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cards, Settings } from './settings.entity';
import { IssueDTO } from '../issue/issue.dto';
import { CardDTO, SettingsDTO } from './settings.dto';
import { Lobby } from '../lobby/lobby.entity';
import { uploadImage } from '../shared/upload.function';


@Injectable()
export class SettingsService {
  private logger = new Logger('SettingsModule')

  constructor(@InjectRepository(Settings)
              private settingsRepository: Repository<Settings>,
              @InjectRepository(Cards)
               private cardsRepository: Repository<Cards>
  ) {}

  async createSettings(){
    const data=new Settings()
    data.is_dealer_play=false
    data.is_change_cards=false
    data.score_type='Score Point'
    data.score_type_short='SP'
    data.timer=null
    data.timer_needed=false
    const card1=await this.createCoverCards('1', 'https://res.cloudinary.com/plaining-poker/image/upload/v1631879184/dibpHF_vba7zs.jpg')
    const card2=await this.createCoverCards('3', 'https://res.cloudinary.com/plaining-poker/image/upload/v1631879177/scale_1200_zwr5jo.jpg')
    const card3=await this.createCoverCards('5', 'https://res.cloudinary.com/plaining-poker/image/upload/v1631879169/linii-ogni-sfera_sxd6ry.jpg')
    data.cards=[card1,card2,card3]
    const settings=this.settingsRepository.create(data)
    await this.settingsRepository.save(settings)
    return settings
  }
  async createCoverCards(name: string, image:string){
    const data=new Cards()
    data.name = name
    data.is_cover=true
    data.image=image
    const card=this.cardsRepository.create(data)
    await this.cardsRepository.save(card)
    return card
  }

  async updateSettings(id:string,data:Partial<SettingsDTO>){
    let settings=await this.settingsRepository.findOne({where:{id}})
    if(!settings){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    await this.settingsRepository.update({id},data)
    settings=await this.settingsRepository.findOne({where:{id}})
    return settings
  }

  async createCards(data:CardDTO,image:Express.Multer.File){
    Logger.log(`File: ${image}`)
    if (image!==undefined){
      const link=await uploadImage(image)
      data.image=link.url
    }
    const settings=await this.settingsRepository.findOne({where:{id:data.settings}}) as Settings
    if(!settings){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    data.settings=settings
    return await this.cardsRepository.save(data)
  }

  async deleteCard(id:string){
    const card=await this.cardsRepository.findOne({where:{id}})
    if(!card){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    await this.cardsRepository.delete({id})
    return card
  }

  async updateCard(data:Partial<CardDTO>,image:Express.Multer.File,id:string){
    let card=await this.cardsRepository.findOne({where:{id}})
    if(!card){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    Logger.log(`File: ${image}`)
    if (image!==undefined){
      const link=await uploadImage(image)
      data.image=link.url
    }
    console.log(data)
    await this.cardsRepository.update({id},{...data})
    card=await this.cardsRepository.findOne({where:{id}})
    return card
  }
}
