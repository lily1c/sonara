import SoloRewardsCard from './multiplayer/SoloRewardsCard';
import {lazy,Suspense,useCallback,useEffect,useRef,useState} from 'react';
import {FilesetResolver,HandLandmarker} from '@mediapipe/tasks-vision';
import {TapDetector,SwipeDetector,type Bounds} from './lib/gestures';
import {unlock,play,notes,drumNames,violinNotes,saxNotes,saxSound,bowSound,setVolume,scheduleLesson,startPracticeGroove,disposeAudio,type Instrument} from './lib/audio';
import SongLibrary from './multiplayer/SongLibrary';
import {songById} from './multiplayer/songs';
import PracticeCoach from './multiplayer/PracticeCoach';
import FeatureBoundary from './FeatureBoundary';
import StartFlow from './StartFlow';
import {useSoloGame} from './multiplayer/useSoloGame';
import PosterCard from './multiplayer/PosterCard';
import BandAchievementGuide from './solana/BandAchievementGuide';
import DoodleFeedback from './DoodleFeedback';
import InstrumentGuide from './InstrumentGuide';
import {DrumDetector,BowDetector,SaxDetector,fingerStates,instruments,type TrackedHand} from './lib/instruments';
import {useBand} from './multiplayer/useBand';
import BandRoom from './multiplayer/BandRoom';
import CameraLesson from './multiplayer/CameraLesson';
import PerformerStrip from './multiplayer/PerformerStrip';
const AchievementClaim=lazy(()=>import('./solana/AchievementClaim'));
const MusicianPanel=lazy(()=>import('./solana/MusicianPanel'));
const colors=['#4978f5','#59b8b1','#aa8bdd','#e8b24e'];
export default function App(){
 const [songId,setSongId]=useState('twinkle-v1');
 const [rulesOpen,setRulesOpen]=useState(false);
 const [profileOpen,setProfileOpen]=useState(false);
 const [screen,setScreen]=useState<'start'|'mode'|'instrument'|'play'>('start');
 const screenRef=useRef(screen);screenRef.current=screen;
 const [pulse,setPulse]=useState({lane:-1,id:0}),[groove,setGroove]=useState(false);
 const grooveStop=useRef<(()=>void)|null>(null);
 const [view,setView]=useState<'solo'|'band'>(new URLSearchParams(location.search).has('room')?'band':'solo');
 const band=useBand(),roleLock=useRef(band.role),bandHit=useRef(band.submitHit);roleLock.current=band.role;bandHit.current=band.submitHit;
 const saxDetector=useRef(new SaxDetector()),lastSax=useRef('');
 const [saxPose,setSaxPose]=useState({fingers:[] as boolean[][],upper:false,lower:false,ready:false,register:false,lane:null as number|null});
 const [bowPosition,setBowPosition]=useState<{x:number;y:number}|null>(null);
 const drum=useRef(new DrumDetector()),bow=useRef(new BowDetector()),lastBowLane=useRef<number|null>(null);
 const [sharing,setSharing]=useState(false);
 const sharingRef=useRef(false),frameSender=useRef(band.shareFrame),stopSender=useRef(band.stopSharing);frameSender.current=band.shareFrame;stopSender.current=band.stopSharing;
 const composite=useRef<HTMLCanvasElement|null>(null),lastPreview=useRef(0);
 const [cameraAspect,setCameraAspect]=useState(4/3);
 const [volume,setVolumeState]=useState(-6),[soundStatus,setSoundStatus]=useState('');
 const volumeRef=useRef(volume);volumeRef.current=volume;
 const [holderSide,setHolderSide]=useState<'left'|'right'>('left'),[pose,setPose]=useState('Place both hands in the guide'),[switchReady,setSwitchReady]=useState(false);
 const holderRef=useRef(holderSide);holderRef.current=holderSide;
 const [instrument,setInstrument]=useState<Instrument>('piano'),[pace,setPace]=useState(650),[switchMessage,setSwitchMessage]=useState('');
 const solo=useSoloGame(instrument),soloHit=useRef(solo.submitHit);soloHit.current=solo.submitHit;
 const lessonRoom=band.room??solo.room;
 const roundPhase=useRef(lessonRoom?.phase);roundPhase.current=lessonRoom?.phase;
 const soloLocked=useRef(false);soloLocked.current=solo.room?.phase==='playing';
 const lessonBand=band.room?band:{...band,room:solo.room,id:solo.id,serverNow:solo.serverNow,clock:solo.clock,role:instrument,feedback:solo.feedback};
 const instrumentRef=useRef<Instrument>('piano'),paceRef=useRef(pace);paceRef.current=pace;
 const swipe=useRef(new SwipeDetector()),muteUntil=useRef(0);
 const video=useRef<HTMLVideoElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const detector=useRef(new TapDetector()),tracker=useRef<HandLandmarker|null>(null),stream=useRef<MediaStream|null>(null),frame=useRef(0),generation=useRef(0);
 const [running,setRunning]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[audio,setAudio]=useState(false),[active,setActive]=useState(-1),[hits,setHits]=useState(0),[metrics,setMetrics]=useState({hands:0,fps:0,ms:0}),[log,setLog]=useState<string[]>([]);
 const [bounds,setBounds]=useState<Bounds>({left:.1,right:.9,line:.6}); const boundsRef=useRef(bounds); boundsRef.current=bounds;
 const alive=useRef(true),flash=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const selectInstrument=useCallback((value:Instrument)=>{if(soloLocked.current)return;if(roleLock.current&&value!==roleLock.current)return;instrumentRef.current=value;setInstrument(value);detector.current.reset();drum.current.reset();bow.current.reset();bowSound(null);saxSound(null);saxDetector.current.reset();lastSax.current='';setBowPosition(null);lastBowLane.current=null;swipe.current.reset();muteUntil.current=performance.now()+650;setActive(-1);setSwitchMessage(`${value[0].toUpperCase()+value.slice(1)} selected · lower your hand to play`);if(value==='violin'||value==='saxophone')void enableAudio();},[]);
 useEffect(()=>{if(band.role)selectInstrument(band.role);},[band.role,selectInstrument]);
 useEffect(()=>{if(lessonRoom?.phase==='playing')return scheduleLesson((lessonRoom.startAt-Date.now()-lessonBand.clock.offset)/1000,lessonRoom.bpm,songById(lessonRoom.chartId).beats);},[lessonRoom?.matchId,lessonRoom?.phase]);
useEffect(()=>{sharingRef.current=false;setSharing(false);stopSender.current();},[band.room?.code]);
useEffect(()=>{if(lessonRoom?.phase!=='playing'){bowSound(null);saxSound(null);lastBowLane.current=null;lastSax.current='';}
 if(lessonRoom?.phase==='playing'){grooveStop.current?.();grooveStop.current=null;setGroove(false);}},[lessonRoom?.phase]);
 useEffect(()=>()=>{grooveStop.current?.();},[]);
 async function toggleGroove(){if(grooveStop.current){grooveStop.current();grooveStop.current=null;setGroove(false);}else if(await enableAudio()){if(grooveStop.current)return;grooveStop.current=startPracticeGroove();setGroove(true);}}
 const labels=instrument==='drums'?drumNames:instrument==='violin'?violinNotes:instrument==='saxophone'?saxNotes:[...notes];
 const hit=useCallback((lane:number,mode:string,silent=false)=>{if(roundPhase.current==='results')return;if(!silent)play(lane,instrumentRef.current);setPulse(p=>({lane,id:p.id+1}));bandHit.current(lane,mode,instrumentRef.current);soloHit.current(lane,mode);setActive(lane);setHits(v=>v+1);setLog(v=>[`${instrumentRef.current==='drums'?drumNames[lane]:instrumentRef.current==='violin'?violinNotes[lane]:instrumentRef.current==='saxophone'?saxNotes[lane]:notes[lane]} · ${mode} · ${new Date().toLocaleTimeString()}`,...v].slice(0,5));clearTimeout(flash.current);flash.current=setTimeout(()=>setActive(-1),320);},[]);
 const stop=useCallback(()=>{sharingRef.current=false;setSharing(false);stopSender.current();generation.current++;cancelAnimationFrame(frame.current);stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;tracker.current?.close();tracker.current=null;detector.current.reset();swipe.current.reset();drum.current.reset();bow.current.reset();bowSound(null);saxSound(null);saxDetector.current.reset();lastSax.current='';setBowPosition(null);lastBowLane.current=null;if(video.current)video.current.srcObject=null;canvas.current?.getContext('2d')?.clearRect(0,0,960,720);setRunning(false);setBusy(false);setMetrics({hands:0,fps:0,ms:0});setSwitchReady(false);},[]);
 useEffect(()=>()=>{alive.current=false;stop();clearTimeout(flash.current);disposeAudio();},[stop]);
 async function enableAudio(){try{setSoundStatus('Loading local sound…');await unlock(instrumentRef.current);setVolume(volumeRef.current);setAudio(true);setSoundStatus('');return true;}catch{setSoundStatus('Sound unavailable');setError('Could not load the local instrument audio. Select the instrument again to retry loading its sounds. Piano and drums remain available.');return false;}}
 async function manual(lane:number,mode:string){if(await enableAudio())hit(lane,mode);}
 useEffect(()=>{const listener=(e:KeyboardEvent)=>{if(screenRef.current!=='play'||e.repeat||e.ctrlKey||e.metaKey||e.altKey||['INPUT','SELECT','TEXTAREA'].includes((e.target as HTMLElement).tagName))return;const lane='asdfghjk'.indexOf(e.key.toLowerCase());if(lane>=0&&lane<(instrumentRef.current==='drums'?4:8)){e.preventDefault();void manual(lane,'keyboard');}};window.addEventListener('keydown',listener);return()=>window.removeEventListener('keydown',listener);});
 async function start(shareWithBand=false){
  setError('');setBusy(true);const token=++generation.current;
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera access requires localhost or HTTPS and a supported browser.');
   if(shareWithBand)await band.enableBandSound();
   if(!await enableAudio())throw new Error('Enable audio before starting your camera.');
   const media=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:640},height:{ideal:480}},audio:false});
   if(token!==generation.current){media.getTracks().forEach(t=>t.stop());return;}stream.current=media;
   const v=video.current!;v.srcObject=media;await v.play();setCameraAspect(v.videoWidth/v.videoHeight||4/3);
   const vision=await FilesetResolver.forVisionTasks(`${import.meta.env.BASE_URL}mediapipe/wasm`);
   const model=await HandLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:`${import.meta.env.BASE_URL}mediapipe/hand_landmarker.task`,delegate:'CPU'},runningMode:'VIDEO',numHands:2,minHandDetectionConfidence:.6,minHandPresenceConfidence:.6,minTrackingConfidence:.6});
   if(token!==generation.current){model.close();return;}tracker.current=model;setRunning(true);setBusy(false);if(shareWithBand&&roleLock.current){sharingRef.current=true;setSharing(true);}
   let last=-1,lastStats=performance.now(),count=0;
   const loop=()=>{
    if(token!==generation.current)return;
    try{if(v.readyState>=2 && v.currentTime!==last){
     last=v.currentTime;const now=performance.now();const result=model.detectForVideo(v,now),elapsed=performance.now()-now;
     const c=canvas.current!,ctx=c.getContext('2d')!;c.width=v.videoWidth;c.height=v.videoHeight;ctx.clearRect(0,0,c.width,c.height);
     const hands:TrackedHand[]=[];
     result.landmarks.forEach((hand,i)=>{
      for(const edge of HandLandmarker.HAND_CONNECTIONS){const a=hand[edge.start],b=hand[edge.end];ctx.strokeStyle='#c7f594aa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo((1-a.x)*c.width,a.y*c.height);ctx.lineTo((1-b.x)*c.width,b.y*c.height);ctx.stroke();}
      const curls=fingerStates(hand),tips=[4,8,12,16,20];
      hand.forEach((p,j)=>{const finger=tips.indexOf(j);ctx.fillStyle=finger>=0?(curls[finger]?'#ffd074':'#76dcff'):'#fff';ctx.beginPath();ctx.arc((1-p.x)*c.width,p.y*c.height,finger>=0?6:2.5,0,Math.PI*2);ctx.fill();if(finger>=0){ctx.strokeStyle='#182545';ctx.lineWidth=1.5;ctx.stroke();ctx.font='bold 11px Arial';ctx.fillStyle='#fff';ctx.strokeText(['T','I','M','R','P'][finger],(1-p.x)*c.width+9,p.y*c.height-7);ctx.fillText(['T','I','M','R','P'][finger],(1-p.x)*c.width+9,p.y*c.height-7);}});
      const p=hand[8],id=`${result.handedness[i]?.[0]?.categoryName??'Hand'}-${i}`;
      const distance=(a:number,b:number)=>Math.hypot(hand[a].x-hand[b].x,hand[a].y-hand[b].y);
      const open=[8,12,16,20].filter(tip=>distance(tip,0)>distance(tip-2,0)*1.15).length>=3;
      const palm={x:1-hand[9].x,y:hand[9].y};
      hands.push({id,palm,tip:{x:1-p.x,y:p.y},landmarks:hand});
      const direction=instrumentRef.current==='saxophone'?null:swipe.current.update(id,palm,open,now,boundsRef.current.line);
      if(direction!==null){const index=instruments.indexOf(instrumentRef.current);selectInstrument(instruments[(index+direction+instruments.length)%instruments.length]);}
      if(palm.y<.22){detector.current.reset();drum.current.reset();return;}
      if(now<muteUntil.current){detector.current.reset();return;}
      if(instrumentRef.current==='violin'||instrumentRef.current==='saxophone')return;
      const input=instrumentRef.current==='drums'?drum.current:detector.current;
      const lane=instrumentRef.current==='piano'?detector.current.update(id,{x:1-p.x,y:p.y},now,boundsRef.current,paceRef.current,8):input.update(id,{x:1-p.x,y:p.y},now,boundsRef.current,paceRef.current);if(lane!==null)hit(lane,'webcam');
     });
     if(instrumentRef.current==='violin'){
      const state=bow.current.update(hands.filter(h=>h.palm.y>=.22),now,holderRef.current);
      const lane=now<muteUntil.current||roundPhase.current==='results'?null:state.lane;bowSound(lane);
      if(lane!==null&&lane!==lastBowLane.current)hit(lane,'bow',true);
      lastBowLane.current=lane;
      if(now-lastStats>80){const holderX=holderRef.current==='left'?.25:.75;const moving=hands.find(h=>Math.abs(h.palm.x-holderX)>.2);setBowPosition(state.lane!==null&&moving?moving.palm:null);}
      if(now-lastStats>500)setPose(!state.holding?'Place your holding hand in the green ring':lane===null?'Holding hand ready · move your other hand along the bow track':'Bowing · keep moving for sound');
     }
     if(instrumentRef.current==='saxophone'){
      const state=saxDetector.current.update(hands,now);
      const lane=now<muteUntil.current||roundPhase.current==='results'?null:state.lane;saxSound(lane,state.register);
      const key=lane===null?'':`${lane}-${state.register}`;if(lane!==null&&key!==lastSax.current)hit(lane+(state.register?4:0),'sax fingers',true);lastSax.current=key;
      if(now-lastStats>200)setSaxPose(state);
     }
     if(sharingRef.current&&now-lastPreview.current>270){
      lastPreview.current=now;const preview=composite.current??=document.createElement('canvas');preview.width=320;preview.height=Math.round(320*v.videoHeight/v.videoWidth);
      const paint=preview.getContext('2d')!;paint.save();paint.translate(preview.width,0);paint.scale(-1,1);paint.drawImage(v,0,0,preview.width,preview.height);paint.restore();paint.drawImage(c,0,0,preview.width,preview.height);
      frameSender.current(preview.toDataURL('image/jpeg',.55),result.landmarks.length);
     }
     count++;if(now-lastStats>500){setSwitchReady(swipe.current.ready);setMetrics({hands:result.landmarks.length,fps:Math.round(count*1000/(now-lastStats)),ms:Math.round(elapsed)});lastStats=now;count=0;}
    }frame.current=requestAnimationFrame(loop);}catch(e){stop();setError(`Tracking stopped: ${e instanceof Error?e.message:'unknown error'}. Keyboard and mouse are available.`);}
   };loop();
  }catch(e){if(token===generation.current && alive.current){stop();setError(`${e instanceof Error?e.message:'Camera could not start'}. Try Chrome/Edge, check camera permissions, or use the keys below.`);}}
 }
 function menu(){stop();solo.reset();band.leave();grooveStop.current?.();grooveStop.current=null;setGroove(false);setScreen('start');}
 return <main className={`camera-first ${band.room?'in-room':''}`} data-mode={view}>
  <header><a className="brand" href="."><span className="brandmark">▥</span> SONARA</a><nav className="mode-nav" aria-label="Play mode" style={{visibility:screen==='play'?'visible':'hidden'}}><button aria-pressed={view==='solo'} disabled={!!band.room} onClick={()=>{solo.reset();setView('solo');}}>Solo studio</button><button aria-pressed={view==='band'} onClick={()=>{solo.reset();setView('band');}}>Play together</button></nav><button className="achievement-launch" onClick={()=>{setRulesOpen(v=>!v);setProfileOpen(false);}}>✧ Achievements</button><button className="musician-launch" onClick={()=>setProfileOpen(v=>!v)}>♫ Musician · Devnet</button><span className="local">{screen==='play'&&<button className="menu-button" onClick={menu}>← Main menu</button>}<i/> {band.room?'BAND SESSION':'YOUR AIR STUDIO'}</span></header>
  
  {rulesOpen&&<aside className="quest-drawer" aria-label="Achievements and rules"><button className="quest-close" aria-label="Close achievement guide" onClick={()=>setRulesOpen(false)}>×</button><h2>Your musician journey.</h2><SoloRewardsCard rewards={solo.rewards} saved={solo.rewardsSaved}/><BandAchievementGuide room={band.room}/></aside>}
  {profileOpen&&<FeatureBoundary onClose={()=>setProfileOpen(false)}><Suspense fallback={<aside className="musician-drawer">Loading Devnet profile…</aside>}><MusicianPanel instrument={instrument} onClose={()=>setProfileOpen(false)}/></Suspense></FeatureBoundary>}
  {screen!=='play'&&<StartFlow step={screen} onStep={setScreen} mode={view} onMode={setView} onChoose={i=>{solo.reset();band.chooseInstrument(i);selectInstrument(i);setScreen('play');}}/>}
  <div className="app-layout" style={{display:screen==='play'?undefined:'none'}}>

  <BandRoom band={band}/>
  <div className="workspace"><PerformerStrip band={band} sharing={sharing} onShare={()=>{if(sharing){sharingRef.current=false;setSharing(false);band.stopSharing();}else{void (async()=>{try{await band.enableBandSound();if(!stream.current||!tracker.current)await start(true);if(stream.current&&tracker.current){sharingRef.current=true;setSharing(true);}}catch{setError('Could not join live band. Allow camera access and try again.');}})();}}}/><section className="studio" aria-label="Camera and instrument">{view==='solo'&&solo.room?.phase!=='playing'&&<SongLibrary selected={songId} onSelect={id=>{solo.reset();setSongId(id);}}/>}{view==='solo'&&<div className="solo-session-bar">{solo.error&&<p role="alert">{solo.error}</p>}<span>Solo · {instrument} · {songById(songId).title}</span>{solo.room?.phase==='playing'?<button onClick={solo.reset}>End take</button>:<><button disabled={solo.starting} onClick={()=>void solo.start(songById(songId).tempo,songId).catch(()=>setError('Click again to enable instrument audio.'))}>{solo.starting?'Connecting solo session…':solo.room?.phase==='results'?'Play again →':`Play ${songById(songId).title} →`}</button><button onClick={()=>{stop();solo.reset();setScreen('instrument');}}>Change instrument</button></>}</div>}
   <div className="studio-top"><span><i className={running?'dot live':'dot'}/> {running?'Camera live':busy?'Preparing your studio…':'Your virtual stage'}</span><div className="stage-actions"><button aria-pressed={groove} disabled={lessonRoom?.phase==='playing'} onClick={()=>void toggleGroove()}>{groove?'♫ Groove on · stop':'♫ Practice groove'}</button><span>{instrument.toUpperCase()}</span>{running&&<button onClick={stop}>Stop camera</button>}</div></div>
   <nav className="instrument-picker" aria-label="Choose instrument"><button disabled={!!band.role||solo.room?.phase==='playing'} aria-pressed={instrument==='piano'} onClick={()=>selectInstrument('piano')}>01 · Piano</button><button disabled={!!band.role||solo.room?.phase==='playing'} aria-pressed={instrument==='drums'} onClick={()=>selectInstrument('drums')}>02 · Drums</button><button disabled={!!band.role||solo.room?.phase==='playing'} aria-pressed={instrument==='violin'} onClick={()=>selectInstrument('violin')}>03 · Violin</button><button disabled={!!band.role||solo.room?.phase==='playing'} aria-pressed={instrument==='saxophone'} onClick={()=>selectInstrument('saxophone')}>04 · Saxophone</button><span>{band.room?'Your assigned instrument':'Hold in top strip, then swipe ↔'}</span></nav>
   <p className="switch-status" role="status">{switchMessage||'Unhurried play. No timer, no rush.'}</p>
   <div className="camera" style={{'--camera-aspect':cameraAspect} as React.CSSProperties}><video ref={video} muted playsInline/><canvas ref={canvas}/>
    {!running&&<div className={`welcome ${instrument!=='piano'?'with-diagram':''} ${lessonRoom?.phase==='playing'?'lesson-running':''}`}><div className="hand">✧</div><h2>{busy?'Getting ready…':'Your hands are the instrument.'}</h2><p>{busy?'Loading local hand tracking.':'Start your camera and bring your hands into view.'}</p><button disabled={busy} onClick={()=>void start(!!band.room)}>{busy?'Starting…':band.room?'Join live band · camera + sound':'Start camera & audio'} <span>↗</span></button><small>{sharing?'Camera shared with your room.':'Camera stays private until you share it.'}</small></div>}
    {!band.room&&lessonRoom?.phase!=='playing'&&instrument!=='saxophone'&&<div className={`swipe-guide ${switchReady?'ready':''}`} style={{top:'3%',height:'19%',display:'grid',placeItems:'center'}}>↔ {switchReady?'Ready — swipe left or right':'Switch instruments: hold open palm here for a moment, then swipe'}</div>}
    {instrument==='piano'&&<div className="zones" style={{left:`${bounds.left*100}%`,width:`${(bounds.right-bounds.left)*100}%`,top:`${bounds.line*100}%`}}>{labels.map((note,i)=><div key={note} style={{borderColor:colors[i%4],background:active===i?`${colors[i%4]}66`:undefined}}><span style={{color:colors[i%4]}}>{note}</span></div>)}</div>}
    <InstrumentGuide instrument={instrument} bounds={bounds} active={active} saxPose={saxPose} holderSide={holderSide} onPlay={i=>void manual(i,'diagram')}/>
    {instrument==='violin'&&<div className="pose-status" role="status">{running?pose:'Pose guide: holding hand in ring, bow hand in colored track'}</div>}
    {instrument==='saxophone'&&<div className="sax-status" role="status">{!running?'Show both hands, one a little higher. Curl and straighten fingers to change notes.':!saxPose.ready?`Show both hands · ${saxPose.fingers.length}/2 detected · palms toward camera`:`Playing ${saxPose.lane===null?'…':saxNotes[saxPose.lane+(saxPose.register?4:0)]} · curl finger keys to change pitch`}</div>}
    <CameraLesson band={lessonBand} bounds={bounds} holderSide={holderSide}/>
    {solo.room?.phase==='results'&&<div className="solo-results" role="status"><img src="/doodles/band.svg" alt=""/><span className="eyebrow">{songById(solo.room.chartId).title.toUpperCase()} · TAKE COMPLETE</span><h2>{solo.room.players[0].score.points>0?'You made music.':'Every band starts somewhere.'}</h2><strong>{solo.room.players[0].score.points} points</strong><p>{solo.room.players[0].score.perfect} Perfect · {solo.room.players[0].score.good} Good · {solo.room.players[0].score.miss} Miss</p><span className="personal-best">Personal best: {solo.best}% performance · this browser · {solo.room.bpm} BPM</span><PracticeCoach score={solo.room.players[0].score} role={solo.room.players[0].role} bpm={solo.room.bpm} songId={solo.room.chartId} onPractice={bpm=>void solo.start(bpm,songId).catch(()=>setError("Sound could not start. Try again."))}/><button onClick={()=>void solo.start(solo.room?.bpm,songId)}>Play again →</button><button onClick={solo.reset}>Free play</button><SoloRewardsCard rewards={solo.rewards} saved={solo.rewardsSaved}/>{solo.room.achievementEligible&&<Suspense fallback={<p>Loading Solana claim…</p>}><AchievementClaim band={solo}/></Suspense>}<PosterCard room={solo.room}/><details className="solo-band-next"><summary>How do I earn a Solana band achievement?</summary><BandAchievementGuide/></details></div>}
    <DoodleFeedback pulse={pulse} instrument={instrument} bounds={bounds} bowPosition={bowPosition}/>
    <div className="camera-footer"><span>{running?`${metrics.hands} hand${metrics.hands===1?'':'s'} detected`:'CAMERA OFF'}</span><span>{running?`${metrics.fps} FPS · ${metrics.ms} ms inference`:'ON-DEVICE TRACKING'}</span></div>
   </div>
   <div className="keyboard" style={{gridTemplateColumns:`repeat(${labels.length},minmax(0,1fr))`}}>{labels.map((note,i)=><button key={note} className={active===i?'key pressed':'key'} style={{'--key-color':colors[i%4]} as React.CSSProperties} onClick={()=>void manual(i,'mouse / touch')} aria-label={`Play ${note}, keyboard ${'ASDFGHJK'[i]}`}><span className="note">{instrument!=='drums'?note.slice(0,-1):note}<small>{instrument!=='drums'?note.slice(-1):''}</small></span><span className="key-bottom">{instrument==='piano'?'DO RE MI FA SOL LA TI DO'.split(' ')[i]:'TAP'}<kbd>{'ASDFGHJK'[i]}</kbd></span></button>)}</div>
   <div className="studio-bottom"><span>↳ Try your keyboard: A S D F G H J K, or tap a key</span><span>{soundStatus|| (audio?'● Audio ready':'Audio starts on first note')}</span></div>
  </section>
  <aside><details className="help-drawer"><summary>How to play</summary><section className="guide"><div className="eyebrow">THE FIRST NOTES</div><h2>Find your flow.</h2>{[['01','Step into the light','Sit in good light, with your hands fully in view.'],['02',instrument==='saxophone'?'Hold & finger the keys':instrument==='violin'?'Hold & bow':instrument==='drums'?'Strike the drum heads':'Hover, then tap',instrument==='saxophone'?'Show both hands anywhere in view, one a little higher. Sound starts automatically when both are detected. Curl index, middle and ring fingers to lower pitch; pinkies and lower thumb add lower keys. Upper thumb changes register. Move a hand out of view to stop.':instrument==='violin'?'Place one hand in the green ring as if holding the violin neck. Move the other sideways along the colored bow track. Further across changes the note.':instrument==='drums'?'Move your index fingertip down through a drum head’s center. Lift above the rim before striking again.':'Raise your index finger above the colored line, then move down through a lane.'],['03','Slide into a new sound','Hold an open palm still inside the top strip until it says Ready. Then sweep sideways to browse piano, drums and violin. Lower your hand to play.']].map(([n,t,d])=><div className="step" key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div></div>)}<div className="tip">✦ &nbsp; {instrument==='violin'?'Keep your holding hand steady. Sound follows your bow movement and fades when you stop.':'Move gently. Lift above each target to play again. There is no beat to keep up with.'}</div></section>
   </details><details className="settings-drawer"><summary>Adjust camera & sound</summary><section className="settings"><h3>Your playing space</h3><label>Volume <output>{volume} dB</output><input aria-label="Volume" type="range" min="-30" max="0" value={volume} onChange={e=>{const db=Number(e.target.value);setVolumeState(db);setVolume(db);}}/></label>{instrument==='violin'&&<p className="setting-hint">Real violin recordings · VSCO 2 CE · CC0. Gentle room reverb and softened note transitions.</p>}{instrument==='violin'&&<label>Holding hand (on screen)<select value={holderSide} onChange={e=>{setHolderSide(e.target.value as 'left'|'right');bow.current.reset();bowSound(null);}}><option value="left">Left · bow with right</option><option value="right">Right · bow with left</option></select></label>}<label>Time between hand taps <output>{(pace/1000).toFixed(2)} s</output><input aria-label="Time between hand taps" type="range" min="300" max="1000" step="50" value={pace} onChange={e=>{setPace(Number(e.target.value));detector.current.reset();}}/></label><p className="setting-hint">{instrument==='violin'?'Tap spacing and playing-space sliders apply to piano and drums. Violin uses the fixed pose guide above.':'Longer spacing prevents rushed repeats. Slow downward movements work too.'}</p><label>Lane width <output>{Math.round((bounds.right-bounds.left)*100)}%</output><input type="range" min="40" max="100" value={(bounds.right-bounds.left)*100} onChange={e=>{const w=Number(e.target.value)/100;detector.current.reset();setBounds(b=>({...b,left:(1-w)/2,right:(1+w)/2}));}}/></label><label>Tap line <output>{Math.round(bounds.line*100)}%</output><input type="range" min="35" max="80" value={bounds.line*100} onChange={e=>{detector.current.reset();setBounds(b=>({...b,line:Number(e.target.value)/100}));}}/></label><button className="secondary" onClick={()=>{detector.current.reset();setBounds({left:.1,right:.9,line:.6});}}>Reset playing space</button>{(running||busy)&&<button className="secondary" onClick={stop}>Stop camera</button>}</section>
  </details></aside></div>
  </div>
  {error&&<p className="error" role="alert">{error}</p>}
  <details className="session-drawer"><summary>Session activity · {hits} notes</summary><section className="session"><div><span className="eyebrow">THIS SESSION</span><strong>{hits} <small>notes played</small></strong></div><div className="event-log" aria-label="Recent note events">{log.length?log.map((s,i)=><span key={i}>{s}</span>):<span>Your first note is waiting.</span>}</div><span className="privacy">◉ No recording. Camera sharing is optional.<br/>Made for the joy of making music.</span></section></details>
  <footer><span>LOCAL TRACKING · OPTIONAL ROOM CAMERA SHARING</span><span>Free & open source</span><span>PIANO / DRUMS / VIOLIN / SAXOPHONE</span></footer>
 </main>;
}
