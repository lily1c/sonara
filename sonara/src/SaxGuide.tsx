import {fingerNames,type SaxDetector} from './lib/instruments';
type Pose=ReturnType<SaxDetector['update']>;
export default function SaxGuide({pose,active}:{pose?:Pose;active:number}){
 return <svg className="instrument-diagram sax-diagram" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-label="Saxophone pose: upper hand on neck keys, lower hand on body keys">
  <path d="M 475 260 Q 415 230 395 280 L 510 695 Q 560 860 690 790 Q 740 755 745 690 L 700 670 Q 695 750 640 753 Q 590 755 570 680 L 455 295 Q 452 280 480 295 Z" fill="#f3c45e42" stroke="#232730" strokeWidth="7" strokeLinejoin="round"/>
  <path d="M 483 259 520 249 530 281 481 298Z" fill="#252c3d" stroke="#252c3d" strokeWidth="4"/>
  <ellipse cx="740" cy="668" rx="82" ry="40" transform="rotate(-24 740 668)" fill="#fff2c8" stroke="#242b3c" strokeWidth="7"/>
  <ellipse cx="740" cy="668" rx="63" ry="24" transform="rotate(-24 740 668)" fill="#d4a64255" stroke="#2864f0" strokeWidth="3"/>
  <path d="M 423 316 547 711 Q 582 809 665 763 M 438 312 560 704" fill="none" stroke="#c69739" strokeWidth="3"/>
  {[0,1,2].map(i=><g key={i}><path d={`M ${446+i*21} ${373+i*67} l -36 10`} stroke="#303c56" strokeWidth="4"/><circle cx={446+i*21} cy={373+i*67} r="13" fill={pose?.fingers[0]?.[i+1]?'#2864f0':'#fff'} stroke="#252f43" strokeWidth="3"/></g>)}
  {[0,1,2].map(i=><g key={i}><path d={`M ${516+i*20} ${585+i*65} l 32 -9`} stroke="#303c56" strokeWidth="4"/><circle cx={516+i*20} cy={585+i*65} r="13" fill={pose?.fingers[1]?.[i+1]?'#2864f0':'#fff'} stroke="#252f43" strokeWidth="3"/></g>)}
  <ellipse cx="430" cy="400" rx="230" ry="150" fill={pose?.upper?'#2864f012':'#ffffff10'} stroke={pose?.upper?'#2864f0':'#657ca8'} strokeWidth="3" strokeDasharray="10 9"/>
  <ellipse cx="590" cy="680" rx="230" ry="150" fill={pose?.lower?'#2864f012':'#ffffff10'} stroke={pose?.lower?'#2864f0':'#657ca8'} strokeWidth="3" strokeDasharray="10 9"/>
  <text x="240" y="295" fill="#2864f0">UPPER HAND</text><text x="780" y="550" fill="#2864f0">LOWER HAND</text>
  {[0,1].map(row=><g key={row}>{fingerNames.map((name,i)=><g key={name}><circle cx={240+i*120} cy={row===0?155:875} r="22" fill={pose?.fingers[row]?.[i]?'#2864f0':'#ffffffce'} stroke="#2864f0" strokeWidth="2.5"/><text x={240+i*120} y={(row===0?155:875)+7} style={{stroke:'none'}} fill={pose?.fingers[row]?.[i]?'#fff':'#244b9b'}>{name[0]}</text><text x={240+i*120} y={row===0?205:928} fill="#364d78" style={{fontSize:19}}>{i===0?(row===0?'Upper keys':'Low key'):name}</text></g>)}</g>)}
  {active>=0&&<path d="M 815 630 Q 890 605 898 548 M 833 675 Q 915 672 942 610" fill="none" stroke="#2864f0" strokeWidth="4" strokeLinecap="round"/>}
 </svg>;
}
