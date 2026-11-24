# Long Odds

A top-down pixel RPG for phone browsers. The world is ending, the ultra rich are betting on you, and you have to fight your way down the Spire Below.

This is the Floor 1 prototype:

- 5 save slots, each its own hero. Any slot can be deleted.
- Make a regular person, pick an old job, then a race (12) and class (5) at the dungeon door.
- A new random floor every game: rooms, mobs with random traits, chests, a floor rule, a safe room and the Turnstile King boss.
- Turn-based battles, loot boxes, potions with side effects, crafting and a bag with no limit.
- Doc Vance, a medic who remembers what you do and changes how she treats you.
- Enchanting at the workbench: one enchantment per piece of gear, paid for with Glow Dust. Deeper floors unlock more and make them stronger.
- Quests: people in the safe rooms (and their job boards) hand out 20 quests per floor that teach the game. Quests 19 and 20 are the bosses. Tap Quests on the map to track them.
- BOOKIE, the betting AI narrator, with live odds and audience hype.
- A build number like `1.0.0.20261122.1310` and a Check for updates button on the title screen.

## Play it

Open the GitHub Pages link for this repo on your phone. Tip: use "Add to Home Screen" so it opens full screen.

## Run it on a computer

Any static file server works, for example:

```
python3 -m http.server 8000
```

Then open http://localhost:8000. Local runs show build `1.0.0.dev`.

## How the version number works

Every push to `main` runs `.github/workflows/deploy.yml`, which stamps the files with `1.0.0.YYYYMMDD.HHMM` (Detroit time), writes `version.json` and publishes to GitHub Pages. The Check for updates button compares the running build with `version.json` and reloads into the new one. Saves are kept, because they live in the browser's storage.

## Files

- `js/main.js`: game state, map, battles, bag, safe room and screens
- `js/data.js`: jobs, races, classes, items, loot tables, mobs, traits and BOOKIE lines
- `js/quests.js`: the quest givers, the 60 quests and the quest achievements
- `js/dungeon.js`: random floor generator
- `js/sprites.js`: the palette and 16x16 pixel sprites
- `js/save.js`: the 5 save slots
- `js/version.js`: build version and update check
