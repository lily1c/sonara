import {useEffect,useState} from 'react';
import {notes,violinNotes,saxNotes,drumNames} from '../lib/audio';
import type {Band} from './useBand';
export default function PerformerStrip({band,sharing,onShare}:{band:Band;sharing:boolean;onShare:()=>void}){
 const [now,setNow]=useState(Date.now()),[error,setError]=useState('');
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
 if(!band.room)return null;
 const partners=band.room.players.filter(p=>p.id!==band.id);
 return <section className="performer-strip" aria-label="Band performers">
  <div className="performer-intro"><span className="eyebrow">YOUR BAND · LIVE</span><strong>See each other play.</strong><button onClick={onShare} aria-pressed={sharing}>{sharing?'Camera shared · stop':'Join live band · camera + sound'}</button><button onClick={()=>{if(band.bandSound)band.muteBand();else void band.enableBandSound().catch(()=>setError('Click again to enable sound.'));}}>{band.bandSound?'♫ Band sound on · mute':'♫ Hear my band'}</button>{error&&<small role="alert">{error}</small>}<div className="doodle-reactions" aria-label="Send a band reaction">{[['nice','nice!'],['star','☆'],['applause','clap clap']].map(([kind,label])=><button key={kind} aria-label={`Send ${kind}`} onClick={()=>band.send({type:'reaction',reaction:kind})}>{label}</button>)}</div><small>{sharing?(now-band.cameraSentAt<3500?'✓ Camera preview reaching the server':'Connecting your camera preview…'):'Join live band on BOTH computers to see and hear each other.'}</small></div>
  {partners.map(p=>{const frame=band.performers[p.id],live=p.connected&&frame&&now-frame.received<3500;return <div className="performer-tile" key={p.id}>
   {live?<img src={frame.image} alt={`${p.name} performing with hand landmarks`}/>:<div className="performer-placeholder"><span>{p.role==='piano'?'♫':'◉'}</span><strong>{p.name}</strong><small>{!p.connected?'Disconnected':'Ask them to click Join live band'}</small></div>}
   <img className={`doodle-avatar ${band.partnerNotes[p.id]&&now-band.partnerNotes[p.id].at<1000?'bopping':''}`} src="/doodles/musician.svg" alt=""/><div className="performer-label"><strong>{p.name}</strong><span>{p.role} · {live?`${frame.tracking} hands tracked`:'camera off'}</span><i className={live?'live-dot':''}/></div>{band.partnerNotes[p.id]&&now-band.partnerNotes[p.id].at<1800&&<div className="partner-note">♫ {(p.role==='piano'?notes:p.role==='drums'?drumNames:p.role==='violin'?violinNotes:saxNotes)[band.partnerNotes[p.id].lane]}{!band.bandSound?' · sound muted':''}</div>}
  </div>;})}
  <div className="floating-reactions" aria-live="polite">{band.reactions.filter(r=>now-r.at<2500).map((r,i)=><span key={`${r.at}-${i}`} style={{left:`${25+i*10}%`}}>{r.kind==='nice'?'nice!':r.kind==='star'?'☆':'clap clap!'}</span>)}</div>
  {!partners.length&&<div className="performer-tile empty"><span>＋</span><strong>Your partner appears here</strong><small>Share your room link to invite them.</small></div>}
 </section>;
}
