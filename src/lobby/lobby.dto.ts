import { PlayerDTO } from '../player/player.dto';
import { IsNotEmpty } from 'class-validator';
import { Settings } from '../settings/settings.entity';

export class LobbyDTO {
  @IsNotEmpty()
  name:string
  players?:PlayerDTO[]
  settings:Settings
  id?: string
}
export class MemberDTO{
  @IsNotEmpty()
  player_id:string
}
