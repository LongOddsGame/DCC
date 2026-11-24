// Random hero names for the 🎲 button on the character screen.
// A name is built from parts, so there are tens of thousands of combos:
//   First + Nickname       "Sal Longshot", "Dot Pickles"
//   First + the + Word     "Moe the Damp", "Viv the Sly"
//   First + Mc/O' + Word   "Gus McNugget", "Bev O'Toole"
//   First + Last           "Hank Puddle", "Peg Bunion"
//   Nickname + Last        "Tater Puddle" (a crawler who only goes by a nickname)
// Every name fits the 14-letter name box. Recent picks are remembered so
// the button rarely shows the same name twice.

const FIRST_M = ['Gus', 'Dale', 'Rex', 'Moe', 'Hank', 'Lou', 'Vic', 'Ned', 'Otis', 'Buck', 'Earl', 'Milo', 'Sal', 'Ray', 'Duke', 'Abe', 'Cliff', 'Bo', 'Stan', 'Tito',
  'Al', 'Art', 'Bart', 'Ben', 'Bert', 'Bill', 'Bob', 'Brad', 'Bud', 'Carl', 'Chad', 'Chet', 'Chip', 'Chuck', 'Clem', 'Cody', 'Curt', 'Dan', 'Dave', 'Dex',
  'Dirk', 'Don', 'Doug', 'Ed', 'Eli', 'Ern', 'Fitz', 'Fred', 'Gary', 'Gene', 'Gil', 'Glen', 'Greg', 'Hal', 'Herb', 'Hugh', 'Ike', 'Jake', 'Jeb', 'Jim',
  'Joe', 'Kirk', 'Lars', 'Lenny', 'Lyle', 'Mack', 'Mel', 'Mort', 'Nate', 'Nick', 'Norm', 'Ollie', 'Ozzy', 'Phil', 'Rick', 'Rod', 'Ron', 'Roy', 'Rudy', 'Russ',
  'Sid', 'Skip', 'Ted', 'Tom', 'Tony', 'Vern', 'Walt', 'Wes', 'Zeke', 'Arlo', 'Barry', 'Benny', 'Boyd', 'Cal', 'Cecil', 'Dewey', 'Floyd', 'Gord', 'Hector', 'Jeff',
  'Kev', 'Leon', 'Lloyd', 'Marty', 'Merle', 'Monty', 'Murph', 'Nils', 'Otto', 'Pete', 'Randy', 'Rocco', 'Rusty', 'Sammy', 'Saul', 'Shep', 'Teddy', 'Tex', 'Troy', 'Vito', 'Wade', 'Wally'];
const FIRST_F = ['Bev', 'Dot', 'Pam', 'Rita', 'Gail', 'Mo', 'Trix', 'Jo', 'Nell', 'Vera', 'Lu', 'Fay', 'Bea', 'Roz', 'Kit', 'Ida', 'Peg', 'Tess', 'Viv', 'Opal',
  'Ada', 'Amy', 'Ann', 'Barb', 'Becky', 'Bet', 'Cass', 'Cher', 'Cleo', 'Deb', 'Dee', 'Della', 'Dina', 'Edie', 'Ella', 'Elsie', 'Emmy', 'Etta', 'Eve', 'Flo',
  'Gert', 'Gwen', 'Hattie', 'Hazel', 'Iris', 'Irma', 'Jan', 'Jen', 'Jill', 'June', 'Kay', 'Lena', 'Lil', 'Liz', 'Lois', 'Lola', 'Mabel', 'Madge', 'Mae', 'Marge',
  'Meg', 'Mel', 'Midge', 'Millie', 'Minnie', 'Myra', 'Nan', 'Nora', 'Olive', 'Patty', 'Pearl', 'Pip', 'Polly', 'Rae', 'Rhoda', 'Rose', 'Roxy', 'Ruby', 'Ruth', 'Sadie',
  'Sal', 'Sue', 'Tammy', 'Tina', 'Trudy', 'Val', 'Vi', 'Wanda', 'Win', 'Zoe', 'Agnes', 'Babs', 'Bonnie', 'Carla', 'Daisy', 'Dora', 'Fern', 'Ginny', 'Greta', 'Hilda',
  'Ivy', 'Joy', 'Kim', 'Lacy', 'Lulu', 'Maude', 'Nadia', 'Norma', 'Penny', 'Queenie', 'Rhea', 'Shirl', 'Stella', 'Tilly', 'Una', 'Velma', 'Wren', 'Yvette', 'Zelda', 'Ursa'];

// Stand-alone nicknames: "Otis Two-Socks".
const NICKS = ['Two-Socks', 'Big Tuna', 'Ironside', 'Quickfoot', 'No-Refund', 'Pocketful', 'Longshot', 'Hotdog', 'Boxcar', 'Hambone', 'Pickles', 'Noodles',
  'Tater', 'Biscuit', 'Gravy', 'Meatball', 'Pudding', 'Waffles', 'Nachos', 'Pretzel', 'Crouton', 'Gumdrop', 'Jellybean', 'Pork Chop', 'Sloppy Joe',
  'Two-Toes', 'Six-Toes', 'One-Shoe', 'No-Shoes', 'Butterfingers', 'Knuckles', 'Elbows', 'Kneecaps', 'Sideburns', 'Mustache', 'Mullet', 'Toupee',
  'Buckets', 'Dumpster', 'Crowbar', 'Wrench', 'Duct Tape', 'Ziptie', 'Spatula', 'Ladle', 'Plunger', 'Doorknob', 'Mailbox', 'Toaster', 'Hubcap',
  'Tailgate', 'Jumpstart', 'Lugnut', 'Sparkplug', 'Coupon', 'Layaway', 'Overtime', 'Payday', 'Jackpot', 'Lotto', 'Scratchoff', 'Snake Eyes',
  'Deadbolt', 'Moonshine', 'Hiccups', 'Sneezy', 'Sniffles', 'Goosebump', 'Flapjack', 'Hushpuppy', 'Cornbread', 'Bratwurst', 'Pierogi',
  'Rat King', 'Possum', 'Raccoon', 'Badger', 'Gopher', 'Ferret', 'Weasel', 'Moose', 'Bigfoot', 'Mothman', 'Goblin', 'Gremlin',
  'Bulldozer', 'Wrecking Ball', 'Thunder', 'Tornado', 'Landslide', 'Avalanche', 'Lucky Dice', 'Long Odds', 'Dark Horse', 'Underdog',
  'Paperclip', 'Stapler', 'Tupperware', 'Flip-Flop', 'Crocs', 'Cargo Shorts', 'Fanny Pack', 'Lunchbox', 'Thermos', 'Tin Foil',
  'Three-Lunches', 'Half-Price', 'Two-Coupons', 'Late Fee', 'Spare Change', 'Small Fries', 'Extra Cheese', 'Hot Sauce', 'Leftovers', 'Free Refill',
  'Buzzcut', 'Bowl Cut', 'Big Hair', 'Unibrow', 'Shins', 'Wet Sock', 'Grub', 'Muffin', 'Dumpling', 'Corndog', 'Mudpie', 'Stinky', 'Scooter', 'Sparky', 'Tank',
  'Bruiser', 'Slugger', 'Smash', 'Chompers', 'Gnasher', 'Grinder', 'Rumble', 'Kaboom', 'Fizzle', 'Doodle', 'Wobbles', 'Jiggles', 'Squeaks', 'Bonkers'];

// Used as "the ___": "Moe the Damp".
const THE = ['Brave', 'Loud', 'Lucky', 'Sneaky', 'Bold', 'Sweaty', 'Grim', 'Late', 'Mild', 'Damp', 'Sly', 'Odd', 'Meek', 'Bald', 'Rude', 'Shy', 'Wise',
  'Moist', 'Tall', 'Short', 'Smelly', 'Wobbly', 'Sticky', 'Crispy', 'Soggy', 'Spicy', 'Chunky', 'Lumpy', 'Grumpy', 'Sleepy', 'Hungry', 'Cranky',
  'Broke', 'Unready', 'Unpaid', 'Fired', 'Tired', 'Lost', 'Mostly Ok', 'Fine', 'Okay', 'Average', 'Adequate', 'Unlikely', 'Doomed', 'Cursed', 'Blessed',
  'Feral', 'Hairy', 'Clumsy', 'Dizzy', 'Fuzzy', 'Greasy', 'Itchy', 'Jumpy', 'Lanky', 'Nosy', 'Petty', 'Salty', 'Shiny', 'Stubby', 'Tiny', 'Huge',
  'Second', 'Third', 'Fourth', 'Lesser', 'Greater', 'Mighty', 'Feeble', 'Fearless', 'Fearful', 'Unwashed', 'Barefoot', 'Bearded', 'Stinky', 'Squishy'];

// Last names, also used after Mc / O' ("Gus McNugget").
const LAST = ['Puddle', 'Bunion', 'Pickles', 'Butts', 'Crumb', 'Dingle', 'Fumble', 'Grubb', 'Hobb', 'Jinks', 'Klutz', 'Lump', 'Muddle', 'Nubb', 'Plunk',
  'Quill', 'Rumble', 'Smudge', 'Thump', 'Waddle', 'Bogg', 'Cobble', 'Dribble', 'Fizz', 'Gobble', 'Huckle', 'Jumble', 'Knob', 'Mudd', 'Noggin',
  'Pudding', 'Rattle', 'Scuttle', 'Tumble', 'Wiggins', 'Buckle', 'Cluck', 'Doodle', 'Flapp', 'Grizzle', 'Higgs', 'Snodd', 'Bottoms', 'Biggs', 'Toots',
  'Sludge', 'Gristle', 'Wart', 'Moss', 'Stump', 'Mold', 'Ditch', 'Gutter', 'Spork', 'Bucket', 'Ladle', 'Kettle', 'Skillet', 'Crust', 'Slab',
  'Hamhock', 'Brisket', 'Nugget', 'Biscuit', 'Gravy', 'Hotcake', 'Muffin', 'Toast', 'Grits', 'Beans', 'Turnip', 'Radish', 'Onion', 'Pumpkin', 'Cabbage',
  'Badger', 'Possum', 'Ferret', 'Toad', 'Newt', 'Grub', 'Slug', 'Beetle', 'Moth', 'Gnat', 'Hogg', 'Goat', 'Mule', 'Duck', 'Crow'];
const PREFIX = ['Mc', 'Mac', "O'"];
const PREFIX_LAST = ['Nugget', 'Toole', 'Grubb', 'Biscuit', 'Gravy', 'Muffin', 'Pickle', 'Doodle', 'Snack', 'Fumble', 'Crumb', 'Burger', 'Waffle', 'Lump',
  'Stuffin', 'Nacho', 'Pudding', 'Grizzle', 'Wiggle', 'Thud', 'Bonk', 'Dunk', 'Slurp', 'Munch', 'Chomp', 'Gobble', 'Hogg', 'Mudd', 'Stinky', 'Flub',
  'Sneeze', 'Wobble', 'Bumble', 'Rumble', 'Tumble', 'Fizzle', 'Dribble', 'Squish', 'Clank', 'Splat'];

const MAX = 14;
const fits = (n) => n.length <= MAX;

// Every possible name for one sex. Built once, then cached.
const cache = {};
function allNames(sex) {
  if (cache[sex]) return cache[sex];
  const firsts = sex === 'f' ? FIRST_F : FIRST_M;
  const out = new Set();
  for (const f of firsts) {
    for (const n of NICKS) out.add(f + ' ' + n);
    for (const t of THE) out.add(f + ' the ' + t);
    for (const p of PREFIX) for (const l of PREFIX_LAST) out.add(f + ' ' + p + l);
    for (const l of LAST) out.add(f + ' ' + l);
  }
  for (const n of NICKS) for (const l of LAST) if (n !== l) out.add(n + ' ' + l);
  cache[sex] = [...out].filter(fits);
  return cache[sex];
}
export function nameCount(sex) { return allNames(sex).length; }

// Pick a name with a fresh random roll, skipping anything shown recently
// or already used by a save slot.
const RECENT_KEY = 'lo_recentNames';
const RECENT_MAX = 300;
function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
}
function saveRecent(list) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(-RECENT_MAX))); } catch { /* storage blocked */ }
}
function roll(n) {
  // crypto gives better randomness than Math.random on some phones.
  try {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % n;
  } catch { return Math.floor(Math.random() * n); }
}
export function randomHeroName(sex, taken = []) {
  const pool = allNames(sex);
  const recent = loadRecent();
  const avoid = new Set([...recent, ...taken].map((x) => String(x).toLowerCase()));
  // Also avoid the same first word as the last few names, so it feels varied.
  const lastFirsts = new Set(recent.slice(-4).map((x) => x.split(' ')[0]));
  let name = pool[roll(pool.length)];
  for (let i = 0; i < 40; i++) {
    const n = pool[roll(pool.length)];
    if (!avoid.has(n.toLowerCase()) && !lastFirsts.has(n.split(' ')[0])) { name = n; break; }
  }
  recent.push(name);
  saveRecent(recent);
  return name;
}
