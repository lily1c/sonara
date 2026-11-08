export type Point = {x:number;y:number};
export type Bounds = {left:number;right:number;line:number};
type State = {x:number;y:number;time:number;armed:boolean;lastHit:number};
export class TapDetector {
 private hands = new Map<string,State>();
 reset(){this.hands.clear();}
 update(id:string, point:Point, time:number, bounds:Bounds, cooldown=650,lanes=4):number|null {
  const prev=this.hands.get(id);
  if(!prev || time-prev.time>220){this.hands.set(id,{...point,time,armed:point.y<bounds.line-.045,lastHit:-Infinity});return null;}
  const x=prev.x+(point.x-prev.x)*.65, y=prev.y+(point.y-prev.y)*.65;
  let armed=prev.armed, lastHit=prev.lastHit, hit:number|null=null;
  if(y<bounds.line-.045) armed=true;
  if(armed && prev.y<bounds.line && y>=bounds.line && (y-prev.y)/Math.max(1,time-prev.time)>.00004 && time-lastHit>cooldown){
   if(x>=bounds.left && x<bounds.right){hit=Math.min(lanes-1,Math.floor((x-bounds.left)/(bounds.right-bounds.left)*lanes));lastHit=time;}
   armed=false;
  }
  this.hands.set(id,{x,y,time,armed,lastHit});return hit;
 }
}

// Hold in the dedicated top strip before swiping. Palm rotation alone cannot select.
export class SwipeDetector {
 private anchors=new Map<string,{x:number;y:number;time:number;seen:number;armedAt:number|null}>();
 private lastSwitch=-Infinity;
 get ready(){return [...this.anchors.values()].some(a=>a.armedAt!==null);}
 reset(){this.anchors.clear();}
 update(id:string,p:Point,open:boolean,time:number,_line:number):number|null {
  if(!open||p.y>.22||time-this.lastSwitch<1800){this.anchors.delete(id);return null;}
  const a=this.anchors.get(id);
  if(!a||time-a.seen>220){this.anchors.set(id,{...p,time,seen:time,armedAt:null});return null;}
  a.seen=time;
  if(a.armedAt===null){
   if(Math.hypot(p.x-a.x,p.y-a.y)>.045){this.anchors.set(id,{...p,time,seen:time,armedAt:null});return null;}
   if(time-a.time>=650){a.armedAt=time;a.x=p.x;a.y=p.y;}
   return null;
  }
  if(time-a.armedAt>1600||Math.abs(p.y-a.y)>.08){this.anchors.delete(id);return null;}
  if(Math.abs(p.x-a.x)>.28){this.lastSwitch=time;this.anchors.clear();return p.x>a.x?1:-1;}
  return null;
 }
}
