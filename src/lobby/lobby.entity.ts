import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from '../player/player.entity';


@Entity('lobby')
export class Lobby extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string
  @CreateDateColumn() created:Date;
  @Column('text') name:string
  @ManyToMany(type => Player, { cascade: true,nullable:true })
  @JoinTable({
    name: 'players',
    joinColumn: { name: 'lobby_id', referencedColumnName: 'id'},
    inverseJoinColumn: { name: 'player_id', referencedColumnName: 'id'},
  })
  players:Player[]
}
