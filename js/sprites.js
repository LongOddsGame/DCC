// Pixel art: a 24 color palette and 16x16 sprites drawn from text maps.
export const PAL = {
  k: '#1a1426', o: '#5a5373', O: '#8b84a3', w: '#fff6e0', e: '#e8dcc0',
  s: '#f2b48a', S: '#c47a5a', h: '#5b3a29', b: '#3a6ea5', B: '#6aa0d8',
  g: '#6bbf59', G: '#2f7a3c', t: '#b8e05a', r: '#c8334a', R: '#7a1c2e',
  y: '#f5c542', Y: '#b8862b', p: '#8a4fc9', P: '#c49af0', n: '#ff5fa2', c: '#4fd8e8',
  u: '#8a4b2a', U: '#b8693a',
};

const MAPS = {
  trashcan: ['................', '.....kkkkkk.....', '...kkOOOOOOkk...', '..kOOOOOOOOOOk..', '..kkkkkkkkkkkk..', '...kowkoowkok...', '...kokkookkok...', '...koooooooook..', '...korrrrrrok...', '...kowowowook...', '...koOoOoOook...', '...koOoOoOook...', '...koOoOoOook...', '...koooooooook..', '....kkkkkkkkk...', '................'],
  mannequin: ['................', '......kkkk......', '.....keeeek.....', '.....kekkek.....', '.....keeeek.....', '......kkkk......', '....kkeeeekk....', '...keekeekeek...', '...kek.ee.kek...', '...kek.ee.kek...', '....k.keek.k....', '......keek......', '.....kekkek.....', '.....kek.kek....', '.....kk...kk....', '................'],
  bat: ['................', '................', '................', '.k....k..k....k.', '.kk..kpkkpk..kk.', '.kpk.kppppk.kpk.', '.kppkpwppwpkppk.', '.kpppppppppppppk', '.kpPpppkkpppPpk.', '..kpPpprrppPpk..', '..kkpPpppppPkk..', '....kkppppkk....', '......kppk......', '.......kk.......', '................', '................'],
  roach: ['................', '..k..........k..', '...k........k...', '....k.kkkk.k....', '.....kuuuuk.....', '....kuUUUUuk....', '...kuUkUUkUuk...', '.k.kuUUUUUUuk.k.', '..kkuuuuuuuukk..', '.k.kuUuuuuUuk.k.', '..kkuuUuuUuukk..', '.k.kuuuuuuuuk.k.', '....kuuuuuuk....', '.....kkkkkk.....', '................', '................'],
  hero: ['................', '.....kkkkkk.....', '....khhhhhhk....', '...khhhhhhhhk...', '...khsssssshk...', '...kssksskssk...', '...kssssssssk...', '....ksSSSSsk....', '...kkbbbbbbkk...', '..kbbBbbbbBbbk..', '..ksbBbbbbBbsk..', '..kskbbbbbbksk..', '...kkbbbbbbkk...', '....kookkook....', '....kkk..kkk....', '................'],
  slime: ['................', '................', '......kkkk......', '....kkggggkk....', '...kggtggggGk...', '..kgtggggggGGk..', '..kggkwggkwgGk..', '..kggkkggkkgGk..', '.kgggggggggggGk.', '.kggggrrrrgggGk.', '.kGgggggggggGGk.', '.kGGGgggggGGGGk.', '..kkkkkkkkkkkk..', '................', '................', '................'],
  rat: ['................', '..kk........kk..', '.knnk......knnk.', '.knokkkkkkkkonk.', '..kooooooooook..', '..koOooooooOok..', '.kookrkookrkook.', '.kooookkkkooook.', '.kOoookwwkoooOk.', '..kOooooooooOk..', '..kooooooooook..', '...kooooooook...', '..kOkkkkkkkkOk..', '..kk........kk..', '................', '................'],
  gremlin: ['................', '..k..........k..', '..kk........kk..', '..kgk.kkkk.kgk..', '...kgkggggkgk...', '....kggggggk....', '...kgwkggkwgk...', '...kgkkggkkgk...', '...kggggggggk...', '....kgrrrrgk....', '...kkkggggkkk...', '..kyykYYYYkyyk..', '..kgkYyyyYkgk...', '....kYYYYk......', '....kgk.kgk.....', '....kk...kk.....'],
  pigeon: ['................', '.....kkkk.......', '....kOOOOk......', '...kOOkwOOk.....', '...kOOOOOOkyy...', '....kOOOOOkk....', '...kooooooOk....', '..kooOOooooOk...', '..koOOOOoooook..', '..kooOOOooooook.', '...kooooooooook.', '....kkkooookkk..', '......kyk.kyk...', '......kk..kk....', '................', '................'],
  king: ['..ky.ky.ky.ky...', '..kyykyykyykyk..', '..kyyyyyyyyyyk..', '..kkkkkkkkkkkk..', '.kOOOOOOOOOOOOk.', '.kOkkkOOOOkkkOk.', '.kOkrkOOOOkrkOk.', '.kOkkkOOOOkkkOk.', '.kOOOOOOOOOOOOk.', '.kOOkkkkkkkkOOk.', '.kOOkwkwkwkkOOk.', '.kOOkkkkkkkkOOk.', '.kooooooooooook.', '.kokk.kokk.kkok.', '.kok..kok...kok.', '.kkk..kkk...kkk.'],
  hoarder: ['................', '......kkkk......', '.....kOOOOk.....', '....kOkOOkOk....', '....kOyOOyOk....', '.....kOOOOk.kk..', '...kkkuuuukkyyk.', '..kuuuUuuuUkyYk.', '..kuUuuuuuukkyk.', '..kuuuuuuuuk.k..', '...kuuuUuuuk....', '...kuuuuuuuk....', '....kuuuuuk.....', '....kOk.kOk.....', '....kkk.kkk.....', '................'],
  scroll: ['................', '..kkkkkkkkkkkk..', '.kUeeeeeeeeeeUk.', '.kkeeeeeeeeeekk.', '..keoooooooeek..', '..keeeeeeeeeek..', '..keoooooeeeek..', '..keeeeeeeeeek..', '..keooooooooek..', '..keeeeeeeeeek..', '..keeeeeeerrek..', '.kkeeeeeeerrekk.', '.kUeeeeeeeeeeUk.', '..kkkkkkkkkkkk..', '................', '................'],
  bookie: ['................', '....k......k....', '.....k....k.....', '......k..k......', '..kkkkkkkkkkkk..', '.kooooooooooook.', '.kokkkkkkkkkkok.', '.kokcccccccckok.', '.kokckcccckckok.', '.kokcccccccckok.', '.kokcnnnnnnckok.', '.kokcckkkkcckok.', '.kokkkkkkkkkkok.', '.koooooooooOook.', '.kkkkkkkkkkkkkk.', '..kk........kk..'],
  potion: ['................', '......kkkk......', '......kYYk......', '......kkkk......', '.......kk.......', '......kOOk......', '.....kOOOOk.....', '....krrrrrrk....', '...krwrrrrrrk...', '...krwrrrrrrk...', '...krrrrrrrRk...', '...krrrrrrRRk...', '....krrrrRRk....', '.....kkkkkk.....', '................', '................'],
  box: ['................', '................', '................', '..kkkkkkkkkkkk..', '.kAAAAAAAAAAAAk.', '.kaaaaaaaaaaaak.', '.kaaaaaaaaaaaak.', '.kkkkkkLLkkkkkk.', '.kaaaaLkkLaaaak.', '.kaaaaaLLaaaaak.', '.kaaaaaaaaaaaak.', '.kaaaaaaaaaaaak.', '.kaaaaaaaaaaaak.', '.kkkkkkkkkkkkkk.', '................', '................'],
  sword: ['................', '.............kk.', '............kwk.', '...........kwOk.', '..........kwOk..', '.........kwOk...', '........kwOk....', '.......kwOk.....', '..kk..kwOk......', '..kYkkwOk.......', '...kYYOk........', '....kYYk........', '...kYkkYk.......', '..kYk..kk.......', '..kk............', '................'],
  vest: ['................', '...kkk....kkk...', '..kbbbk..kbbbk..', '.kbbbbbkkbbbbbk.', '.kbBbbbbbbbbBbk.', '.kbBbbbbbbbbBbk.', '..kkbbbbbbbbkk..', '...kbyybbyybk...', '...kbbbbbbbbk...', '...kbbbbbbbbk...', '...kbyybbyybk...', '...kbbbbbbbbk...', '...kkkkkkkkkk...', '................', '................', '................'],
  hat: ['................', '................', '................', '.....kkkkkk.....', '....kbbbbbbk....', '...kbBbbbbbbk...', '...kbBbbbbbbk...', '...kyyyyyyyyk...', '..kkkkkkkkkkkk..', '.kbbbbbbbbbbbbk.', '..kkkkkkkkkkkk..', '................', '................', '................', '................', '................'],
  shirt: ['................', '...kkkk..kkkk...', '..kbbbbkkbbbbk..', '.kbbbbbbbbbbbbk.', 'kbbBbbbbbbbbBbbk', 'kbbkbbbbbbbbkbbk', '.kk.kbbbbbbk.kk.', '....kbbybbbk....', '....kbbbbbbk....', '....kbbbbbbk....', '....kbbbbbbk....', '....kkkkkkkk....', '................', '................', '................', '................'],
  bracer: ['................', '................', '................', '....kkkkkkkk....', '...kbbbbbbbbk...', '...kByyBByybk...', '...kbbbbbbbbk...', '...kByyBByybk...', '...kbbbbbbbbk...', '....kkkkkkkk....', '................', '................', '................', '................', '................', '................'],
  boot: ['................', '................', '.....kkkk.......', '.....kbbk.......', '.....kbBk.......', '.....kbBk.......', '.....kbbk.......', '.....kbbk.......', '.....kbbkkkk....', '.....kbbbbbbk...', '.....kbbbbbbbk..', '.....kyyyyyyyk..', '.....kkkkkkkkk..', '................', '................', '................'],
  shop: ['................', '..kkkkkkkkkkkk..', '.knnnnnnnnnnnnk.', '.knwnwnwnwnwnnk.', '.kkkkkkkkkkkkkk.', '.koooooooooooOk.', '.kocckcckcckoOk.', '.kocckcckcckoOk.', '.koooooooooooOk.', '.koyykggkrrkoOk.', '.koooooooooooOk.', '.kokkkkkkkkkkok.', '.kowwwwwwwwwwok.', '.kokkkkkkkkkkok.', '.kkkkkkkkkkkkkk.', '..kk........kk..'],
  amulet: ['................', '....kk....kk....', '.....k....k.....', '......k..k......', '.......kk.......', '.......kk.......', '......kyyk......', '.....kybByk.....', '.....kbBbbk.....', '.....kbbbbk.....', '......kbbk......', '.......kk.......', '................', '................', '................', '................'],
  ring: ['................', '................', '................', '......kkkk......', '.....kbBBbk.....', '......kbbk......', '....kkkkkkkk....', '...kyyyyyyyyk...', '..kyk......kyk..', '..kyk......kyk..', '..kyk......kyk..', '...kyyyyyyyyk...', '....kkkkkkkk....', '................', '................', '................'],
  pants: ['................', '................', '...kkkkkkkkkk...', '...kbbbbbbbbk...', '...kyyyyyyyyk...', '...kbbbbbbbbk...', '...kbBbkkbBbk...', '...kbBbkkbBbk...', '...kbBbkkbBbk...', '...kbbbkkbbbk...', '...kbbbkkbbbk...', '...kbbbkkbbbk...', '..kkkkkk.kkkkk..', '................', '................', '................'],
  cape: ['................', '.....kkkkkk.....', '....kyyyyyyk....', '...kbbbbbbbbk...', '...kbBbbbbbbk...', '..kbbBbbbbbbbk..', '..kbbBbbbbbbbk..', '..kbbbbbbbbbbk..', '.kbbbbbbbbbbbbk.', '.kbbbbbbbbbbbbk.', '.kbbbbbbbbbbbbk.', 'kbbbbbbbbbbbbbbk', 'kkkkkkkkkkkkkkkk', '................', '................', '................'],
  stairs: ['kkkkkkkkkkkkkkkk', 'kOOOOOOOOOOOOOOk', 'kkkkkkkkkkkkkkkk', 'kooooooooooooook', 'kkkkkkkkkkkkkkkk', 'k.oooooooooooo.k', 'kkkkkkkkkkkkkkkk', 'k..oooooooooo..k', 'kkkkkkkkkkkkkkkk', 'k...oooooooo...k', 'kkkkkkkkkkkkkkkk', 'k....oooooo....k', 'kkkkkkkkkkkkkkkk', 'k.....kkkk.....k', 'k..............k', 'kkkkkkkkkkkkkkkk'],
  nugget: ['................', '................', '................', '....kkkk........', '...kYyyyk.......', '..kYyyyyyk..kkk.', '..kYywkwyk.kYyyk', '..kkYyyykkkYwkwk', '.kkkkkkkkYyyyyyk', 'kYyyyk..kkYyyykk', 'kYwkwyk...kkkk..', 'kYyyyyyk........', '.kYyyyyk........', '..kkkkk.........', '................', '................'],
  fizz: ['..........k.....', '.........kwk....', '.........kwk....', '...kkkkkkkwkk...', '..kwwwwwwwwwwk..', '..kkkkkkkkkkkk..', '...krrrrrrrrk...', '...krwkrrkwrk...', '...krkkrrkkrk...', '...krrrrrrrrk...', '...krwwwwwwrk...', '....krrrrrrk....', '....krrrrrrk....', '....kRRRRRRk....', '.....kkkkkk.....', '................'],
  meatball: ['................', '................', '.....kkkkkk.....', '...kkuuUuuukk...', '..kuUuuuuuUuuk..', '..kurrrruuuuuk..', '.kuuwkuuuuwkuuk.', '.kuukkuuuukkuuk.', '.kuuuuuUuuuuuuk.', '.kuUuurrrruuUuk.', '.kuuurrkkrruuuk.', '..kuuuuuuuuuuk..', '..kkuuUuuuuukk..', '....kkkkkkkk....', '................', '................'],
  busboy: ['................', '.....kkkkkk.....', '....kggggggk....', '....kgrkgrkk....', '....kggggggk....', '....kgkkkkgk....', '.....kggggk.....', '...kkwwwwwwkk...', '..kgkwwwwwwkgk..', 'kkkkkkwwwwkkkkkk', 'kOOOOkwwwwkOOOOk', '.kkkkkwwwwkkkkk.', '....kwwwwwwk....', '....kokkkkok....', '....kok..kok....', '....kkk..kkk....'],
  pizza: ['.kkkkkkkkkkkkkk.', '.kUUUUUUUUUUUUk.', '.kuuuuuuuuuuuuk.', '..kyyyrryyyyyk..', '..kywkyyyywkyk..', '...kyyyrryyyk...', '...kyyrrrryyk...', '....kyyrryyk....', '....kyyyyyyk....', '.....kyyyyk.....', '.....kyrryk.....', '......kyyk......', '......kyyk......', '.......kk.......', '................', '................'],
  frycook: ['.....kkkkkk.....', '....kwwwwwwk....', '...kwwwwwwwwk...', '...kwwwwwwwwk...', '....kkkkkkkk....', '....ksssssskk...', '....kkskssksk...', '....ksssssssk...', '....ksRRRRssk.k.', '...kkksssskkkkOk', '..kwwwwwwwwwwkOk', '..kwwwwrrwwwwkkk', '..kwwwwwwwwwwk..', '..kwwwwwwwwwwk..', '...kkkk..kkkk...', '................'],
  buffet: ['................', '......kkkk......', '....kktttttkk...', '...kttttttttk...', '..kttwkttwkttk..', '..kttkkttkkttk..', '.ktttttttttttk..', '.kttrrrrrrrttk..', 'ktttrwwwwrrtttk.', 'kttttrrrrrttttk.', 'ktyttttttttgytk.', 'kttyttgtttttttk.', 'kGtttttttttyttk.', 'kGGttttttttttGk.', '.kkkkkkkkkkkkkk.', '................'],
  cone: ['................', '.......kk.......', '......kUUk......', '......kUUk......', '.....kwwwwk.....', '.....kUUUUk.....', '....kUkUUkUk....', '....kUrkkrUk....', '...kwwwwwwwwk...', '...kUUUUUUUUk...', '..kUUUkkkkUUUk..', '..kwwwwwwwwwwk..', '.kUUUUUUUUUUUUk.', 'kkkkkkkkkkkkkkkk', 'kooooooooooooook', 'kkkkkkkkkkkkkkkk'],
  alarm: ['................', '.n..........n...', '..n...kk...n....', '.....krrk.......', '....krrrrk......', '...kkkkkkkkk....', '..krrrrrrrrrk.n.', '.krwrrrrrrrwrk..', '.kOkkrrrrrkkOk..', '.kokwkrrrkwkok..', '.kOkkrkkkrkkOk..', '.krrrrnnnrrrrk..', '.kkkkkkkkkkkkk..', '..kok.....kok...', '..kkk.....kkk...', '................'],
  tire: ['................', '.....kkkkkk.....', '...kkokkokokk...', '..kokkkkkkkkok..', '.kokkkOOOOkkkok.', '.kkkkOooooOkkkk.', 'kokkOorkkroOkkok', 'kkkkOokwwkoOkkkk', 'kokkOokkkkoOkkok', 'kkkkOooooooOkkkk', '.kokkOOOOOOkkok.', '.kkkkkkkkkkkkkk.', '..kokkkkkkkkok..', '...kkokkokokk...', '.....kkkkkk.....', '................'],
  meter: ['................', '....kkkkkkkk....', '...kOOOOOOOOk...', '...kOkkkkkkOk...', '...kOkcwwckOk...', '...kOkrkkrkOk...', '...kOkkkkkkOk...', '...kOOyyOOOOk...', '...kOOkkOOOOk...', '...kOkwwwwkOk...', '....kkkkkkkk....', '......kook......', '......kOok......', '......kook......', '....kkkkkkkk....', '....kOOOOOOk....'],
  valet: ['................', '.....kkkkkk.....', '....kRRRRRRk....', '...kkkkkkkkkk...', '....kggggggk....', '....kgrkgrkk....', '....kggggggk....', '....kgkwwkgk....', '...kkRRRRRRkk...', '..kgkRyRRyRkgk..', '..kgkRRRRRRkyyk.', '..kkkRyRRyRkyk..', '....kRRRRRRk....', '....kokkkkok....', '....kok..kok....', '....kkk..kkk....'],
  towtruck: ['................', '.........k......', '........kOk.....', '.......kOk......', '..kkkkkOk.......', '.kyyyykk........', '.kyccyk.kkkk....', '.kycwyk.kOk.....', 'kkyyyykkkkkkkkk.', 'kyyyyyyyyyyyyyk.', 'kyrryyyyyyyyyykk', 'kyyyyyyyyyyyyyyk', 'kkkkkkkkkkkkkkkk', '.kokk.....kokk..', '.kOok.....kOok..', '..kk.......kk...'],
  metermaid: ['....kkkkkkkk....', '...kbbbbbbbbk...', '..kkkkkkkkkkkk..', '....ksssssk.....', '....kckksckk....', '....ksssssk.....', '....ksSRRSk.....', '...kkkssskkk....', '..kbbbbbbbbbk...', '.kbbbyybbbbbbk..', '.ksbbbbbbbbwwwk.', '.ksbbbbbbbbwrwk.', '..kbbbbbbbbwwwk.', '...kbbbkbbbbk...', '...kokk.kkok....', '...kkk...kkk....'],
  board: ['................', '.kkkkkkkkkkkkkk.', '.kuuuuuuuuuuuuk.', '.kuwwwkuUeeeUuk.', '.kuwoowuUeoeUuk.', '.kuwwwwuUeeeUuk.', '.kuwoowuuuuuuuk.', '.kuwwwwuyyyyyuk.', '.kuuuuuuyokoyuk.', '.kueeeeuyyyyyuk.', '.kueooeuuuuuuuk.', '.kueeeeuuuuuuuk.', '.kkkkkkkkkkkkkk.', '...ko......ok...', '...ko......ok...', '...kk......kk...'],
  drone: ['................', '................', '.kkkk......kkkk.', '..kk........kk..', '...k.kkkkkk.k...', '...kkOOOOOOkk...', '....kOkkkkOk....', '....kOkrrkOk....', '....kOkkkkOk....', '....kOOOOOOk....', '.....kwwwwk.....', '.....kwrrwk.....', '.....kwwwwk.....', '......kkkk......', '................', '................'],
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

// Hero poses: facing down, up or sideways, each with an idle frame and two walking frames.
const HERO_BACK = ['................', '.....kkkkkk.....', '....khhhhhhk....', '...khhhhhhhhk...', '...khhhhhhhhk...', '...khhhhhhhhk...', '...kshhhhhhsk...', '....kSSSSSSk....', '...kkbbbbbbkk...', '..kbbbbbbbbbbk..', '..ksbbbbbbbbsk..', '..kskbbbbbbksk..', '...kkbbbbbbkk...', '....kookkook....', '....kkk..kkk....', '................'];
const HERO_SIDE = ['................', '.....kkkkkk.....', '....khhhhhhk....', '...khhhhhhhhk...', '...ksssshhhhk...', '...kskssshhhk...', '..kssssssshhk...', '....ksSSSssk....', '....kkbbbbkk....', '....kbbBbbbk....', '....kbsBbbbk....', '....kbskbbbk....', '....kkbbbbkk....', '.....kookok.....', '.....kkkkkk.....', '................'];
const LEGS = {
  front: [['....kookkook....', '....kkk..kkk....'], ['....kookkkk.....', '....kkk.........'], ['.....kkkkook....', '.........kkk....']],
  side: [['.....kookok.....', '.....kkkkkk.....'], ['....kook.kok....', '....kkk...kk....'], ['.....kookk......', '.....kkkk.......']],
};
function withLegs(rows, legs) { return [...rows.slice(0, 13), legs[0], legs[1], rows[15]]; }
for (let f = 0; f < 3; f++) {
  MAPS['hero_down' + f] = withLegs(MAPS.hero, LEGS.front[f]);
  MAPS['hero_up' + f] = withLegs(HERO_BACK, LEGS.front[f]);
  MAPS['hero_left' + f] = withLegs(HERO_SIDE, LEGS.side[f]);
}
// Female variants: long hair that falls past the shoulders.
function longHair(rows, cols) {
  const out = rows.slice();
  for (let y = 4; y <= 9; y++) {
    const r = out[y].split('');
    for (const [hx, kx] of cols) {
      if (r[hx] === '.' || (y >= 4 && r[hx] === 'k' && y < 8)) r[hx] = 'h';
      if (r[kx] === '.') r[kx] = 'k';
    }
    out[y] = r.join('');
  }
  const last = out[10].split('');
  for (const [hx] of cols) if (last[hx] === '.') last[hx] = 'k';
  out[10] = last.join('');
  return out;
}
for (let f = 0; f < 3; f++) {
  MAPS['heroF_down' + f] = longHair(MAPS['hero_down' + f], [[2, 1], [13, 14]]);
  MAPS['heroF_up' + f] = longHair(MAPS['hero_up' + f], [[2, 1], [13, 14]]).map((r, y) => (y === 7 ? '....khhhhhhk....' : r));
  MAPS['heroF_left' + f] = longHair(MAPS['hero_left' + f], [[12, 13]]);
}
function mirror(c) {
  const m = document.createElement('canvas');
  m.width = 16; m.height = 16;
  const g = m.getContext('2d');
  g.translate(16, 0); g.scale(-1, 1); g.drawImage(c, 0, 0);
  return m;
}
const mirrorCache = new Map();
export function flipped(c) {
  if (!mirrorCache.has(c)) mirrorCache.set(c, mirror(c));
  return mirrorCache.get(c);
}
// Race features (horns, ears, fins, glowing eyes...) are extra pixels painted over the hero map.
function withFeat(name, race, view) {
  const px = race.feat && (race.feat[view] || race.feat.all);
  if (!px) return name;
  const key = name + '#' + race.id;
  if (!MAPS[key]) {
    const rows = MAPS[name].map((r) => r.split(''));
    for (const [x, y, ch] of px) rows[y][x] = ch;
    MAPS[key] = rows.map((r) => r.join(''));
  }
  return key;
}
// dir: down | up | left | right. frame: 0 standing, 1 and 2 mid-step.
export function heroSprite(race, cls, dir = 'down', frame = 0, sex = 'm') {
  const over = { ...(race.over || {}), s: race.skin, S: race.shade, h: race.hair || '#5b3a29', b: cls.coat, B: cls.coatLight };
  const base = dir === 'right' ? 'left' : dir;
  const c = sprite(withFeat((sex === 'f' ? 'heroF_' : 'hero_') + base + frame, race, base), over, race.id + cls.id);
  return dir === 'right' ? flipped(c) : c;
}

export function docSprite() {
  return sprite('hero', { h: '#7a1c2e', b: '#e8dcc0', B: '#fff6e0', o: '#3a6ea5' }, 'doc');
}

// Quest givers are regular people: the hero sprite repainted with their own colors.
export function npcSprite(name, colors) {
  return sprite('hero', colors, 'npc_' + name);
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
  potion_mana_big: { r: '#8a4fc9', R: '#3a6ea5' },
  potion_mystery: { r: '#c49af0', R: '#8a4fc9' },
  potion_radar: { r: '#ff5fa2', R: '#8a4fc9', w: '#4fd8e8' },
  potion_path: { r: '#b8e05a', R: '#2f7a3c', w: '#fff6e0' },
};

const ARMOR_COLORS = {
  a_vest: { b: '#f5c542', B: '#fff6e0', y: '#c9c3da' },
  a_jacket: { b: '#3a6ea5', B: '#6aa0d8', y: '#1a1426' },
  a_suit: { b: '#b8862b', B: '#f5c542', y: '#fff6e0' },
  a_coat: { b: '#8a4fc9', B: '#c49af0', y: '#fff6e0' },
};

// Gear for the new slots is tinted by rarity.
const GEAR_TINT = {
  common: { b: '#8b84a3', B: '#c9c3da', y: '#5a5373' },
  rusty: { b: '#8a4b2a', B: '#b8693a', y: '#f5c542' },
  silver: { b: '#3a6ea5', B: '#6aa0d8', y: '#e8dcc0' },
  gold: { b: '#b8862b', B: '#f5c542', y: '#fff6e0' },
  patron: { b: '#8a4fc9', B: '#c49af0', y: '#ff5fa2' },
};
const SLOT_SPRITE = { head: 'hat', shirt: 'shirt', wrist: 'bracer', shoes: 'boot', neck: 'amulet', ring: 'ring', ring1: 'ring', ring2: 'ring', legs: 'pants', back: 'cape' };
export function slotIcon(slot) {
  const name = SLOT_SPRITE[slot] || (slot === 'weapon' ? 'sword' : 'vest');
  return sprite(name, { b: '#3d3550', B: '#5a5373', y: '#3d3550', k: '#5a5373', w: '#5a5373', O: '#3d3550', Y: '#3d3550' }, 'empty').toDataURL();
}

// Small icon for an inventory item, as a data URL for <img> tags.
const iconCache = new Map();
export function itemIcon(id, type, rarity = 'common') {
  if (iconCache.has(id)) return iconCache.get(id);
  let c;
  if (type === 'box') c = boxSprite(id);
  else if (type === 'scroll') c = sprite('scroll', null, 'scroll');
  else if (type === 'potion') c = sprite('potion', POTION_COLORS[id], id);
  else if (type === 'bomb') c = sprite('potion', { r: '#5a5373', R: '#1a1426', Y: '#ff5fa2', w: '#8b84a3' }, id);
  else if (type === 'food') c = sprite('potion', { r: '#b8693a', R: '#8a4b2a', O: '#f5c542', Y: '#c8334a' }, id);
  else if (type === 'weapon') c = sprite('sword', null, id);
  else if (type === 'armor') c = sprite('vest', ARMOR_COLORS[id] || GEAR_TINT[rarity], id);
  else if (SLOT_SPRITE[type]) c = sprite(SLOT_SPRITE[type], GEAR_TINT[rarity], id);
  else c = sprite('potion', { r: '#5b3a29', R: '#1a1426', O: '#5a5373' }, id);
  const url = c.toDataURL();
  iconCache.set(id, url);
  return url;
}
