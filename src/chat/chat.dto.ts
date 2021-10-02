import { IsNotEmpty } from 'class-validator';
import { PlayerDTO } from '../player/player.dto';
import { LobbyDTO } from '../lobby/lobby.dto';

export class ChatDTO{
  @IsNotEmpty()
  members:PlayerDTO[]
  @IsNotEmpty()
  message:string
  @IsNotEmpty()
  rooms:LobbyDTO[]
}
