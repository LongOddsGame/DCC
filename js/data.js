// All game content for the Floor 1 prototype: jobs, races, classes, items, mobs and lines.

export const BASE_STATS = { maxHp: 40, maxMp: 12, atk: 6, def: 3, mag: 5, spd: 5, luck: 5 };

export const JOBS = [
  { id: 'nurse', name: 'Nurse', perk: 'Healing potions heal 20% more.' },
  { id: 'mechanic', name: 'Mechanic', perk: 'Crafting needs one less piece of junk.' },
  { id: 'cook', name: 'Line cook', perk: 'Food heals twice as much.' },
  { id: 'driver', name: 'Delivery driver', perk: 'Move faster and get 2 extra minutes per floor.' },
  { id: 'bartender', name: 'Bartender', perk: 'People start out trusting you more.' },
  { id: 'unemployed', name: 'Unemployed', perk: 'One extra loot box on every floor. BOOKIE pities you.' },
];

// skin / hair overrides are used to recolor the hero sprite.
export const RACES = [
  { id: 'human', name: 'Human', desc: 'Balanced. The Patrons love an underdog, so you gain hype faster.', mods: {}, odds: 8, skin: '#f2b48a', shade: '#c47a5a' },
  { id: 'fairy', name: 'Fairy', desc: 'Fragile but magical. 15% chance to flutter out of the way of a hit.', mods: { maxHp: -8, mag: 4, spd: 2 }, odds: 30, skin: '#ffd6e8', shade: '#ff5fa2', hair: '#4fd8e8' },
  { id: 'orc', name: 'Orc', desc: 'Hits hard. Deals 50% more damage when below a third of your health.', mods: { maxHp: 8, atk: 3 }, odds: 6, skin: '#6bbf59', shade: '#2f7a3c', hair: '#1a1426' },
  { id: 'ogre', name: 'Ogre', desc: 'Huge and slow. Food and junk you eat heal twice as much.', mods: { maxHp: 16, atk: 2, spd: -2 }, odds: 10, skin: '#b8a07a', shade: '#7a6a4a', hair: '#5b3a29' },
  { id: 'elf', name: 'Elf', desc: 'Quick and sharp-eyed. Every chest holds one extra item.', mods: { spd: 2, luck: 3 }, odds: 12, skin: '#f7e0c4', shade: '#c9a27e', hair: '#f5c542' },
  { id: 'dwarf', name: 'Dwarf', desc: 'Tough as stone. Immune to poison.', mods: { def: 3, maxHp: 4 }, odds: 9, skin: '#e8a87c', shade: '#b8693a', hair: '#c8334a' },
  { id: 'troll', name: 'Troll', desc: 'Slowly regrows. Heal 1 health every 4 steps.', mods: { maxHp: 10 }, odds: 14, skin: '#6a9a8a', shade: '#3a6a5a', hair: '#2f7a3c' },
  { id: 'gnome', name: 'Gnome', desc: 'Tiny and clever. Bombs deal 50% more damage.', mods: { maxHp: -6, mag: 2, luck: 2 }, odds: 25, skin: '#f2b48a', shade: '#c47a5a', hair: '#fff6e0' },
  { id: 'goblin', name: 'Goblin', desc: 'Sneaky. 25% chance to steal tokens when you hit. People trust you less.', mods: { luck: 4, spd: 1 }, odds: 20, skin: '#b8e05a', shade: '#6bbf59', hair: '#1a1426' },
  { id: 'werewolf', name: 'Werewolf', desc: 'Wild. 20% chance your attack hits twice.', mods: { atk: 4, def: -1 }, odds: 15, skin: '#a08070', shade: '#5b3a29', hair: '#5a5373' },
  { id: 'ghoul', name: 'Ghoul', desc: 'Heal 4 health for every mob you defeat. People find you creepy.', mods: { maxHp: 4 }, odds: 22, skin: '#c9c3da', shade: '#8b84a3', hair: '#1a1426' },
  { id: 'pixie', name: 'Pixie-kin', desc: 'Trickster. 15% chance a mob attack hits another mob instead.', mods: { mag: 3, maxHp: -6 }, odds: 35, skin: '#e0c4f0', shade: '#c49af0', hair: '#8a4fc9' },
];

export const CLASSES = [
  { id: 'brawler', name: 'Brawler', desc: 'Heavy hits and high health.', mods: { maxHp: 10, atk: 2 }, odds: 0, coat: '#c8334a', coatLight: '#ff8a8a',
    skill: { name: 'Haymaker', mp: 3, desc: 'A punch for double damage.', target: 'one' } },
  { id: 'hex', name: 'Hex-slinger', desc: 'Spells and curses.', mods: { maxMp: 10, mag: 3 }, odds: 2, coat: '#8a4fc9', coatLight: '#c49af0',
    skill: { name: 'Hex Bolt', mp: 4, desc: 'Magic damage that ignores armor.', target: 'one' } },
  { id: 'scrapper', name: 'Scrapper', desc: 'Builds bombs from junk. Starts with 3 bombs.', mods: { luck: 2 }, odds: 2, coat: '#b8693a', coatLight: '#f5c542',
    skill: { name: 'Shrapnel', mp: 4, desc: 'Hit every mob at once.', target: 'all' } },
  { id: 'talker', name: 'Smooth Talker', desc: 'Talks mobs down and gets better deals.', mods: { luck: 2, def: 1 }, odds: 4, coat: '#3a6ea5', coatLight: '#6aa0d8',
    skill: { name: 'Talk Down', mp: 3, desc: 'Convince one mob to walk away.', target: 'one' } },
  { id: 'showboat', name: 'Showboat', desc: 'Wins over the audience for bigger gifts.', mods: { spd: 1 }, odds: 3, coat: '#f5c542', coatLight: '#fff6e0',
    skill: { name: 'Showstopper', mp: 3, desc: 'A flashy hit worth 2 hype.', target: 'one' } },
];

export const RARITY = {
  common: { name: 'Common', color: '#c9c3da' },
  rusty: { name: 'Rusty', color: '#d08a5a' },
  silver: { name: 'Silver', color: '#e8e4f4' },
  gold: { name: 'Gold', color: '#f5c542' },
  patron: { name: "Patron's Pick", color: '#c49af0' },
};
export const RARITY_ORDER = ['patron', 'gold', 'silver', 'rusty', 'common'];

// type: potion | food | bomb | weapon | armor | junk | box
export const ITEMS = {
  potion_heal: { name: 'Health Potion', type: 'potion', rarity: 'common', heal: 25, price: 8, desc: 'Heals 25.' },
  potion_big: { name: 'Big Health Potion', type: 'potion', rarity: 'silver', heal: 60, desc: 'Heals 60.' },
  potion_mana: { name: 'Mana Potion', type: 'potion', rarity: 'common', mana: 12, price: 10, desc: 'Restores 12 MP.' },
  potion_mystery: { name: 'Mystery Potion', type: 'potion', rarity: 'rusty', mystery: true, desc: 'Who knows? Not BOOKIE.' },
  food_pretzel: { name: 'Stale Pretzel', type: 'food', rarity: 'common', heal: 8, desc: 'Heals 8. Crunchy in a bad way.' },
  food_hotdog: { name: 'Station Hot Dog', type: 'food', rarity: 'rusty', heal: 16, desc: 'Heals 16. Do not ask what is in it.' },
  bomb: { name: 'Junk Bomb', type: 'bomb', rarity: 'common', dmg: 12, desc: 'Hits every mob for 12.' },
  bomb_big: { name: 'Pipe Bomb Deluxe', type: 'bomb', rarity: 'gold', dmg: 26, desc: 'Hits every mob for 26.' },
  w_pipe: { name: 'Rusty Pipe', type: 'weapon', rarity: 'rusty', atk: 2, desc: '+2 attack.' },
  w_bar: { name: 'Turnstile Bar', type: 'weapon', rarity: 'silver', atk: 4, desc: '+4 attack.' },
  w_mic: { name: 'Golden Mic Stand', type: 'weapon', rarity: 'gold', atk: 6, hype: true, desc: '+6 attack. Kills with it earn hype.' },
  w_bat: { name: "Patron's Gilded Bat", type: 'weapon', rarity: 'patron', atk: 9, def: -2, desc: '+9 attack, -2 defense. Heavy and gaudy.' },
  a_vest: { name: 'Hi-vis Vest', type: 'armor', rarity: 'rusty', def: 1, desc: '+1 defense. Very visible.' },
  a_jacket: { name: 'Riot Jacket', type: 'armor', rarity: 'silver', def: 3, desc: '+3 defense.' },
  a_suit: { name: 'Gold Lame Suit', type: 'armor', rarity: 'gold', def: 4, hype: true, desc: '+4 defense. The audience loves it.' },
  a_coat: { name: "Patron's Fur Coat", type: 'armor', rarity: 'patron', def: 6, desc: '+6 defense. Smells like money.' },
  j_token: { name: 'Bent Subway Token', type: 'junk', rarity: 'common', value: 2, desc: 'Junk. Craft or sell it.' },
  j_wire: { name: 'Loose Wires', type: 'junk', rarity: 'common', value: 2, desc: 'Junk. Craft or sell it.' },
  j_jelly: { name: 'Slime Jelly', type: 'junk', rarity: 'common', value: 3, edible: 6, desc: 'Junk. Technically edible.' },
  j_tail: { name: 'Rat Tail', type: 'junk', rarity: 'common', value: 2, edible: 4, desc: 'Junk. Technically edible.' },
  j_feather: { name: 'Pigeon Feather', type: 'junk', rarity: 'common', value: 1, desc: 'Junk. Craft or sell it.' },
  box_rusty: { name: 'Rusty Box', type: 'box', rarity: 'rusty', desc: 'A loot box. Open it!' },
  box_silver: { name: 'Silver Box', type: 'box', rarity: 'silver', desc: 'A better loot box.' },
  box_gold: { name: 'Gold Box', type: 'box', rarity: 'gold', desc: 'A great loot box.' },
  box_patron: { name: "Patron's Pick", type: 'box', rarity: 'patron', desc: 'A gift from a Patron. Probably fine.' },
};

// What each loot box tier can hold. [itemId, weight, minCount, maxCount]
export const LOOT = {
  box_rusty: [['potion_heal', 5, 1, 2], ['food_pretzel', 4, 1, 3], ['food_hotdog', 2, 1, 1], ['bomb', 3, 1, 2], ['potion_mystery', 2, 1, 1], ['w_pipe', 1, 1, 1], ['a_vest', 1, 1, 1], ['j_wire', 3, 1, 2], ['potion_mana', 2, 1, 1]],
  box_silver: [['potion_heal', 4, 2, 3], ['potion_big', 3, 1, 1], ['potion_mana', 3, 1, 2], ['bomb', 3, 2, 3], ['w_bar', 2, 1, 1], ['a_jacket', 2, 1, 1], ['potion_mystery', 2, 1, 2], ['box_rusty', 1, 1, 2]],
  box_gold: [['potion_big', 4, 1, 2], ['bomb_big', 3, 1, 2], ['w_mic', 2, 1, 1], ['a_suit', 2, 1, 1], ['box_silver', 2, 1, 1], ['potion_mana', 3, 2, 3]],
  box_patron: [['w_bat', 2, 1, 1], ['a_coat', 2, 1, 1], ['potion_big', 3, 2, 3], ['bomb_big', 3, 1, 2], ['box_gold', 1, 1, 1], ['potion_mystery', 2, 3, 4]],
};
export const BOX_TOKENS = { box_rusty: [3, 8], box_silver: [8, 16], box_gold: [18, 30], box_patron: [25, 50] };

// Each potion type rolls one of these per save. You learn it the first time you drink one.
export const SIDE_EFFECTS = [
  { text: 'Your hair turns bright green. The audience howls.', hype: 1 },
  { text: 'You hiccup glitter for a while.', hype: 1 },
  { text: 'You feel weirdly tough.', defBuff: 2 },
  { text: 'Your arms twitch with extra strength.', atkBuff: 2 },
  { text: 'You burp. It echoes. BOOKIE rates it 7 out of 10.', hype: 0 },
  { text: 'Your tongue goes numb. Nothing else happens.', hype: 0 },
  { text: 'You feel faster. Mobs look slower.', spdBuff: 2 },
];

export const MOBS = {
  slime: { name: 'Gutter Slime', sprite: 'slime', hp: 14, atk: 4, def: 1, spd: 3, xp: 6, tokens: [1, 4], drops: ['j_jelly', 'food_pretzel'] },
  rat: { name: 'Platform Rat', sprite: 'rat', hp: 10, atk: 5, def: 0, spd: 7, xp: 5, tokens: [1, 3], drops: ['j_tail', 'j_token'] },
  gremlin: { name: 'Ticket Gremlin', sprite: 'gremlin', hp: 16, atk: 6, def: 2, spd: 5, xp: 8, tokens: [2, 6], drops: ['j_token', 'j_wire', 'potion_heal'] },
  pigeon: { name: 'Feral Pigeon', sprite: 'pigeon', hp: 8, atk: 3, def: 0, spd: 9, xp: 4, tokens: [0, 3], drops: ['j_feather', 'food_pretzel'] },
};
export const BOSS = { name: 'The Turnstile King', sprite: 'king', hp: 95, atk: 9, def: 3, spd: 4, xp: 60, tokens: [30, 45], boss: true };

export const TRAITS = {
  armored: { name: 'Armored', desc: '+3 defense' },
  explosive: { name: 'Explosive', desc: 'Explodes when it dies' },
  cowardly: { name: 'Cowardly', desc: 'Begs for mercy when hurt' },
  greedy: { name: 'Greedy', desc: 'Steals items' },
  famous: { name: 'Famous', desc: 'The audience loves seeing it lose' },
  fast: { name: 'Fast', desc: 'Sometimes acts twice' },
  toxic: { name: 'Toxic', desc: 'Poisons on hit' },
};

export const FLOOR_RULES = [
  { id: 'doubleloot', name: 'Double Loot', text: 'Every chest holds twice the loot. Greed is good TV.' },
  { id: 'cowards', name: 'Cowards Night', text: 'Every mob begs for mercy when hurt. Will you show any?' },
  { id: 'hypefest', name: 'Hype Fest', text: 'The audience is hyped. Hype builds twice as fast.' },
];

export const ACHIEVEMENTS = {
  firstblood: { name: 'First Blood', text: 'You killed something. The audience claps politely.', reward: 'box_rusty' },
  mercy: { name: 'Mercy Rule', text: 'You let a mob live. Some viewers booed. Some cried.', reward: 'box_rusty' },
  death: { name: 'Welcome to the Show', text: 'You died! Do not worry, we kept the tape.', reward: 'box_rusty' },
  boxaddict: { name: 'Box Addict', text: 'You opened 5 loot boxes. You might have a problem.', reward: 'box_silver' },
  ratings: { name: 'Ratings Gold', text: 'You took down a Famous mob on live TV.', reward: 'box_silver' },
  elite: { name: 'Punching Up', text: 'You beat an elite mob.', reward: 'box_silver' },
  king: { name: 'Fare Evasion', text: 'You dethroned the Turnstile King.', reward: 'box_gold' },
};

export const BOOKIE = {
  welcome: [
    'Welcome to LONG ODDS, the last show on Earth! Literally.',
    'Contestant, the Patrons have placed their bets. Most of them bet against you.',
  ],
  win: ['Clean. The Patrons barely spilled their champagne.', 'A win! Your odds just got a little less insulting.', 'The crowd goes mild!', 'Somebody up on the arks just won a bet on you.'],
  lowWin: ['That was close. The audience LOVED it.', 'Barely alive. Peak television.'],
  hurt: ['Ooh, that one is going in the highlight reel.', 'Ouch. The Patrons are re-running that in slow motion.'],
  spare: ['You spared it. Touching. Boring, but touching.', 'Mercy! Half the audience is crying, the other half wants a refund.'],
  finish: ['Cold. The Patrons respect cold.', 'No mercy! The ratings spike.'],
  chest: ['A loot box! The sweetest sound in the apocalypse.', 'Shiny! Go on, open it.'],
  timer: ['Five minutes left on the floor. Tick tock.', 'One minute! The floor is getting crumbly.'],
  death: ['And you are dead! Classic. Let us rewind.', 'That was a death. Your odds just got worse. Much worse.'],
  hype: ['The audience is losing it! A Patron sent you a gift.'],
};
