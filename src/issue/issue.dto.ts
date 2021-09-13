import { IsNotEmpty } from 'class-validator';
import { LobbyDTO } from '../lobby/lobby.dto';

export class IssueDTO{
  @IsNotEmpty()
  name:string
  @IsNotEmpty()
  priority:string
  lobby?:LobbyDTO
}
