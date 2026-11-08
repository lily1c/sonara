import type {Bounds,Point} from './gestures';
export const instruments=['piano','drums','violin','saxophone'] as const;
export const drumPads=[{x:.2,y:.65,rx:.105,ry:.085},{x:.42,y:.75,rx:.105,ry:.085},{x:.64,y:.58,rx:.11,ry:.065},{x:.82,y:.72,rx:.105,ry:.085}];
export function padLayout(b:Bounds){return drumPads.map(p=>({...p,x:b.left+p.x*(b.right-b.left),y:p.y+b.line-.6,rx:p.rx*(b.right-b.left)}));}
export class DrumDetector{
 private hands=new Map<string,{p:Point;time:number;armed:boolean[];last:number}>();
 reset(){this.hands.clear();}
 update(id:string,p:Point,time:number,b:Bounds,cooldown:number){
  const pads=padLayout(b),prev=this.hands.get(id);
  if(!prev||time-prev.time>220){this.hands.set(id,{p,time,armed:pads.map(pad=>p.y<pad.y-pad.ry),last:-Infinity});return null;}
  const smooth={x:prev.p.x+(p.x-prev.p.x)*.65,y:prev.p.y+(p.y-prev.p.y)*.65};let hit:number|null=null;
  pads.forEach((pad,i)=>{if(smooth.y<pad.y-pad.ry)prev.armed[i]=true;
   if(prev.armed[i]&&prev.p.y<pad.y&&smooth.y>=pad.y){prev.armed[i]=false;if(Math.abs(smooth.x-pad.x)<pad.rx&&(smooth.y-prev.p.y)/Math.max(1,time-prev.time)>.00004&&time-prev.last>=cooldown){hit=i;prev.last=time;}}
  });this.hands.set(id,{...prev,p:smooth,time});return hit;
 }
}
export type TrackedHand={id:string;palm:Point;tip:Point;landmarks?:FingerPoint[]};
export class BowDetector{
 private prev:{x:number;time:number;id:string}|null=null;private lastMotion=-Infinity;private motionX:number|null=null;private note:number|null=null;
 reset(){this.prev=null;this.lastMotion=-Infinity;this.motionX=null;this.note=null;}
 update(hands:TrackedHand[],time:number,holderSide:'left'|'right'){
  const targetX=holderSide==='left'?.25:.75;
  const holder=hands.find(h=>Math.hypot((h.palm.x-targetX)/.15,(h.palm.y-.48)/.18)<1);
  const bow=holder?hands.find(h=>h.id!==holder.id):undefined;
  if(!holder||!bow){this.reset();return {holding:!!holder,lane:null};}
  const x=holderSide==='left'?bow.palm.x:1-bow.palm.x;
  if(x<.45||x>.94||bow.palm.y<.32||bow.palm.y>.78){this.reset();return {holding:true,lane:null};}
  if(!this.prev||this.prev.id!==bow.id||time-this.prev.time>220){this.prev={x,time,id:bow.id};this.motionX=x;return {holding:true,lane:null};}
  if(this.motionX===null)this.motionX=x;
  if(Math.abs(x-this.motionX)>.012){this.lastMotion=time;this.motionX=x;}
  this.prev={x,time,id:bow.id};
  const candidate=Math.min(7,Math.floor((x-.45)/.49*8));
  if(this.note===null||x<.45+this.note*.06125-.012||x>.45+(this.note+1)*.06125+.012)this.note=candidate;
  return {holding:true,lane:time-this.lastMotion<220?this.note:null};
 }
}

export type FingerPoint=Point&{z?:number};
export const fingerNames=['Thumb','Index','Middle','Ring','Pinky'];
export function fingerStates(points:FingerPoint[],previous:boolean[]=Array(5).fill(false)){
 const joints=[[1,2,4],[5,6,8],[9,10,12],[13,14,16],[17,18,20]];
 return joints.map(([a,b,c],i)=>{
  if(!points[a]||!points[b]||!points[c])return false;
  const u=[points[a].x-points[b].x,points[a].y-points[b].y,(points[a].z??0)-(points[b].z??0)],v=[points[c].x-points[b].x,points[c].y-points[b].y,(points[c].z??0)-(points[b].z??0)];
  const length=Math.hypot(...u)*Math.hypot(...v);if(length<.000001)return previous[i]??false;
  const angle=Math.acos(Math.max(-1,Math.min(1,u.reduce((s,n,j)=>s+n*v[j],0)/length)));
  const curl=1-angle/Math.PI;return previous[i]?curl>.20:curl>.34;
 });
}
export type SaxPose={lane:number|null;register:boolean;fingers:boolean[][];upper:boolean;lower:boolean;ready:boolean};
export class SaxDetector{
 private masks=new Map<string,boolean[]>();private pending='';private since=0;private last=0;
 private active:{lane:number;register:boolean}|null=null;
 reset(){this.masks.clear();this.pending='';this.active=null;this.last=0;}
 update(hands:TrackedHand[],time:number):SaxPose{
  if(time-this.last>250){this.masks.clear();this.pending='';this.active=null;}this.last=time;
  const ordered=[...hands].sort((a,b)=>a.palm.y-b.palm.y);
  const top=ordered[0],bottom=ordered[1];
  const upper=!!top&&top.palm.x>.03&&top.palm.x<.97&&top.palm.y>.03&&top.palm.y<.95;
  const lower=!!bottom&&bottom.palm.x>.03&&bottom.palm.x<.97&&bottom.palm.y>.03&&bottom.palm.y<.95;
  const fingers=ordered.slice(0,2).map(h=>{const mask=fingerStates(h.landmarks??[],this.masks.get(h.id));this.masks.set(h.id,mask);return mask;});
  const ready=upper&&lower&&!!top.landmarks&&!!bottom.landmarks;
  if(!ready){this.pending='';this.active=null;return {lane:null,register:false,fingers,upper,lower,ready};}
  const closed=[...fingers[0].slice(1,4),...fingers[1].slice(1,4)].filter(Boolean).length;
  const pinkies=Number(fingers[0][4])+Number(fingers[1][4])+Number(fingers[1][0]);
  const lane=Math.max(0,Math.min(3,Math.floor((6-closed-pinkies)/2))),register=fingers[0][0];
  const key=`${lane}-${register}`;if(key!==this.pending){this.pending=key;this.since=time;}
  if(time-this.since>=110)this.active={lane,register};
  return {lane:this.active?.lane??null,register:this.active?.register??false,fingers,upper,lower,ready};
 }
}
