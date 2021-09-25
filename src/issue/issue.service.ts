import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from './issue.entity';
import { IssueDTO } from './issue.dto';
import { Lobby } from '../lobby/lobby.entity';

@Injectable()
export class IssueService {
  constructor(@InjectRepository(Issue)
              private issueRepository: Repository<Issue>,
              @InjectRepository(Lobby)
              private lobbyRepository: Repository<Lobby>) {
  }
  async showByLobby(lobbyId:string){
    const lobby=await this.lobbyRepository.findOne({where:{id:lobbyId}}) as Lobby
    if(!lobby){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    const issues=await this.issueRepository.find({where:{lobby:lobby}})
    if(!issues){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    return issues
  }
  async create(data:IssueDTO){
    const lobby=await this.lobbyRepository.findOne({where:{id:data.lobby}}) as Lobby
    if(!lobby){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    data.lobby=lobby
    return await this.issueRepository.save(data)
  }

  async update(id:string,data:Partial<IssueDTO>){
    let issue=await this.issueRepository.findOne({where:{id}})
    if(!issue){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    await this.issueRepository.update({id},data)
    issue=await this.issueRepository.findOne({where:{id}})
    return issue
  }

  async destroy(id:string){
    const issue=await this.issueRepository.findOne({where:{id}})
    if(!issue){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }
    await this.issueRepository.delete({id})
    return issue
  }
  async createArray(data:IssueDTO[]){
    for(const issue of data){
      issue.score='-'
      const lobby=await this.lobbyRepository.findOne({where:{id:issue.lobby}}) as Lobby
      if(!lobby){
        throw new HttpException('Not found',HttpStatus.NOT_FOUND)
      }
      issue.lobby=lobby
    }
    return await this.issueRepository.save(data)
  }

}
