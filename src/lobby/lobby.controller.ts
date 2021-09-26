import { Body, Controller, Get, HttpException, HttpStatus, Logger, Param, Post, Put, UsePipes } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { LobbyDTO, MemberDTO } from './lobby.dto';
import { ValidationPipe } from '../shared/validation.pipe';

@Controller('lobby')
export class LobbyController {
  private logger=new Logger('LobbyController')
  constructor(private lobbyService:LobbyService) {}

  @Get()
  showAllLobby(){
    return this.lobbyService.showAll()
  }

  @Get(':id')
  getLobby(@Param('id') id:string){
    const pattern = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', 'i');
    Logger.log(`Id: ${id.match(pattern)}`)
    if(!id.match(pattern)){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    return this.lobbyService.getById(id)
  }

  @Post()
  @UsePipes(new ValidationPipe())
  createLobby(@Body() data:LobbyDTO){
    this.logger.log(JSON.stringify(data))
    return this.lobbyService.createEmptyLobby(data)
  }
  @Put('add/:lobby_id')
  @UsePipes(new ValidationPipe())
  addMember(@Param('lobby_id') lobby_id:string,@Body() player_id:MemberDTO){
    this.logger.log(JSON.stringify(lobby_id))
    this.logger.log(JSON.stringify(player_id))
    return this.lobbyService.addMembers(lobby_id,player_id.player_id)
  }
  @Put('delete/:lobby_id')
  @UsePipes(new ValidationPipe())
  deleteMember(@Param('lobby_id') lobby_id:string,@Body() player_id:MemberDTO){
    this.logger.log(JSON.stringify(lobby_id))
    this.logger.log(JSON.stringify(player_id))
    return this.lobbyService.deleteMember(lobby_id,player_id.player_id)
  }
}
