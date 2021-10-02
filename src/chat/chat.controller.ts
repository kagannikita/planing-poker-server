import { Body, Controller, Get, Logger, Param, Post, UsePipes } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ValidationPipe } from '../shared/validation.pipe';
import { ChatDTO } from './chat.dto';

@Controller('chat')
export class ChatController {
  private logger = new Logger('ChatController')
  constructor(private chatService: ChatService) {
  }

  @Get(':id')
  getLastMessagesByLobby(@Param('id') id:string){
    return this.chatService.getMessagesByLobby(id)
  }
  @Post()
  @UsePipes(new ValidationPipe())
  createChat(@Body() data:ChatDTO)
  {
    this.logger.log(JSON.stringify(data))
    return this.chatService.createMessage(data)
  }
}
