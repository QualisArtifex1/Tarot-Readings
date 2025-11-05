
export interface Card {
  name: string;
  image: string;
}

export interface DrawnCard extends Card {
  isReversed: boolean;
}

export enum GameState {
  Start,
  Shuffled,
  Cut,
  Drawing,
  Revealing,
  Reading,
  Done,
}
