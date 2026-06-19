# Wyrdfall — Test Map Prototype

> The gods have fallen. The world lies in ruins. Rise from the ashes of Ragnarok.

A click-based 2D Norse post-apocalyptic text RPG. This repo is a **static, self-contained prototype** of the test map (Hub -> Ashen Valholl). No build step, no server — just open `index.html`.

## Run it

- **Local:** clone the repo and open `index.html` in a browser. Game state is saved in `localStorage`.
- **GitHub Pages:** Settings -> Pages -> Source: `main` / root. Play from the published URL.

Sprites are real WebP files under `sprites/` (split into `tiles/`, `monsters/`, `npcs/`, `items/`, `classes/`) and mapped to keys in `assets/sprites.js`.

## Gameplay

Pure-click map (no movement keys). On a 7x7 grid only these tiles are clickable:

- **Empty ground** — pick up HP / Mana / Stamina drops, and the spot can later become a monster respawn point.
- **Monster** — opens the monster view, then battle.
- **Portal (up / down)** — travel between maps.

Trees, rocks and hills are obstacles (not clickable).

Battle runs **5 rounds** (+1 if you bring a pet) and costs **1 stamina**. Monster HP persists between fights. When a monster dies you gain XP + Gull, and it respawns on a different empty tile.

Resources regenerate over time: **HP +10%/min, Mana +10%/min, Stamina +1/min**.

## Routing

The prototype uses query params that mirror the planned server routes:

| Server route (planned) | Prototype query param |
| --- | --- |
| `/maps?id=<map>&r=<seed>` | `?view=maps&id=<map>&r=<seed>` |
| `/monster/view?id_monster=<id>&r=<seed>` | `?view=monster&id_monster=<id>&r=<seed>` |
| `/monster/battle/attack?id_monster=<id>&r=<seed>` | `?view=battle&id_monster=<id>&r=<seed>` |

`r` is a single-use anti-spam seed regenerated on every action.

## Maps

| id | Name | Type |
| --- | --- | --- |
| `hub_midgard` | Midgard's Last Refuge | Safe |
| `forest_01` | Forest 1 | Combat (Lv 1-5) |
| `forest_02` | Forest 2 | Combat (Lv 5-10) |
| `city_ashenvalholl` | Ashen Valholl | Safe |

## Monsters

`gaunt_wolf`, `decayed_draugr`, `draugr_warrior`, `ice_bear`.

## File structure

```
index.html
sprites/         # real WebP sprites: tiles/ monsters/ npcs/ items/ classes/
assets/
  style.css
  sprites.js   # maps sprite keys -> sprites/<category>/<name>.webp
  data.js      # monsters, NPCs, maps
  game.js      # engine: routing, rendering, battle, save
```

## Status

Prototype / test build. Default character is an **Einherjar Lv 1**. Next steps: port to a real server (PHP/Node) for server-side seed validation and PvP.
