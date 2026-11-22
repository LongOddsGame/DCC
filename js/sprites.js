// Pixel art: a 24 color palette and 16x16 sprites drawn from text maps.
export const PAL = {
  k: '#1a1426', o: '#5a5373', O: '#8b84a3', w: '#fff6e0', e: '#e8dcc0',
  s: '#f2b48a', S: '#c47a5a', h: '#5b3a29', b: '#3a6ea5', B: '#6aa0d8',
  g: '#6bbf59', G: '#2f7a3c', t: '#b8e05a', r: '#c8334a', R: '#7a1c2e',
  y: '#f5c542', Y: '#b8862b', p: '#8a4fc9', P: '#c49af0', n: '#ff5fa2', c: '#4fd8e8',
  u: '#8a4b2a', U: '#b8693a',
};

const MAPS = {
  hero: ['................', '.....kkkkkk.....', '....khhhhhhk....', '...khhhhhhhhk...', '...khsssssshk...', '...kssksskssk...', '...kssssssssk...', '....ksSSSSsk....', '...kkbbbbbbkk...', '..kbbBbbbbBbbk..', '..ksbBbbbbBbsk..', '..kskbbbbbbksk..', '...kkbbbbbbkk...', '....kookkook....', '....kkk..kkk....', '................'],
  slime: ['................', '................', '......kkkk......', '....kkggggkk....', '...kggtggggGk...', '..kgtggggggGGk..', '..kggkwggkwgGk..', '..kggkkggkkgGk..', '.kgggggggggggGk.', '.kggggrrrrgggGk.', '.kGgggggggggGGk.', '.kGGGgggggGGGGk.', '..kkkkkkkkkkkk..', '................', '................', '................'],
  rat: ['................', '..kk........kk..', '.knnk......knnk.', '.knokkkkkkkkonk.', '..kooooooooook..', '..koOooooooOok..', '.kookrkookrkook.', '.kooookkkkooook.', '.kOoookwwkoooOk.', '..kOooooooooOk..', '..kooooooooook..', '...kooooooook...', '..kOkkkkkkkkOk..', '..kk........kk..', '................', '................'],
  gremlin: ['................', '..k..........k..', '..kk........kk..', '..kgk.kkkk.kgk..', '...kgkggggkgk...', '....kggggggk....', '...kgwkggkwgk...', '...kgkkggkkgk...', '...kggggggggk...', '....kgrrrrgk....', '...kkkggggkkk...', '..kyykYYYYkyyk..', '..kgkYyyyYkgk...', '....kYYYYk......', '....kgk.kgk.....', '....kk...kk.....'],
  pigeon: ['................', '.....kkkk.......', '....kOOOOk......', '...kOOkwOOk.....', '...kOOOOOOkyy...', '....kOOOOOkk....', '...kooooooOk....', '..kooOOooooOk...', '..koOOOOoooook..', '..kooOOOooooook.', '...kooooooooook.', '....kkkooookkk..', '......kyk.kyk...', '......kk..kk....', '................', '................'],
  king: ['..ky.ky.ky.ky...', '..kyykyykyykyk..', '..kyyyyyyyyyyk..', '..kkkkkkkkkkkk..', '.kOOOOOOOOOOOOk.', '.kOkkkOOOOkkkOk.', '.kOkrkOOOOkrkOk.', '.kOkkkOOOOkkkOk.', '.kOOOOOOOOOOOOk.', '.kOOkkkkkkkkOOk.', '.kOOkwkwkwkkOOk.', '.kOOkkkkkkkkOOk.', '.kooooooooooook.', '.kokk.kokk.kkok.', '.kok..kok...kok.', '.kkk..kkk...kkk.'],
  bookie: ['................', '....k......k....', '.....k....k.....', '......k..k......', '..kkkkkkkkkkkk..', '.kooooooooooook.', '.kokkkkkkkkkkok.', '.kokcccccccckok.', '.kokckcccckckok.', '.kokcccccccckok.', '.kokcnnnnnnckok.', '.kokcckkkkcckok.', '.kokkkkkkkkkkok.', '.koooooooooOook.', '.kkkkkkkkkkkkkk.', '..kk........kk..'],
  potion: ['................', '......kkkk......', '......kYYk......', '......kkkk......', '.......kk.......', '......kOOk......', '.....kOOOOk.....', '....krrrrrrk....', '...krwrrrrrrk...', '...krwrrrrrrk...', '...krrrrrrrRk...', '...krrrrrrRRk...', '....krrrrRRk....', '.....kkkkkk.....', '................', '................'],
  box: ['................', '................', '................', '..kkkkkkkkkkkk..', '.kAAAAAAAAAAAAk.', '.kaaaaaaaaaaaak.', '.kaaaaaaaaaaaak.', '.kkkkkkLLkkkkkk.', '.kaaaaLkkLaaaak.', '.kaaaaaLLaaaaak.', '.kaaaaaaaaaaaak.', '.kaaaaaaaaaaaak.', '.kaaaaaaaaaaaak.', '.kkkkkkkkkkkkkk.', '................', '................'],
  sword: ['................', '.............kk.', '............kwk.', '...........kwOk.', '..........kwOk..', '.........kwOk...', '........kwOk....', '.......kwOk.....', '..kk..kwOk......', '..kYkkwOk.......', '...kYYOk........', '....kYYk........', '...kYkkYk.......', '..kYk..kk.......', '..kk............', '................'],
  vest: ['................', '...kkk....kkk...', '..kbbbk..kbbbk..', '.kbbbbbkkbbbbbk.', '.kbBbbbbbbbbBbk.', '.kbBbbbbbbbbBbk.', '..kkbbbbbbbbkk..', '...kbyybbyybk...', '...kbbbbbbbbk...', '...kbbbbbbbbk...', '...kbyybbyybk...', '...kbbbbbbbbk...', '...kkkkkkkkkk...', '................', '................', '................'],
  stairs: ['kkkkkkkkkkkkkkkk', 'kOOOOOOOOOOOOOOk', 'kkkkkkkkkkkkkkkk', 'kooooooooooooook', 'kkkkkkkkkkkkkkkk', 'k.oooooooooooo.k', 'kkkkkkkkkkkkkkkk', 'k..oooooooooo..k', 'kkkkkkkkkkkkkkkk', 'k...oooooooo...k', 'kkkkkkkkkkkkkkkk', 'k....oooooo....k', 'kkkkkkkkkkkkkkkk', 'k.....kkkk.....k', 'k..............k', 'kkkkkkkkkkkkkkkk'],
};

export const BOX_COLORS = {
  box_rusty: { a: '#8a4b2a', A: '#b8693a', L: '#b8862b' },
  box_silver: { a: '#8b84a3', A: '#e8dcc0', L: '#4fd8e8' },
  box_gold: { a: '#b8862b', A: '#f5c542', L: '#fff6e0' },
  box_patron: { a: '#8a4fc9', A: '#c49af0', L: '#ff5fa2' },
};

const cache = new Map();

export function sprite(name, over = null, key = '') {
  const id = name + '|' + key;
  if (cache.has(id)) return cache.get(id);
  const rows = MAPS[name];
  const c = document.createElement('canvas');
  c.width = 16; c.height = 16;
  const g = c.getContext('2d');
  for (let y = 0; y < 16; y++) {
    const row = ((rows[y] || '') + '................').slice(0, 16);
    for (let x = 0; x < 16; x++) {
      const ch = row[x];
      const col = (over && over[ch]) || PAL[ch];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  }
  cache.set(id, c);
  return c;
}

export function heroSprite(race, cls) {
  return sprite('hero', { s: race.skin, S: race.shade, h: race.hair || '#5b3a29', b: cls.coat, B: cls.coatLight }, race.id + cls.id);
}

export function docSprite() {
  return sprite('hero', { h: '#7a1c2e', b: '#e8dcc0', B: '#fff6e0', o: '#3a6ea5' }, 'doc');
}

export function boxSprite(id) {
  return sprite('box', BOX_COLORS[id] || BOX_COLORS.box_rusty, id);
}

export function mobSprite(name, traits = []) {
  // Armored mobs look metallic, elites get a gold tint.
  if (traits.includes('armored')) return sprite(name, { g: '#8b84a3', t: '#e8dcc0', G: '#5a5373', o: '#8b84a3' }, 'armored');
  if (traits.includes('toxic')) return sprite(name, { g: '#b8e05a', t: '#fff6e0', o: '#6bbf59', O: '#b8e05a' }, 'toxic');
  if (traits.includes('famous')) return sprite(name, { n: '#f5c542', o: '#c49af0', O: '#e0c4f0' }, 'famous');
  return sprite(name);
}

const POTION_COLORS = {
  potion_heal: null,
  potion_big: { r: '#ff5fa2', R: '#c8334a' },
  potion_mana: { r: '#4fd8e8', R: '#3a6ea5' },
  potion_mystery: { r: '#c49af0', R: '#8a4fc9' },
};

const ARMOR_COLORS = {
  a_vest: { b: '#f5c542', B: '#fff6e0', y: '#c9c3da' },
  a_jacket: { b: '#3a6ea5', B: '#6aa0d8', y: '#1a1426' },
  a_suit: { b: '#b8862b', B: '#f5c542', y: '#fff6e0' },
  a_coat: { b: '#8a4fc9', B: '#c49af0', y: '#fff6e0' },
};

// Small icon for an inventory item, as a data URL for <img> tags.
const iconCache = new Map();
export function itemIcon(id, type) {
  if (iconCache.has(id)) return iconCache.get(id);
  let c;
  if (type === 'box') c = boxSprite(id);
  else if (type === 'potion') c = sprite('potion', POTION_COLORS[id], id);
  else if (type === 'bomb') c = sprite('potion', { r: '#5a5373', R: '#1a1426', Y: '#ff5fa2', w: '#8b84a3' }, id);
  else if (type === 'food') c = sprite('potion', { r: '#b8693a', R: '#8a4b2a', O: '#f5c542', Y: '#c8334a' }, id);
  else if (type === 'weapon') c = sprite('sword', null, id);
  else if (type === 'armor') c = sprite('vest', ARMOR_COLORS[id], id);
  else c = sprite('potion', { r: '#5b3a29', R: '#1a1426', O: '#5a5373' }, id);
  const url = c.toDataURL();
  iconCache.set(id, url);
  return url;
}
