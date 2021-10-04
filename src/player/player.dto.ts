import { IsNotEmpty } from 'class-validator';

export class PlayerDTO{
  @IsNotEmpty()
  firstName:string
  lastName?:string
  position?:string
  image?:string
  @IsNotEmpty()
  role:string
  id?: string
}
