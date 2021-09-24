import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { IssueService } from '../issue/issue.service';
import { LobbyService } from '../lobby/lobby.service';
import { SettingsService } from '../settings/settings.service';
import { GameService } from './game.service';
import { GameData, GameState } from './interface';

// TO DO: СДЕЛАТЬ ЕВЕНТ СОКЕТ РЕДИРЕКТ ВСЕХ КЛИЕНТОВ ПО ОТПРАВЛЕННОМУ АДРЕСУ И ID
// FIX: ОТЧИСТКА ИНТЕРВАЛА

@WebSocketGateway()
export class GameGateway{
  @WebSocketServer()
  private server: Server
  private logger: Logger = new Logger('GameGateway');

  private timer =  {}

  constructor(private issueService:IssueService,
              private settingsService:SettingsService,
              private gameService:GameService,
              private lobbyService:LobbyService) {}

  // @SubscribeMessage('game:data')
  // async gameData(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() body: { issueId:string,timer:number },
  // ): Promise<void> {
  //   const {issueId,timer}=body
  //   const status='start'
  //   this.server.to(issueId).emit('start', { issueId,timer,status});
  // }

  @SubscribeMessage('game:start')
  async gameStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { gameData: GameData, lobbyId: string },
  ): Promise<void> {
    let countdown = body.gameData.timer;
    this.timer[body.lobbyId] = setInterval(function () {
      if (countdown <= 0) {
        body.gameData.status = GameState.paused;
        body.gameData.timer = countdown
        // не работает отчистка интервала
        clearInterval(this.timer[body.lobbyId]);
        client.to(body.lobbyId).emit('game:paused', { gameData: body.gameData });
      } else {
        countdown--
        body.gameData.status = GameState.started;
        body.gameData.timer = countdown
        client.to(body.lobbyId).emit('game:started', { gameData: body.gameData });
      }

    }, 1000);
  }

  @SubscribeMessage('game:pause')
  async gamePaused(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { gameData: GameData, lobbyId: string },
  ): Promise<void> {
    let { gameData, lobbyId}=body
    if (gameData.status===GameState.started){
      gameData.status = GameState.paused
    }
    clearInterval(this.timer[lobbyId])
    this.server.to(lobbyId).emit('game:paused', { gameData })
  }
}
