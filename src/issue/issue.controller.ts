import { Body, Controller, Delete, Get, Logger, Param, Post, Put, UsePipes } from '@nestjs/common';
import { IssueService } from './issue.service';
import { ValidationPipe } from '../shared/validation.pipe';
import { IssueDTO } from './issue.dto';


@Controller('issue')
export class IssueController {
  private logger=new Logger('IssueController')
  constructor(private issueService:IssueService) {}

  @Get(':lobbyId')
  showIssuesByLobby(@Param('lobbyId') lobbyId:string){
    return this.issueService.showByLobby(lobbyId)
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  editIssue(@Param('id') id:string,@Body() data:Partial<IssueDTO>){
    this.logger.log(JSON.stringify(data))
    return this.issueService.update(id,data)
  }

  @Delete(':id')
  deleteIssue(@Param('id') id:string){
    return this.issueService.destroy(id)
  }

  @Post()
  @UsePipes(new ValidationPipe())
  createIssue(@Body() data:IssueDTO)
  {
    this.logger.log(JSON.stringify(data))
    return this.issueService.create(data)
  }
}
