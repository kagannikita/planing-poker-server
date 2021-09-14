import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryProvider } from '../shared/cloudinary.provider';
import { Issue } from './issue.entity';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';
import { Lobby } from '../lobby/lobby.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Issue,Lobby])],
  controllers: [IssueController],
  providers:[IssueService,CloudinaryProvider],
  exports:[CloudinaryProvider]
})
export class IssueModule {}
