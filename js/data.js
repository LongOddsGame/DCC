// All game content for the Floor 1 prototype: jobs, races, classes, items, mobs and lines.

export const BASE_STATS = { maxHp: 40, maxMp: 12, atk: 6, def: 3, mag: 5, spd: 5, luck: 5, cha: 5, xpPct: 0 };

// Enhancements. Your old job is drawn at random, then you pick 2 of the 4 it offers.
export const PERKS = {
  medic: { name: 'Bedside Manner', desc: 'Health potions heal 20% more.' },
  tinkerer: { name: 'Tinkerer', desc: 'Crafting recipes need one less material.' },
  chef: { name: 'Iron Stomach', desc: 'Food heals twice as much.' },
  quickfeet: { name: 'Quick Feet', desc: 'Walk faster around the floor.' },
  charmer: { name: 'Charmer', desc: 'People trust you more. +2 charisma.', mods: { cha: 2 } },
  pity: { name: 'Pity Case', desc: 'One extra loot box on every floor.' },
  tough: { name: 'Tough', desc: '+10 max HP.', mods: { maxHp: 10 } },
  brainy: { name: 'Brainy', desc: '+6 max MP and +1 magic.', mods: { maxMp: 6, mag: 1 } },
  strong: { name: 'Strong Arms', desc: '+2 attack.', mods: { atk: 2 } },
  thick: { name: 'Thick Skin', desc: '+2 defense.', mods: { def: 2 } },
  lucky: { name: 'Lucky', desc: '+3 luck: more crits and more mercy.', mods: { luck: 3 } },
  nimble: { name: 'Nimble', desc: '+2 speed: run away more easily.', mods: { spd: 2 } },
  haggler: { name: 'Haggler', desc: 'Shop prices are 15% lower.' },
  salesman: { name: 'Salesman', desc: 'Items sell for 50% more.' },
  tipjar: { name: 'Tip Jar', desc: 'Win 3 extra tokens after every fight.' },
  learner: { name: 'Fast Learner', desc: 'Earn 25% more XP.' },
  ham: { name: 'Camera Ham', desc: 'Gain hype 25% faster.' },
  firstaid: { name: 'First Aid', desc: 'Heal 4 HP after every fight.' },
  demo: { name: 'Demolitions', desc: 'Bombs deal 30% more damage.' },
  nerd: { name: 'Radar Nerd', desc: 'Mob Radar potions last twice as long.' },
  scavenger: { name: 'Scavenger', desc: 'Mobs drop junk and items more often.' },
  stash: { name: 'Secret Stash', desc: 'Start with 2 extra loot boxes and 20 tokens.' },
};

export const JOBS = [
  { id: 'nurse', name: 'Nurse', flavor: 'Twelve-hour shifts prepared you for this.', perks: ['medic', 'firstaid', 'tough', 'charmer'] },
  { id: 'mechanic', name: 'Mechanic', flavor: 'You can fix anything with the right wrench.', perks: ['tinkerer', 'strong', 'scavenger', 'demo'] },
  { id: 'cook', name: 'Line cook', flavor: 'Hot oil burns built character.', perks: ['chef', 'thick', 'firstaid', 'nimble'] },
  { id: 'driver', name: 'Delivery driver', flavor: 'Five stars. Every time.', perks: ['quickfeet', 'nimble', 'tipjar', 'nerd'] },
  { id: 'bartender', name: 'Bartender', flavor: 'You have heard every sad story twice.', perks: ['charmer', 'chef', 'tipjar', 'lucky'] },
  { id: 'unemployed', name: 'Unemployed', flavor: 'Between opportunities. Long between.', perks: ['pity', 'lucky', 'stash', 'learner'] },
  { id: 'teacher', name: 'Substitute teacher', flavor: 'You survived seventh grade. Twice a day.', perks: ['learner', 'brainy', 'thick', 'charmer'] },
  { id: 'plumber', name: 'Plumber', flavor: 'You have seen things in pipes.', perks: ['strong', 'tinkerer', 'chef', 'scavenger'] },
  { id: 'clown', name: 'Party clown', flavor: 'Balloon animals and quiet despair.', perks: ['ham', 'nimble', 'lucky', 'charmer'] },
  { id: 'accountant', name: 'Accountant', flavor: 'Numbers never lied to you. People did.', perks: ['haggler', 'salesman', 'brainy', 'learner'] },
  { id: 'bouncer', name: 'Bouncer', flavor: 'Not on the list? Not getting in.', perks: ['strong', 'thick', 'tough', 'charmer'] },
  { id: 'influencer', name: 'Influencer', flavor: 'Smash that like button. Or the mob.', perks: ['ham', 'salesman', 'stash', 'tipjar'] },
  { id: 'librarian', name: 'Librarian', flavor: 'Shhh. The scrolls are talking.', perks: ['brainy', 'learner', 'nerd', 'medic'] },
  { id: 'janitor', name: 'Night janitor', flavor: 'You know where everything gets swept.', perks: ['scavenger', 'pity', 'tough', 'quickfeet'] },
  { id: 'magician', name: 'Stage magician', flavor: 'Pick a card. Any card. Run.', perks: ['ham', 'brainy', 'lucky', 'nimble'] },
  { id: 'roofer', name: 'Roofer', flavor: 'Heights, hammers and heat stroke.', perks: ['tough', 'strong', 'nimble', 'demo'] },
  { id: 'carsales', name: 'Used car salesman', flavor: 'This baby can fit so many potions in it.', perks: ['salesman', 'haggler', 'charmer', 'tipjar'] },
  { id: 'paramedic', name: 'Paramedic', flavor: 'You run toward the screaming.', perks: ['firstaid', 'medic', 'quickfeet', 'thick'] },
  { id: 'miner', name: 'Coal miner', flavor: 'Underground is home.', perks: ['demo', 'tough', 'scavenger', 'nerd'] },
  { id: 'lifeguard', name: 'Lifeguard', flavor: 'No running by the pool. Running from mobs is fine.', perks: ['nimble', 'firstaid', 'tough', 'ham'] },
  { id: 'gamer', name: 'Pro gamer', flavor: 'You have trained for this your whole life.', perks: ['learner', 'nerd', 'lucky', 'quickfeet'] },
  { id: 'chef', name: 'Fancy chef', flavor: 'Yes chef. No chef. Slime jelly, chef?', perks: ['chef', 'haggler', 'medic', 'ham'] },
  { id: 'pawn', name: 'Pawn shop clerk', flavor: 'Everything has a price. Usually low.', perks: ['haggler', 'salesman', 'scavenger', 'stash'] },
  { id: 'wrestler', name: 'Pro wrestler', flavor: 'The chair shot was always real.', perks: ['strong', 'ham', 'tough', 'thick'] },
  { id: 'vet', name: 'Veterinarian', flavor: 'Mobs are just angry animals. Mostly.', perks: ['medic', 'charmer', 'firstaid', 'brainy'] },
  { id: 'courier', name: 'Bike courier', flavor: 'Red lights are suggestions.', perks: ['quickfeet', 'nimble', 'nerd', 'tipjar'] },
  { id: 'fisher', name: 'Crab fisher', flavor: 'The ocean tried to kill you weekly.', perks: ['tough', 'lucky', 'thick', 'scavenger'] },
  { id: 'intern', name: 'Unpaid intern', flavor: 'Exposure finally paid off. Sort of.', perks: ['learner', 'pity', 'stash', 'quickfeet'] },
  { id: 'chemist', name: 'Pharmacist', flavor: 'Take two of these and call no one.', perks: ['medic', 'nerd', 'demo', 'brainy'] },
  { id: 'farmer', name: 'Farmer', flavor: 'Up before the sun, every single day.', perks: ['chef', 'tough', 'strong', 'firstaid'] },
  { id: 'locksmith', name: 'Locksmith', flavor: 'No box stays closed for long.', perks: ['stash', 'tinkerer', 'lucky', 'scavenger'] },
  { id: 'dj', name: 'Wedding DJ', flavor: 'You know exactly when to drop the beat.', perks: ['ham', 'tipjar', 'charmer', 'nimble'] },
  { id: 'firefighter', name: 'Firefighter', flavor: 'Smoke, fire and bad news. Normal Tuesday.', perks: ['thick', 'tough', 'demo', 'firstaid'] },
  { id: 'mascot', name: 'Team mascot', flavor: 'Nobody has seen your real face in years.', perks: ['ham', 'thick', 'nimble', 'pity'] },
  { id: 'professor', name: 'History professor', flavor: 'You saw the end coming. Nobody listened.', perks: ['brainy', 'learner', 'nerd', 'haggler'] },
  { id: 'mailcarrier', name: 'Mail carrier', flavor: 'Neither rain nor snow nor floor bosses.', perks: ['quickfeet', 'tough', 'scavenger', 'charmer'] },
  { id: 'stuntdouble', name: 'Stunt double', flavor: 'You have fallen off better buildings.', perks: ['thick', 'nimble', 'ham', 'lucky'] },
  { id: 'gravedigger', name: 'Gravedigger', flavor: 'Quiet work. Very steady demand lately.', perks: ['strong', 'scavenger', 'tough', 'demo'] },
  { id: 'scientist', name: 'Lab scientist', flavor: 'This is all very interesting, actually.', perks: ['nerd', 'demo', 'brainy', 'tinkerer'] },
  { id: 'barista', name: 'Barista', flavor: 'You run on caffeine and spite.', perks: ['quickfeet', 'tipjar', 'chef', 'charmer'] },
];

// skin / hair overrides are used to recolor the hero sprite.
export const RACES = [
  { id: 'human', name: 'Human', desc: 'Balanced. The Patrons love an underdog, so you gain hype faster.', mods: { cha: 1 }, odds: 8, skin: '#f2b48a', shade: '#c47a5a' },
  { id: 'fairy', name: 'Fairy', desc: 'Fragile but magical. 15% chance to flutter out of the way of a hit.', mods: { maxHp: -8, mag: 4, spd: 2, cha: 2 }, odds: 30, skin: '#ffd6e8', shade: '#ff5fa2', hair: '#4fd8e8' },
  { id: 'orc', name: 'Orc', desc: 'Hits hard. Deals 50% more damage when below a third of your health.', mods: { maxHp: 8, atk: 3, cha: -1 }, odds: 6, skin: '#6bbf59', shade: '#2f7a3c', hair: '#1a1426' },
  { id: 'ogre', name: 'Ogre', desc: 'Huge and slow. Food and junk you eat heal twice as much.', mods: { maxHp: 16, atk: 2, spd: -2, cha: -2 }, odds: 10, skin: '#b8a07a', shade: '#7a6a4a', hair: '#5b3a29' },
  { id: 'elf', name: 'Elf', desc: 'Quick and sharp-eyed. Every chest holds one extra item.', mods: { spd: 2, luck: 3, cha: 1 }, odds: 12, skin: '#f7e0c4', shade: '#c9a27e', hair: '#f5c542' },
  { id: 'dwarf', name: 'Dwarf', desc: 'Tough as stone. Immune to poison.', mods: { def: 3, maxHp: 4 }, odds: 9, skin: '#e8a87c', shade: '#b8693a', hair: '#c8334a' },
  { id: 'troll', name: 'Troll', desc: 'Slowly regrows. Heal 1 health every 4 steps.', mods: { maxHp: 10, cha: -1 }, odds: 14, skin: '#6a9a8a', shade: '#3a6a5a', hair: '#2f7a3c' },
  { id: 'gnome', name: 'Gnome', desc: 'Tiny and clever. Bombs deal 50% more damage.', mods: { maxHp: -6, mag: 2, luck: 2 }, odds: 25, skin: '#f2b48a', shade: '#c47a5a', hair: '#fff6e0' },
  { id: 'goblin', name: 'Goblin', desc: 'Sneaky. 25% chance to steal tokens when you hit. People trust you less.', mods: { luck: 4, spd: 1, cha: -2 }, odds: 20, skin: '#b8e05a', shade: '#6bbf59', hair: '#1a1426' },
  { id: 'werewolf', name: 'Werewolf', desc: 'Wild. 20% chance your attack hits twice.', mods: { atk: 4, def: -1 }, odds: 15, skin: '#a08070', shade: '#5b3a29', hair: '#5a5373' },
  { id: 'ghoul', name: 'Ghoul', desc: 'Heal 4 health for every mob you defeat. People find you creepy.', mods: { maxHp: 4, cha: -3 }, odds: 22, skin: '#c9c3da', shade: '#8b84a3', hair: '#1a1426' },
  { id: 'pixie', name: 'Pixie-kin', desc: 'Trickster. 15% chance a mob attack hits another mob instead.', mods: { mag: 3, maxHp: -6, cha: 2 }, odds: 35, skin: '#e0c4f0', shade: '#c49af0', hair: '#8a4fc9' },
];

// Classes. skill.kind picks what the class skill does in battle (see castMove).
// cannot lists spell schools the class can never learn from scrolls.
// Flags: magic (gear magic counts more), haggle (20% off in shops), hypeUp (50% more hype).
export const SCHOOL_NAMES = { poison: 'Poison', guard: 'Guard', ice: 'Ice', heal: 'Healing', blood: 'Blood', fire: 'Fire', storm: 'Storm' };
export const CLASSES = [
  { id: 'brawler', name: 'Brawler', desc: 'Heavy hits and high health.', mods: { maxHp: 10, atk: 2 }, odds: 0, coat: '#c8334a', coatLight: '#ff8a8a', cannot: ['storm', 'ice'],
    skill: { name: 'Haymaker', mp: 3, desc: 'A punch for double damage.', target: 'one', kind: 'double' } },
  { id: 'hex', name: 'Hex-slinger', desc: 'Spells and curses.', mods: { maxMp: 10, mag: 3 }, odds: 2, coat: '#8a4fc9', coatLight: '#c49af0', cannot: ['heal'], magic: true,
    skill: { name: 'Hex Bolt', mp: 4, desc: 'Magic damage that ignores armor.', target: 'one', kind: 'bolt', color: '#c49af0' } },
  { id: 'scrapper', name: 'Scrapper', desc: 'Builds bombs from junk. Starts with 3 bombs.', mods: { luck: 2 }, odds: 2, coat: '#b8693a', coatLight: '#f5c542', cannot: ['heal', 'ice'],
    skill: { name: 'Shrapnel', mp: 4, desc: 'Hit every mob at once.', target: 'all', kind: 'shrapnel' } },
  { id: 'talker', name: 'Smooth Talker', desc: 'Talks mobs down and gets better deals.', mods: { luck: 2, def: 1, cha: 4 }, odds: 4, coat: '#3a6ea5', coatLight: '#6aa0d8', cannot: ['fire', 'blood'], haggle: true,
    skill: { name: 'Talk Down', mp: 3, desc: 'Convince one mob to walk away.', target: 'one', kind: 'talk' } },
  { id: 'showboat', name: 'Showboat', desc: 'Wins over the audience for bigger gifts.', mods: { spd: 1, cha: 3 }, odds: 3, coat: '#f5c542', coatLight: '#fff6e0', cannot: ['poison'], hypeUp: true,
    skill: { name: 'Showstopper', mp: 3, desc: 'A flashy hit worth 2 hype.', target: 'one', kind: 'flashy' } },
  { id: 'medic', name: 'Field Medic', desc: 'Keeps themself alive no matter what.', mods: { maxHp: 6, maxMp: 6, mag: 1 }, odds: 3, coat: '#e8dcc0', coatLight: '#fff6e0', cannot: ['blood', 'poison', 'fire'],
    skill: { name: 'Patch Up', mp: 4, desc: 'Heal 20 HP plus 1.5 times your magic.', target: 'self', kind: 'heal' } },
  { id: 'knight', name: 'Mall Knight', desc: 'Armor and shields. Hard to knock down.', mods: { def: 3, maxHp: 6, spd: -1 }, odds: 1, coat: '#8b84a3', coatLight: '#e8dcc0', cannot: ['poison', 'blood'],
    skill: { name: 'Shield Bash', mp: 4, desc: 'A hit that stuns one mob for a turn.', target: 'one', kind: 'stun' } },
  { id: 'rogue', name: 'Pickpocket', desc: 'Quick hands, quicker feet.', mods: { spd: 2, luck: 2, cha: 1 }, odds: 5, coat: '#2f7a3c', coatLight: '#6bbf59', cannot: ['heal', 'guard'],
    skill: { name: 'Back Alley', mp: 3, desc: 'A sneaky hit that also steals tokens.', target: 'one', kind: 'steal' } },
  { id: 'pyro', name: 'Pyromaniac', desc: 'Sets everything on fire. Everything.', mods: { mag: 3, maxMp: 4 }, odds: 6, coat: '#ff8a3a', coatLight: '#f5c542', cannot: ['ice', 'heal'], magic: true,
    skill: { name: 'Flame Burst', mp: 5, desc: 'Magic fire hits every mob.', target: 'all', kind: 'burst', color: '#ff8a3a' } },
  { id: 'frost', name: 'Frost Witch', desc: 'Cold spells that freeze mobs in place.', mods: { mag: 2, maxMp: 6 }, odds: 5, coat: '#4fd8e8', coatLight: '#e8dcc0', cannot: ['fire'], magic: true,
    skill: { name: 'Cold Shoulder', mp: 4, desc: 'Ice damage that freezes one mob.', target: 'one', kind: 'freeze' } },
  { id: 'vamp', name: 'Night Shift Vampire', desc: 'Drinks life from mobs. Hates daylight anyway.', mods: { atk: 1, mag: 2, maxHp: 4 }, odds: 7, coat: '#7a1c2e', coatLight: '#c8334a', cannot: ['heal', 'fire'],
    skill: { name: 'Blood Siphon', mp: 4, desc: 'Damage one mob and heal all of it.', target: 'one', kind: 'drain' } },
  { id: 'druid', name: 'Park Druid', desc: 'Weeds, thorns and nature that bites back.', mods: { mag: 2, maxHp: 4, luck: 1 }, odds: 4, coat: '#6bbf59', coatLight: '#b8e05a', cannot: ['fire', 'storm'], magic: true,
    skill: { name: 'Thornwhip', mp: 3, desc: 'Damage and poison one mob.', target: 'one', kind: 'poison' } },
  { id: 'monk', name: 'Yoga Monk', desc: 'Calm, centered, and very fast with their fists.', mods: { spd: 3, atk: 1 }, odds: 3, coat: '#f5c542', coatLight: '#ff8a3a', cannot: ['fire', 'poison', 'blood'],
    skill: { name: 'Flurry', mp: 4, desc: 'Three quick punches.', target: 'one', kind: 'multi' } },
  { id: 'bard', name: 'Karaoke Bard', desc: 'Sings so badly it inspires. Great with crowds.', mods: { cha: 4, maxMp: 4 }, odds: 6, coat: '#ff5fa2', coatLight: '#f5c542', cannot: ['blood', 'poison'], haggle: true, hypeUp: true,
    skill: { name: 'Power Ballad', mp: 3, desc: '+3 attack for the rest of the fight, plus hype.', target: 'self', kind: 'song' } },
  { id: 'berserk', name: 'Berserker', desc: 'All rage, no spells. Hits like a truck.', mods: { atk: 4, maxHp: 8, def: -2, cha: -2 }, odds: 2, coat: '#7a1c2e', coatLight: '#ff8a8a', cannot: ['heal', 'guard', 'ice', 'storm'],
    skill: { name: 'Rampage', mp: 4, desc: 'Hit every mob with your weapon.', target: 'all', kind: 'rampage' } },
  { id: 'sniper', name: 'Arcade Sniper', desc: 'Never misses. Won every prize at the fair.', mods: { luck: 3, spd: 1 }, odds: 4, coat: '#3a6ea5', coatLight: '#4fd8e8', cannot: ['heal'],
    skill: { name: 'Headshot', mp: 5, desc: 'Triple damage that ignores armor.', target: 'one', kind: 'crit' } },
  { id: 'warden', name: 'Bouncer Warden', desc: 'Stands in the door and does not move.', mods: { def: 2, maxHp: 12, spd: -1 }, odds: 1, coat: '#1a1426', coatLight: '#5a5373', cannot: ['fire', 'storm'],
    skill: { name: 'Hunker Down', mp: 3, desc: '+6 defense this fight and heal 10.', target: 'self', kind: 'guard' } },
  { id: 'trick', name: 'Trickster', desc: 'Smoke, mirrors and pocket sand.', mods: { spd: 2, luck: 2, cha: 1 }, odds: 6, coat: '#8a4fc9', coatLight: '#4fd8e8', cannot: ['blood'],
    skill: { name: 'Pocket Sand', mp: 4, desc: 'Every mob has a 60% chance to lose its next turn.', target: 'all', kind: 'blind' } },
  { id: 'necro', name: 'Basement Necromancer', desc: 'Curses and creepy whispers.', mods: { mag: 3, maxMp: 6, cha: -2 }, odds: 7, coat: '#1a1426', coatLight: '#8a4fc9', cannot: ['heal'], magic: true,
    skill: { name: 'Grave Chill', mp: 4, desc: 'Magic damage and the mob hits 3 weaker for the fight.', target: 'one', kind: 'curse' } },
  { id: 'storm', name: 'Storm Caller', desc: 'Weather in a bottle. Mostly lightning.', mods: { mag: 3, spd: 1 }, odds: 5, coat: '#3a6ea5', coatLight: '#f5c542', cannot: ['ice', 'poison'], magic: true,
    skill: { name: 'Static Snap', mp: 4, desc: 'Lightning that ignores armor.', target: 'one', kind: 'bolt', color: '#f5c542' } },
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
  potion_path: { name: 'Boss Compass Potion', type: 'potion', rarity: 'rusty', guide: 120, price: 15, desc: 'Draws the way to the nearest boss on your maps for 120 seconds of play.' },
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
  a_suit: { name: 'Gold Lame Suit', type: 'armor', rarity: 'gold', cha: 1, def: 4, hype: true, desc: '+4 defense. The audience loves it.' },
  a_coat: { name: "Patron's Fur Coat", type: 'armor', rarity: 'patron', def: 6, desc: '+6 defense. Smells like money.' },
  w_wrench: { name: 'Pipe Wrench', type: 'weapon', rarity: 'common', atk: 3, desc: 'Bolted together at a bench.' },
  a_trash: { name: 'Trash Lid Plate', type: 'armor', rarity: 'common', def: 2, desc: 'A garbage can lid on a strap.' },
  // Head: magic and MP. Shirt: max HP. Wrist: attack and luck. Shoes: speed and defense.
  h_foil: { name: 'Tinfoil Hat', type: 'head', rarity: 'common', mag: 1, maxMp: 2, desc: 'Blocks mind rays. Probably.' },
  h_cap: { name: 'Transit Cap', type: 'head', rarity: 'rusty', mag: 1, maxMp: 3, def: 1, desc: 'A conductor cap with a cracked brim.' },
  h_hardhat: { name: 'Hard Hat', type: 'head', rarity: 'silver', mag: 2, maxMp: 5, def: 1, desc: 'Somebody wrote THINK on it.' },
  h_tiara: { name: 'Pageant Tiara', type: 'head', rarity: 'gold', cha: 2, mag: 4, maxMp: 8, hype: true, desc: 'The audience loves it.' },
  h_crown: { name: "Patron's Paper Crown", type: 'head', rarity: 'patron', mag: 6, maxMp: 12, def: 2, desc: 'From a very expensive party.' },
  s_patch: { name: 'Patchwork Shirt', type: 'shirt', rarity: 'common', maxHp: 5, desc: 'Stitched from feathers and goo.' },
  s_tee: { name: 'Souvenir Tee', type: 'shirt', rarity: 'rusty', maxHp: 8, desc: 'I SURVIVED THE LOBBY. (So far.)' },
  s_flannel: { name: 'Lumberjack Flannel', type: 'shirt', rarity: 'silver', maxHp: 14, def: 1, desc: 'Soft, warm and surprisingly sturdy.' },
  s_jersey: { name: 'Sequin Jersey', type: 'shirt', rarity: 'gold', cha: 1, maxHp: 20, hype: true, desc: 'Sparkles on camera.' },
  s_silk: { name: "Patron's Silk Shirt", type: 'shirt', rarity: 'patron', cha: 2, maxHp: 30, luck: 2, desc: 'Costs more than a house.' },
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
  // Neck: luck, magic and bonus XP. Rings: a bit of everything, wear two. Legs: defense and HP. Back: speed.
  n_lanyard: { name: 'Staff Lanyard', type: 'neck', rarity: 'common', def: 1, luck: 1, desc: 'ALL ACCESS. To nothing.' },
  n_whistle: { name: 'Safety Whistle', type: 'neck', rarity: 'rusty', luck: 2, maxHp: 4, desc: 'One blast scares rats. Sometimes.' },
  n_locket: { name: "Scholar's Locket", type: 'neck', rarity: 'silver', mag: 2, xpPct: 10, desc: 'A tiny photo of a library inside.' },
  n_chain: { name: 'Gold Chain', type: 'neck', rarity: 'gold', cha: 2, atk: 2, luck: 3, xpPct: 5, hype: true, desc: 'Heavy, shiny and very on camera.' },
  n_pendant: { name: "Patron's Pearl Pendant", type: 'neck', rarity: 'patron', mag: 4, maxMp: 10, xpPct: 20, desc: 'Learn faster, look richer.' },
  g_washer: { name: 'Washer Ring', type: 'ring', rarity: 'common', def: 1, desc: 'A hardware store washer. Fits fine.' },
  g_mood: { name: 'Mood Ring', type: 'ring', rarity: 'rusty', mag: 1, luck: 1, desc: 'Currently: terrified.' },
  g_class: { name: 'Class Ring', type: 'ring', rarity: 'silver', atk: 1, xpPct: 8, desc: 'Class of the year the world ended.' },
  g_signet: { name: 'Silver Signet', type: 'ring', rarity: 'silver', atk: 1, def: 2, desc: 'Stamped with a stranger\'s crest.' },
  g_ruby: { name: 'Ruby Ring', type: 'ring', rarity: 'gold', atk: 3, maxHp: 8, desc: 'Glows when you are angry.' },
  g_band: { name: "Patron's Platinum Band", type: 'ring', rarity: 'patron', atk: 3, def: 3, luck: 3, xpPct: 10, desc: 'Worth more than the floor you found it on.' },
  l_bags: { name: 'Trash Bag Pants', type: 'legs', rarity: 'common', def: 1, maxHp: 2, desc: 'Crinkly but waterproof.' },
  l_shorts: { name: 'Gym Shorts', type: 'legs', rarity: 'rusty', spd: 1, maxHp: 4, desc: 'Never skip leg day.' },
  l_jeans: { name: 'Ripped Jeans', type: 'legs', rarity: 'silver', def: 2, maxHp: 6, desc: 'Ripped by a mob, not a designer.' },
  l_cargo: { name: 'Cargo Pants', type: 'legs', rarity: 'gold', def: 3, maxHp: 10, luck: 1, desc: 'So many pockets. No inventory limit anyway.' },
  l_tux: { name: "Patron's Tux Trousers", type: 'legs', rarity: 'patron', def: 4, spd: 2, maxHp: 14, desc: 'Pressed by a butler who cried.' },
  k_towel: { name: 'Beach Towel Cape', type: 'back', rarity: 'rusty', spd: 1, luck: 1, desc: 'Always know where your towel is.' },
  k_tarp: { name: 'Blue Tarp Cloak', type: 'back', rarity: 'silver', def: 1, spd: 2, desc: 'Rustles heroically.' },
  k_cape: { name: 'Showbiz Cape', type: 'back', rarity: 'gold', cha: 2, spd: 2, mag: 2, hype: true, desc: 'Sequins on both sides.' },
  k_mink: { name: "Patron's Mink Stole", type: 'back', rarity: 'patron', spd: 3, def: 3, maxMp: 8, desc: 'Fur from an animal that never existed.' },
  j_token: { name: 'Bent Subway Token', type: 'junk', rarity: 'common', value: 2, desc: 'Crafting material for the bench.' },
  j_wire: { name: 'Loose Wires', type: 'junk', rarity: 'common', value: 2, desc: 'Crafting material for the bench.' },
  j_jelly: { name: 'Slime Jelly', type: 'junk', rarity: 'common', value: 3, edible: 6, desc: 'Crafting material. Technically edible.' },
  j_tail: { name: 'Rat Tail', type: 'junk', rarity: 'common', value: 2, edible: 4, desc: 'Crafting material. Technically edible.' },
  j_feather: { name: 'Pigeon Feather', type: 'junk', rarity: 'common', value: 1, desc: 'Crafting material for the bench.' },
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
  box_rusty: [['potion_heal', 5, 1, 2], ['food_pretzel', 4, 1, 3], ['food_hotdog', 2, 1, 1], ['bomb', 3, 1, 2], ['potion_mystery', 2, 1, 1], ['w_pipe', 1, 1, 1], ['a_vest', 1, 1, 1], ['j_wire', 3, 1, 2], ['potion_mana', 2, 1, 1], ['potion_radar', 2, 1, 1], ['potion_path', 2, 1, 1], ['scroll_venom', 1, 1, 1], ['scroll_iron', 1, 1, 1], ['h_cap', 1, 1, 1], ['s_tee', 1, 1, 1], ['r_band', 1, 1, 1], ['f_flops', 1, 1, 1], ['j_feather', 2, 1, 2], ['n_whistle', 1, 1, 1], ['g_mood', 1, 1, 1], ['l_shorts', 1, 1, 1], ['k_towel', 1, 1, 1]],
  box_silver: [['potion_heal', 4, 2, 3], ['potion_big', 3, 1, 1], ['potion_mana', 3, 1, 2], ['bomb', 3, 2, 3], ['w_bar', 2, 1, 1], ['a_jacket', 2, 1, 1], ['potion_mystery', 2, 1, 2], ['box_rusty', 1, 1, 2], ['potion_radar', 2, 1, 2], ['potion_path', 2, 1, 1], ['scroll_frost', 1, 1, 1], ['scroll_mend', 1, 1, 1], ['scroll_leech', 1, 1, 1], ['h_hardhat', 1, 1, 1], ['s_flannel', 1, 1, 1], ['r_watch', 1, 1, 1], ['f_sneaks', 1, 1, 1], ['h_cap', 1, 1, 1], ['s_tee', 1, 1, 1], ['n_locket', 1, 1, 1], ['g_class', 1, 1, 1], ['g_signet', 1, 1, 1], ['l_jeans', 1, 1, 1], ['k_tarp', 1, 1, 1]],
  box_gold: [['potion_big', 4, 1, 2], ['bomb_big', 3, 1, 2], ['w_mic', 2, 1, 1], ['a_suit', 2, 1, 1], ['box_silver', 2, 1, 1], ['potion_mana', 3, 2, 3], ['scroll_fireball', 2, 1, 1], ['scroll_frost', 1, 1, 1], ['potion_radar', 1, 2, 2], ['h_tiara', 1, 1, 1], ['s_jersey', 1, 1, 1], ['r_cuffs', 1, 1, 1], ['f_boots', 1, 1, 1], ['s_flannel', 1, 1, 1], ['n_chain', 1, 1, 1], ['g_ruby', 1, 1, 1], ['l_cargo', 1, 1, 1], ['k_cape', 1, 1, 1]],
  box_patron: [['w_bat', 2, 1, 1], ['a_coat', 2, 1, 1], ['potion_big', 3, 2, 3], ['bomb_big', 3, 1, 2], ['box_gold', 1, 1, 1], ['potion_mystery', 2, 3, 4], ['scroll_lightning', 2, 1, 1], ['scroll_fireball', 1, 1, 1], ['h_crown', 1, 1, 1], ['s_silk', 1, 1, 1], ['r_bangle', 1, 1, 1], ['f_loafers', 1, 1, 1], ['n_pendant', 1, 1, 1], ['g_band', 1, 1, 1], ['l_tux', 1, 1, 1], ['k_mink', 1, 1, 1]],
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
  venom: { school: 'poison', name: 'Venom Dart', mp: 3, target: 'one', desc: 'Poisons one mob for 3 turns.' },
  iron: { school: 'guard', name: 'Iron Skin', mp: 4, target: 'self', desc: '+4 defense for the rest of the fight.' },
  frost: { school: 'ice', name: 'Frost Snap', mp: 4, target: 'one', desc: 'Ice damage. The mob skips its next turn.' },
  mend: { school: 'heal', name: 'Mend', mp: 5, target: 'self', desc: 'Heal 30 HP plus your magic.' },
  leech: { school: 'blood', name: 'Life Leech', mp: 5, target: 'one', desc: 'Damage a mob and heal half of it.' },
  fireball: { school: 'fire', name: 'Fireball', mp: 6, target: 'all', desc: 'Fire hits every mob.' },
  lightning: { school: 'storm', name: 'Chain Lightning', mp: 8, target: 'all', desc: 'A huge shock to every mob.' },
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
// Slots you can wear things in. Both ring slots take items of type 'ring'.
export const GEAR_SLOTS = ['weapon', 'head', 'neck', 'shirt', 'armor', 'back', 'wrist', 'ring1', 'ring2', 'legs', 'shoes'];
export const GEAR_TYPES = ['weapon', 'head', 'neck', 'shirt', 'armor', 'back', 'wrist', 'ring', 'legs', 'shoes'];
export const SLOT_NAMES = { weapon: 'Weapon', head: 'Head', neck: 'Neck', shirt: 'Shirt', armor: 'Armor', back: 'Back', wrist: 'Wrist', ring: 'Ring', ring1: 'Ring 1', ring2: 'Ring 2', legs: 'Legs', shoes: 'Shoes' };
export const STAT_NAMES = { atk: 'ATK', def: 'DEF', mag: 'MAG', spd: 'SPD', luck: 'LUCK', maxHp: 'HP', maxMp: 'MP', cha: 'CHA', xpPct: 'XP%' };

// Shop prices by rarity when an item has no price of its own. Selling pays half.
export const RARITY_PRICE = { common: 6, rusty: 12, silver: 28, gold: 60, patron: 110 };

// Penny's shop gets better as you level up. Each tier unlocks at a level.
export const SHOP_TIERS = [
  { lvl: 1, rarity: 'rusty', basics: ['potion_heal', 'potion_mana', 'potion_radar', 'potion_path', 'food_hotdog', 'bomb', 'box_rusty'], scrolls: ['scroll_venom', 'scroll_iron'] },
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
  { out: 'g_washer', lvl: 1, need: { j_wire: 1, j_token: 2 } },
  { out: 'l_bags', lvl: 2, need: { j_jelly: 1, j_wire: 1 } },
  { out: 'n_lanyard', lvl: 2, need: { j_wire: 2, j_feather: 1 } },
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
