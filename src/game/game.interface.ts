export enum GameState {
  init = 'init',
  paused = 'paused',
  started = 'started',
  roundFinished = 'round-finished',
  roundRepeat = 'round-repeat'
}

export interface GameData {
  status: GameState,
  playersScore: string,
  currIssueId: string,
  issueScore: Map<string, number>,
  timer: number
}
