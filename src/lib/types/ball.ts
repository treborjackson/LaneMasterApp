export interface Ball {
  name:   string;
  brand:  string;
  weight: string;
  cover:  string;
  lane:   string;
  skill:  'Beginner' | 'Intermediate' | 'Advanced';
  hook:   number;
  speed:  number;
  price:  string;
  color:  string;
  emoji:  string;
}

export interface BallNote {
  id:        string;
  ballName:  string;
  brand:     string;
  rating:    number;
  notes:     string;
  dateAdded: string;
}
