export interface User {
  id:    string;
  email: string;
  name?: string;
}

export interface UserPreferences {
  id:            string;
  userId:        string;
  bowlingStyle:  string;
  skillLevel:    string;
  favoriteBrands: string[];
  selectedBall:  string | null;
}
