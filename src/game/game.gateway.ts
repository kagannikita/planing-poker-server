import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { IssueService } from '../issue/issue.service';
import { LobbyService } from '../lobby/lobby.service';
import { SettingsService } from '../settings/settings.service';
import { GameService } from './game.service';
import { GameData, GameState } from './interface';
import { AppGateway } from 'src/app.gateway';



@WebSocketGateway()
export class GameGateway{

  private logger: Logger = new Logger('GameGateway');

  private timer =  {}

  constructor(private issueService:IssueService,
              private settingsService:SettingsService,
              private gameService:GameService,
              private lobbyService:LobbyService,
              private mainGateway: AppGateway) {}


  @SubscribeMessage('redirect')
  async redirectGame(@ConnectedSocket() client: Socket,
        @MessageBody() body: { pathname: string,playerId:string, lobbyId: string,exit:boolean,isDealer:boolean }) {
    const {pathname,lobbyId,exit,isDealer,playerId}=body
    const clients=await this.lobbyService.getById(lobbyId)
    if (exit && !isDealer){
        const currClient= this.mainGateway.users.get(playerId)
        this.logger.log( 'curr client ', currClient)
        console.log('curr client ', this.mainGateway.users)
        this.mainGateway.server.to(currClient?.id).emit('player:deleted')
       this.mainGateway.server.to(lobbyId).emit('lobby:get', { data: clients});
     }
     if(exit && isDealer){
       for (const player of clients.players) {
         const currClient = this.mainGateway.users.get(player.id)
         this.mainGateway.server.to(currClient?.id).emit('player:deleted')
       }
     }
     if(!exit && isDealer){
       this.mainGateway.server.to(lobbyId).emit('redirect:get', { pathname,lobbyId});
     }
  }

  @SubscribeMessage('game:start')
  async gameStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { gameData: GameData, lobbyId: string },
  ): Promise<void> {
    let countdown = body.gameData.timer;
    const timer=this.timer
    timer[body.lobbyId] = setInterval(function () {
      if (countdown <= 0) {
        body.gameData.status = GameState.paused;
        body.gameData.timer = countdown
        // не работает очистка интервала
        clearInterval(timer[body.lobbyId]);
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
    this.mainGateway.server.to(lobbyId).emit('game:paused', { gameData })
  }
}
