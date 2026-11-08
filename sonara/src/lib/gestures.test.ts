import {describe,it,expect} from 'vitest'; import {TapDetector,SwipeDetector} from './gestures';
const b={left:.1,right:.9,line:.6};
describe('intentional taps',()=>{
 it('requires release, does not repeat while held, and re-arms',()=>{const d=new TapDetector();expect(d.update('a',{x:.2,y:.4},0,b)).toBeNull();expect(d.update('a',{x:.2,y:.8},40,b)).toBe(0);for(let t=80;t<760;t+=40)expect(d.update('a',{x:.2,y:.8},t,b)).toBeNull();d.update('a',{x:.2,y:.3},760,b);expect(d.update('a',{x:.2,y:.9},800,b)).toBe(0);});
 it('maps all four mirrored lanes',()=>{for(let lane=0;lane<4;lane++){const d=new TapDetector();const x=.2+lane*.2;d.update('a',{x,y:.3},0,b);expect(d.update('a',{x,y:.9},40,b)).toBe(lane);}});
 it('ignores initial presence, out of bounds and tracking gaps',()=>{const d=new TapDetector();expect(d.update('a',{x:.2,y:.9},0,b)).toBeNull();d.update('a',{x:.01,y:.3},40,b);expect(d.update('a',{x:.01,y:.9},80,b)).toBeNull();expect(d.update('a',{x:.2,y:.9},500,b)).toBeNull();});
});
describe('comfortable gestures',()=>{
 it('accepts a slow downward crossing',()=>{const d=new TapDetector();let hit:number|null=null;for(let i=0;i<70;i++){const result=d.update('a',{x:.4,y:.4+i*.004},i*40,b);if(result!==null)hit=result;}expect(hit).toBe(1);});
 it('requires a still hold before swiping and ignores palm flips',()=>{const d=new SwipeDetector();d.update('a',{x:.2,y:.15},true,0,.6);expect(d.update('a',{x:.6,y:.15},true,100,.6)).toBeNull();for(let t=200;t<=800;t+=100)d.update('a',{x:.6,y:.15},true,t,.6);expect(d.ready).toBe(true);expect(d.update('a',{x:.25,y:.15},true,900,.6)).toBe(-1);expect(d.update('a',{x:.8,y:.15},true,1000,.6)).toBeNull();});
 it('does not arm across missing frames or below the switch strip',()=>{const d=new SwipeDetector();d.update('a',{x:.2,y:.15},true,0,.6);d.update('a',{x:.2,y:.15},true,800,.6);expect(d.ready).toBe(false);expect(d.update('a',{x:.8,y:.5},true,900,.6)).toBeNull();});
});
