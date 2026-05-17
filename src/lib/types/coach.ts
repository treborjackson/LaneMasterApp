export type BowlingStyle = 'onehand' | 'twohand';
export type SkillLevel   = 'beginner' | 'intermediate' | 'advanced';

export interface CoachMessage {
  role:    'user' | 'assistant';
  content: string;
}

export interface CoachSession {
  style:    BowlingStyle;
  level:    SkillLevel;
  messages: CoachMessage[];
}
