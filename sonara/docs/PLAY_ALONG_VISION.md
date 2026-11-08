# SONARA play-along vision

Product direction: karaoke for a virtual band. Find a song, choose an instrument, practice a short arrangement slowly, and perform complementary parts together. This document records future scope; no recognition, transcription, imports, tutorials or multiplayer ship in the current instrument prototype.

## Keep the stages separate

1. Identify a recording against a catalog (fingerprinting). This returns identity, not a score or permission.
2. Resolve that identity to an arrangement we can legally use, with explicit composition, arrangement/chart and recording provenance.
3. Import structured MIDI/MusicXML with a FOSS parser; validate tracks, timing, key, range and chart version. A sheet-music PDF is not already machine-readable note data.
4. Author and review beginner parts: reduce pitch range to available zones, simplify rhythm, preserve the song’s recognizable phrase, and disclose simplification.
5. Schedule accompaniment on the audio clock, offer tempo reduction, count-in, loopable phrases, falling-note guides and instrument-specific gestures.
6. Later add synchronized cooperative parts and server-confirmed scoring.

Start with a curated catalog of original compositions or verified public-domain works with original/compatibly licensed arrangements. Manual song selection should work before recognition. Matching a known song to an existing licensed chart is a much smaller problem than transcribing arbitrary mixed recordings into accurate instrumental parts.

## Catalog evidence per song

Record composition title/composer, composition rights basis and jurisdiction, source URL, arranger, arrangement/chart license and attribution, source MIDI/MusicXML checksum/version, sample/backing-recording license, modification notes, difficulty, BPM and instrument mappings. Skip entries with unresolved reuse terms. A repository’s software license does not necessarily license its music assets.

Public posting or free download does not grant redistribution/adaptation rights. Composition, new arrangements, notation editions and recorded performances need separate review as applicable. Recognition and transcription do not bypass those rights. Commercial songs can be added when the needed permissions/licenses are obtained. Do not promise every recognized song is playable.

## Sources

- U.S. Copyright Office, musical compositions versus sound recordings: https://www.copyright.gov/register/pa-sr.html
- U.S. Copyright Office, musicians and reuse: https://www.copyright.gov/engage/musicians/
- VSCO 2 CE instrument recordings (CC0): https://github.com/sgossner/VSCO-2-CE

## Quality gates before expanding the catalog

- Blind listening on target laptop speakers and headphones: no buzzy placeholder violin, clipping, clicks, stuck notes or large loudness jumps.
- Check local asset loading, retry on failure, offline operation and explicit sample attribution.
- Slow movement, zone boundaries and tracking loss should not stutter or leave sustained audio running.
- A short reviewed chart must stay aligned with scheduled accompaniment at both normal and reduced tempos.
- Preserve guest and keyboard/mouse play, local inference and no mandatory paid services.
