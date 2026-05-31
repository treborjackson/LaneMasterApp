import type { OilPattern } from '@/lib/types/oil';

export const OIL_PATTERNS: OilPattern[] = [
  {
    name: 'House Shot',
    length: 40,
    difficulty: 'Easy',
    description: 'The standard house shot used in most recreational bowling centers. Oil is concentrated in the middle with dry boards on the outside, creating a natural funnel toward the pocket.',
    tip: 'Play the 10–15 board and let the pattern funnel your ball to the pocket.',
    ratio: '8:1',
  },
  {
    name: 'Sport Shot',
    length: 42,
    difficulty: 'Sport',
    description: 'A flatter oil pattern with less outside oil than a house shot. Requires more accuracy and precision — mistakes are not forgiven.',
    tip: 'Stay straighter and avoid over-hooking. Target the 12–17 board.',
    ratio: '3:1',
  },
  {
    name: 'Cheetah',
    length: 35,
    difficulty: 'Hard',
    description: 'A short WTBA sport pattern (35 ft). The short length demands a controlled release and early hook.',
    tip: 'Play straighter and inside. Reduce rev rate and use a weaker ball.',
    ratio: '2.7:1',
  },
  {
    name: 'Chameleon',
    length: 41,
    difficulty: 'Hard',
    description: 'A medium-length WTBA sport pattern that transitions quickly. Ball choice and timing are critical.',
    tip: 'Start on the 15 board and move left as the pattern transitions.',
    ratio: '2.9:1',
  },
  {
    name: 'Scorpion',
    length: 45,
    difficulty: 'Hard',
    description: 'A longer WTBA sport pattern (45 ft). Favors higher rev players who can carry the ball deep.',
    tip: 'Use a high-hooking ball and play deep inside angles. Target the 20+ boards.',
    ratio: '2.7:1',
  },
  {
    name: 'Shark',
    length: 48,
    difficulty: 'Sport',
    description: 'The longest WTBA sport pattern (48 ft). Extremely demanding with little outside forgiveness.',
    tip: 'Play very deep inside. This pattern is designed to expose ball speed and axis tilt weaknesses.',
    ratio: '2.5:1',
  },
  {
    name: 'Viper',
    length: 37,
    difficulty: 'Hard',
    description: 'A short-medium WTBA sport pattern. The dry outside creates a steep hook angle if you miss outside.',
    tip: 'Keep your ball speed up and play a straighter line at 10–12 boards.',
    ratio: '2.6:1',
  },
  {
    name: 'Christmas Tree',
    length: 40,
    difficulty: 'Medium',
    description: 'A medium-length recreational pattern with moderate oil ratio. Slightly more challenging than the house shot.',
    tip: 'Play 12–14 boards and look for the ball to make a smooth arc to the pocket.',
    ratio: '5:1',
  },
  {
    name: 'PBA Experience',
    length: 44,
    difficulty: 'Hard',
    description: 'Simulates conditions used on the PBA Tour. Demands consistent targeting and carry-down management.',
    tip: 'Track your carry-down carefully. Move left as the backends dry up.',
    ratio: '3.2:1',
  },
  {
    name: 'Badger',
    length: 52,
    difficulty: 'Sport',
    description: 'One of the longest patterns used in competition. Requires a very clean backend to generate hook.',
    tip: 'Use a high-surface, high-hook ball. Play inside 25 boards and let the ball breathe at the breakpoint.',
    ratio: '2.4:1',
  },
];

export interface OilPatternDetail {
  name:          string;
  ballRecommendations: string[];
  lineToPlay:    string;
  adjustments:   string[];
  commonMistakes: string[];
  proTips:       string[];
  bestFor:       string;
}

export const OIL_PATTERN_DETAILS: Record<string, OilPatternDetail> = {
  'House Shot': {
    name: 'House Shot',
    ballRecommendations: ['Pearl reactive (moderate hook)', 'Hybrid reactive', 'Any skill-level ball works well'],
    lineToPlay: 'Stand on boards 20–25, target the 10–15 board at the arrows, breakpoint around board 8–10',
    adjustments: [
      'Missing left → move your feet 2 boards left, keep target the same',
      'Missing right → move your feet 2 boards right, keep target the same',
      'Ball not hooking enough → move 2–3 boards right with feet and target',
      'Ball over-hooking → move 2–3 boards left or switch to a weaker ball',
    ],
    commonMistakes: [
      'Playing too far outside — the house shot does not reward the gutter line',
      'Forcing hook on the dry boards — let the ball react naturally',
      'Ignoring carry-down after 4–5 games — the oil migrates and pattern changes',
    ],
    proTips: [
      'The house shot has a built-in "track" — find it early and ride it all game',
      'Second game is usually your highest — the pattern softens and creates more hook',
      'Watch where better bowlers are playing and use that as a starting reference',
      'If striking consistently, do NOT change anything — trust the line',
    ],
    bestFor: 'All skill levels — ideal for beginners to learn proper ball motion',
  },
  'Sport Shot': {
    name: 'Sport Shot',
    ballRecommendations: ['Solid reactive with medium hook', 'Symmetrical core for predictability', 'Avoid high-hook pearl balls'],
    lineToPlay: 'Stand on boards 15–20, target arrows 12–17, keep the ball straighter through the heads',
    adjustments: [
      'Over-hooking → move left (feet and target) 2 boards at a time',
      'Under-hooking → move right 1–2 boards — resist the urge to go too far outside',
      'Inconsistent carry → check ball surface; add a little surface to create earlier roll',
      'Ball burning up early → increase ball speed or play a deeper angle',
    ],
    commonMistakes: [
      'Playing the same line as a house shot — the lack of outside oil will send you wide',
      'Using a ball with too much hook — control beats power on sport shots',
      'Getting frustrated early — sport shots require patience to find the correct line',
    ],
    proTips: [
      'Accuracy off the hand matters more than ball selection here',
      'Play the pattern straight — a 5-degree entry angle beats 8-degree every time',
      'Watch the oil line carefully; 5–10 boards of error equals a washout or split',
      'Slow down your armswing slightly to promote a smoother, more consistent release',
    ],
    bestFor: 'Intermediate to advanced bowlers looking to sharpen accuracy',
  },
  'Cheetah': {
    name: 'Cheetah',
    ballRecommendations: ['Plastic/spare ball for very straight lines', 'Low-hook pearl reactive', 'Light surface (2000 grit or higher)'],
    lineToPlay: 'Play very straight — stand boards 10–15, target the 8–12 board range, minimal hook',
    adjustments: [
      'Ball hooking too early → move deeper inside and increase ball speed',
      'Missing right consistently → flatten your release angle, stand more left',
      'Leaving 10 pins → wrist position too cupped — flatten it out',
      'Splits appearing → the pattern is drying up — move left immediately',
    ],
    commonMistakes: [
      'Using a high-hook ball — the short pattern will over-react and send the ball left',
      'Playing too far outside — the dry boards will kill your carry',
      'Not adjusting early enough when the pattern breaks down',
    ],
    proTips: [
      'Cheetah rewards bowlers who can throw it straight — leave your big hooker in the bag',
      'Speed is your friend here; a firmer ball speed prevents early hook',
      'The breakpoint should be the 6–8 board maximum — anything more and you are out of the oil',
      'Watch for the pattern to change quickly after 3–4 games — Cheetah dries out fast',
    ],
    bestFor: 'Straight ballists and spare-shooting practice',
  },
  'Chameleon': {
    name: 'Chameleon',
    ballRecommendations: ['Hybrid reactive (versatile)', 'Symmetrical core', 'Medium surface (1000–2000 grit)'],
    lineToPlay: 'Stand boards 18–22, target 14–16 at the arrows, watch breakpoint at boards 8–10',
    adjustments: [
      'Pattern transitioning quickly → move left in small 1-board increments',
      'Ball burning up mid-lane → try a shiny or pearl surface to push the hook later',
      'Over/under reaction → switch to a symmetrical core for more predictability',
      'Leaving corner pins → entry angle too steep — flatten out 2–3 boards',
    ],
    commonMistakes: [
      'Not making adjustments as the pattern transitions — Chameleon lives up to its name',
      'Staying in one spot too long after the first signs of change',
      'Using a highly asymmetrical ball that amplifies the over/under reaction',
    ],
    proTips: [
      'Name of the game: adaptability — check your line every 3 frames',
      'Carry-down becomes your second oil pattern by game 2; account for it',
      'The bowler who adjusts fastest wins on Chameleon',
      'Keep a mental note of where your ball exits the oil — that spot shifts left every game',
    ],
    bestFor: 'Intermediate to advanced bowlers who want to practice reading transitions',
  },
  'Scorpion': {
    name: 'Scorpion',
    ballRecommendations: ['Strong solid reactive', 'Asymmetrical core for max hook', 'Dull surface (500–1000 grit)'],
    lineToPlay: 'Stand boards 25–30, target the 20–22 board range, let ball hook back from board 12–15',
    adjustments: [
      'Ball not making it back → move right 2 boards and open your angle',
      'Ball over-hooking → increase speed or move left 3 boards',
      'Leaving the 4-pin or 6-pin → entry angle off — adjust 1 board at a time',
      'Over-under reaction late → add surface to your ball for more consistent mid-lane read',
    ],
    commonMistakes: [
      'Playing too straight — Scorpion rewards a higher rev rate and deep inside angle',
      'Under-surfacing the ball — you need a ball that controls the mid-lane hook',
      'Giving up too many boards too fast — make small, confident adjustments',
    ],
    proTips: [
      'Rev rate wins on Scorpion — two-handed bowlers and high-rev players thrive here',
      'Play the "direct" line from your feet to the pocket — do not try to cut the lane',
      'Your ball should hit the dry backend and make a clean, defined arc',
      'If the Scorpion dries up after game 2, move both feet and target left 3–4 boards',
    ],
    bestFor: 'High-rev, powerful players — two-handed bowlers especially',
  },
  'Shark': {
    name: 'Shark',
    ballRecommendations: ['Maximum hook solid reactive', 'Very dull surface (180–500 grit)', 'Asymmetrical strong core'],
    lineToPlay: 'Play very deep inside — stand 30+ boards, target 22–25, let ball hook from the dry backends',
    adjustments: [
      'Not enough backend → add surface to the ball (go duller)',
      'Too much backend snap → polish the ball slightly or slow down the rev rate',
      'Ball dying in the oil → you are playing too straight — open up your angle',
      'Carry issues → move your feet left 1–2 boards while keeping target the same',
    ],
    commonMistakes: [
      'Playing the gutter line like a house shot — the outside is a dead zone on Shark',
      'Insufficient ball surface prep — Shark demands a dull, high-friction cover',
      'Rushing adjustments — make one change at a time and commit to 3 frames',
    ],
    proTips: [
      'The longer pattern gives you time to make the ball read before the breakpoint',
      'Your axis tilt will dramatically affect reaction — less tilt = earlier, smoother read',
      'Walk the breakpoint: find board 10 at the pins and work backwards to your target',
      'Shark is the ultimate test of ball speed control — vary speed to tune the reaction',
    ],
    bestFor: 'Advanced and elite bowlers — the hardest WTBA pattern',
  },
  'Viper': {
    name: 'Viper',
    ballRecommendations: ['Light to medium hook pearl or hybrid', 'Higher grit surface (2000+)', 'Symmetrical core'],
    lineToPlay: 'Stand boards 12–17, target the 10–13 board, keep the ball moving through the fronts',
    adjustments: [
      'Hooking too early → increase speed and flatten wrist angle',
      'Not enough hook at pins → move right 1–2 boards to find more backend friction',
      'Splitting → over-hooking on dry backends — add speed or move left',
      'Inconsistent carry → target the same board every shot before anything else',
    ],
    commonMistakes: [
      'Playing outside thinking the dry edge will create hook — Viper punishes that line',
      'Under-throwing ball speed — ball speed is critical on short patterns',
      'Using a high-hook ball and fighting the over/under all day',
    ],
    proTips: [
      'Viper is shorter than it looks — your ball is in the backends earlier than expected',
      'Make sure your timing is on point — late timing equals early hook on Viper',
      'If you find yourself fighting left, the answer is usually more speed — not less hook',
      'The 1–3 pocket entry from a direct angle is more consistent than an arcing shot here',
    ],
    bestFor: 'Straighter players and those practicing speed control',
  },
  'Christmas Tree': {
    name: 'Christmas Tree',
    ballRecommendations: ['Pearl or hybrid reactive', 'Moderate hook potential', 'Any symmetrical core'],
    lineToPlay: 'Stand boards 18–22, target 12–14, smooth arc into the pocket',
    adjustments: [
      'Missing right → move feet right 1 board without changing target',
      'Missing left → move feet and target left 1 board each',
      'Early roll → try a higher-grit surface or increase ball speed',
      'Late snap → reduce speed slightly or drop surface grit',
    ],
    commonMistakes: [
      'Assuming it plays exactly like a house shot — the ratio is a bit tighter',
      'Playing too far outside — the outside oil is thinner than a standard house pattern',
    ],
    proTips: [
      'Great pattern to practice fine-tuning your line — gives honest feedback',
      'Treat it as a bridge between house shot and sport shot in terms of difficulty',
      'Find your break point first and work backwards to your target and feet position',
    ],
    bestFor: 'Recreational to intermediate bowlers building competition skills',
  },
  'PBA Experience': {
    name: 'PBA Experience',
    ballRecommendations: ['Strong solid reactive', 'Medium-dull surface (500–1000 grit)', 'Asymmetrical core preferred'],
    lineToPlay: 'Stand boards 22–27, target 16–20, watch for strong backend reaction in the dry',
    adjustments: [
      'Ball not recovering → play deeper and open up the angle 2–3 boards',
      'Carry-down building → move left 2 boards every 2–3 games',
      'Over/under reaction → normalize ball surface before adjusting feet',
      'Leaving stone 8s → entry angle too flat — open 1–2 boards',
    ],
    commonMistakes: [
      'Ignoring carry-down — by frame 20 the backends are completely different',
      'Making large adjustments — PBA patterns reward small, precise moves',
      'Not warming up with a practice game to read the pattern first',
    ],
    proTips: [
      'Watch the oil track on your ball after every shot — it tells you where you are in the oil',
      'Move before you need to — being proactive beats reactive on this pattern',
      'Your target at the arrows is less important than your breakpoint — find the right board at pins',
      'If averaging under 180, start straighter and work your way deeper as you get comfortable',
    ],
    bestFor: 'Advanced bowlers preparing for competitive or PBA-style events',
  },
  'Badger': {
    name: 'Badger',
    ballRecommendations: ['Maximum-hook strong asymmetrical solid', 'Very dull surface (180–500 grit)', 'Heavy ball weight recommended (15–16 lbs)'],
    lineToPlay: 'Stand 30–35 boards, target 23–27, let the ball skate through the oil and hook aggressively in the dry',
    adjustments: [
      'Ball dying in the oil → go duller on cover stock surface',
      'Too much snap at breakpoint → slow down rev rate or increase speed 0.5 mph',
      'Ball not reaching the pocket → move right 2 boards and open angle',
      'Over-deflection at pins → move left for a cleaner, more direct entry',
    ],
    commonMistakes: [
      'Using a ball that hooks too early — on 52 ft of oil the ball must stay clean',
      'Playing too far right — the outside is completely unplayable on Badger',
      'Lack of patience — Badger takes 5+ frames to truly read',
    ],
    proTips: [
      'At 52 ft, the oil lasts almost all the way to the pins — you need extreme backend friction',
      'Two-handed bowlers with high axis tilt dominate Badger due to their natural backend snap',
      'Surface preparation is everything — bowl 3 shots with a fresh pad before the match',
      'Think about your exit board at the breakpoint before worrying about feet and target',
      'This pattern will expose weak release fundamentals immediately — clean it up first',
    ],
    bestFor: 'Elite and tour-level bowlers only',
  },
};
