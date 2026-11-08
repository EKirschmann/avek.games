# AVEK public site

Public studio, policy, support and tester pages, served by GitHub Pages at
**https://avek.games/**. No build step, no third-party fonts, no analytics, no embedded
advertising. `.nojekyll` stops Pages from processing the files.

Game source, builds, saves and signing material live in separate private repositories and
must never be copied here.

```
/                      studio page        <- Play Console "developer website"
/CNAME                 avek.games
/app-ads.txt           NOT YET PRESENT - see below
/privacy.html          legacy redirect, do not delete (see below)
/site.css              shared styling
/neon-bastion/         index, beta, support, privacy, data
/neon-bastion/img/     optimised screenshots and icons (see below)
/thornmarch/            index, support, privacy, data
/glassmarch/            index and devlog (PC, early prototype; no policy pages until it is distributed)
/glassmarch/media/      web stills (WebP, 1200 and 2000 wide) and muted WebM loops with posters
/loops.js               plays muted loops only while on screen; none under reduced motion
/turret.svg, thorn.svg, glass.svg   one emblem per game, drawn in its accent
```

Each game gets its own folder. One `app-ads.txt` at the root covers every game, because the
AdMob publisher ID is per account and the file is read per root domain.

## Play Console fields

| Field | Value |
| --- | --- |
| Developer website | `https://avek.games/` |
| Privacy policy | `https://avek.games/neon-bastion/privacy.html` |
| Data deletion | `https://avek.games/neon-bastion/data.html` |

## Before publishing

- `neon-bastion/beta.html` has no placeholders left. The tester Google Group is
  https://groups.google.com/g/neon-bastion-beta (`neon-bastion-beta@googlegroups.com`,
  anyone may join without approval) and the Play opt-in link is
  https://play.google.com/apps/testing/com.gentso.neonbastion . The closed track reads
  its tester list from that group.
- **`app-ads.txt` is deliberately absent.** It must be the exact publisher line issued by
  AdMob, at this domain's root, and the domain must be the one named as the developer
  website on the listing. Do not invent a publisher ID. Allow about 24 hours for the crawl.
- **Do not delete `/privacy.html`.** Released builds of Neon Bastion have
  `https://ekirschmann.github.io/neon-bastion-public/privacy.html` compiled in
  (`scripts/title.gd`). Setting a custom domain makes GitHub redirect that to
  `https://avek.games/privacy.html`, and this stub forwards it to the real policy. It can go
  once no supported build still carries the old URL.
- **The images in `neon-bastion/img/` are already-public Play listing assets**, resized
  and recompressed from the game repository's `store/listing-v0104/` captures and
  `assets/icon.png`. They are the only game material that belongs here. They are current
  as of v0.104.0. Recapture them whenever the build's appearance or labelling changes;
  `docs/store-listing.md` in the game repository holds the exact capture commands.
- The privacy policy must keep matching the shipped build. It currently describes a game
  with no advertising, no analytics, no accounts and no in-app purchases. Update it, the
  data page and the Play Console declarations in the same batch as any of those features.
