# Third-party notices

SONARA source code is MIT. Third-party code and model weights retain their own terms. No external artwork, commercial songs, soundfonts or web fonts are bundled. Piano/drums use Tone.js synthesis; violin uses the CC0 recordings documented below.

## MediaPipe assets

- SDK and WASM: `@mediapipe/tasks-vision` 0.10.22-rc.20250304, Apache-2.0, Google LLC. WASM is copied verbatim from that npm package. License text is included under `public/licenses/`.
- Hand Landmarker float16 model, version 1: https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task
- Official model/task documentation: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker
- MediaPipe project license: Apache-2.0, https://github.com/google-ai-edge/mediapipe/blob/master/LICENSE
- Model card: https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Hand%20Tracking%20%28Lite_Full%29%20with%20Fairness%20Oct%202021.pdf

The official MediaPipe model is used unmodified. Keep these notices with redistributed model/WASM assets. No inference service is used. React and React DOM are MIT; Tone.js is MIT. Their installed package licenses and transitive notices are copied into `public/licenses/` so deployments retain them.

## Installed dependency inventory

This inventory includes development tooling; lockfile determines exact dependencies. License files supplied in installed packages are copied into `public/licenses/`.

| Package | Version | Declared license |
| --- | --- | --- |
| @babel/code-frame | 7.29.7 | MIT |
| @babel/compat-data | 7.29.7 | MIT |
| @babel/core | 7.29.13 | MIT |
| @babel/generator | 7.29.13 | MIT |
| @babel/helper-compilation-targets | 7.29.13 | MIT |
| @babel/helper-globals | 7.29.7 | MIT |
| @babel/helper-module-imports | 7.29.7 | MIT |
| @babel/helper-module-transforms | 7.29.13 | MIT |
| @babel/helper-plugin-utils | 7.29.7 | MIT |
| @babel/helper-string-parser | 7.29.13 | MIT |
| @babel/helper-validator-identifier | 7.29.7 | MIT |
| @babel/helper-validator-option | 7.29.7 | MIT |
| @babel/helpers | 7.29.13 | MIT |
| @babel/parser | 7.29.13 | MIT |
| @babel/plugin-transform-react-jsx-self | 7.29.7 | MIT |
| @babel/plugin-transform-react-jsx-source | 7.29.7 | MIT |
| @babel/runtime | 7.29.13 | MIT |
| @babel/template | 7.29.7 | MIT |
| @babel/traverse | 7.29.13 | MIT |
| @babel/types | 7.29.11 | MIT |
| @esbuild/aix-ppc64 | 0.25.12 | MIT |
| @esbuild/aix-ppc64 | 0.28.2 | MIT |
| @esbuild/android-arm | 0.25.12 | MIT |
| @esbuild/android-arm | 0.28.2 | MIT |
| @esbuild/android-arm64 | 0.25.12 | MIT |
| @esbuild/android-arm64 | 0.28.2 | MIT |
| @esbuild/android-x64 | 0.25.12 | MIT |
| @esbuild/android-x64 | 0.28.2 | MIT |
| @esbuild/darwin-arm64 | 0.25.12 | MIT |
| @esbuild/darwin-arm64 | 0.28.2 | MIT |
| @esbuild/darwin-x64 | 0.25.12 | MIT |
| @esbuild/darwin-x64 | 0.28.2 | MIT |
| @esbuild/freebsd-arm64 | 0.25.12 | MIT |
| @esbuild/freebsd-arm64 | 0.28.2 | MIT |
| @esbuild/freebsd-x64 | 0.25.12 | MIT |
| @esbuild/freebsd-x64 | 0.28.2 | MIT |
| @esbuild/linux-arm | 0.25.12 | MIT |
| @esbuild/linux-arm | 0.28.2 | MIT |
| @esbuild/linux-arm64 | 0.25.12 | MIT |
| @esbuild/linux-arm64 | 0.28.2 | MIT |
| @esbuild/linux-ia32 | 0.25.12 | MIT |
| @esbuild/linux-ia32 | 0.28.2 | MIT |
| @esbuild/linux-loong64 | 0.25.12 | MIT |
| @esbuild/linux-loong64 | 0.28.2 | MIT |
| @esbuild/linux-mips64el | 0.25.12 | MIT |
| @esbuild/linux-mips64el | 0.28.2 | MIT |
| @esbuild/linux-ppc64 | 0.25.12 | MIT |
| @esbuild/linux-ppc64 | 0.28.2 | MIT |
| @esbuild/linux-riscv64 | 0.25.12 | MIT |
| @esbuild/linux-riscv64 | 0.28.2 | MIT |
| @esbuild/linux-s390x | 0.25.12 | MIT |
| @esbuild/linux-s390x | 0.28.2 | MIT |
| @esbuild/linux-x64 | 0.25.12 | MIT |
| @esbuild/linux-x64 | 0.28.2 | MIT |
| @esbuild/netbsd-arm64 | 0.25.12 | MIT |
| @esbuild/netbsd-arm64 | 0.28.2 | MIT |
| @esbuild/netbsd-x64 | 0.25.12 | MIT |
| @esbuild/netbsd-x64 | 0.28.2 | MIT |
| @esbuild/openbsd-arm64 | 0.25.12 | MIT |
| @esbuild/openbsd-arm64 | 0.28.2 | MIT |
| @esbuild/openbsd-x64 | 0.25.12 | MIT |
| @esbuild/openbsd-x64 | 0.28.2 | MIT |
| @esbuild/openharmony-arm64 | 0.25.12 | MIT |
| @esbuild/openharmony-arm64 | 0.28.2 | MIT |
| @esbuild/sunos-x64 | 0.25.12 | MIT |
| @esbuild/sunos-x64 | 0.28.2 | MIT |
| @esbuild/win32-arm64 | 0.25.12 | MIT |
| @esbuild/win32-arm64 | 0.28.2 | MIT |
| @esbuild/win32-ia32 | 0.25.12 | MIT |
| @esbuild/win32-ia32 | 0.28.2 | MIT |
| @esbuild/win32-x64 | 0.25.12 | MIT |
| @esbuild/win32-x64 | 0.28.2 | MIT |
| @jridgewell/gen-mapping | 0.3.13 | MIT |
| @jridgewell/remapping | 2.3.5 | MIT |
| @jridgewell/resolve-uri | 3.1.2 | MIT |
| @jridgewell/sourcemap-codec | 1.6.0 | MIT |
| @jridgewell/trace-mapping | 0.3.31 | MIT |
| @mediapipe/tasks-vision | 0.10.22-rc.20250304 | Apache-2.0 |
| @metaplex-foundation/mpl-core | 1.10.0 | Apache-2.0 |
| @metaplex-foundation/umi | 1.6.0 | MIT |
| @metaplex-foundation/umi-bundle-defaults | 1.6.0 | MIT |
| @metaplex-foundation/umi-downloader-http | 1.6.0 | MIT |
| @metaplex-foundation/umi-eddsa-web3js | 1.6.0 | MIT |
| @metaplex-foundation/umi-http-fetch | 1.6.0 | MIT |
| @metaplex-foundation/umi-options | 1.6.0 | MIT |
| @metaplex-foundation/umi-program-repository | 1.6.0 | MIT |
| @metaplex-foundation/umi-public-keys | 1.6.0 | MIT |
| @metaplex-foundation/umi-rpc-chunk-get-accounts | 1.6.0 | MIT |
| @metaplex-foundation/umi-rpc-web3js | 1.6.0 | MIT |
| @metaplex-foundation/umi-serializer-data-view | 1.6.0 | MIT |
| @metaplex-foundation/umi-serializers | 1.6.0 | MIT |
| @metaplex-foundation/umi-serializers-core | 1.6.0 | MIT |
| @metaplex-foundation/umi-serializers-encodings | 1.6.0 | MIT |
| @metaplex-foundation/umi-serializers-numbers | 1.6.0 | MIT |
| @metaplex-foundation/umi-transaction-factory-web3js | 1.6.0 | MIT |
| @metaplex-foundation/umi-web3js-adapters | 1.6.0 | MIT |
| @msgpack/msgpack | 3.1.3 | ISC |
| @noble/curves | 1.9.7 | MIT |
| @noble/hashes | 1.8.0 | MIT |
| @rolldown/pluginutils | 1.0.0-beta.27 | MIT |
| @rollup/rollup-android-arm-eabi | 4.68.0 | MIT |
| @rollup/rollup-android-arm64 | 4.68.0 | MIT |
| @rollup/rollup-android-x64 | 4.68.0 | MIT |
| @rollup/rollup-darwin-arm64 | 4.68.0 | MIT |
| @rollup/rollup-darwin-x64 | 4.68.0 | MIT |
| @rollup/rollup-freebsd-arm64 | 4.68.0 | MIT |
| @rollup/rollup-freebsd-x64 | 4.68.0 | MIT |
| @rollup/rollup-linux-arm-gnueabihf | 4.68.0 | MIT |
| @rollup/rollup-linux-arm-musleabihf | 4.68.0 | MIT |
| @rollup/rollup-linux-arm64-gnu | 4.68.0 | MIT |
| @rollup/rollup-linux-arm64-musl | 4.68.0 | MIT |
| @rollup/rollup-linux-loong64-gnu | 4.68.0 | MIT |
| @rollup/rollup-linux-loong64-musl | 4.68.0 | MIT |
| @rollup/rollup-linux-ppc64-gnu | 4.68.0 | MIT |
| @rollup/rollup-linux-ppc64-musl | 4.68.0 | MIT |
| @rollup/rollup-linux-riscv64-gnu | 4.68.0 | MIT |
| @rollup/rollup-linux-riscv64-musl | 4.68.0 | MIT |
| @rollup/rollup-linux-s390x-gnu | 4.68.0 | MIT |
| @rollup/rollup-linux-x64-gnu | 4.68.0 | MIT |
| @rollup/rollup-linux-x64-musl | 4.68.0 | MIT |
| @rollup/rollup-openbsd-x64 | 4.68.0 | MIT |
| @rollup/rollup-openharmony-arm64 | 4.68.0 | MIT |
| @rollup/rollup-win32-arm64-msvc | 4.68.0 | MIT |
| @rollup/rollup-win32-ia32-msvc | 4.68.0 | MIT |
| @rollup/rollup-win32-x64-gnu | 4.68.0 | MIT |
| @rollup/rollup-win32-x64-msvc | 4.68.0 | MIT |
| @solana/buffer-layout | 4.0.1 | MIT |
| @solana/codecs-core | 5.5.1 | MIT |
| @solana/codecs-numbers | 5.5.1 | MIT |
| @solana/errors | 5.5.1 | MIT |
| @solana/wallet-standard-features | 1.5.0 | Apache-2.0 |
| @solana/web3.js | 1.99.0 | MIT |
| @swc/helpers | 0.5.24 | Apache-2.0 |
| @types/babel__core | 7.20.5 | MIT |
| @types/babel__generator | 7.27.0 | MIT |
| @types/babel__template | 7.4.4 | MIT |
| @types/babel__traverse | 7.28.0 | MIT |
| @types/chai | 5.2.3 | MIT |
| @types/connect | 3.4.38 | MIT |
| @types/deep-eql | 4.0.2 | MIT |
| @types/estree | 1.0.10 | MIT |
| @types/node | 12.20.55 | MIT |
| @types/node | 26.6.6 | MIT |
| @types/react | 19.3.0 | MIT |
| @types/react-dom | 19.3.0 | MIT |
| @types/uuid | 10.0.0 | MIT |
| @types/ws | 7.4.7 | MIT |
| @types/ws | 8.18.2 | MIT |
| @vitejs/plugin-react | 4.7.0 | MIT |
| @vitest/mocker | 5.1.0 | MIT |
| @vitest/spy | 5.1.0 | MIT |
| @wallet-standard/app | 1.1.1 | Apache-2.0 |
| @wallet-standard/base | 1.1.1 | Apache-2.0 |
| @wallet-standard/features | 1.1.1 | Apache-2.0 |
| agentkeepalive | 4.6.0 | MIT |
| assertion-error | 2.0.1 | MIT |
| automation-events | 7.1.19 | MIT |
| base-x | 3.0.11 | MIT |
| base64-js | 1.5.1 | MIT |
| baseline-browser-mapping | 2.11.35 | Apache-2.0 |
| bn.js | 5.2.5 | MIT |
| borsh | 0.7.0 | Apache-2.0 |
| browserslist | 4.29.5 | MIT |
| bs58 | 4.0.1 | MIT |
| buffer | 6.0.3 | MIT |
| bufferutil | 4.2.0 | MIT |
| caniuse-lite | 1.0.30001823 | CC-BY-4.0 |
| chai | 6.3.0 | MIT |
| chalk | 5.6.2 | MIT |
| commander | 14.0.2 | MIT |
| commander | 2.20.3 | MIT |
| convert-source-map | 2.0.0 | MIT |
| csstype | 3.2.3 | MIT |
| debug | 4.4.3 | MIT |
| delay | 5.0.0 | MIT |
| electron-to-chromium | 1.5.478 | ISC |
| es-module-lexer | 2.3.2 | MIT |
| es6-promise | 4.2.8 | MIT |
| es6-promisify | 5.0.0 | MIT |
| esbuild | 0.25.12 | MIT |
| esbuild | 0.28.2 | MIT |
| escalade | 3.2.0 | MIT |
| estree-walker | 3.0.3 | MIT |
| eventemitter3 | 5.0.4 | MIT |
| expect-type | 1.4.0 | Apache-2.0 |
| eyes | 0.1.8 | See package license |
| fast-stable-stringify | 1.0.0 | MIT |
| fdir | 6.5.0 | MIT |
| fsevents | 2.3.3 | MIT |
| gensync | 1.0.0-beta.2 | MIT |
| humanize-ms | 1.2.1 | MIT |
| ieee754 | 1.2.1 | BSD-3-Clause |
| isomorphic-ws | 4.0.1 | MIT |
| jayson | 4.3.0 | MIT |
| js-tokens | 4.0.0 | MIT |
| jsesc | 3.1.0 | MIT |
| json-stringify-safe | 5.0.1 | ISC |
| json5 | 2.2.3 | MIT |
| lru-cache | 5.1.1 | ISC |
| magic-string | 1.4.5 | MIT |
| ms | 2.1.3 | MIT |
| nanoid | 3.3.20 | MIT |
| node-fetch | 2.7.0 | MIT |
| node-gyp-build | 4.8.4 | MIT |
| node-releases | 2.0.63 | MIT |
| obug | 3.0.0 | MIT |
| picocolors | 1.1.1 | ISC |
| picomatch | 4.0.7 | MIT |
| postcss | 8.5.32 | MIT |
| react | 19.3.1 | MIT |
| react-dom | 19.3.1 | MIT |
| react-refresh | 0.17.0 | MIT |
| rollup | 4.68.0 | MIT |
| rpc-websockets | 9.3.9 | LGPL-3.0-only |
| safe-buffer | 5.2.1 | MIT |
| scheduler | 0.28.0 | MIT |
| semver | 6.3.2 | ISC |
| source-map-js | 1.2.2 | BSD-3-Clause |
| standardized-audio-context | 25.3.77 | MIT |
| std-env | 4.3.0 | MIT |
| stream-chain | 2.2.5 | BSD-3-Clause |
| stream-json | 1.9.1 | BSD-3-Clause |
| superstruct | 2.0.2 | MIT |
| text-encoding-utf-8 | 1.0.2 | See package license |
| tinybench | 6.2.3 | MIT |
| tinyexec | 1.3.1 | MIT |
| tinyglobby | 0.2.17 | MIT |
| tone | 15.1.22 | MIT |
| tr46 | 0.0.3 | MIT |
| tslib | 2.9.1 | 0BSD |
| tsx | 4.23.15 | MIT |
| typescript | 5.7.3 | Apache-2.0 |
| undici-types | 8.9.0 | MIT |
| update-browserslist-db | 1.3.4 | MIT |
| utf-8-validate | 5.0.10 | MIT |
| utf-8-validate | 6.0.6 | MIT |
| uuid | 14.0.3 | MIT |
| uuid | 8.3.2 | MIT |
| vite | 6.4.5 | MIT |
| vitest | 5.1.0 | MIT |
| webidl-conversions | 3.0.1 | BSD-2-Clause |
| whatwg-url | 5.0.0 | MIT |
| why-is-node-running | 3.2.1 | MIT |
| ws | 7.5.13 | MIT |
| ws | 8.22.1 | MIT |
| yallist | 3.1.1 | ISC |
| yaml | 2.9.1 | ISC |

## Violin recordings — VSCO 2 Community Edition

Recorded by Sam Gossner & Simon Dalzell; sample cutting by Elan Hickler / Soundemote. Library by Versilian Studios. CC0 1.0 Universal.

Source: https://github.com/sgossner/VSCO-2-CE at commit `440300901dfe9275fd84e0b7763af1f8443ae62e`.

Four soft arco-vibrato solo violin WAVs: G3, C4, A4, E5, from `Strings/Solo Violin/Arco Vib/LLVln_ArcoVib_<pitch>_p.wav`. Peak normalized independently to -3 dBFS; original PCM16 stereo 44.1 kHz rate/length retained; WAV metadata removed. Local filenames use the root note. Original hashes, shipped hashes, gain adjustments and durations are in `public/samples/violin/manifest.json`. Normalization script: `scripts/normalize-violin.py` (run on freshly downloaded originals).

Upstream CC0 legal text and README are retained alongside the samples as LICENSE.txt and UPSTREAM-README.md. D4 is generated by Tone.Sampler repitching the closest sampled note. No external audio service or runtime CDN. These recordings are licensed separately from the MIT app code.

## Multiplayer

`ws` is MIT, with license retained in public/licenses. `tsx` is MIT development/runtime tooling. First Jam melody, bass accompaniment and note charts are original SONARA project material under MIT. No existing song arrangement was copied.

## Patrick Hand font

Patrick Hand Regular, by Patrick Wagesreiter, SIL Open Font License 1.1. Source: https://github.com/google/fonts/tree/main/ofl/patrickhand. Font and unmodified OFL are served locally in public/fonts. Original SONARA musical doodles in public/doodles are MIT project artwork; no image content from the visual reference was copied.

## Tenor saxophone recordings — VCSL

Versilian Community Sample Library, Versilian Studios LLC, CC0 1.0. Upstream source: https://github.com/sgossner/VCSL at commit c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e. Four non-vibrato tenor saxophone roots: C3, E3, C4 and F#4, velocity layer 2 / round-robin 1, from Aerophones/Reed Aerophones/Tenor Saxophone/Non-Vibrato/BrettTenor_NV_Main_<pitch>_vl2_rr1.wav. Peak normalized to -3dBFS; original 24-bit stereo PCM format retained (see manifest for hashes and normalization gain). LICENSE.txt and UPSTREAM-README.md are retained next to the recordings. Other pitches are generated by repitching. Source credit is retained even though CC0 does not require attribution.

All dock instrument drawings are original MIT SONARA artwork. Rhythm Plus was consulted as product-flow inspiration; no code, charts, songs or artwork were incorporated.

## Solana integration

Wallet Standard packages, Metaplex Umi/Core SDKs and their dependencies retain their declared licenses in the inventory above and the supplied license files in public/licenses. The musician illustration is original SONARA MIT artwork. No wallet brand artwork is bundled. See docs/SOLANA.md for dependency audit limitations.

## Public-domain melody songbook

Twinkle, Twinkle Little Star (traditional French melody) and Ode to Joy (L. V. Beethoven) use new simplified SONARA game arrangements, distributed as MIT project material. No lyrics, commercial recordings or third-party modern arrangement files are bundled. Composition provenance and public-domain catalog references are retained in docs/SONGS.md and in the song picker. First Jam remains an original SONARA composition.

Standalone doodle SVG exports embed the local Patrick Hand font as a data URI and retain the complete supplied OFL text in SVG metadata. Instrument musicians, borders, textures, stamps and song decorations are original SONARA vector artwork, MIT. No AI image generation or reference-image tracing is used for these exports.
