import { Body, Controller,  Get, Logger, Param, Post, UploadedFile, UseInterceptors, UsePipes } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerDTO } from './player.dto';
import { ValidationPipe } from '../shared/validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('player')
export class PlayerController {
  private logger=new Logger('PlayerController')
  constructor(private playerService:PlayerService) {}

  // @Get()
  // showAllPlayers(){
  //   return this.playerService.showAll()
  // }
  //
  // @Get(':id')
  // getPlayer(@Param('id') id:string){
  //   return this.playerService.read(id)
  // }
  //
  //
  // @Put(':id')
  // @UsePipes(new ValidationPipe())
  // editPlayer(@Param('id') id:string,@Body() data:Partial<PlayerDTO>){
  //   this.logger.log(JSON.stringify(data))
  //   return this.playerService.update(id,data)
  // }
  //
  // @Delete(':id')
  // deletePlayer(@Param('id') id:string){
  //   return this.playerService.destroy(id)
  // }

  @Post()
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('image'))
  createPlayer(@Body() data:PlayerDTO,@UploadedFile() image:Express.Multer.File)
  {
    this.logger.log(JSON.stringify(data))
    return this.playerService.create(data,image)
  }
}
