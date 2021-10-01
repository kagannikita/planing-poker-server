import { IsNotEmpty } from 'class-validator';
import { PlayerDTO } from '../player/player.dto';
import { LobbyDTO } from '../lobby/lobby.dto';

export class ChatDTO{
  @IsNotEmpty()
  member:PlayerDTO
  @IsNotEmpty()
  message:string
  @IsNotEmpty()
  room:LobbyDTO
}
