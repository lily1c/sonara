import { mkdir, cp, writeFile } from 'node:fs/promises';
await mkdir('public/mediapipe', {recursive:true});
await cp('node_modules/@mediapipe/tasks-vision/wasm','public/mediapipe/wasm',{recursive:true});
const url='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const response=await fetch(url); if(!response.ok) throw new Error(`Model download failed: ${response.status}`);
const data=new Uint8Array(await response.arrayBuffer());
if(data.length<1000000) throw new Error('Unexpected model size');
await writeFile('public/mediapipe/hand_landmarker.task',data);
console.log(`Local MediaPipe assets ready (${data.length} model bytes).`);
