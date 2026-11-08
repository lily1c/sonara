import {describe,it,expect} from 'vitest';
import {DrumDetector,BowDetector,SaxDetector,fingerStates,padLayout,type TrackedHand} from './instruments';
const bounds={left:.1,right:.9,line:.6};
describe('drum targets',()=>{
 it('strikes every visible drum center and never repeats while held',()=>{padLayout(bounds).forEach((pad,i)=>{const d=new DrumDetector();d.update('h',{x:pad.x,y:pad.y-.16},0,bounds,650);expect(d.update('h',{x:pad.x,y:pad.y+.15},40,bounds,650)).toBe(i);for(let t=80;t<900;t+=40)expect(d.update('h',{x:pad.x,y:pad.y+.15},t,bounds,650)).toBeNull();});});
 it('rejects a strike in empty space',()=>{const d=new DrumDetector();d.update('h',{x:.02,y:.2},0,bounds,650);expect(d.update('h',{x:.02,y:.9},40,bounds,650)).toBeNull();});
});
const hand=(id:string,x:number,y:number):TrackedHand=>({id,palm:{x,y},tip:{x,y}});
describe('violin pose and bow',()=>{
 it('requires a holding hand, changes notes with bow reach and releases when stopped or lost',()=>{const d=new BowDetector(),h=hand('holder',.25,.48);expect(d.update([hand('bow',.6,.5)],0,'left').lane).toBeNull();d.update([h,hand('bow',.5,.5)],40,'left');expect(d.update([h,hand('bow',.6,.5)],80,'left').lane).toBe(2);expect(d.update([h,hand('bow',.87,.5)],120,'left').lane).toBe(6);expect(d.update([h,hand('bow',.87,.5)],340,'left').lane).toBeNull();expect(d.update([hand('bow',.87,.5)],380,'left').lane).toBeNull();});
 it('mirrors the holding hand and note zones',()=>{const d=new BowDetector(),h=hand('holder',.75,.48);d.update([h,hand('bow',.5,.5)],0,'right');expect(d.update([h,hand('bow',.4,.5)],40,'right').lane).toBe(2);});
 it('holds the current note around a boundary and releases after movement stops',()=>{const d=new BowDetector(),h=hand('holder',.25,.48);d.update([h,hand('bow',.5,.5)],0,'left');expect(d.update([h,hand('bow',.57,.5)],40,'left').lane).toBe(1);expect(d.update([h,hand('bow',.58,.5)],80,'left').lane).toBe(1);expect(d.update([h,hand('bow',.57,.5)],120,'left').lane).toBe(1);expect(d.update([h,hand('bow',.61,.5)],160,'left').lane).toBe(2);d.update([h,hand('bow',.61,.5)],300,'left');expect(d.update([h,hand('bow',.61,.5)],400,'left').lane).toBeNull();});

});

function fingers(mask:boolean[]){const points=Array.from({length:21},()=>({x:0,y:0,z:0}));[[1,2,4],[5,6,8],[9,10,12],[13,14,16],[17,18,20]].forEach(([a,b,c],i)=>{points[a]={x:i*.15,y:0,z:0};points[b]={x:i*.15,y:.1,z:0};points[c]={x:i*.15+(mask[i]?.01:0),y:mask[i]?.04:.2,z:0};});return points;}
const saxHand=(id:string,x:number,y:number,mask:boolean[]):TrackedHand=>({...hand(id,x,y),landmarks:fingers(mask)});
describe('all-finger saxophone',()=>{
 it('reads every thumb/index/middle/ring/pinky independently',()=>{for(let i=0;i<5;i++){const mask=Array(5).fill(false);mask[i]=true;expect(fingerStates(fingers(mask))).toEqual(mask);}});
 it('requires two hands but starts without a difficult thumb gate',()=>{const d=new SaxDetector();const upper=saxHand('u',.43,.4,[false,false,false,false,false]),lower=saxHand('l',.59,.68,[false,false,false,false,false]);expect(d.update([upper],0).lane).toBeNull();expect(d.update([upper,lower],40).lane).toBeNull();expect(d.update([upper,lower],180).lane).toBe(3);expect(d.update([],240).lane).toBeNull();});
 it('lowers pitch with finger closures and raises register with upper thumb',()=>{const d=new SaxDetector();const upper=saxHand('u',.43,.4,[true,true,true,true,false]),lower=saxHand('l',.59,.68,[true,true,true,true,false]);d.update([upper,lower],0);const state=d.update([upper,lower],120);expect(state.lane).toBe(0);expect(state.register).toBe(true);expect(state.fingers.flat()).toHaveLength(10);});
});

it('accepts comfortable hand placement including a high hand and duplicate handedness labels',()=>{const d=new SaxDetector();const u=saxHand('Left',.25,.15,[false,false,false,false,false]),l=saxHand('Left',.8,.5,[false,false,false,false,false]);d.update([u,l],0);expect(d.update([u,l],120).lane).toBe(3);expect(d.update([u],160).lane).toBeNull();});
