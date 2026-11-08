import {useEffect,useState} from 'react';
import type {Bounds,Point} from './lib/gestures';
import type {Instrument} from './lib/audio';
import {padLayout} from './lib/instruments';
export default function DoodleFeedback({pulse,instrument,bounds,bowPosition}:{pulse:{lane:number;id:number};instrument:Instrument;bounds:Bounds;bowPosition:Point|null}){
 const [trail,setTrail]=useState<Point[]>([]);
 useEffect(()=>{if(bowPosition){setTrail(t=>[...t,bowPosition].slice(-10));return;}const timer=setTimeout(()=>setTrail([]),220);return()=>clearTimeout(timer);},[bowPosition?.x,bowPosition?.y]);
 if(pulse.lane<0&&!trail.length)return null;
 const pad=padLayout(bounds)[Math.max(0,pulse.lane)%4];
 const x=instrument==='drums'?pad.x:instrument==='violin'?(bowPosition?.x??.65):instrument==='saxophone'?.75:bounds.left+(pulse.lane+.5)*(bounds.right-bounds.left)/8;
 const y=instrument==='drums'?pad.y:instrument==='violin'?(bowPosition?.y??.55):instrument==='saxophone'?.67:bounds.line;
 const line=trail.map((p,i)=>`${i?'L':'M'} ${p.x*1000} ${p.y*1000}`).join(' ');
 return <svg className="hit-doodles" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
  {instrument==='violin'&&trail.length>1&&<g className="live-bow-trail"><path d={line} stroke="#ffffffc9" strokeWidth="18" fill="none"/><path d={line} stroke="#2864f0" strokeWidth="7" fill="none" strokeDasharray="32 5"/>{trail.filter((_,i)=>i%2===0).map((p,i)=><text key={i} x={p.x*1000+12} y={p.y*1000-20} className="trail-note" fontSize={18+i*3}>{i%2?'♪':'✧'}</text>)}</g>}
  {pulse.lane>=0&&<g className="ink-pop rich-burst" key={pulse.id} transform={`translate(${x*1000} ${y*1000})`}>
   <ellipse className="ink-ring" rx="62" ry="47"/><ellipse className="ink-ring second" rx="76" ry="57"/>
   {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <g key={i} className="burst-particle" style={{'--dx':`${Math.cos(a)*45}px`,'--dy':`${Math.sin(a)*45}px`,'--delay':`${i%3*.035}s`} as React.CSSProperties}><path className="ink-ray" d={`M ${Math.cos(a)*72} ${Math.sin(a)*54} q ${Math.cos(a)*14-5} ${Math.sin(a)*14+7} ${Math.cos(a)*30} ${Math.sin(a)*30}`}/><circle className="ink-dot" cx={Math.cos(a)*105} cy={Math.sin(a)*82} r={i%3===0?6:3}/></g>;})}
   {[-1,1].map((side,i)=><text key={side} className="burst-music" x={side*75} y={-50+i*90} style={{animationDelay:`${i*.1}s`}}>{instrument==='saxophone'?'♫':i?'✧':'♪'}</text>)}
   <text className="ink-word" y="-90" textAnchor="middle">{instrument==='drums'?'ba-dum!':instrument==='saxophone'?'smoooth!':['♪','nice!','♫','yeah!'][pulse.lane%4]}</text>
   {instrument==='violin'&&<><path className="bow-swoosh" d="M -170 95 Q -25 -130 175 -115 M -155 115 Q 15 -85 185 -90"/><path className="bow-swoosh golden" d="M -145 105 Q -5 -110 175 -102"/></>}
  </g>}
 </svg>;
}
