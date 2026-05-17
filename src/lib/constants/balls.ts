import type { Ball } from '@/lib/types/ball';

export const BALLS: Ball[] = [
  {
    name: 'Hyroad Nano', brand: 'Storm', weight: '14-16 lbs', cover: 'Hybrid Reactive',
    lane: 'Medium-Heavy', skill: 'Advanced', hook: 9, speed: 7,
    price: '$199', color: '#1a1a2e', emoji: '🔵',
  },
  {
    name: 'Phaze II', brand: 'Storm', weight: '14-16 lbs', cover: 'Solid Reactive',
    lane: 'Heavy', skill: 'Advanced', hook: 10, speed: 6,
    price: '$219', color: '#c0392b', emoji: '🔴',
  },
  {
    name: 'Iq Tour', brand: 'Storm', weight: '14-16 lbs', cover: 'Pearl Reactive',
    lane: 'Medium', skill: 'Intermediate', hook: 7, speed: 8,
    price: '$169', color: '#f39c12', emoji: '🟡',
  },
  {
    name: 'Idol', brand: 'Roto Grip', weight: '14-16 lbs', cover: 'Solid Reactive',
    lane: 'Medium-Heavy', skill: 'Intermediate', hook: 8, speed: 7,
    price: '$179', color: '#8e44ad', emoji: '🟣',
  },
  {
    name: 'Hustle Ink', brand: 'Roto Grip', weight: '12-16 lbs', cover: 'Pearl Reactive',
    lane: 'Light-Medium', skill: 'Beginner', hook: 5, speed: 8,
    price: '$129', color: '#2c3e50', emoji: '⚫',
  },
  {
    name: 'Axiom', brand: 'Motiv', weight: '14-16 lbs', cover: 'Solid Reactive',
    lane: 'Heavy', skill: 'Advanced', hook: 9, speed: 6,
    price: '$209', color: '#e74c3c', emoji: '🔴',
  },
  {
    name: 'Venom Shock', brand: 'Motiv', weight: '14-16 lbs', cover: 'Pearl Reactive',
    lane: 'Medium', skill: 'Intermediate', hook: 7, speed: 8,
    price: '$159', color: '#27ae60', emoji: '🟢',
  },
  {
    name: 'Integrity', brand: 'Ebonite', weight: '12-16 lbs', cover: 'Solid Reactive',
    lane: 'Medium', skill: 'Beginner', hook: 5, speed: 7,
    price: '$119', color: '#7f8c8d', emoji: '⚪',
  },
  {
    name: 'Proton PhysiX', brand: 'Brunswick', weight: '14-16 lbs', cover: 'Solid Reactive',
    lane: 'Heavy', skill: 'Advanced', hook: 10, speed: 6,
    price: '$229', color: '#e67e22', emoji: '🟠',
  },
  {
    name: 'Rhino', brand: 'Brunswick', weight: '10-16 lbs', cover: 'Pearl Reactive',
    lane: 'Light-Medium', skill: 'Beginner', hook: 4, speed: 9,
    price: '$89', color: '#3498db', emoji: '🔵',
  },
  {
    name: 'Jackal Ghost', brand: 'Motiv', weight: '14-16 lbs', cover: 'Hybrid Reactive',
    lane: 'Medium-Heavy', skill: 'Advanced', hook: 9, speed: 7,
    price: '$219', color: '#ecf0f1', emoji: '👻',
  },
  {
    name: 'Alpha Crux', brand: 'Roto Grip', weight: '14-16 lbs', cover: 'Solid Reactive',
    lane: 'Heavy', skill: 'Advanced', hook: 10, speed: 5,
    price: '$239', color: '#1abc9c', emoji: '🟢',
  },
  {
    name: 'Timeless', brand: 'Storm', weight: '14-16 lbs', cover: 'Hybrid Reactive',
    lane: 'Medium-Heavy', skill: 'Advanced', hook: 9, speed: 7,
    price: '$249', color: '#2980b9', emoji: '🔵',
  },
  {
    name: 'Spare Ball', brand: 'Columbia 300', weight: '10-16 lbs', cover: 'Plastic',
    lane: 'Any (spares)', skill: 'Beginner', hook: 1, speed: 10,
    price: '$49', color: '#bdc3c7', emoji: '⚪',
  },
  {
    name: 'Absolute', brand: 'Hammer', weight: '14-16 lbs', cover: 'Solid Reactive',
    lane: 'Medium', skill: 'Intermediate', hook: 7, speed: 8,
    price: '$149', color: '#e74c3c', emoji: '🔴',
  },
];

export const BRANDS = [...new Set(BALLS.map((b) => b.brand))].sort();
