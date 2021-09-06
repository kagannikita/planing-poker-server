import { IsNotEmpty } from 'class-validator';

export class PlayerDTO{
  @IsNotEmpty()
  firstName:string
  lastName?:string
  position?:string
  @IsNotEmpty()
  role:string
  image:string
}
