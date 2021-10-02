import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity, JoinColumn, JoinTable, ManyToMany, OneToMany,
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
  @ManyToMany(type => Player, { cascade: true,nullable:true })
  @JoinTable({
    name: 'members',
    joinColumn: { name: 'chat_id', referencedColumnName: 'id'},
    inverseJoinColumn: { name: 'player_id', referencedColumnName: 'id'},
  })
  members:Player[]
  @ManyToMany(type => Lobby, { cascade: true,nullable:true })
  @JoinTable({
    name: 'rooms',
    joinColumn: { name: 'chat_id', referencedColumnName: 'id'},
    inverseJoinColumn: { name: 'lobby_id', referencedColumnName: 'id'},
  })
  rooms:Lobby[]
  @Column('text') message:string
}
