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
  lucky: { name: 'Lucky', desc: '+3 luck: more crits and luckier gambles.', mods: { luck: 3 } },
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
  // ----- More races (owner asked for more). feat adds pixels to the hero sprite: [x, y, palette letter] per view. -----
  { id: 'minotaur', name: 'Minotaur', desc: 'Charges in horns first. Your first weapon hit in every fight deals 50% more damage.', mods: { maxHp: 8, atk: 2, mag: -2, cha: -1 }, odds: 8, skin: '#8a4b2a', shade: '#5b3a29', hair: '#1a1426',
    feat: { all: [[3, 2, 'e'], [2, 1, 'e'], [2, 0, 'e'], [12, 2, 'e'], [13, 1, 'e'], [13, 0, 'e']] } },
  { id: 'catfolk', name: 'Catfolk', desc: 'Nine lives, more or less. Once per floor, a blow that would knock you out leaves you at 1 health.', mods: { spd: 2, luck: 2, maxHp: -4 }, odds: 18, skin: '#f5c542', shade: '#b8862b', hair: '#b8693a',
    feat: { all: [[4, 0, 'h'], [4, 1, 'h'], [5, 1, 'n'], [11, 0, 'h'], [11, 1, 'h'], [10, 1, 'n']] } },
  { id: 'golem', name: 'Clay Golem', desc: 'Baked hard. Mob hits deal 15% less damage, but potions heal 25% less.', mods: { def: 2, maxHp: 6, spd: -2, cha: -2 }, odds: 11, skin: '#b8693a', shade: '#8a4b2a', hair: '#8a4b2a',
    feat: { down: [[6, 5, 'y'], [9, 5, 'y'], [8, 3, 'u'], [8, 4, 'u']], left: [[5, 5, 'y'], [7, 3, 'u']], up: [[7, 3, 'u'], [7, 4, 'u']] } },
  { id: 'merfolk', name: 'Merfolk', desc: 'Built for water. Potions heal and restore MP 40% more. A bit slow on land.', mods: { maxMp: 6, mag: 2, spd: -2 }, odds: 14, skin: '#6aa0d8', shade: '#3a6ea5', hair: '#2f7a3c', over: { o: '#4fd8e8' },
    feat: { down: [[2, 4, 'c'], [1, 4, 'c'], [2, 5, 'c'], [13, 4, 'c'], [14, 4, 'c'], [13, 5, 'c']], up: [[2, 4, 'c'], [1, 4, 'c'], [2, 5, 'c'], [13, 4, 'c'], [14, 4, 'c'], [13, 5, 'c']], left: [[13, 4, 'c'], [14, 4, 'c'], [13, 5, 'c']] } },
  { id: 'imp', name: 'Imp', desc: 'A small devil with a big spark. Spells and class moves cost 1 less MP.', mods: { mag: 2, luck: 1, maxHp: -6, cha: -1 }, odds: 22, skin: '#ff8a8a', shade: '#c8334a', hair: '#1a1426',
    feat: { all: [[4, 1, 'r'], [4, 0, 'r'], [11, 1, 'r'], [11, 0, 'r']] } },
  { id: 'banshee', name: 'Banshee', desc: 'Wails as you strike. 15% chance your weapon hit stuns a mob for a turn.', mods: { mag: 2, spd: 1, maxHp: -4, cha: -2 }, odds: 24, skin: '#e8dcc0', shade: '#c9c3da', hair: '#fff6e0',
    feat: { down: [[6, 5, 'c'], [9, 5, 'c']], left: [[5, 5, 'c']] } },
  { id: 'centaur', name: 'Centaur', desc: 'Four fast hooves. Running away from a normal fight always works.', mods: { spd: 3, maxHp: 6, atk: 1, cha: -1 }, odds: 12, skin: '#e8a87c', shade: '#b8693a', hair: '#1a1426', over: { o: '#b8693a' } },
  { id: 'mushroom', name: 'Mushroom Folk', desc: 'A walking toadstool. 20% chance your weapon hit poisons a mob. Spoiled food is just food to you.', mods: { maxHp: 6, luck: 1, spd: -1, cha: -2 }, odds: 18, skin: '#fff6e0', shade: '#e8dcc0', hair: '#c8334a',
    feat: { all: [[2, 3, 'h'], [13, 3, 'h'], [2, 4, 'k'], [13, 4, 'k'], [6, 2, 'w'], [9, 2, 'w'], [4, 3, 'w'], [11, 3, 'w']] } },
];

// Classes. skill.kind picks what the class skill does in battle (see castMove).
// cannot lists spell schools the class can never learn from scrolls.
// Flags: magic (gear magic counts more), haggle (20% off in shops), hypeUp (50% more hype).
export const SCHOOL_NAMES = { poison: 'Poison', guard: 'Guard', ice: 'Ice', heal: 'Healing', blood: 'Blood', fire: 'Fire', storm: 'Storm' };
export const CLASSES = [
  { id: 'brawler', name: 'Brawler', desc: 'Heavy hits and high health.', mods: { maxHp: 10, atk: 2 }, odds: 0, coat: '#c8334a', coatLight: '#ff8a8a', cannot: ['storm', 'ice'],
    skill: { name: 'Haymaker', mp: 3, desc: 'A big punch for 1.5x damage.', target: 'one', kind: 'double' } },
  { id: 'hex', name: 'Hex-slinger', desc: 'Spells and curses.', mods: { maxMp: 10, mag: 3 }, odds: 2, coat: '#8a4fc9', coatLight: '#c49af0', cannot: ['heal'], magic: true,
    skill: { name: 'Hex Bolt', mp: 4, desc: 'Magic damage that ignores armor.', target: 'one', kind: 'bolt', color: '#c49af0' } },
  { id: 'scrapper', name: 'Scrapper', desc: 'Builds bombs from junk. Starts with 3 bombs.', mods: { luck: 2 }, odds: 2, coat: '#b8693a', coatLight: '#f5c542', cannot: ['heal', 'ice'],
    skill: { name: 'Shrapnel', mp: 4, desc: 'Hit every mob at once.', target: 'all', kind: 'shrapnel' } },
  { id: 'talker', name: 'Smooth Talker', desc: 'Rattles mobs with words and gets better deals.', mods: { luck: 2, def: 1, cha: 4 }, odds: 4, coat: '#3a6ea5', coatLight: '#6aa0d8', cannot: ['fire', 'blood'], haggle: true,
    skill: { name: 'Talk Down', mp: 3, desc: 'Rattle one mob: it loses its next turn and takes 30% more damage.', target: 'one', kind: 'talk' } },
  { id: 'showboat', name: 'Showboat', desc: 'Wins over the audience for bigger gifts.', mods: { spd: 1, cha: 3 }, odds: 3, coat: '#f5c542', coatLight: '#fff6e0', cannot: ['poison'], hypeUp: true,
    skill: { name: 'Showstopper', mp: 3, desc: 'A flashy hit worth 2 hype.', target: 'one', kind: 'flashy' } },
  { id: 'medic', name: 'Field Medic', desc: 'Keeps themself alive no matter what.', mods: { maxHp: 6, maxMp: 6, mag: 1 }, odds: 3, coat: '#e8dcc0', coatLight: '#fff6e0', cannot: ['blood', 'poison', 'fire'],
    skill: { name: 'Patch Up', mp: 4, desc: 'Heal 15 HP plus 1.2 times your magic.', target: 'self', kind: 'heal' } },
  { id: 'knight', name: 'Mall Knight', desc: 'Armor and shields. Hard to knock down.', mods: { def: 3, maxHp: 6, spd: -1 }, odds: 1, coat: '#8b84a3', coatLight: '#e8dcc0', cannot: ['poison', 'blood'],
    skill: { name: 'Shield Bash', mp: 4, desc: 'A hit that stuns one mob for a turn.', target: 'one', kind: 'stun' } },
  { id: 'rogue', name: 'Pickpocket', desc: 'Quick hands, quicker feet.', mods: { spd: 2, luck: 2, cha: 1 }, odds: 5, coat: '#2f7a3c', coatLight: '#6bbf59', cannot: ['heal', 'guard'],
    skill: { name: 'Back Alley', mp: 3, desc: 'A sneaky hit that also steals tokens.', target: 'one', kind: 'steal' } },
  { id: 'pyro', name: 'Pyromaniac', desc: 'Sets everything on fire. Everything.', mods: { mag: 3, maxMp: 4 }, odds: 6, coat: '#ff8a3a', coatLight: '#f5c542', cannot: ['ice', 'heal'], magic: true,
    skill: { name: 'Flame Burst', mp: 5, desc: 'Magic fire hits every mob.', target: 'all', kind: 'burst', color: '#ff8a3a' } },
  { id: 'frost', name: 'Frost Witch', desc: 'Cold spells that freeze mobs in place.', mods: { mag: 2, maxMp: 6 }, odds: 5, coat: '#4fd8e8', coatLight: '#e8dcc0', cannot: ['fire'], magic: true,
    skill: { name: 'Cold Shoulder', mp: 4, desc: 'Ice damage that freezes one mob.', target: 'one', kind: 'freeze' } },
  { id: 'vamp', name: 'Night Shift Vampire', desc: 'Drinks life from mobs. Hates daylight anyway.', mods: { atk: 1, mag: 2, maxHp: 4 }, odds: 7, coat: '#7a1c2e', coatLight: '#c8334a', cannot: ['heal', 'fire'],
    skill: { name: 'Blood Siphon', mp: 4, desc: 'Damage one mob and heal some of it back.', target: 'one', kind: 'drain' } },
  { id: 'druid', name: 'Park Druid', desc: 'Weeds, thorns and nature that bites back.', mods: { mag: 2, maxHp: 4, luck: 1 }, odds: 4, coat: '#6bbf59', coatLight: '#b8e05a', cannot: ['fire', 'storm'], magic: true,
    skill: { name: 'Thornwhip', mp: 3, desc: 'Damage and poison one mob.', target: 'one', kind: 'poison' } },
  { id: 'monk', name: 'Yoga Monk', desc: 'Calm, centered, and very fast with their fists.', mods: { spd: 3, atk: 1 }, odds: 3, coat: '#f5c542', coatLight: '#ff8a3a', cannot: ['fire', 'poison', 'blood'],
    skill: { name: 'Flurry', mp: 4, desc: 'Three quick punches.', target: 'one', kind: 'multi' } },
  { id: 'bard', name: 'Karaoke Bard', desc: 'Sings so badly it inspires. Great with crowds.', mods: { cha: 4, maxMp: 4 }, odds: 6, coat: '#ff5fa2', coatLight: '#f5c542', cannot: ['blood', 'poison'], haggle: true, hypeUp: true,
    skill: { name: 'Power Ballad', mp: 3, desc: '+3 attack for the rest of the fight, plus hype.', target: 'self', kind: 'song' } },
  { id: 'berserk', name: 'Berserker', desc: 'All rage, no spells. Hits like a truck.', mods: { atk: 4, maxHp: 8, def: -2, cha: -2 }, odds: 2, coat: '#7a1c2e', coatLight: '#ff8a8a', cannot: ['heal', 'guard', 'ice', 'storm'],
    skill: { name: 'Rampage', mp: 4, desc: 'Hit every mob with your weapon.', target: 'all', kind: 'rampage' } },
  { id: 'sniper', name: 'Arcade Sniper', desc: 'Never misses. Won every prize at the fair.', mods: { luck: 3, spd: 1 }, odds: 4, coat: '#3a6ea5', coatLight: '#4fd8e8', cannot: ['heal'],
    skill: { name: 'Headshot', mp: 6, desc: 'A 1.4x hit that ignores armor.', target: 'one', kind: 'crit' } },
  { id: 'warden', name: 'Bouncer Warden', desc: 'Stands in the door and does not move.', mods: { def: 2, maxHp: 12, spd: -1 }, odds: 1, coat: '#1a1426', coatLight: '#5a5373', cannot: ['fire', 'storm'],
    skill: { name: 'Hunker Down', mp: 3, desc: '+5 defense this fight and heal 8.', target: 'self', kind: 'guard' } },
  { id: 'trick', name: 'Trickster', desc: 'Smoke, mirrors and pocket sand.', mods: { spd: 2, luck: 2, cha: 1 }, odds: 6, coat: '#8a4fc9', coatLight: '#4fd8e8', cannot: ['blood'],
    skill: { name: 'Pocket Sand', mp: 4, desc: 'Every mob has a 60% chance to lose its next turn.', target: 'all', kind: 'blind' } },
  { id: 'necro', name: 'Basement Necromancer', desc: 'Curses and creepy whispers.', mods: { mag: 3, maxMp: 6, cha: -2 }, odds: 7, coat: '#1a1426', coatLight: '#8a4fc9', cannot: ['heal'], magic: true,
    skill: { name: 'Grave Chill', mp: 4, desc: 'Magic damage and the mob hits 3 weaker for the fight.', target: 'one', kind: 'curse' } },
  { id: 'storm', name: 'Storm Caller', desc: 'Weather in a bottle. Mostly lightning.', mods: { mag: 3, spd: 1 }, odds: 5, coat: '#3a6ea5', coatLight: '#f5c542', cannot: ['ice', 'poison'], magic: true,
    skill: { name: 'Static Snap', mp: 4, desc: 'Lightning that ignores armor.', target: 'one', kind: 'bolt', color: '#f5c542' } },
  // ----- More classes (1.0.20): each run offers 8 at random from the whole list. -----
  { id: 'grill', name: 'Grill Master', desc: 'Weekend barbecue legend. Everything gets seared.', mods: { maxHp: 6, mag: 2, atk: 1 }, odds: 4, coat: '#c8334a', coatLight: '#fff6e0', cannot: ['ice', 'storm'],
    skill: { name: 'Grease Fire', mp: 5, desc: 'A flare-up that hits every mob.', target: 'all', kind: 'burst', color: '#ff8a3a' } },
  { id: 'courier', name: 'Bike Courier', desc: 'Weaves through traffic and through mobs.', mods: { spd: 3, luck: 1 }, odds: 4, coat: '#f5c542', coatLight: '#1a1426', cannot: ['heal', 'blood'],
    skill: { name: 'Drive-By', mp: 4, desc: 'Three quick hits as you ride past.', target: 'one', kind: 'multi' } },
  { id: 'janitor', name: 'Night Janitor', desc: 'Has seen things in this building. Wet floors are a weapon.', mods: { def: 1, maxHp: 6, luck: 1 }, odds: 5, coat: '#5a5373', coatLight: '#4fd8e8', cannot: ['fire'],
    skill: { name: 'Mop Slick', mp: 4, desc: 'Every mob has a 60% chance to slip and lose its next turn.', target: 'all', kind: 'blind' } },
  { id: 'lifeguard', name: 'Off-Duty Lifeguard', desc: 'Strong swimmer, stronger whistle.', mods: { maxHp: 8, spd: 1, maxMp: 2 }, odds: 3, coat: '#c8334a', coatLight: '#f5c542', cannot: ['fire', 'blood'],
    skill: { name: 'Rescue Breath', mp: 4, desc: 'Heal 15 HP plus 1.2 times your magic.', target: 'self', kind: 'heal' } },
  { id: 'plumber', name: 'Emergency Plumber', desc: 'On call 24/7. Carries a very large wrench.', mods: { atk: 2, def: 1, maxHp: 4 }, odds: 3, coat: '#3a6ea5', coatLight: '#8b84a3', cannot: ['fire', 'storm'],
    skill: { name: 'Wrench Whack', mp: 4, desc: 'A hit that stuns one mob for a turn.', target: 'one', kind: 'stun' } },
  { id: 'dj', name: 'Club DJ', desc: 'Reads the room. Drops the beat at the perfect moment.', mods: { cha: 3, spd: 1, maxMp: 3 }, odds: 5, coat: '#1a1426', coatLight: '#ff5fa2', cannot: ['ice', 'blood'], hypeUp: true,
    skill: { name: 'Drop the Beat', mp: 3, desc: '+3 attack for the rest of the fight, plus hype.', target: 'self', kind: 'song' } },
  { id: 'astro', name: 'Mall Astrologer', desc: 'Your stars say this mob is having a bad week.', mods: { mag: 3, maxMp: 5, cha: 1 }, odds: 6, coat: '#8a4fc9', coatLight: '#f5c542', cannot: ['guard'], magic: true,
    skill: { name: 'Bad Horoscope', mp: 4, desc: 'Magic damage and the mob hits 3 weaker for the fight.', target: 'one', kind: 'curse' } },
  { id: 'bees', name: 'Rooftop Beekeeper', desc: 'Brought the bees. The bees are not happy.', mods: { mag: 2, maxHp: 4, def: 1 }, odds: 5, coat: '#fff6e0', coatLight: '#f5c542', cannot: ['fire'], magic: true,
    skill: { name: 'Angry Swarm', mp: 3, desc: 'Damage and poison one mob.', target: 'one', kind: 'poison' } },
  { id: 'mime', name: 'Street Mime', desc: 'Never says a word. Somehow very persuasive.', mods: { cha: 3, spd: 1, luck: 1 }, odds: 5, coat: '#1a1426', coatLight: '#fff6e0', cannot: ['storm', 'fire'],
    skill: { name: 'Silent Treatment', mp: 3, desc: 'Rattle one mob: it loses its next turn and takes 30% more damage.', target: 'one', kind: 'talk' } },
  { id: 'sparky', name: 'Rogue Electrician', desc: 'Not licensed. Very confident.', mods: { mag: 3, def: 1 }, odds: 5, coat: '#f5c542', coatLight: '#3a6ea5', cannot: ['ice', 'heal'], magic: true,
    skill: { name: 'Live Wire', mp: 4, desc: 'Lightning that ignores armor.', target: 'one', kind: 'bolt', color: '#f5c542' } },
  { id: 'icecream', name: 'Ice Cream Driver', desc: 'The jingle means danger now.', mods: { mag: 2, maxMp: 4, cha: 1 }, odds: 5, coat: '#ff5fa2', coatLight: '#4fd8e8', cannot: ['fire', 'blood'], magic: true,
    skill: { name: 'Brain Freeze', mp: 4, desc: 'Ice damage that freezes one mob.', target: 'one', kind: 'freeze' } },
  { id: 'collector', name: 'Debt Collector', desc: 'Everyone owes you something. Penny gives you a discount.', mods: { atk: 1, luck: 2, cha: 1 }, odds: 4, coat: '#1a1426', coatLight: '#f5c542', cannot: ['heal'], haggle: true,
    skill: { name: 'Collections', mp: 3, desc: 'A sneaky hit that also steals tokens.', target: 'one', kind: 'steal' } },
  { id: 'tackle', name: 'Retired Linebacker', desc: 'Bad knees. Great shoulders.', mods: { maxHp: 12, atk: 2, spd: -1 }, odds: 1, coat: '#2f7a3c', coatLight: '#fff6e0', cannot: ['ice', 'storm', 'poison'],
    skill: { name: 'Blindside', mp: 3, desc: 'A tackle for 1.5x damage.', target: 'one', kind: 'double' } },
  { id: 'influencer', name: 'Influencer', desc: 'Lives for the camera. The Patrons eat it up.', mods: { cha: 4, spd: 1 }, odds: 6, coat: '#ff5fa2', coatLight: '#fff6e0', cannot: ['blood', 'guard'], hypeUp: true,
    skill: { name: 'Go Viral', mp: 3, desc: 'A flashy hit worth 2 hype.', target: 'one', kind: 'flashy' } },
  { id: 'lumber', name: 'Lumberjack', desc: 'Swings big, swings wide, yells TIMBER.', mods: { atk: 3, maxHp: 10, mag: -1 }, odds: 2, coat: '#c8334a', coatLight: '#1a1426', cannot: ['heal', 'storm'],
    skill: { name: 'Timber!', mp: 4, desc: 'Hit every mob with your weapon.', target: 'all', kind: 'rampage' } },
  { id: 'dentist', name: 'Strip Mall Dentist', desc: 'Steady hands. Finds the soft spot every time.', mods: { luck: 2, mag: 1, atk: 1 }, odds: 4, coat: '#e8dcc0', coatLight: '#4fd8e8', cannot: ['blood'],
    skill: { name: 'Root Canal', mp: 6, desc: 'A 1.4x hit that ignores armor.', target: 'one', kind: 'crit' } },
  { id: 'derby', name: 'Roller Derby Jammer', desc: 'Elbows out. Wheels down.', mods: { spd: 2, atk: 1, maxHp: 4 }, odds: 3, coat: '#8a4fc9', coatLight: '#ff5fa2', cannot: ['heal', 'ice'],
    skill: { name: 'Pileup', mp: 4, desc: 'Crash into every mob at once.', target: 'all', kind: 'shrapnel' } },
  { id: 'mallcop', name: 'Mall Cop', desc: 'Has a badge. It is plastic. Takes it very seriously.', mods: { def: 2, maxHp: 8, cha: 1 }, odds: 2, coat: '#3a6ea5', coatLight: '#e8dcc0', cannot: ['fire', 'poison'],
    skill: { name: 'Hold the Line', mp: 3, desc: '+5 defense this fight and heal 8.', target: 'self', kind: 'guard' } },
  { id: 'ghost', name: 'Ghost Hunter', desc: 'Owns a vacuum for spirits. It also works on mobs.', mods: { mag: 3, luck: 1, maxMp: 3 }, odds: 6, coat: '#5a5373', coatLight: '#6bbf59', cannot: ['heal', 'fire'], magic: true,
    skill: { name: 'Spirit Vacuum', mp: 4, desc: 'Damage one mob and heal some of it back.', target: 'one', kind: 'drain' } },
  // ----- New classes (classes update): each has its own move type nobody else has. -----
  { id: 'repo', name: 'Repo Agent', desc: 'Takes back what is owed. Finishes off whatever is limping.', mods: { atk: 2, luck: 1 }, odds: 4, coat: '#5a5373', coatLight: '#f5c542', cannot: ['heal', 'ice'],
    skill: { name: 'Final Notice', desc: 'A hit that does double damage to a mob under a third of its health.', target: 'one', kind: 'execute' } },
  { id: 'wrecker', name: 'Demolition Crew', desc: 'Hard hat, harder hammer. Armor is just a wall with legs.', mods: { atk: 2, maxHp: 6, spd: -1 }, odds: 2, coat: '#f5c542', coatLight: '#ff8a3a', cannot: ['ice', 'storm', 'heal'],
    skill: { name: 'Jackhammer', desc: 'A hit that ignores armor and cracks it: the mob loses 2 defense for the fight.', target: 'one', kind: 'shred' } },
  { id: 'fencer', name: 'Fencing Coach', desc: 'Light on their feet. Waits for you to make the mistake.', mods: { spd: 2, def: 1 }, odds: 3, coat: '#fff6e0', coatLight: '#3a6ea5', cannot: ['poison', 'blood'],
    skill: { name: 'En Garde', desc: 'Ready a parry. The next hit on you is halved and you hit back for the same amount.', target: 'self', kind: 'parry' } },
  { id: 'shark', name: 'Card Shark', desc: 'Counts cards, bends odds, and bets on themself every time.', mods: { luck: 4, cha: 1 }, odds: 8, coat: '#2f7a3c', coatLight: '#c8334a', cannot: ['guard'],
    skill: { name: 'Double or Nothing', desc: 'A coin flip: a huge 2.2x hit or a weak 0.4x one. Luck tips the coin.', target: 'one', kind: 'gamble' } },
  { id: 'auditor', name: 'Tax Auditor', desc: 'Finds every loose coin. Including your mana.', mods: { mag: 2, maxMp: 6, cha: -1 }, odds: 5, coat: '#8b84a3', coatLight: '#e8dcc0', cannot: ['blood', 'fire'], magic: true,
    skill: { name: 'Audit', desc: 'Magic damage that pays you back 2 MP.', target: 'one', kind: 'audit', color: '#6bbf59' } },
  { id: 'pinball', name: 'Pinball Wizard', desc: 'High score on every machine in the arcade. Tilts reality.', mods: { mag: 3, luck: 1 }, odds: 6, coat: '#ff5fa2', coatLight: '#4fd8e8', cannot: ['guard', 'heal'], magic: true,
    skill: { name: 'Multiball', desc: 'A magic ball bounces 3 times between random mobs.', target: 'all', kind: 'chain' } },
  { id: 'dummy', name: 'Crash Test Dummy', desc: 'Built to take hits. Gives them out too, at a cost.', mods: { maxHp: 14, def: 1, mag: -1 }, odds: 3, coat: '#f5c542', coatLight: '#1a1426', cannot: ['heal', 'storm', 'ice'],
    skill: { name: 'Full Impact', desc: 'A 1.9x hit that also costs you 8% of your max HP.', target: 'one', kind: 'reckless' } },
  { id: 'butcher', name: 'Butcher', desc: 'Knows every cut. Mobs are just meat that fights back.', mods: { atk: 2, maxHp: 4 }, odds: 3, coat: '#fff6e0', coatLight: '#c8334a', cannot: ['ice', 'storm'],
    skill: { name: 'Meat Cleaver', desc: 'A deep cut. The mob bleeds for 3 turns, and bleeding ignores armor.', target: 'one', kind: 'bleed' } },
  { id: 'packer', name: 'Warehouse Packer', desc: 'Wraps anything in anything. Including themself.', mods: { def: 1, maxHp: 6, mag: 1 }, odds: 3, coat: '#b8693a', coatLight: '#e8dcc0', cannot: ['fire', 'blood'],
    skill: { name: 'Bubble Wrap', desc: 'Wrap yourself in a shield that soaks 10 plus 1.5 times your magic in damage.', target: 'self', kind: 'barrier' } },
  { id: 'bounty', name: 'Bounty Hunter', desc: 'Picks a target and never lets it go.', mods: { atk: 1, luck: 2, spd: 1 }, odds: 4, coat: '#7a1c2e', coatLight: '#f5c542', cannot: ['heal'],
    skill: { name: 'Wanted Poster', desc: 'A light hit that marks one mob. Every hit on it does 30% more for the fight.', target: 'one', kind: 'mark' } },
];
// Class move costs, set by what the move does so every class pays the same for the same power (balance pass 1.0.22).
const KIND_MP = { double: 4, bolt: 4, flashy: 3, shrapnel: 5, talk: 3, heal: 4, stun: 4, steal: 3, burst: 5, freeze: 4, drain: 4, poison: 4, multi: 4, song: 3, rampage: 5, crit: 5, guard: 3, blind: 4, curse: 4,
  execute: 4, shred: 4, parry: 3, gamble: 4, audit: 4, chain: 5, reckless: 4, bleed: 4, barrier: 4, mark: 3 };
for (const c of CLASSES) if (KIND_MP[c.skill.kind]) c.skill.mp = KIND_MP[c.skill.kind];


export const RARITY = {
  common: { name: 'Common', color: '#c9c3da' },
  rusty: { name: 'Rusty', color: '#d08a5a' },
  silver: { name: 'Silver', color: '#e8e4f4' },
  gold: { name: 'Gold', color: '#f5c542' },
  patron: { name: "Patron's Pick", color: '#c49af0' },
};
export const RARITY_ORDER = ['patron', 'gold', 'silver', 'rusty', 'common'];

// type: potion | food | bomb | scroll | junk | box, or a gear slot: weapon | head | shirt | armor | wrist | shoes
const BASE_ITEMS = {
  potion_heal: { name: 'Health Potion', type: 'potion', rarity: 'common', heal: 25, healPct: 30, price: 8, desc: 'Heals 30% of your max HP (at least 25).' },
  potion_big: { name: 'Big Health Potion', type: 'potion', rarity: 'silver', heal: 60, healPct: 60, desc: 'Heals 60% of your max HP (at least 60).' },
  potion_mana: { name: 'Mana Potion', type: 'potion', rarity: 'common', mana: 12, price: 10, desc: 'Restores 12 MP.' },
  potion_mana_big: { name: 'Big Mana Potion', type: 'potion', rarity: 'silver', mana: 35, price: 26, desc: 'Restores 35 MP.' },
  potion_path: { name: 'Boss Compass Potion', type: 'potion', rarity: 'rusty', guide: 120, price: 15, desc: 'Draws the way to the nearest boss on your maps for 120 seconds of play.' },
  potion_safe: { name: 'Safe Room Compass', type: 'potion', rarity: 'rusty', safeGuide: 90, price: 10, desc: 'Draws the way to the nearest safe room you have not visited on your maps for 90 seconds of play.' },
  potion_radar: { name: 'Mob Radar Potion', type: 'potion', rarity: 'rusty', radar: 60, price: 12, desc: 'Shows every mob on your map for 60 seconds of play.' },
  potion_mystery: { name: 'Mystery Potion', type: 'potion', rarity: 'rusty', mystery: true, desc: 'Who knows? Not BOOKIE.' },
  food_pretzel: { name: 'Stale Pretzel', type: 'food', rarity: 'common', heal: 8, desc: 'Heals 8. Crunchy in a bad way.' },
  food_hotdog: { name: 'Station Hot Dog', type: 'food', rarity: 'rusty', heal: 16, desc: 'Heals 16. Do not ask what is in it.' },
  // Floor 2 food: heals a little and gives a buff for your next fight. Some of it has gone bad.
  food_taco: { name: 'Hot Sauce Taco', type: 'food', rarity: 'rusty', heal: 20, buff: { atk: 4 }, desc: 'Heals 20 and +4 attack for your next fight.' },
  food_smoothie: { name: 'Kale Smoothie', type: 'food', rarity: 'rusty', heal: 20, buff: { def: 4 }, desc: 'Heals 20 and +4 defense for your next fight.' },
  food_espresso: { name: 'Triple Espresso', type: 'food', rarity: 'silver', heal: 10, mana: 10, buff: { spd: 4 }, desc: 'Heals 10, +10 MP and +4 speed for your next fight.' },
  food_mystery: { name: 'Mystery Meat Skewer', type: 'food', rarity: 'common', heal: 30, spoil: 0.35, desc: 'Heals 30. Has a 35% chance it went bad and poisons you instead.' },
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
  j_scrap: { name: 'Scrap', type: 'junk', rarity: 'common', value: 0, nosell: true, desc: 'From breaking down gear at the bench. Stands in for any missing material when you upgrade gear.' },
  j_dust: { name: 'Glow Dust', type: 'junk', rarity: 'common', value: 4, price: 12, desc: 'Enchanting material. Use it at the workbench (Enchant tab).' },
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

// Floor tagged gear: "w_pipe@2" is a Rusty Pipe found on Floor 2. Its stats and price grow with the floor
// (see FLOORS size below), so gear from deeper floors replaces older gear. Floor 1 gear has no tag.
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const SCALED = ['atk', 'def', 'mag', 'spd', 'maxHp', 'maxMp'];
const GEAR_KINDS = ['weapon', 'head', 'neck', 'shirt', 'armor', 'back', 'wrist', 'ring', 'legs', 'shoes'];
const tierCache = new Map();
function tierItem(key) {
  if (tierCache.has(key)) return tierCache.get(key);
  const [base, t] = key.split('@');
  const b = BASE_ITEMS[base], tier = Number(t);
  let it;
  if (b && GEAR_KINDS.includes(b.type) && tier >= 2 && tier <= 10) {
    const m = floorSize(tier);
    it = { ...b, base, tier, name: b.name + ' ' + ROMAN[tier], price: Math.round((b.price || RARITY_PRICE[b.rarity] || 6) * m) };
    for (const k of SCALED) if (b[k] > 0) it[k] = Math.max(b[k] + 1, Math.round(b[k] * m));
    const parts = SCALED.filter((k) => it[k]).map((k) => (it[k] > 0 ? '+' : '') + it[k] + ' ' + { atk: 'attack', def: 'defense', mag: 'magic', spd: 'speed', maxHp: 'HP', maxMp: 'MP' }[k]);
    it.desc = 'Floor ' + tier + ' gear: ' + parts.join(', ') + '.';
  }
  tierCache.set(key, it);
  return it;
}
export const ITEMS = new Proxy(BASE_ITEMS, {
  get(t, k) { return typeof k === 'string' && !(k in t) && k.includes('@') ? tierItem(k) : t[k]; },
  has(t, k) { return k in t || (typeof k === 'string' && k.includes('@') && !!tierItem(k)); },
});
// The plain item id under a floor tag ("w_pipe@2" -> "w_pipe").
export function baseId(id) { return String(id).split('@')[0]; }

// What each loot box tier can hold. [itemId, weight, minCount, maxCount]
export const LOOT = {
  box_rusty: [['potion_heal', 5, 1, 2], ['food_pretzel', 4, 1, 3], ['food_hotdog', 2, 1, 1], ['bomb', 3, 1, 2], ['potion_mystery', 2, 1, 1], ['w_pipe', 1, 1, 1], ['a_vest', 1, 1, 1], ['j_wire', 3, 1, 2], ['potion_mana', 2, 1, 1], ['potion_radar', 2, 1, 1], ['potion_path', 2, 1, 1], ['potion_safe', 2, 1, 1], ['scroll_venom', 1, 1, 1], ['scroll_iron', 1, 1, 1], ['h_cap', 1, 1, 1], ['s_tee', 1, 1, 1], ['r_band', 1, 1, 1], ['f_flops', 1, 1, 1], ['j_feather', 2, 1, 2], ['n_whistle', 1, 1, 1], ['g_mood', 1, 1, 1], ['l_shorts', 1, 1, 1], ['k_towel', 1, 1, 1], ['j_dust', 1, 1, 1]],
  box_silver: [['potion_heal', 4, 2, 3], ['potion_big', 3, 1, 1], ['potion_mana', 3, 1, 2], ['potion_mana_big', 1, 1, 1], ['bomb', 3, 2, 3], ['w_bar', 2, 1, 1], ['a_jacket', 2, 1, 1], ['potion_mystery', 2, 1, 2], ['box_rusty', 1, 1, 2], ['potion_radar', 2, 1, 2], ['potion_path', 2, 1, 1], ['scroll_frost', 1, 1, 1], ['scroll_mend', 1, 1, 1], ['scroll_leech', 1, 1, 1], ['h_hardhat', 1, 1, 1], ['s_flannel', 1, 1, 1], ['r_watch', 1, 1, 1], ['f_sneaks', 1, 1, 1], ['h_cap', 1, 1, 1], ['s_tee', 1, 1, 1], ['n_locket', 1, 1, 1], ['g_class', 1, 1, 1], ['g_signet', 1, 1, 1], ['l_jeans', 1, 1, 1], ['k_tarp', 1, 1, 1], ['j_dust', 3, 1, 2]],
  box_gold: [['potion_big', 4, 1, 2], ['bomb_big', 3, 1, 2], ['w_mic', 2, 1, 1], ['a_suit', 2, 1, 1], ['box_silver', 2, 1, 1], ['potion_mana', 2, 1, 2], ['potion_mana_big', 2, 1, 2], ['scroll_fireball', 2, 1, 1], ['scroll_frost', 1, 1, 1], ['potion_radar', 1, 2, 2], ['h_tiara', 1, 1, 1], ['s_jersey', 1, 1, 1], ['r_cuffs', 1, 1, 1], ['f_boots', 1, 1, 1], ['s_flannel', 1, 1, 1], ['n_chain', 1, 1, 1], ['g_ruby', 1, 1, 1], ['l_cargo', 1, 1, 1], ['k_cape', 1, 1, 1], ['j_dust', 3, 2, 3]],
  box_patron: [['w_bat', 2, 1, 1], ['a_coat', 2, 1, 1], ['potion_big', 3, 2, 3], ['potion_mana_big', 3, 1, 2], ['bomb_big', 3, 1, 2], ['box_gold', 1, 1, 1], ['potion_mystery', 2, 3, 4], ['scroll_lightning', 2, 1, 1], ['scroll_fireball', 1, 1, 1], ['h_crown', 1, 1, 1], ['s_silk', 1, 1, 1], ['r_bangle', 1, 1, 1], ['f_loafers', 1, 1, 1], ['n_pendant', 1, 1, 1], ['g_band', 1, 1, 1], ['l_tux', 1, 1, 1], ['k_mink', 1, 1, 1], ['j_dust', 2, 3, 4]],
};
// Halved for Floor 3 (owner banked 13,751 tokens by the end of Floor 2).
export const BOX_TOKENS = { box_rusty: [1, 4], box_silver: [4, 8], box_gold: [9, 15], box_patron: [12, 25] };

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
  roach: { name: 'Third Rail Roach', sprite: 'roach', hp: 10, atk: 4, def: 2, spd: 8, xp: 5, tokens: [0, 3], drops: ['j_wire', 'j_token'] },
  bat: { name: 'Tunnel Bat', sprite: 'bat', hp: 9, atk: 5, def: 0, spd: 10, xp: 5, tokens: [0, 3], drops: ['j_feather', 'j_tail'] },
  mannequin: { name: 'Lost Mannequin', sprite: 'mannequin', hp: 20, atk: 5, def: 3, spd: 2, xp: 9, tokens: [2, 5], drops: ['j_wire', 'j_scrap'] },
  trashcan: { name: 'Trash Can Mimic', sprite: 'trashcan', hp: 18, atk: 6, def: 3, spd: 4, xp: 9, tokens: [2, 6], drops: ['j_scrap', 'j_token', 'j_jelly'] },
  // Floor 2: The Food Court. healer: may patch up a hurt friend instead of attacking. poison: chance to poison on hit.
  nugget: { name: 'Nugget Swarm', sprite: 'nugget', hp: 9, atk: 5, def: 0, spd: 9, xp: 5, tokens: [0, 3], drops: ['j_feather', 'food_mystery'] },
  fizz: { name: 'Fizz Cup', sprite: 'fizz', hp: 12, atk: 5, def: 1, spd: 6, xp: 6, tokens: [1, 4], healer: true, drops: ['j_jelly', 'food_espresso'] },
  meatball: { name: 'Rolling Meatball', sprite: 'meatball', hp: 19, atk: 6, def: 3, spd: 2, xp: 9, tokens: [2, 5], drops: ['j_scrap', 'food_mystery'] },
  busboy: { name: 'Zombie Busboy', sprite: 'busboy', hp: 16, atk: 6, def: 2, spd: 4, xp: 8, tokens: [2, 6], healer: true, drops: ['j_token', 'j_wire', 'food_taco'] },
  pizza: { name: 'Cold Pizza Slice', sprite: 'pizza', hp: 12, atk: 5, def: 1, spd: 5, xp: 6, tokens: [1, 4], poison: 0.25, drops: ['j_tail', 'food_smoothie'] },
  // Floor 3: The Parking Garage. rally: may blare an alarm that makes every friend hit harder.
  // bleed: chance to make you bleed on hit. fine: chance to take tokens on hit (you get half back if you win).
  // steal: chance to swipe an item (you get it back if you win).
  cone: { name: 'Traffic Cone Brute', sprite: 'cone', hp: 22, atk: 6, def: 5, spd: 2, xp: 10, tokens: [1, 4], drops: ['j_scrap', 'j_wire'] },
  alarm: { name: 'Car Alarm Banshee', sprite: 'alarm', hp: 12, atk: 5, def: 1, spd: 8, xp: 8, tokens: [1, 3], rally: true, drops: ['j_wire', 'food_espresso'] },
  tire: { name: 'Tire Shredder', sprite: 'tire', hp: 15, atk: 7, def: 2, spd: 7, xp: 8, tokens: [1, 3], bleed: 0.3, drops: ['j_scrap', 'j_tail'] },
  meter: { name: 'Parking Meter Mimic', sprite: 'meter', hp: 18, atk: 6, def: 4, spd: 3, xp: 9, tokens: [2, 5], fine: 0.4, drops: ['j_token', 'j_wire'] },
  valet: { name: 'Valet Ghoul', sprite: 'valet', hp: 16, atk: 7, def: 2, spd: 6, xp: 9, tokens: [1, 4], steal: 0.3, drops: ['j_token', 'food_taco'] },
};
export const BOSSES = {
  // Boss stats are set for their floor and do not grow with your level (see FLOORS).
  king: { name: 'The Turnstile King', sprite: 'king', hp: 230, atk: 19, def: 5, spd: 4, xp: 120, tokens: [30, 45], drop: 'w_bar', special: 'Fare Check', angry: 'FARE INCREASE! The King is angry now.', intro: '"No ticket? No exit. No mercy."', announce: 'Ladies, gentlemen and billionaires: THE TURNSTILE KING!' },
  hoarder: { name: 'The Lost and Found Hoarder', sprite: 'hoarder', hp: 210, atk: 17, def: 6, spd: 5, xp: 110, tokens: [25, 40], drop: 'scroll_fireball', special: 'Grabby Hands', angry: 'The Hoarder is getting desperate. Hold onto your stuff!', intro: '"Finders keepers. Losers... also mine."', announce: 'From the depths of the lost property office: THE HOARDER!' },
  frycook: { name: 'The Fry Cook Tyrant', sprite: 'frycook', hp: 300, atk: 25, def: 7, spd: 5, xp: 230, tokens: [45, 65], drop: 'w_mic', special: 'Grease Fire', angry: 'The fryer is boiling over! The Tyrant is furious!', intro: '"Order up! You\'re the order."', announce: 'Straight from the grill of doom: THE FRY COOK TYRANT!' },
  towtruck: { name: 'The Tow Truck Titan', sprite: 'towtruck', hp: 470, atk: 34, def: 10, spd: 4, xp: 380, tokens: [50, 70], drop: 'f_boots', special: 'Hook and Drag', angry: 'The engine roars! The Titan is moving twice as fast!', intro: '"You\'re parked in a tow zone. Forever."', announce: 'Eighteen wheels of bad news: THE TOW TRUCK TITAN!' },
  metermaid: { name: 'The Meter Maid', sprite: 'metermaid', hp: 430, atk: 32, def: 9, spd: 6, xp: 380, tokens: [50, 70], drop: 'r_cuffs', special: 'Boot Clamp', angry: 'She calls for backup! Ticket Drones incoming!', intro: '"Your time has expired. So have you."', announce: 'She has never once accepted an excuse: THE METER MAID!' },
  buffet: { name: 'The Buffet Blob', sprite: 'buffet', hp: 320, atk: 24, def: 6, spd: 3, xp: 230, tokens: [45, 65], drop: 'a_suit', special: 'Second Helping', angry: 'The Blob is splitting! Leftovers incoming!', intro: '"All you can eat. And I can eat YOU."', announce: 'It ate the salad bar. It ate the sneeze guard. THE BUFFET BLOB!' },
};
// Small blobs the Buffet Blob splits off. Their stats are set for Floor 2.
export const MINIONS = {
  leftover: { name: 'Leftover Blob', sprite: 'slime', atkKey: 'slime', hp: 35, atk: 12, def: 3, spd: 3, xp: 20, tokens: [3, 6] },
  // The Meter Maid calls two of these in when she gets angry. Set for Floor 3.
  drone: { name: 'Ticket Drone', sprite: 'drone', atkKey: 'drone', hp: 55, atk: 17, def: 5, spd: 8, xp: 30, tokens: [3, 6] },
};

// What each mob throws at you. proj is the shape drawn flying across the battle screen.
export const ATTACKS = {
  slime: { name: 'Slime Spit', heavy: 'Big Slime Glob', proj: 'blob', color: '#6bbf59' },
  rat: { name: 'Bone Toss', heavy: 'Gnawed Femur Fling', proj: 'bone', color: '#e8dcc0' },
  gremlin: { name: 'Ticket Barrage', heavy: 'Fine Notice Flurry', proj: 'tickets', color: '#f5c542' },
  pigeon: { name: 'Dive Bomb', heavy: 'Airborne Droppings', proj: 'blob', color: '#fff6e0' },
  roach: { name: 'Antenna Whip', heavy: 'Sparking Scuttle', proj: 'bone', color: '#8a4b2a' },
  bat: { name: 'Screech', heavy: 'Fang Dive', proj: 'blob', color: '#8a4fc9' },
  mannequin: { name: 'Plastic Slap', heavy: 'Limb Toss', proj: 'bone', color: '#e8dcc0' },
  trashcan: { name: 'Garbage Spew', heavy: 'Lid Slam', proj: 'junk', color: '#8b84a3' },
  king: { name: 'Fare Card Fling', heavy: 'Turnstile Spin', proj: 'bar', color: '#8b84a3' },
  hoarder: { name: 'Junk Avalanche', heavy: 'Umbrella Storm', proj: 'junk', color: '#b8693a' },
  nugget: { name: 'Crumb Spray', heavy: 'Deep Fried Pileup', proj: 'blob', color: '#f5c542' },
  fizz: { name: 'Soda Spray', heavy: 'Sugar Rush Blast', proj: 'blob', color: '#c8334a' },
  meatball: { name: 'Sauce Splat', heavy: 'Rolling Crush', proj: 'blob', color: '#8a4b2a' },
  busboy: { name: 'Tray Toss', heavy: 'Dish Tub Dump', proj: 'bar', color: '#e8dcc0' },
  pizza: { name: 'Cheese String', heavy: 'Crust Slap', proj: 'bone', color: '#f5c542' },
  frycook: { name: 'Spatula Smack', heavy: 'Deep Fryer Dunk', proj: 'bar', color: '#f5c542' },
  buffet: { name: 'Gravy Wave', heavy: 'Belly Flop', proj: 'blob', color: '#b8e05a' },
  cone: { name: 'Cone Bonk', heavy: 'Pylon Pile Driver', proj: 'bar', color: '#b8693a' },
  alarm: { name: 'Shriek', heavy: 'Wailing Siren', proj: 'blob', color: '#ff5fa2' },
  tire: { name: 'Spike Spin', heavy: 'Blowout', proj: 'junk', color: '#8b84a3' },
  meter: { name: 'Coin Spit', heavy: 'Expired Meter Slam', proj: 'tickets', color: '#f5c542' },
  valet: { name: 'Key Fob Fling', heavy: 'Reckless Reverse', proj: 'bar', color: '#c8334a' },
  towtruck: { name: 'Chain Whip', heavy: 'Bumper Ram', proj: 'bar', color: '#8b84a3' },
  metermaid: { name: 'Ticket Toss', heavy: 'Citation Storm', proj: 'tickets', color: '#4fd8e8' },
  drone: { name: 'Fine Print Laser', heavy: 'Late Fee Beam', proj: 'tickets', color: '#c8334a' },
};

// Moves you can learn from scrolls, on top of your class skill.
export const MOVES = {
  venom: { school: 'poison', name: 'Venom Dart', mp: 3, target: 'one', desc: 'Poisons one mob for 3 turns.' },
  iron: { school: 'guard', name: 'Iron Skin', mp: 4, target: 'self', desc: '+4 defense for the rest of the fight.' },
  frost: { school: 'ice', name: 'Frost Snap', mp: 4, target: 'one', desc: 'Ice damage. The mob skips its next turn.' },
  mend: { school: 'heal', name: 'Mend', mp: 5, target: 'self', desc: 'Heal 25 HP plus your magic.' },
  leech: { school: 'blood', name: 'Life Leech', mp: 5, target: 'one', desc: 'Damage a mob and heal half of it.' },
  fireball: { school: 'fire', name: 'Fireball', mp: 6, target: 'all', desc: 'Fire hits every mob.' },
  lightning: { school: 'storm', name: 'Chain Lightning', mp: 8, target: 'all', desc: 'A huge shock to every mob.' },
};

export const TRAITS = {
  armored: { name: 'Armored', desc: '+3 defense' },
  explosive: { name: 'Explosive', desc: 'Explodes when it dies' },
  cowardly: { name: 'Cowardly', desc: 'Cowers and loses a turn when hurt' },
  greedy: { name: 'Greedy', desc: 'Steals items' },
  famous: { name: 'Famous', desc: 'The audience loves seeing it lose' },
  fast: { name: 'Fast', desc: 'Sometimes acts twice' },
  toxic: { name: 'Toxic', desc: 'Poisons on hit' },
};

export const FLOOR_RULES = [
  { id: 'doubleloot', name: 'Double Loot', text: 'Every chest holds twice the loot. Greed is good TV.' },
  { id: 'cowards', name: 'Cowards Night', text: 'Every mob begs for mercy when hurt. Nobody is listening, but they lose a turn groveling.' },
  { id: 'hypefest', name: 'Hype Fest', text: 'The audience is hyped. Hype builds twice as fast.' },
  { id: 'happyhour', name: 'Happy Hour', text: 'Penny is running a special. Everything in her shop is 25% off.' },
  { id: 'allyoucaneat', name: 'All You Can Eat', text: 'Food heals twice as much on this floor. Dig in.' },
  { id: 'rushhour', name: 'Rush Hour', text: 'Everything down here is in a hurry. Mobs sometimes act twice, but give 25% more XP.' },
  { id: 'nofreeparking', name: 'No Free Parking', text: 'Every mob carries a ticket book. Any hit might cost you tokens.' },
];

// ---------- Floors ----------
// One row per floor. Danger comes from the floor you are on, not your level.
// size: how big gear, prices, tokens and bombs are (Floor 1 = 1). hp and atk: how much tougher than their base
// stats mobs are at the start of the floor and at the bosses. defK: the number in the defense formula
// (damage = hit x defK / (defK + defense)), so stacking defense can't make you untouchable deeper down.
// lvl: the level a normal player has at the start and end of the floor (mobs give less XP if you are well past it).
// upgCap: highest gear upgrade allowed on that floor. shopFloor: Penny's shelves unlock by floor.
export const FLOORS = {
  1: { name: 'The Lobby', hp: [1.5, 4.5], atk: [1.4, 3.5], defK: 12, lvl: [1, 6], upgCap: 2,
    mobs: ['slime', 'rat', 'gremlin', 'pigeon', 'roach', 'bat', 'mannequin', 'trashcan'], bosses: ['king', 'hoarder'],
    rules: ['doubleloot', 'cowards', 'hypefest'], shop: [],
    colors: { floor: ['#5a5373', '#635c7d', '#4e4866'], wall: ['#3b2a4d', '#5a5373', '#2c2040', '#241a36'], safe: ['#8a4b2a', '#9a5636', '#b8693a'] } },
  2: { name: 'The Food Court', hp: [3.6, 6.2], atk: [3.1, 4.2], defK: 18, lvl: [6, 9], upgCap: 3,
    mobs: ['nugget', 'fizz', 'meatball', 'busboy', 'pizza', 'rat', 'pigeon', 'trashcan'], bosses: ['frycook', 'buffet'],
    rules: ['doubleloot', 'hypefest', 'happyhour', 'allyoucaneat'], shop: ['food_taco', 'food_smoothie', 'food_espresso'], healers: true,
    colors: { floor: ['#e8dcc0', '#c9c3da', '#b7aecb'], wall: ['#7a1c2e', '#c8334a', '#5a1422', '#3e0e18'], safe: ['#3a6ea5', '#4477b0', '#6aa0d8'] } },
  // Floor 3 is a real step up: mobs blare alarms to rally each other, shred you (bleed), fine you and steal.
  3: { name: 'The Parking Garage', hp: [6.0, 9.0], atk: [4.8, 6.0], defK: 24, lvl: [9, 13], upgCap: 4,
    mobs: ['cone', 'alarm', 'tire', 'meter', 'valet', 'roach', 'rat', 'trashcan'], bosses: ['towtruck', 'metermaid'],
    rules: ['rushhour', 'nofreeparking', 'hypefest', 'happyhour'], shop: ['food_taco', 'food_smoothie', 'food_espresso'], rally: true,
    colors: { floor: ['#6b6b76', '#75757f', '#5f5f69'], wall: ['#3a3a44', '#b8862b', '#2b2b33', '#1e1e25'], safe: ['#2f7a3c', '#3a8a48', '#6bbf59'] } },
};
export const LAST_FLOOR = 3; // the deepest floor built so far
// Arriving on these floors lets the hero swap to any class (owner asked for Floor 3).
export const CLASS_SWAP_FLOORS = [3];
// Gear, shop prices, tokens and bombs grow 40% per floor.
export function floorSize(n) { return 1 + 0.4 * (Math.max(1, n) - 1); }
export function floorDef(n) { return FLOORS[Math.max(1, Math.min(LAST_FLOOR, n || 1))]; }

export const ACHIEVEMENTS = {
  firstblood: { name: 'First Blood', text: 'You killed something. The audience claps politely.', reward: 'box_rusty' },
  death: { name: 'Welcome to the Show', text: 'You died! Do not worry, we kept the tape.', reward: 'box_rusty' },
  boxaddict: { name: 'Box Addict', text: 'You opened 5 loot boxes. You might have a problem.', reward: 'box_silver' },
  ratings: { name: 'Ratings Gold', text: 'You took down a Famous mob on live TV.', reward: 'box_silver' },
  elite: { name: 'Punching Up', text: 'You beat an elite mob.', reward: 'box_silver' },
  king: { name: 'Fare Evasion', text: 'You dethroned the Turnstile King.', reward: 'box_gold' },
  hoarder: { name: 'Spring Cleaning', text: 'You cleared out the Lost and Found Hoarder.', reward: 'box_gold' },
  frycook: { name: 'Kitchen Closed', text: 'You shut down the Fry Cook Tyrant.', reward: 'box_gold' },
  buffet: { name: 'Clean Plate', text: 'You finished the Buffet Blob. All of it.', reward: 'box_gold' },
  floor2: { name: 'Going Down', text: 'You took the stairs to Floor 2.', reward: 'box_silver' },
  towtruck: { name: 'Repo Man', text: 'You scrapped the Tow Truck Titan.', reward: 'box_gold' },
  metermaid: { name: 'Fight the Fine', text: 'You tore up the Meter Maid\'s last ticket.', reward: 'box_gold' },
  floor3: { name: 'Lower Level', text: 'You took the stairs to Floor 3.', reward: 'box_silver' },
};

export const BOOKIE = {
  welcome: [
    'Welcome to LONG ODDS, the last show on Earth! Literally.',
    'Contestant, the Patrons have placed their bets. Most of them bet against you.',
  ],
  win: ['Clean. The Patrons barely spilled their champagne.', 'A win! Your odds just got a little less insulting.', 'The crowd goes mild!', 'Somebody up on the arks just won a bet on you.'],
  lowWin: ['That was close. The audience LOVED it.', 'Barely alive. Peak television.'],
  hurt: ['Ooh, that one is going in the highlight reel.', 'Ouch. The Patrons are re-running that in slow motion.'],
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

// Penny's shop gets better on deeper floors. Each tier needs both its floor and its level. Patron boxes are never sold.
export const SHOP_TIERS = [
  { lvl: 1, floor: 1, rarity: 'rusty', basics: ['potion_heal', 'potion_mana', 'potion_radar', 'potion_path', 'potion_safe', 'food_hotdog', 'bomb', 'box_rusty', 'j_dust'], scrolls: ['scroll_venom', 'scroll_iron'] },
  { lvl: 3, floor: 2, rarity: 'silver', basics: ['potion_big', 'potion_mana_big', 'box_silver'], scrolls: ['scroll_frost', 'scroll_mend', 'scroll_leech'] },
  { lvl: 5, floor: 4, rarity: 'gold', basics: ['bomb_big', 'box_gold'], scrolls: ['scroll_fireball'] },
  { lvl: 8, floor: 7, rarity: 'patron', basics: [], scrolls: ['scroll_lightning'] },
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
  { out: 'potion_safe', lvl: 1, need: { j_token: 2, j_feather: 1 } },
  { out: 'potion_mana', lvl: 2, need: { j_jelly: 1, j_feather: 1 } },
  { out: 's_patch', lvl: 2, need: { j_feather: 2, j_jelly: 1 } },
  { out: 'a_trash', lvl: 2, need: { j_token: 2, j_wire: 2 } },
  { out: 'w_wrench', lvl: 3, need: { w_pipe: 1, j_wire: 2 } },
  { out: 'f_feather', lvl: 3, need: { j_feather: 4, j_wire: 1 }, tokens: 5 },
  { out: 'potion_big', lvl: 3, need: { potion_heal: 2, j_jelly: 1 } },
  { out: 'potion_mana_big', lvl: 3, need: { potion_mana: 2, j_feather: 1 } },
  { out: 'bomb_big', lvl: 4, need: { bomb: 3, j_wire: 2 } },
  { out: 'r_cuffs', lvl: 5, need: { r_band: 1, j_token: 4 }, tokens: 20 },
  { out: 'h_tiara', lvl: 6, need: { h_hardhat: 1, j_token: 4 }, tokens: 30 },
];

// Enchanting (owner request): one enchantment per piece of gear, put on at the workbench with Glow Dust.
// Stat enchants grow with the floor you enchant on (floorSize), so re-enchanting deeper makes them stronger.
// floor: the first floor it can be used on. leech: melee hits heal you a share of the damage.
export const ENCHANTS = {
  sharp: { name: 'Sharp', floor: 1, stats: { atk: 2 }, desc: '+2 attack' },
  sturdy: { name: 'Sturdy', floor: 1, stats: { def: 2 }, desc: '+2 defense' },
  vital: { name: 'Vital', floor: 1, stats: { maxHp: 10 }, desc: '+10 HP' },
  arcane: { name: 'Arcane', floor: 1, stats: { mag: 2, maxMp: 4 }, desc: '+2 magic, +4 MP' },
  swift: { name: 'Swift', floor: 2, stats: { spd: 2 }, desc: '+2 speed' },
  lucky: { name: 'Lucky', floor: 2, stats: { luck: 3, cha: 1 }, desc: '+3 luck, +1 charisma' },
  scholar: { name: 'Scholar', floor: 3, stats: { xpPct: 6 }, desc: '+6% XP' },
  leeching: { name: 'Leeching', floor: 3, stats: {}, leech: 0.06, desc: 'Melee hits heal you 6% of the damage (stacks)' },
};
