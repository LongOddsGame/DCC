// All game content for the Floor 1 prototype: jobs, races, classes, items, mobs and lines.

export const BASE_STATS = { maxHp: 40, maxMp: 12, atk: 6, def: 3, mag: 5, spd: 5, luck: 5 };

export const JOBS = [
  { id: 'nurse', name: 'Nurse', perk: 'Healing potions heal 20% more.' },
  { id: 'mechanic', name: 'Mechanic', perk: 'Crafting recipes need one less piece of junk.' },
  { id: 'cook', name: 'Line cook', perk: 'Food heals twice as much.' },
  { id: 'driver', name: 'Delivery driver', perk: 'Move faster around the floor.' },
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

// type: potion | food | bomb | scroll | junk | box, or a gear slot: weapon | head | shirt | armor | wrist | shoes
export const ITEMS = {
  potion_heal: { name: 'Health Potion', type: 'potion', rarity: 'common', heal: 25, price: 8, desc: 'Heals 25.' },
  potion_big: { name: 'Big Health Potion', type: 'potion', rarity: 'silver', heal: 60, desc: 'Heals 60.' },
  potion_mana: { name: 'Mana Potion', type: 'potion', rarity: 'common', mana: 12, price: 10, desc: 'Restores 12 MP.' },
  potion_radar: { name: 'Mob Radar Potion', type: 'potion', rarity: 'rusty', radar: 60, price: 12, desc: 'Shows every mob on your map for 60 seconds of play.' },
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
  w_wrench: { name: 'Pipe Wrench', type: 'weapon', rarity: 'common', atk: 3, desc: 'Bolted together at a bench.' },
  a_trash: { name: 'Trash Lid Plate', type: 'armor', rarity: 'common', def: 2, desc: 'A garbage can lid on a strap.' },
  // Head: magic and MP. Shirt: max HP. Wrist: attack and luck. Shoes: speed and defense.
  h_foil: { name: 'Tinfoil Hat', type: 'head', rarity: 'common', mag: 1, maxMp: 2, desc: 'Blocks mind rays. Probably.' },
  h_cap: { name: 'Transit Cap', type: 'head', rarity: 'rusty', mag: 1, maxMp: 3, def: 1, desc: 'A conductor cap with a cracked brim.' },
  h_hardhat: { name: 'Hard Hat', type: 'head', rarity: 'silver', mag: 2, maxMp: 5, def: 1, desc: 'Somebody wrote THINK on it.' },
  h_tiara: { name: 'Pageant Tiara', type: 'head', rarity: 'gold', mag: 4, maxMp: 8, hype: true, desc: 'The audience loves it.' },
  h_crown: { name: "Patron's Paper Crown", type: 'head', rarity: 'patron', mag: 6, maxMp: 12, def: 2, desc: 'From a very expensive party.' },
  s_patch: { name: 'Patchwork Shirt', type: 'shirt', rarity: 'common', maxHp: 5, desc: 'Stitched from feathers and goo.' },
  s_tee: { name: 'Souvenir Tee', type: 'shirt', rarity: 'rusty', maxHp: 8, desc: 'I SURVIVED THE LOBBY. (So far.)' },
  s_flannel: { name: 'Lumberjack Flannel', type: 'shirt', rarity: 'silver', maxHp: 14, def: 1, desc: 'Soft, warm and surprisingly sturdy.' },
  s_jersey: { name: 'Sequin Jersey', type: 'shirt', rarity: 'gold', maxHp: 20, hype: true, desc: 'Sparkles on camera.' },
  s_silk: { name: "Patron's Silk Shirt", type: 'shirt', rarity: 'patron', maxHp: 30, luck: 2, desc: 'Costs more than a house.' },
  r_tape: { name: 'Duct Tape Wraps', type: 'wrist', rarity: 'common', atk: 1, desc: 'Fixes everything, including fists.' },
  r_band: { name: 'Sweatband', type: 'wrist', rarity: 'rusty', atk: 1, luck: 1, desc: 'Still damp. Do not ask.' },
  r_watch: { name: 'Cracked Watch', type: 'wrist', rarity: 'silver', atk: 2, luck: 2, desc: 'Stopped at the exact time the world broke.' },
  r_cuffs: { name: 'Brass Knuckle Cuffs', type: 'wrist', rarity: 'gold', atk: 4, luck: 1, desc: 'Every punch rings like a bell.' },
  r_bangle: { name: "Patron's Diamond Bangle", type: 'wrist', rarity: 'patron', atk: 5, luck: 5, desc: 'Blindingly shiny.' },
  f_flops: { name: 'Flip Flops', type: 'shoes', rarity: 'rusty', spd: 1, desc: 'Slap slap slap.' },
  f_feather: { name: 'Feather Sneakers', type: 'shoes', rarity: 'silver', spd: 3, desc: 'Hand made from pigeon feathers.' },
  f_sneaks: { name: 'Running Sneakers', type: 'shoes', rarity: 'silver', spd: 2, def: 1, desc: 'Good arch support for the apocalypse.' },
  f_boots: { name: 'Steel Toe Boots', type: 'shoes', rarity: 'gold', spd: 1, def: 4, desc: 'Kick things with confidence.' },
  f_loafers: { name: "Patron's Gold Loafers", type: 'shoes', rarity: 'patron', spd: 4, def: 3, desc: 'No socks. Never socks.' },
  j_token: { name: 'Bent Subway Token', type: 'junk', rarity: 'common', value: 2, desc: 'Junk. Craft or sell it.' },
  j_wire: { name: 'Loose Wires', type: 'junk', rarity: 'common', value: 2, desc: 'Junk. Craft or sell it.' },
  j_jelly: { name: 'Slime Jelly', type: 'junk', rarity: 'common', value: 3, edible: 6, desc: 'Junk. Technically edible.' },
  j_tail: { name: 'Rat Tail', type: 'junk', rarity: 'common', value: 2, edible: 4, desc: 'Junk. Technically edible.' },
  j_feather: { name: 'Pigeon Feather', type: 'junk', rarity: 'common', value: 1, desc: 'Junk. Craft or sell it.' },
  scroll_venom: { name: 'Scroll of Venom Dart', type: 'scroll', rarity: 'rusty', teaches: 'venom', desc: 'Teaches Venom Dart. Learn it in a safe room.' },
  scroll_iron: { name: 'Scroll of Iron Skin', type: 'scroll', rarity: 'rusty', teaches: 'iron', desc: 'Teaches Iron Skin. Learn it in a safe room.' },
  scroll_frost: { name: 'Scroll of Frost Snap', type: 'scroll', rarity: 'silver', teaches: 'frost', desc: 'Teaches Frost Snap. Learn it in a safe room.' },
  scroll_mend: { name: 'Scroll of Mend', type: 'scroll', rarity: 'silver', teaches: 'mend', desc: 'Teaches Mend. Learn it in a safe room.' },
  scroll_leech: { name: 'Scroll of Life Leech', type: 'scroll', rarity: 'silver', teaches: 'leech', desc: 'Teaches Life Leech. Learn it in a safe room.' },
  scroll_fireball: { name: 'Scroll of Fireball', type: 'scroll', rarity: 'gold', teaches: 'fireball', desc: 'Teaches Fireball. Learn it in a safe room.' },
  scroll_lightning: { name: 'Scroll of Chain Lightning', type: 'scroll', rarity: 'patron', teaches: 'lightning', desc: 'Teaches Chain Lightning. Learn it in a safe room.' },
  box_rusty: { name: 'Rusty Box', type: 'box', rarity: 'rusty', desc: 'A loot box. Open it!' },
  box_silver: { name: 'Silver Box', type: 'box', rarity: 'silver', desc: 'A better loot box.' },
  box_gold: { name: 'Gold Box', type: 'box', rarity: 'gold', desc: 'A great loot box.' },
  box_patron: { name: "Patron's Pick", type: 'box', rarity: 'patron', desc: 'A gift from a Patron. Probably fine.' },
};

// What each loot box tier can hold. [itemId, weight, minCount, maxCount]
export const LOOT = {
  box_rusty: [['potion_heal', 5, 1, 2], ['food_pretzel', 4, 1, 3], ['food_hotdog', 2, 1, 1], ['bomb', 3, 1, 2], ['potion_mystery', 2, 1, 1], ['w_pipe', 1, 1, 1], ['a_vest', 1, 1, 1], ['j_wire', 3, 1, 2], ['potion_mana', 2, 1, 1], ['potion_radar', 2, 1, 1], ['scroll_venom', 1, 1, 1], ['scroll_iron', 1, 1, 1], ['h_cap', 1, 1, 1], ['s_tee', 1, 1, 1], ['r_band', 1, 1, 1], ['f_flops', 1, 1, 1], ['j_feather', 2, 1, 2]],
  box_silver: [['potion_heal', 4, 2, 3], ['potion_big', 3, 1, 1], ['potion_mana', 3, 1, 2], ['bomb', 3, 2, 3], ['w_bar', 2, 1, 1], ['a_jacket', 2, 1, 1], ['potion_mystery', 2, 1, 2], ['box_rusty', 1, 1, 2], ['potion_radar', 2, 1, 2], ['scroll_frost', 1, 1, 1], ['scroll_mend', 1, 1, 1], ['scroll_leech', 1, 1, 1], ['h_hardhat', 1, 1, 1], ['s_flannel', 1, 1, 1], ['r_watch', 1, 1, 1], ['f_sneaks', 1, 1, 1], ['h_cap', 1, 1, 1], ['s_tee', 1, 1, 1]],
  box_gold: [['potion_big', 4, 1, 2], ['bomb_big', 3, 1, 2], ['w_mic', 2, 1, 1], ['a_suit', 2, 1, 1], ['box_silver', 2, 1, 1], ['potion_mana', 3, 2, 3], ['scroll_fireball', 2, 1, 1], ['scroll_frost', 1, 1, 1], ['potion_radar', 1, 2, 2], ['h_tiara', 1, 1, 1], ['s_jersey', 1, 1, 1], ['r_cuffs', 1, 1, 1], ['f_boots', 1, 1, 1], ['s_flannel', 1, 1, 1]],
  box_patron: [['w_bat', 2, 1, 1], ['a_coat', 2, 1, 1], ['potion_big', 3, 2, 3], ['bomb_big', 3, 1, 2], ['box_gold', 1, 1, 1], ['potion_mystery', 2, 3, 4], ['scroll_lightning', 2, 1, 1], ['scroll_fireball', 1, 1, 1], ['h_crown', 1, 1, 1], ['s_silk', 1, 1, 1], ['r_bangle', 1, 1, 1], ['f_loafers', 1, 1, 1]],
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
export const BOSSES = {
  king: { name: 'The Turnstile King', sprite: 'king', hp: 95, atk: 9, def: 3, spd: 4, xp: 60, tokens: [30, 45], intro: '"No ticket? No exit. No mercy."', announce: 'Ladies, gentlemen and billionaires: THE TURNSTILE KING!' },
  hoarder: { name: 'The Lost and Found Hoarder', sprite: 'hoarder', hp: 80, atk: 8, def: 4, spd: 5, xp: 55, tokens: [25, 40], intro: '"Finders keepers. Losers... also mine."', announce: 'From the depths of the lost property office: THE HOARDER!' },
};

// What each mob throws at you. proj is the shape drawn flying across the battle screen.
export const ATTACKS = {
  slime: { name: 'Slime Spit', heavy: 'Big Slime Glob', proj: 'blob', color: '#6bbf59' },
  rat: { name: 'Bone Toss', heavy: 'Gnawed Femur Fling', proj: 'bone', color: '#e8dcc0' },
  gremlin: { name: 'Ticket Barrage', heavy: 'Fine Notice Flurry', proj: 'tickets', color: '#f5c542' },
  pigeon: { name: 'Dive Bomb', heavy: 'Airborne Droppings', proj: 'blob', color: '#fff6e0' },
  king: { name: 'Fare Card Fling', heavy: 'Turnstile Spin', proj: 'bar', color: '#8b84a3' },
  hoarder: { name: 'Junk Avalanche', heavy: 'Umbrella Storm', proj: 'junk', color: '#b8693a' },
};

// Moves you can learn from scrolls, on top of your class skill.
export const MOVES = {
  venom: { name: 'Venom Dart', mp: 3, target: 'one', desc: 'Poisons one mob for 3 turns.' },
  iron: { name: 'Iron Skin', mp: 4, target: 'self', desc: '+4 defense for the rest of the fight.' },
  frost: { name: 'Frost Snap', mp: 4, target: 'one', desc: 'Ice damage. The mob skips its next turn.' },
  mend: { name: 'Mend', mp: 5, target: 'self', desc: 'Heal 30 HP plus your magic.' },
  leech: { name: 'Life Leech', mp: 5, target: 'one', desc: 'Damage a mob and heal half of it.' },
  fireball: { name: 'Fireball', mp: 6, target: 'all', desc: 'Fire hits every mob.' },
  lightning: { name: 'Chain Lightning', mp: 8, target: 'all', desc: 'A huge shock to every mob.' },
};

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
  hoarder: { name: 'Spring Cleaning', text: 'You cleared out the Lost and Found Hoarder.', reward: 'box_gold' },
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

// ---------- Gear ----------
export const GEAR_SLOTS = ['weapon', 'head', 'shirt', 'armor', 'wrist', 'shoes'];
export const SLOT_NAMES = { weapon: 'Weapon', head: 'Head', shirt: 'Shirt', armor: 'Armor', wrist: 'Wrist', shoes: 'Shoes' };
export const STAT_NAMES = { atk: 'ATK', def: 'DEF', mag: 'MAG', spd: 'SPD', luck: 'LUCK', maxHp: 'HP', maxMp: 'MP' };

// Shop prices by rarity when an item has no price of its own. Selling pays half.
export const RARITY_PRICE = { common: 6, rusty: 12, silver: 28, gold: 60, patron: 110 };

// Penny's shop gets better as you level up. Each tier unlocks at a level.
export const SHOP_TIERS = [
  { lvl: 1, rarity: 'rusty', basics: ['potion_heal', 'potion_mana', 'potion_radar', 'food_hotdog', 'bomb', 'box_rusty'], scrolls: ['scroll_venom', 'scroll_iron'] },
  { lvl: 3, rarity: 'silver', basics: ['potion_big', 'box_silver'], scrolls: ['scroll_frost', 'scroll_mend', 'scroll_leech'] },
  { lvl: 5, rarity: 'gold', basics: ['bomb_big', 'box_gold'], scrolls: ['scroll_fireball'] },
  { lvl: 8, rarity: 'patron', basics: ['box_patron'], scrolls: ['scroll_lightning'] },
];

// Crafting bench recipes. need lists items used up. lvl is when the recipe unlocks.
export const RECIPES = [
  { out: 'bomb', lvl: 1, need: { j_wire: 1, j_token: 1 } },
  { out: 'potion_heal', lvl: 1, need: { j_jelly: 2 } },
  { out: 'food_hotdog', lvl: 1, need: { j_tail: 2 } },
  { out: 'h_foil', lvl: 1, need: { j_wire: 2, j_token: 1 } },
  { out: 'r_tape', lvl: 1, need: { j_wire: 1, j_tail: 1 } },
  { out: 'potion_radar', lvl: 2, need: { j_feather: 2, j_wire: 1 } },
  { out: 'potion_mana', lvl: 2, need: { j_jelly: 1, j_feather: 1 } },
  { out: 's_patch', lvl: 2, need: { j_feather: 2, j_jelly: 1 } },
  { out: 'a_trash', lvl: 2, need: { j_token: 2, j_wire: 2 } },
  { out: 'w_wrench', lvl: 3, need: { w_pipe: 1, j_wire: 2 } },
  { out: 'f_feather', lvl: 3, need: { j_feather: 4, j_wire: 1 }, tokens: 5 },
  { out: 'potion_big', lvl: 3, need: { potion_heal: 2, j_jelly: 1 } },
  { out: 'bomb_big', lvl: 4, need: { bomb: 3, j_wire: 2 } },
  { out: 'r_cuffs', lvl: 5, need: { r_band: 1, j_token: 4 }, tokens: 20 },
  { out: 'h_tiara', lvl: 6, need: { h_hardhat: 1, j_token: 4 }, tokens: 30 },
];
