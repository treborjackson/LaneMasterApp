export interface SoloFormResult {
  score:         number;
  stance:        string;
  backswing:     string;
  release:       string;
  followThrough: string;
  footwork:      string;
  tips:          string[];
}

export interface CategoryComparison {
  name:      string;
  userScore: number;
  proScore:  number;
  userNote:  string;
  proNote:   string;
  gap:       string;
}

export interface CompareFormResult {
  userScore:      number;
  proName:        string;
  proStyle:       string;
  categories:     CategoryComparison[];
  topDifferences: string[];
  drillsToClose:  string[];
}

export type FormAnalysisResult = SoloFormResult | CompareFormResult;
