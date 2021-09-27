export enum GameState {
  init = 'init',
  paused = 'paused',
  started = 'started'
}

export interface GameData {
  status: GameState,
  currIssueId: string,
  issueScore: number,
  timer: number
}
