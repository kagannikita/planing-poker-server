import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lobby } from '../lobby/lobby.entity';

@Entity('issue')
export class Issue extends BaseEntity{
  @PrimaryGeneratedColumn('uuid') id: string
  @CreateDateColumn() created:Date;
  @UpdateDateColumn() updated:Date;
  @Column('text',{ nullable: false }) name: string
  @Column('text',{ nullable: false }) priority:string
  @ManyToOne(type => Lobby, lobby => lobby.issues)
  lobby: Lobby;
}
