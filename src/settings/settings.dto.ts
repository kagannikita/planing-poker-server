import { IsNotEmpty } from 'class-validator';


export class SettingsDTO{
  @IsNotEmpty()
  is_dealer_play:boolean
  @IsNotEmpty()
  is_change_cards:boolean
  @IsNotEmpty()
  timer_needed:boolean
  @IsNotEmpty()
  score_type:string
  @IsNotEmpty()
  score_type_short:string
  @IsNotEmpty()
  timer:string
  cards:CardDTO[]
}
export class CardDTO{
  image?:string
  @IsNotEmpty()
  name:string
  settings?:SettingsDTO
}
