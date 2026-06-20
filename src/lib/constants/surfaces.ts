export interface SurfaceProfile {
  id:               string;
  name:             string;
  grit:             string;
  oilCondition:     string;
  description:      string;
  motion:           string;
  bestOilPatterns:  string[];
  tip:              string;
  color:            string;
  emoji:            string;
}

export const SURFACE_PROFILES: SurfaceProfile[] = [
  {
    id:           'polished-pearl',
    name:         'Polished / Pearl',
    grit:         'Polished · 2000–4000+ grit or box shine',
    oilCondition: 'Light Oil · Dry · Burned Lanes',
    description:  'A glassy, low-friction shell that skids easily through the front part of the lane and saves energy for a sharper move at the breakpoint.',
    motion:       'Longer skid, later & sharper backend reaction',
    bestOilPatterns: ['House Shot', 'Viper', 'Christmas Tree'],
    tip:          'Reach for this on shorter or drying-out patterns — it resists hooking too early on the burn.',
    color:        '#c084fc',
    emoji:        '✨',
  },
  {
    id:           'hybrid-medium',
    name:         'Hybrid Reactive',
    grit:         '1000–2000 grit',
    oilCondition: 'Medium Oil · House Conditions',
    description:  'Splits the difference between solid and pearl finishes — enough traction to read the midlane, enough length to still reach the pocket.',
    motion:       'Balanced, predictable arc through the whole pattern',
    bestOilPatterns: ['Chameleon', 'Sport Shot'],
    tip:          'The safest first surface to try on an unfamiliar pattern — it tells you whether you need to go duller or shinier next game.',
    color:        '#9333ea',
    emoji:        '🌗',
  },
  {
    id:           'solid-dull',
    name:         'Solid Reactive (Dull)',
    grit:         '500–1000 grit sanded',
    oilCondition: 'Medium-Heavy Oil',
    description:  'A sanded, matte finish that bites into the oil earlier for more midlane traction when the pattern is carrying extra volume.',
    motion:       'Earlier roll, rounder shape, strong midlane read',
    bestOilPatterns: ['Scorpion', 'PBA Experience'],
    tip:          'Pair with a stronger asymmetrical core if the pattern is also long — the surface alone won’t cut through heavy volume.',
    color:        '#7c3aed',
    emoji:        '🟪',
  },
  {
    id:           'very-dull',
    name:         'Very Dull Sanded',
    grit:         '180–500 grit',
    oilCondition: 'Heaviest Oil · Sport Patterns',
    description:  'The roughest box finish available — maximum friction to generate hook on patterns that are too heavy or flat for anything else to create angle.',
    motion:       'Earliest, strongest overall hook',
    bestOilPatterns: ['Shark', 'Badger'],
    tip:          'Overkill on drier lanes — save this surface for the heaviest volume patterns or you’ll burn up your angle too early.',
    color:        '#581c87',
    emoji:        '⬛',
  },
  {
    id:           'urethane-plastic',
    name:         'Urethane / Plastic',
    grit:         'Smooth, low-friction cover (non-reactive)',
    oilCondition: 'Fresh Heavy Oil · Fried/Burned Patterns · Spares',
    description:  'Minimal hook potential makes this cover the most predictable on either extreme — fresh, flooded oil where reactive balls skid uncontrollably, or a fried pattern with zero traction left.',
    motion:       'Smooth, mild, highly predictable arc',
    bestOilPatterns: ['Cheetah'],
    tip:          'On a short, burning pattern like Cheetah, this often out-scores a reactive ball that’s hooking too early and too unpredictably.',
    color:        '#bdc3c7',
    emoji:        '⚪',
  },
];
