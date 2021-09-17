import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
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
  @Column('timestamptz',{nullable: true }) timer: Date;
}
export class Cards extends BaseEntity{
  @PrimaryGeneratedColumn('uuid') id: string
  @CreateDateColumn() created:Date;
  @UpdateDateColumn() updated:Date;
  @Column('text',{ nullable: true }) cover:string
  @Column('text',{ nullable: true }) image:string
  @Column('text',{ nullable: true }) text:string
}
