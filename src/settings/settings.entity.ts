import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity, JoinColumn, JoinTable, ManyToOne, OneToMany,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('settings')
export class Settings extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string
  @CreateDateColumn() created:Date;
  @UpdateDateColumn() updated:Date;
  @Column('bool',{ nullable: true }) is_dealer_play:boolean
  @Column('bool',{ nullable: true }) is_change_cards:boolean
  @Column('bool',{ nullable: true }) timer_needed:boolean
  @Column('text',{ nullable: true }) score_type:string
  @Column('text',{ nullable: true }) score_type_short:string
  @Column('timestamptz',{nullable: true }) timer: string;
  @OneToMany(type => Cards, card => card.settings)
  cards: Cards[];
}

@Entity('cards')
export class Cards extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string
  @CreateDateColumn() created:Date;
  @UpdateDateColumn() updated:Date;
  @Column('text',{ nullable: false }) image:string
  // @Column('bool',{ nullable: false }) is_cover:boolean
  @Column('text',{ nullable: false }) name:string
  @ManyToOne(type => Settings, settings => settings.cards)
  settings: Settings;
}
