
export interface Card {
  name: string;
  image: string;
  type: 'major' | 'minor';
}

export interface DrawnCard extends Card {
  isReversed: boolean;
}

export enum GameState {
  Start,
  Shuffling,
  ReadyToCut,
  Cutting,
  ReadyToDraw,
  Drawing,
  Revealing,
  Reading,
  Done,
}