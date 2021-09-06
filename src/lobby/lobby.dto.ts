import { PlayerDTO } from '../player/player.dto';
import { IsNotEmpty } from 'class-validator';

export class LobbyDTO {
  @IsNotEmpty()
  name:string
  players?:PlayerDTO[]
}
export class MemberDTO{
  @IsNotEmpty()
  player_id:string
}
