export interface OilPattern {
  name:        string;
  length:      number;
  difficulty:  'Easy' | 'Medium' | 'Hard' | 'Sport';
  description: string;
  tip:         string;
  ratio:       string;
}

export interface OilPatternDetail {
  name:                string;
  ballRecommendations: string[];
  lineToPlay:          string;
  adjustments:         string[];
  commonMistakes:      string[];
  proTips:             string[];
  bestFor:             string;
}
