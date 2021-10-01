import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  private logger = new Logger('ChatController')
  constructor(private chatService: ChatService) {
  }

  @Get(':id')
  getLastMessagesByLobby(@Param('id') id:string){
    return this.chatService.getMessagesByLobby(id)
  }

}
