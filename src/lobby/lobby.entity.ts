import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity, JoinColumn,
  JoinTable,
  ManyToMany, OneToMany,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Player } from '../player/player.entity';
import { Issue } from '../issue/issue.entity';


@Entity('lobby')
export class Lobby extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string
  @CreateDateColumn() created:Date;
  @UpdateDateColumn() updated:Date;
  @Column('text') name:string
  @OneToMany(type => Issue, issue => issue.lobby)
  issues: Issue[];
  @ManyToMany(type => Player, { cascade: true,nullable:true })
  @JoinTable({
    name: 'players',
    joinColumn: { name: 'lobby_id', referencedColumnName: 'id'},
    inverseJoinColumn: { name: 'player_id', referencedColumnName: 'id'},
  })
  players:Player[]
}
