import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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
