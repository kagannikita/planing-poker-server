import { Body, Controller, Get, Logger, Param, Post, Put, UsePipes } from '@nestjs/common';
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
    return this.lobbyService.getById(id)
  }
  @Post()
  @UsePipes(new ValidationPipe())
  createLobby(@Body() data:LobbyDTO){
    this.logger.log(JSON.stringify(data))
    return this.lobbyService.createEmptyLobby(data)
  }
  @Put(':lobby_id')
  @UsePipes(new ValidationPipe())
  addMember(@Param('lobby_id') lobby_id:string,@Body() player_id:MemberDTO){
    this.logger.log(JSON.stringify(lobby_id))
    this.logger.log(JSON.stringify(player_id))
    return this.lobbyService.addMembers(lobby_id,player_id.player_id)
  }

}
