export const userData = {
  name: 'Monkey D. Coder',
  level: 15,
  currentExp: 45000000,
  maxExp: 100000000,
  title: 'Supernova',
};

export const courses = [
  {
    id: 'c1',
    title: 'Haki 101: Observation',
    description: 'Master the basics of sensing your code\'s bugs before they happen.',
    status: 'completed',
    reward: 'm1',
  },
  {
    id: 'c2',
    title: 'Navigation of the Grand Line',
    description: 'Learn complex routing and state management to brave the New World.',
    status: 'in-progress',
    progress: 65,
    reward: 'm2',
  },
  {
    id: 'c3',
    title: 'Devil Fruit Awakening',
    description: 'Push your framework skills beyond their natural limits.',
    status: 'locked',
    reward: 'm3',
  },
  {
    id: 'c4',
    title: 'Conqueror\'s Haki: Architecture',
    description: 'Impose your will upon the codebase and lead the crew.',
    status: 'locked',
    reward: 'm4',
  }
];

export const merchandise = [
  {
    id: 'm1',
    name: 'Straw Hat',
    type: 'Headgear',
    unlocked: true,
    imagePlaceholder: 'https://images.unsplash.com/photo-1579294212558-f99a385f67be?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    description: 'A symbol of promise. Unlocked after mastering the basics.'
  },
  {
    id: 'm2',
    name: 'Log Pose',
    type: 'Accessory',
    unlocked: false,
    imagePlaceholder: 'https://images.unsplash.com/photo-1509650080645-563b785d1e43?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    description: 'Never lose your way. Reward for Navigation.'
  },
  {
    id: 'm3',
    name: 'Gomu Gomu no Mi',
    type: 'Devil Fruit',
    unlocked: false,
    imagePlaceholder: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    description: 'Gives you rubber properties. Reward for Awakening.'
  },
  {
    id: 'm4',
    name: 'Wado Ichimonji',
    type: 'Weapon',
    unlocked: false,
    imagePlaceholder: 'https://images.unsplash.com/photo-1599307779774-706f9a0d8e87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    description: 'A legendary blade. Reward for Conqueror\'s Architecture.'
  }
];
