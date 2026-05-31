export interface Pro {
  name:        string;
  style:       'onehand' | 'twohand';
  description: string;
  known:       string;
  emoji:       string;
}

export const PROS: Pro[] = [
  {
    name: 'Jason Belmonte',
    style: 'twohand',
    description: 'The pioneer of modern two-handed bowling. 14-time major champion with exceptional rev rate.',
    known: 'Two-handed delivery, massive rev rate, axis tilt control',
    emoji: '🇦🇺',
  },
  {
    name: 'Norm Duke',
    style: 'onehand',
    description: 'Hall of Famer known for his smooth, consistent one-handed delivery and elite lane reading.',
    known: 'Smooth release, footwork precision, lane reading mastery',
    emoji: '🎳',
  },
  {
    name: 'Pete Weber',
    style: 'onehand',
    description: 'PD&D — Pretty Dominant and Dangerous. Known for an explosive release and high-rev delivery.',
    known: 'High rev rate, aggressive release, clutch bowling',
    emoji: '🔥',
  },
  {
    name: 'Walter Ray Williams Jr.',
    style: 'onehand',
    description: 'The most decorated bowler in PBA history with 47 titles. Legendary for consistency and spare shooting.',
    known: 'Straight spare game, consistent delivery, longevity',
    emoji: '👑',
  },
  {
    name: 'EJ Tackett',
    style: 'twohand',
    description: 'Young two-handed star known for elite versatility and ability to play multiple angles.',
    known: 'Versatile two-hand style, angle diversity, mental game',
    emoji: '⚡',
  },
  {
    name: 'Liz Johnson',
    style: 'onehand',
    description: 'One of the greatest female bowlers of all time. PWBA Hall of Famer with world-class consistency.',
    known: 'Precision targeting, footwork, consistent ball speed',
    emoji: '🏆',
  },
  {
    name: 'Dom Barrett',
    style: 'onehand',
    description: 'Elite one-handed bowler from the UK known for his textbook swing and high scores.',
    known: 'Classic swing, timing, rhythm',
    emoji: '🇬🇧',
  },
  {
    name: 'Kyle Troup',
    style: 'twohand',
    description: 'High-rev two-handed bowler with one of the highest rev rates on tour.',
    known: 'Extreme rev rate, two-hand power, axis rotation',
    emoji: '💪',
  },
];
