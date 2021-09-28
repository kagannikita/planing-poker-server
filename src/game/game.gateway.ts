import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { IssueService } from '../issue/issue.service';
import { LobbyService } from '../lobby/lobby.service';
import { SettingsService } from '../settings/settings.service';
import { GameService } from './game.service';
import { GameData, GameState } from './interface';
import { AppGateway } from 'src/app.gateway';
import { SocketStateService } from 'src/app.socketState';




@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  public server: Server;
  private logger: Logger = new Logger('GameGateway');

  private timer =  {}

  constructor(private issueService:IssueService,
              private settingsService:SettingsService,
              private gameService:GameService,
              private lobbyService:LobbyService,
              private SocketStateService: SocketStateService) {}



  @SubscribeMessage('redirect')
  async redirectGame(@ConnectedSocket() client: Socket,
        @MessageBody() body: { pathname: string,playerId:string, lobbyId: string,exit:boolean,isDealer:boolean }) {
    const {pathname,lobbyId,exit,isDealer,playerId}=body

    if (exit && !isDealer){
        const currClient = this.SocketStateService.get(playerId)
        console.log('curr client length ', this.SocketStateService.length())

      this.SocketStateService.remove(playerId, client)
      const data = await this.lobbyService.deleteMember(lobbyId, playerId)
      client.emit('player:deleted')
      currClient.forEach(sock => {
        console.log('curr id ', sock.id);
        sock.emit('player:deleted')
        sock.leave(lobbyId);
      })
      this.server.to(lobbyId).emit('lobby:get', { data });
     }

     if(exit && isDealer){
       this.server.to(lobbyId).emit('player:deleted')
     }

     if(!exit && isDealer){
       this.server.to(lobbyId).emit('redirect:get', { pathname,lobbyId});
     }
  }

  @SubscribeMessage('game:start')
  async gameStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { gameData: GameData, lobbyId: string },
  ): Promise<void> {
    let countdown = body.gameData.timer;
    // const timer=this.timer
    this.logger.log('game:start data ', body.gameData)
    if (this.timer[body.lobbyId]) clearInterval(this.timer[body.lobbyId]);
    
    if (countdown <= 0) {
      body.gameData.status = GameState.paused;
      body.gameData.timer = countdown
      clearInterval(this.timer[body.lobbyId]);
      this.server.to(body.lobbyId).emit('game:paused', { gameData: body.gameData });
    }

    this.timer[body.lobbyId] = setInterval(() => {
      if (countdown <= 0) {
        body.gameData.status = GameState.paused;
        body.gameData.timer = countdown
        clearInterval(this.timer[body.lobbyId]);
        this.server.to(body.lobbyId).emit('game:paused', { gameData: body.gameData });
      }
        countdown--
        body.gameData.status = GameState.started;
        body.gameData.timer = countdown
        this.server.to(body.lobbyId).emit('game:started', { gameData: body.gameData });
    }, 1000);

  }

  @SubscribeMessage('game:pause')
  async gamePaused(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { gameData: GameData, lobbyId: string },
  ): Promise<void> {
    let { gameData, lobbyId}=body
    gameData.status = GameState.paused
    this.logger.log('timer ',this.timer[lobbyId], gameData)
    clearInterval(this.timer[lobbyId])
    this.server.to(lobbyId).emit('game:paused', { gameData })
  }
}
