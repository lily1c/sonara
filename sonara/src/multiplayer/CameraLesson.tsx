import {useEffect,useState} from 'react';
import {notes,drumNames,violinNotes,saxNotes} from '../lib/audio';
import {chart,duration} from './game';
import type {Band} from './useBand';
import type {Bounds} from '../lib/gestures';
import {padLayout} from '../lib/instruments';
const colors=['#4978f5','#59b8b1','#aa8bdd','#e8b24e'];
export default function CameraLesson({band,bounds,holderSide}:{band:Band;bounds:Bounds;holderSide:'left'|'right'}){
 const [now,setNow]=useState(()=>band.serverNow());
 const {room,role}=band;
 useEffect(()=>{if(room?.phase!=='playing')return;setNow(band.serverNow());const timer=setInterval(()=>setNow(band.serverNow()),33);return()=>clearInterval(timer);},[room?.phase,room?.matchId,band.clock.offset]);
 if(room?.phase!=='playing'||!role)return null;
 const elapsed=now-room.startAt,me=room.players.find(p=>p.id===band.id),pads=padLayout(bounds),remaining=Math.max(0,Math.ceil((duration(room.bpm)-elapsed)/1000));
 return <div className="camera-lesson" aria-label={`Lesson prompts over ${role} camera targets`}>
  <div className="camera-score"><span>FIRST JAM · {role.toUpperCase()}</span><strong>{me?.score.points??0} <small>points</small></strong><span>{elapsed<0?'Get ready':`${remaining}s left`} · {room.bpm} BPM</span></div>
  <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-label="Approaching notes">
   {chart(role).map(n=>{
    if(me?.score.judged[n.id])return null;const until=n.beat*60000/room.bpm-elapsed;if(until>2300||until< -220)return null;
    const progress=Math.max(0,Math.min(1,1-until/2300));
    const x=role==='piano'?bounds.left+(n.lane+.5)*(bounds.right-bounds.left)/8:role==='drums'?pads[n.lane].x:role==='violin'?(holderSide==='left'?.45+(n.lane+.5)*.06125:1-(.45+(n.lane+.5)*.06125)):.75;
    const y=role==='piano'?bounds.line:role==='drums'?pads[n.lane].y:role==='violin'?.55:.67;
    const targetWidth=role==='piano'?(bounds.right-bounds.left)/8*.85:role==='drums'?pads[n.lane].rx*1.65:.10;
    const label=(role==='piano'?notes:role==='drums'?drumNames:role==='violin'?violinNotes:saxNotes)[n.lane];
    return <g key={n.id}>
     <path d={`M ${x*1000} ${Math.max(.15,y-.36)*1000} V ${y*1000}`} stroke={colors[n.lane%4]} strokeDasharray="5 12" opacity=".3" strokeWidth="2"/>
     <rect x={(x-targetWidth/2)*1000} y={(y-.36*(1-progress))*1000-21} width={targetWidth*1000} height="42" rx="12" fill={colors[n.lane%4]} opacity={until<0?.65:1}/>
     <text x={x*1000} y={(y-.36*(1-progress))*1000+7} textAnchor="middle" fill="#152010" fontSize="23" fontFamily="Arial">{label}</text>
     {until<=140&&<ellipse cx={x*1000} cy={y*1000} rx={targetWidth*650} ry="48" fill="none" stroke={colors[n.lane%4]} strokeWidth="6"/>}
    </g>;
   })}
  </svg>
  {elapsed<0?<div className="camera-countdown"><span>Hands in position</span><strong>{Math.min(5,Math.ceil(-elapsed/1000))}</strong><span>Follow the notes on your instrument.</span></div>:<div className="camera-judgement" role="status">{band.feedback||'Play as the note meets your target'}</div>}
 </div>;
}
