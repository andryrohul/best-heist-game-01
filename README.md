# best-heist-game-01

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/andryrohul/best-heist-game-01/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/andryrohul/best-heist-game-01/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**Meridian Midnight — The Cobalt Star Heist.** A one-room top-down stealth game: Rook the thief crosses the Meridian Gallery, dodges three patrolling guards and two sweeping wall cameras, steals The Cobalt Star from its glass case, and slips out through the green ESCAPE door before the alarm fills. Three routes cross the room — the open main hall, the vent run along the top, the service corridor along the bottom — with plinths, planters and crates as cover that breaks a guard's line of sight. Two decoy coins lure guards away; one EMP blinds the cameras for six seconds. Keyboard and mouse, no network, sounds synthesized in code.

## Run it

```sh
python3 -m http.server 8080 --directory game
```

Then open http://localhost:8080 in desktop Chrome. WASD or arrow keys move (or click to walk there), Q throws a decoy coin toward the mouse, E fires the EMP, R restarts after a win or a capture.

## Layout

- `game/index.html` — page, HUD (alarm meter, tools, timer) and overlays
- `game/src/config.js` — level layout, tuning and palette
- `game/src/world.js` — walls, cover, line of sight, alarm
- `game/src/guards.js` — patrols, vision cones, chase and decoy lures
- `game/src/cameras.js` — sweeping cameras and the EMP freeze
- `game/src/input.js` — keyboard and mouse
- `game/src/render.js` — all canvas drawing
- `game/src/audio.js` — synthesized WebAudio sounds and music
- `game/src/main.js` — game loop, tools, win and caught moments
- `main.ts` — copies `game/` and `screenshots/` to the output and writes `dossier.json`

---

<sub>Entered on [make.fun](https://make.fun/?ref=andryrohul&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
