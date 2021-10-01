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
import { Chat } from '../chat/chat.entity';

@Entity('player')
export class Player extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string
  @CreateDateColumn() created:Date;
  @UpdateDateColumn() updated:Date;
  @Column('text',{ nullable: false }) firstName: string
  @Column('text',{ nullable: true }) lastName:string
  @Column('text',{ nullable: true }) position:string
  @Column('text',{ nullable: false }) role:string
  @Column('text',{ nullable: true }) image:string
}
