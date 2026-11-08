# SONARA songbook

The first library includes two public-domain melodies and one original composition. These are new simplified SONARA game arrangements, typed into the shared chart module, not downloaded modern arrangements or copied recordings. No lyrics or commercial song audio are included.

| Song | Source composition | Arrangement | Length / default pace |
| --- | --- | --- | --- |
| Twinkle, Twinkle Little Star | Traditional French tune, also known as Ah! vous dirai-je, maman | SONARA C-major melody and original drum part, MIT | 48 beats / 60 BPM |
| Ode to Joy | Ludwig van Beethoven, Symphony No. 9 melody | SONARA simplified opening theme in C major and original drum part, MIT | 32 beats / 60 BPM |
| First Jam | Original SONARA composition | Original per-instrument charts, MIT | 32 beats / 80 BPM |

Composition provenance references checked:

- Mutopia catalog 2236, Ah Vous Dirai-Je Maman, identifies the Twinkle theme and marks its edition Public Domain: https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2236. The traditional theme is not credited to Mozart; his variations are a separate composition. We have not incorporated that guitar arrangement.
- Mutopia catalog 528, Ode to Joy, composer L. V. Beethoven, Public Domain: https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=528.

Public posting alone does not establish public-domain status. Adding more songs requires reviewing composition and arrangement/recording permissions separately. The library exposes provenance links for these historical melodies; modern commercial songs are not automatically imported. No song-recognition service is used.

## Play and compete

Choose a song in solo mode before starting. Listen plays the first eight notes using local piano synthesis and stops on selection/start. Solo tracks a local performance best separately for song, instrument and tempo in this browser; it is not a global or verified leaderboard. Keyboard/touch input counts.

In a band room, the host opens the songbook, chooses a song, and everyone readies again. The server owns the selected chart, rejects stale-chart hits, and locks the selection during a take. Notes, duration, accompaniment length, result headings and poster title follow the selected song. Results rank players by performance percentage: points / (number of chart notes × 100). This normalizes melody/drum charts with different note counts. Equal percentages share a rank. Perfect = 100, Good = 60, Miss = 0.

Piano, violin and saxophone now share eight C-major pitches C4–C5 so the historical melodies sound in the same key across a band. Sax upper-thumb selection changes from the lower four pitches C/D/E/F to the upper four G/A/B/C; it is an accessible game mapping, not authentic saxophone fingering. Violin remains a sampled bow/holding-hand instrument. Existing recorded sample licenses are unchanged.

The First Band receipt now includes the selected song ID. Its other trust and Devnet limitations are documented in SOLANA.md. 36 tests pass, including chart bounds/order, selected-song scoring and expiration, normalized ranking, and two-client song selection/readiness/stale-event checks.
