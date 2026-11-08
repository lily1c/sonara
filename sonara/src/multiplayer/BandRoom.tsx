import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {duration,roleName} from './game';
import type {Band} from './useBand';
import {downloadPoster} from './poster';
import {unlock} from '../lib/audio';
import PracticeCoach from './PracticeCoach';
import FeatureBoundary from '../FeatureBoundary';
import {accuracy} from '../solana/achievement';
const AchievementClaim=lazy(()=>import('../solana/AchievementClaim'));
export default function BandRoom({band}:{band:Band}){
 const queryCode=new URLSearchParams(location.search).get('room')?.toUpperCase()??'';
 const resultsWindow=useRef<HTMLDivElement>(null);
 const [resultsOpen,setResultsOpen]=useState(true);
 const [entry,setEntry]=useState<'create'|'join'>(queryCode?'join':'create');
 const [name,setName]=useState(''),[code,setCode]=useState(queryCode),[now,setNow]=useState(0),[notice,setNotice]=useState(''),[loading,setLoading]=useState(false);
 const {room,id,connection,clock}=band;const me=room?.players.find(p=>p.id===id),host=room?.host===id;
 const connecting=['connecting','syncing'].includes(connection);
 useEffect(()=>{if(room?.phase!=='playing')return;const t=setInterval(()=>setNow(band.serverNow()),33);return()=>clearInterval(t);},[clock.offset,room?.phase]);
 useEffect(()=>{setNotice('');setResultsOpen(true);},[room?.code,room?.phase]);
 useEffect(()=>{if(room?.phase!=='results'||!resultsOpen)return;const previous=document.activeElement as HTMLElement|null;resultsWindow.current?.querySelector<HTMLButtonElement>('button')?.focus();return()=>{if(previous?.isConnected)previous.focus();};},[room?.phase,resultsOpen]);
 function dialogKeys(e:React.KeyboardEvent<HTMLDivElement>){e.stopPropagation();if(e.key==='Escape'){e.preventDefault();setResultsOpen(false);}if(e.key==='Tab'){const items=Array.from(resultsWindow.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],summary,[tabindex="0"]')??[]);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}
 async function ready(){setLoading(true);try{await unlock(me?.role);await band.enableBandSound();band.send({type:'ready',ready:!me?.ready});setNotice('');}catch{setNotice('Sound could not start. Try Ready again.');}finally{setLoading(false);}}
 async function copy(){const url=`${band.inviteOrigin}/?room=${room!.code}`;try{if(!navigator.clipboard)throw new Error();await navigator.clipboard.writeText(url);setNotice('Invite link copied. Send it to your partner.');}catch{setNotice(`Share this address and your room code: ${url}`);}}
 const elapsed=room?now-room.startAt:0,playing=room?.phase==='playing',countdown=playing&&elapsed<0;
 const bothReady=(room?.players.length??0)>=2&&room!.players.every(p=>p.connected&&p.ready);
 const progress=room?Math.max(0,Math.min(100,elapsed/duration(room.bpm)*100)):0;
 if(!room)return <section className="band-panel entry-panel" aria-label="Band room">
  <div className="entry-heading"><span className="eyebrow">UP TO FOUR PLAYERS · ONE SONG</span><h1>Bring a friend.</h1><p>Create or join a room. Your camera stays center stage.</p></div>
  <div className="entry-card"><div className="entry-tabs" role="tablist" aria-label="Room action"><button role="tab" aria-selected={entry==='create'} onClick={()=>setEntry('create')}>Create a room</button><button role="tab" aria-selected={entry==='join'} onClick={()=>setEntry('join')}>Join with code</button></div>
   <form onSubmit={e=>{e.preventDefault();band.enter(entry,name,entry==='join'?code:undefined);}}>
    <label>Your name<input autoComplete="nickname" maxLength={24} value={name} onChange={e=>setName(e.target.value)} placeholder="What should we call you?"/></label>
    {entry==='join'&&<label>Room code<input className="code-input" value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-F0-9]/g,'').slice(0,6))} placeholder="A1B2C3" autoCapitalize="characters" spellCheck={false} maxLength={6}/></label>}
    <div className="role-preview"><span>{entry==='create'?'♫':'◉'}</span><div><strong>{entry==='create'?'You’ll lead the band':'You’ll join the band'}</strong><small>{entry==='create'?'Invite a friend and choose your instruments.':'Your chosen instrument comes with you.'}</small></div></div>
    <button className="primary-action" type="submit" disabled={connecting||(entry==='join'&&code.length!==6)}>{connecting?'Connecting…':entry==='create'?'Create room →':'Join the band →'}</button>
   </form>
   {band.error&&<p className="room-warning" role="alert">{band.error}</p>}
   <p className="entry-footnote">Both devices open the same HTTPS game address. No shared Wi-Fi needed.</p>
  </div>
  <div className="entry-steps"><span><b>1</b> Connect</span><span><b>2</b> Get ready</span><span><b>3</b> Play together</span></div>
 </section>;
 return <section className={`band-panel room-panel ${playing?'is-playing':''}`} aria-label="Band room">
  <div className="room-header"><div><span className="eyebrow">{playing?'YOUR SHARED STAGE':'YOUR BAND ROOM'}</span><h2>{playing?'First Jam':room.phase==='results'?'Nice playing.':'Get your band ready.'}</h2></div><button className="text-button" onClick={band.leave}>Leave room ↗</button></div>
  {!playing&&<div className="invite-strip"><div><span>ROOM CODE</span><strong>{room.code}</strong></div><button className="secondary" onClick={()=>void copy()}>Copy invite link ↗</button><div className="invite-address"><span>Your partner opens</span><a href={`${band.inviteOrigin}/?room=${room.code}`}>{band.inviteOrigin}</a></div></div>}
  <div className="players">{room.players.map(p=><div key={p.id} className={`player-card ${p.id===id?'you':''}`}><div className="player-icon">{p.role==='piano'?'♫':'◉'}</div><div><strong>{p.name} {p.id===id&&<small>YOU</small>}</strong><span>{roleName(p.role)}{playing?` · ${p.score.points} pts`:''}</span></div><span className={`ready-badge ${p.connected&&p.ready?'is-ready':''}`}>{!p.connected?'Offline':playing?`${p.score.combo} streak`:p.ready?'✓ Ready':'Not ready'}</span></div>)}{room.players.length<2&&<div className="player-card waiting"><div className="player-icon">＋</div><div><strong>Waiting for your friend</strong><span>Share the link and code above.</span></div></div>}</div>
  {room.phase==='interrupted'&&<p role="alert" className="room-warning">{room.reason}</p>}
  {playing?<div className="camera-play-summary"><span className="eyebrow">PLAY ON YOUR CAMERA</span><h3>Follow the notes<br/>over your hands.</h3><p>{me?.role==='drums'?'Strike the drum heads as the notes arrive.':me?.role==='violin'?'Hold the neck and bow through the highlighted pitch.':me?.role==='saxophone'?'Hold both hand positions and finger the highlighted note.':'Tap down through a piano lane as its note arrives.'}</p><div className="lesson-progress"><i style={{width:`${progress}%`}}/></div><span>{countdown?'Starting together…':`${Math.max(0,Math.ceil((duration(room.bpm)-elapsed)/1000))} seconds left`}</span><p>A / S / D / F and the on-screen keys also work.</p></div>
  :<>
   {room.phase==='results'&&!resultsOpen&&<button className="secondary" onClick={()=>setResultsOpen(true)}>View your concert results ✧</button>}
   {room.phase==='results'&&resultsOpen&&<div ref={resultsWindow} onKeyDown={dialogKeys} className="band-results doodle-concert concert-results-window" role="dialog" aria-label="Your concert results" aria-modal="true"><button className="concert-close" onClick={()=>setResultsOpen(false)} aria-label="Close concert results">×</button><h2>Your band made music.</h2><img className="concert-band" src="/doodles/band.svg" alt=""/><span className="eyebrow">YOUR FIRST JAM · LIVE SESSION</span><strong>{room.players.reduce((sum,p)=>sum+p.score.points,0)} <small>band points</small></strong><div className="concert-scorecards">{room.players.map(p=><article key={p.id}><img src={`/doodles/${p.role}.svg`} alt=""/><h3>{p.name}</h3><span>{roleName(p.role)}</span><strong>{accuracy(p.score)}% <small>notes hit</small></strong><p>{p.score.perfect} Perfect · {p.score.good} Good · {p.score.miss} Miss</p><p>Best streak {p.score.best} · {p.score.points} points</p></article>)}</div>{room.achievementEligible?<FeatureBoundary><Suspense fallback={<p>Loading your achievement…</p>}><AchievementClaim key={room.matchId} band={band}/></Suspense></FeatureBoundary>:<p className="achievement-next">✧ Next goal: finish together with two different instruments and at least four timed hits each to earn First Band. Keyboard and touch count too.</p>}{me&&<PracticeCoach score={me.score} role={me.role} bpm={room.bpm}/>}<button className="secondary" onClick={()=>downloadPoster(room)}>Keep your concert poster ↗</button></div>}
   <div className="ready-flow"><div className="next-step"><span className="step-marker">{!me?.ready?'1':'2'}</span><div><strong>{!me?.ready?'Check your controls. Then get ready.':bothReady?host?'Your band is ready. Start your song.':'Your band is ready. Waiting for the host.':'You’re ready. Waiting for your partner.'}</strong><p>Position your hands in the camera, then get ready.</p></div></div>
    <div className="room-actions"><label>Your instrument<select aria-label="Your instrument" value={me?.role??'piano'} onChange={e=>band.chooseInstrument(e.target.value as 'piano'|'drums'|'violin'|'saxophone')}>{['piano','drums','violin','saxophone'].map(role=><option key={role} value={role}>{role[0].toUpperCase()+role.slice(1)}</option>)}</select></label>{host&&<label>Tempo<select aria-label="Lesson tempo" value={room.bpm} onChange={e=>band.send({type:'tempo',bpm:Number(e.target.value)})}><option value={60}>60 BPM · gentle</option><option value={80}>80 BPM · relaxed</option><option value={100}>100 BPM · flowing</option></select></label>}
     <button className={me?.ready?'secondary':'primary-action'} disabled={connection!=='online'||clock.samples<5||loading} onClick={()=>void ready()}>{loading?'Enabling sound…':me?.ready?'✓ Ready · undo':'I’m ready →'}</button>
     {host&&bothReady&&<button className="primary-action" onClick={()=>band.send({type:'start'})}>{room.phase==='results'?'Play again →':'Start together →'}</button>}
    </div>
   </div>
   <p className="connection-note">{location.protocol!=='https:'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1'?'Keyboard & touch ready. Webcam on this device requires HTTPS.':'Share your camera in the performer strip when you’re ready.'}</p>
  </>}
  {(band.error||notice)&&<p className="room-warning" role="status">{band.error||notice}</p>}
  {connection==='offline'&&<button className="primary-action" onClick={band.reconnect}>Reconnect</button>}
 </section>;
}
