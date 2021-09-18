import {
  Body,
  Controller,
  Delete,
  Logger,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ValidationPipe } from '../shared/validation.pipe';
import { CardDTO, SettingsDTO } from './settings.dto';
import { PlayerDTO } from '../player/player.dto';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('settings')
export class SettingsController {
  private logger = new Logger('SettingsController')

  constructor(private settingsService: SettingsService) {}
  @Put(':id')
  @UsePipes(new ValidationPipe())
  editSettings(@Param('id') id:string,@Body() data:Partial<SettingsDTO>){
    this.logger.log(JSON.stringify(data))
    return this.settingsService.updateSettings(id,data)
  }

  @Put('cards/:id')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('image'))
  editCard(@Param('id') id:string,@Body() data:Partial<CardDTO>,
             @UploadedFile() image:Express.Multer.File){
    this.logger.log(JSON.stringify(data))
    return this.settingsService.updateCard(data,image,id)
  }

  @Delete('cards/:id')
  deleteCard(@Param('id') id:string){
    return this.settingsService.deleteCard(id)
  }

  @Post('cards')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('image'))
  createCard(@Body() data:CardDTO,@UploadedFile() image:Express.Multer.File)
  {
    this.logger.log(JSON.stringify(data))
    return this.settingsService.createCards(data,image)
  }
}
