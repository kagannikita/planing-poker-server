import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { IssueService } from '../issue/issue.service';
import { LobbyService } from '../lobby/lobby.service';
import { SettingsService } from '../settings/settings.service';
import { GameService } from './game.service';

@WebSocketGateway()
export class GameGateway{
  @WebSocketServer()
  private server: Server
  private logger: Logger = new Logger('GameGateway');
  constructor(private issueService:IssueService,
              private settingsService:SettingsService,
              private gameService:GameService,
              private lobbyService:LobbyService) {}

  @SubscribeMessage('game:data')
  async gameData(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { lobby_id:string,timer:number },
  ): Promise<void> {
    const {lobby_id,timer}=body
    const status='start'
    this.server.to(body.lobby_id).emit('start', { lobby_id,timer,status});
  }

  @SubscribeMessage('game:start')
  async gameStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { status:string, issue_id: string; timer:number,lobby_id:string},
  ): Promise<void> {
    let countdown = body.timer*1000;
    const timer = setInterval(function(){
      client.to(body.lobby_id).emit('round:start', countdown);
      countdown--
      if (countdown === 0) {
       client.to(body.lobby_id).emit('round:end');
        clearInterval(timer);
      }
    }, 1000);
  }

  @SubscribeMessage('game:paused')
  async gamePaused(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { status:string, issue_id: string; timer:number,lobby_id:string },
  ): Promise<void> {
    let {status,issue_id,timer,lobby_id}=body
    if(status==='play'){
      status='paused'
      clearInterval(timer)
    }
    this.server.to(lobby_id).emit('paused',{status,timer})
  }
}
