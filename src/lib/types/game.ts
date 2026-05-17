export interface Frame {
  ball1: string;
  ball2: string;
  ball3: string;
  note:  string;
}

export interface GameSession {
  id:         string;
  datePlayed: string;
  totalScore: number;
  ballUsed:   string | null;
  laneNumber: number | null;
  oilPattern: string | null;
  frames:     Frame[];
}
