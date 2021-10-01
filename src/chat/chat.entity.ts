import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity, JoinColumn,
  OneToOne, PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lobby } from '../lobby/lobby.entity';
import { Player } from '../player/player.entity';


@Entity('chat')
export class Chat extends BaseEntity{
  @PrimaryGeneratedColumn('uuid') id: string
  @CreateDateColumn() created:Date;
  @UpdateDateColumn() updated:Date;
  @OneToOne(() => Lobby)
  @JoinColumn()
  room: Lobby;
  @OneToOne(() => Player)
  @JoinColumn()
  member: Player;
  @Column('text') message:string
}
