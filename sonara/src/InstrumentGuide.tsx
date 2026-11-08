import SaxGuide from './SaxGuide';
import type {SaxDetector} from './lib/instruments';
import type {Instrument} from './lib/audio';
import type {Bounds} from './lib/gestures';
import {padLayout} from './lib/instruments';
const colors=['#4978f5','#59b8b1','#aa8bdd','#e8b24e'];
export default function InstrumentGuide({instrument,bounds,active,holderSide,onPlay,saxPose}:{instrument:Instrument;bounds:Bounds;active:number;holderSide:'left'|'right';saxPose?:ReturnType<SaxDetector['update']>;onPlay:(lane:number)=>void}){
 if(instrument==='piano')return null;
 if(instrument==='saxophone')return <SaxGuide pose={saxPose} active={active}/>;
 return <svg className="instrument-diagram" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-label={instrument==='drums'?'Air drum kit: strike down through the center of a drum':'Air violin: hold one hand in the neck ring and move the other along the bow track'}>
 {instrument==='drums'?<>
  <text x="500" y="345" className="diagram-instruction">AIR DRUM KIT · STRIKE DOWN, THEN LIFT</text>
  {padLayout(bounds).map((p,i)=><g key={i} className="drum-target" onClick={()=>onPlay(i)}>
   {i===2?<><path d={`M ${p.x*1000} ${p.y*1000} V 915 M ${p.x*1000-45} 930 L ${p.x*1000} 895 L ${p.x*1000+45} 930`} stroke="#d2b8fc80" fill="none" strokeWidth="4"/></>:<path d={`M ${(p.x-p.rx)*1000} ${p.y*1000} v 65 Q ${p.x*1000} ${(p.y+p.ry)*1000+90} ${(p.x+p.rx)*1000} ${p.y*1000+65} v -65`} fill={`${colors[i%4]}22`} stroke={colors[i%4]} strokeWidth="3"/>}
   <ellipse cx={p.x*1000} cy={p.y*1000} rx={p.rx*1000} ry={p.ry*1000} fill={active===i?colors[i%4]:`${colors[i%4]}33`} stroke={colors[i%4]} strokeWidth={active===i?7:3}/>
   <ellipse cx={p.x*1000} cy={p.y*1000} rx={p.rx*820} ry={p.ry*760} fill="none" stroke={colors[i%4]} opacity=".5"/>
   <text x={p.x*1000} y={p.y*1000+7} fill={active===i?'#152015':colors[i%4]}>{['KICK','SNARE','HI-HAT','TOM'][i]}</text>
   <text x={p.x*1000} y={(p.y-p.ry)*1000-22} fill={colors[i%4]}>↓</text>
  </g>)}
 </>:<>
  <g transform={holderSide==='right'?'translate(1000 0) scale(-1 1)':undefined}>
   <path d="M 220 430 L 380 640 C 470 590 550 660 490 710 C 560 790 460 850 400 770 C 310 790 310 690 355 665 L 195 455 Z" fill="#b57f4933" stroke="#e4bb86" strokeWidth="4"/>
   {[0,1,2,3].map(i=><path key={i} d={`M ${204+i*6} 445 L ${444+i*6} 743`} stroke="#e4bb86" strokeWidth="1.5"/>)}
   <ellipse cx="250" cy="480" rx="150" ry="180" fill="#c7f59415" stroke="#c7f594" strokeWidth="3" strokeDasharray="9 7"/>
   {[0,1,2,3,4,5,6,7].map(i=><rect key={i} x={450+i*61.25} y="320" width="61.25" height="460" fill={active===i?`${colors[i%4]}88`:`${colors[i%4]}18`} stroke={colors[i%4]} strokeWidth="2"/>)}
   <path d="M 465 700 L 925 395" stroke="#f0d1a4" strokeWidth="8" strokeLinecap="round"/>
   <path d="M 470 712 L 933 406" stroke="#fff3d9" strokeWidth="2"/>
  </g>
  <text x={holderSide==='left'?250:750} y="285" fill="#c7f594">HOLD HAND HERE</text>
  <text x={holderSide==='left'?695:305} y="355" fill="#eee2ca">BOW HAND ↔</text>
  {['G3','A3','B3','C4','D4','E4','F4','G4'].map((n,i)=><text key={n} x={holderSide==='left'?480.625+i*61.25:519.375-i*61.25} y="540" fill={colors[i%4]}>{n}</text>)}
  <text x="500" y="885" className="diagram-instruction">KEEP ONE HAND IN THE RING · SLIDE THE OTHER SIDEWAYS</text>
 </>}
 </svg>;
}
