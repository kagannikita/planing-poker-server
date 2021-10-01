import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { IssueService } from '../issue/issue.service';
import { LobbyService } from '../lobby/lobby.service';
import { SettingsService } from '../settings/settings.service';
import { GameService } from './game.service';
import { GameData, GameState } from './game.interface';
import { SocketStateService } from 'src/shared/socketState';


@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  public server: Server;
  private logger: Logger = new Logger('GameGateway');

  private timer = {}

  private issuesState: Map<string, string> = new Map()

  constructor(private issueService: IssueService,
    private settingsService: SettingsService,
    private gameService: GameService,
    private lobbyService: LobbyService,
    private SocketStateService: SocketStateService) { }

  @SubscribeMessage('redirect')
  async redirectGame(@ConnectedSocket() client: Socket,
    @MessageBody() body: { pathname: string, playerId: string, lobbyId: string, exit: boolean, isDealer: boolean }) {
    const { pathname, lobbyId, exit, isDealer, playerId } = body

    if (exit && !isDealer) {
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

    if (exit && isDealer) {
      this.server.to(lobbyId).emit('player:deleted')
    }

    if (!exit && isDealer) {
      this.server.to(lobbyId).emit('redirect:get', { pathname, lobbyId });
    }
  }

  count(arr: string[]) {
  const obj = arr.reduce((acc, cur) => {
    acc[cur] = (acc[cur] || 0) + 1;
    return acc
  }, {})
  return obj
}
  sumScore(): {} {
    let value = 0
    const arr = Array.from(this.issuesState.values())
    const obj = this.count(arr);

    this.logger.log(obj)


    return obj
  }

  @SubscribeMessage('game:start')
  async gameStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { gameData: GameData, lobbyId: string },
  ): Promise<void> {
    let countdown = body.gameData.timer;

    this.logger.log('game:start data ', body.gameData)


    this.timer[body.lobbyId] = setInterval(() => {
      if (countdown === 0) {
        const data: GameData = {
          currIssueId: body.gameData.currIssueId,
          timer: countdown,
          issueScore: this.sumScore(),
          playersScore: JSON.stringify(Array.from(this.issuesState)),
          status: GameState.roundFinished
        }
        this.server.to(body.lobbyId).emit('game:round-finished', { gameData: data });
        this.issuesState.clear()
        clearInterval(this.timer[body.lobbyId]);
      } else {
        countdown--
        body.gameData.status = GameState.started;
        body.gameData.timer = countdown
        body.gameData.playersScore = JSON.stringify(Array.from(this.issuesState))
        this.logger.log('countdown ', countdown)
        this.server.to(body.lobbyId).emit('game:started', { gameData: body.gameData });
      }
    }, 1000);

  }

  @SubscribeMessage('game:pause')
  async gamePaused(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { gameData: GameData, lobbyId: string },
  ): Promise<void> {
    let { gameData, lobbyId } = body
    gameData.status = GameState.paused
    this.logger.log('timer ', this.timer[lobbyId], gameData)
    clearInterval(this.timer[lobbyId])
    this.server.to(lobbyId).emit('game:paused', { gameData })
  }

  @SubscribeMessage('game:set-score')
  async setScore(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { score: string, playerId: string, lobbyId:string },
  ): Promise<void> {
    const { score, playerId, lobbyId } = body
    this.issuesState.set(playerId, score)

    this.logger.log(`score ${score} to current issue setted `)
    this.server.to(lobbyId).emit('game:score-setted', Array.from(this.issuesState.values()))
  }
}
