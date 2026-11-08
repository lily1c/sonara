import * as Tone from 'tone';
export type Instrument = 'piano' | 'drums' | 'violin' | 'saxophone';
export const notes=['C4','D4','E4','F4','G4','A4','B4','C5'] as const;
export const violinNotes=['C4','D4','E4','F4','G4','A4','B4','C5'];
export const saxNotes=['C4','D4','E4','F4','G4','A4','B4','C5'];
let sax:Tone.Sampler|undefined,saxLoad:Promise<void>|undefined,saxHeld:string|null=null;
export const drumNames=['Kick','Snare','Hi-hat','Tom'];
let violin:Tone.Sampler|undefined, violinLoad:Promise<void>|undefined;
let bowNote:number|null=null;
let synth:Tone.PolySynth|undefined, kick:Tone.MembraneSynth|undefined, snare:Tone.NoiseSynth|undefined, hat:Tone.MetalSynth|undefined, tom:Tone.MembraneSynth|undefined;
let room:Tone.Reverb|undefined, eq:Tone.EQ3|undefined, limiter:Tone.Limiter|undefined;
function output(){return limiter??=new Tone.Limiter(-1).toDestination();}
export function setVolume(db:number){Tone.getDestination().volume.rampTo(Math.max(-30,Math.min(0,db)),.1);}
async function loadViolin(){
 if(violin?.loaded)return;
 if(!violinLoad){
  violinLoad=(async()=>{
   room??=new Tone.Reverb({decay:1.15,preDelay:.015,wet:.12}).connect(output());
   eq??=new Tone.EQ3({low:-2,mid:0,high:-3,lowFrequency:220,highFrequency:3800}).connect(room);
   await room.ready;
   await new Promise<void>((resolve,reject)=>{
    violin=new Tone.Sampler({urls:{G3:'G3.wav',C4:'C4.wav',A4:'A4.wav',E5:'E5.wav'},baseUrl:`${import.meta.env.BASE_URL}samples/violin/`,attack:.045,release:.22,curve:'exponential',volume:-8,onload:resolve,onerror:reject}).connect(eq!);
   });
  })().catch(error=>{violin?.dispose();violin=undefined;violinLoad=undefined;throw error;});
 }
 await violinLoad;
}
async function loadSax(){
 if(sax?.loaded)return;
 if(!saxLoad)saxLoad=new Promise<void>((resolve,reject)=>{
  sax=new Tone.Sampler({urls:{C3:'C3.wav',E3:'E3.wav',C4:'C4.wav','F#4':'Fs4.wav'},baseUrl:`${import.meta.env.BASE_URL}samples/saxophone/`,attack:.04,release:.18,volume:-13,onload:resolve,onerror:reject}).connect(output());
 }).catch(e=>{sax?.dispose();sax=undefined;saxLoad=undefined;throw e;});
 await saxLoad;
}
export function saxSound(lane:number|null,register=false){
 if(!sax?.loaded)return;const pitch=lane===null?null:saxNotes[lane+(register?4:0)];
 if(pitch===saxHeld)return;const now=Tone.now();if(saxHeld)sax.triggerRelease(saxHeld,now);saxHeld=pitch;if(pitch)sax.triggerAttack(pitch,now,.8);
}
export async function unlock(instrument:Instrument='piano'){
 await Tone.start();
 synth??=new Tone.PolySynth(Tone.Synth,{oscillator:{type:'triangle'},envelope:{attack:.015,decay:.3,sustain:.12,release:1.2},volume:-15}).connect(output());
 kick??=new Tone.MembraneSynth({pitchDecay:.05,octaves:6,volume:-14}).connect(output());
 snare??=new Tone.NoiseSynth({noise:{type:'white'},envelope:{attack:.003,decay:.15,sustain:0},volume:-20}).connect(output());
 hat??=new Tone.MetalSynth({envelope:{attack:.001,decay:.06,release:.02},volume:-27}).connect(output());
 tom??=new Tone.MembraneSynth({pitchDecay:.03,octaves:3,volume:-17}).connect(output());
 if(instrument==='violin')await loadViolin();if(instrument==='saxophone')await loadSax();
}
export function play(lane:number,instrument:Instrument='piano'){
 const now=Tone.now();
 if(instrument==='saxophone'){if(sax?.loaded){sax.releaseAll(now);saxHeld=null;sax.triggerAttackRelease(saxNotes[lane],.8,now,.8);}return;}
 if(instrument==='violin'){
  if(!violin?.loaded)return;
  violin.releaseAll(now);bowNote=null;violin.triggerAttackRelease(violinNotes[lane],1.1,now,.8);return;
 }
 if(instrument==='piano'){synth?.triggerAttackRelease(notes[lane],.4,now);return;}
 if(lane===0)kick?.triggerAttackRelease('C1',.15,now);
 if(lane===1)snare?.triggerAttackRelease(.12,now);
 if(lane===2)hat?.triggerAttackRelease('C5',.04,now);
 if(lane===3)tom?.triggerAttackRelease('G2',.18,now);
}
export function bowSound(lane:number|null){
 if(!violin?.loaded||lane===bowNote)return;
 const now=Tone.now();
 if(bowNote!==null)violin.triggerRelease(violinNotes[bowNote],now);
 bowNote=lane;
 if(lane!==null)violin.triggerAttack(violinNotes[lane],now,.8);
}
export function disposeAudio(){
 [synth,kick,snare,hat,tom,violin,sax,eq,room,limiter].forEach(s=>s?.dispose());
 violin=undefined;violinLoad=undefined;bowNote=null;sax=undefined;saxLoad=undefined;saxHeld=null;synth=undefined;kick=undefined;snare=undefined;hat=undefined;tom=undefined;eq=undefined;room=undefined;limiter=undefined;
}

// Schedule original backing and count-in directly on the audio clock.
export function scheduleLesson(delaySeconds:number,bpm:number,beats=32){
 const bass=new Tone.Synth({oscillator:{type:'sine'},envelope:{attack:.02,decay:.3,sustain:.05,release:.3},volume:-22}).connect(output());
 const click=new Tone.MembraneSynth({octaves:1,pitchDecay:.01,volume:-25}).connect(output());
 const beat=60/bpm,start=Tone.now()+delaySeconds;
 for(let i=-4;i<0;i++){const at=start+i*beat;if(at>Tone.now())click.triggerAttackRelease('C5',.035,at);}
 for(let i=0;i<beats/4;i++){const at=start+i*4*beat;if(at>Tone.now())bass.triggerAttackRelease(['C3','G2','C3','G2'][i%4],beat*1.5,at);}
 return ()=>{bass.dispose();click.dispose();};
}

export function startPracticeGroove(){
 const bass=new Tone.Synth({oscillator:{type:'sine'},envelope:{attack:.015,decay:.2,sustain:.1,release:.2},volume:-25}).connect(output());
 const drum=new Tone.MembraneSynth({pitchDecay:.025,octaves:3,volume:-27}).connect(output());
 const tick=new Tone.NoiseSynth({envelope:{attack:.001,decay:.025,sustain:0},volume:-32}).connect(output());
 let next=Tone.now()+.1,step=0;const eighth=60/72/2;
 const timer=setInterval(()=>{const now=Tone.now();if(next<now-.2){const skipped=Math.ceil((now-next)/eighth);step+=skipped;next+=skipped*eighth;}while(next<now+.15){if(step%4===0)bass.triggerAttackRelease(['C3','G2','C3','G2'][Math.floor(step/4)%4],.3,next);if(step%4===0)drum.triggerAttackRelease('C1',.1,next);if(step%2===1)tick.triggerAttackRelease(.025,next);step++;next+=eighth;}},75);
 return ()=>{clearInterval(timer);bass.dispose();drum.dispose();tick.dispose();};
}
