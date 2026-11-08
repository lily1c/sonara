import {useCallback,useEffect,useRef,useState} from 'react';
import {play,unlock} from '../lib/audio';
import type {Role,RoomView} from './game';
export function useBand(){
 const achievementWaiters=useRef(new Map<string,{resolve:(value:any)=>void;reject:(error:Error)=>void;timer:ReturnType<typeof setTimeout>}>());
 const [reactions,setReactions]=useState<Array<{id:string;kind:string;at:number}>>([]);
 const [cameraSentAt,setCameraSentAt]=useState(0),[partnerNotes,setPartnerNotes]=useState<Record<string,{lane:number;role:Role;at:number}>>({});
 const [performers,setPerformers]=useState<Record<string,{image:string;tracking:number;received:number}>>({}),[bandSound,setBandSound]=useState(false);
 const soundRef=useRef(false),lastFrame=useRef(0);
 const [inviteOrigin,setInviteOrigin]=useState(location.origin);
 const [room,setRoom]=useState<RoomView|null>(null),[id,setId]=useState(''),[connection,setConnection]=useState('offline'),[error,setError]=useState(''),[feedback,setFeedback]=useState(''),[clock,setClock]=useState({offset:0,rtt:0,samples:0});
 const eventSequence=useRef(0),preferredRole=useRef<Role>('piano');
 const socket=useRef<WebSocket|null>(null),roomRef=useRef(room),idRef=useRef(id),clockRef=useRef(clock),intent=useRef<{type:'create'|'join';name:string;code?:string;role?:Role}|null>(null),closed=useRef(false),retries=useRef(0),retryTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 roomRef.current=room;idRef.current=id;clockRef.current=clock;
 const send=useCallback((message:unknown)=>{if(socket.current?.readyState===WebSocket.OPEN)socket.current.send(JSON.stringify(message));},[]);
 const connect=useCallback(()=>{
  if(socket.current&&socket.current.readyState<2)return;
  closed.current=false;setConnection('connecting');setError('');
  const ws=new WebSocket(`${location.protocol==='https:'?'wss:':'ws:'}//${location.host}/room`);socket.current=ws;
  let count=0,best=Infinity;let heartbeat:ReturnType<typeof setInterval>|undefined;
  const ping=()=>{if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify({type:'ping',sent:Date.now()}));};
  ws.onopen=()=>{retries.current=0;setConnection('syncing');setClock({offset:0,rtt:0,samples:0});ping();heartbeat=setInterval(ping,350);};
  ws.onmessage=e=>{
   try{const m=JSON.parse(e.data);
    if(m.type==='pong'){
     const rtt=Date.now()-m.sent;count++;if(rtt<best){best=rtt;const c={offset:m.serverTime-(m.sent+rtt/2),rtt,samples:count};clockRef.current=c;setClock(c);}else setClock(c=>({...c,samples:count}));
     // Finish initial clock sampling before joining; no readiness until synchronized.
     if(count===5){setConnection('online');clearInterval(heartbeat);heartbeat=setInterval(ping,10000);const value=intent.current;if(value){const code=roomRef.current?.code??value.code;let token='';try{token=sessionStorage.getItem(`sonara-room-${code}`)??'';}catch{}ws.send(JSON.stringify({...value,type:code?'join':value.type,code,token}));}}
    }
    if(m.type==='welcome'){setInviteOrigin(m.inviteOrigin||location.origin);setId(m.id);idRef.current=m.id;if(intent.current)intent.current={...intent.current,type:'join',code:m.code};try{sessionStorage.setItem(`sonara-room-${m.code}`,m.token);}catch{}}
    if(m.type==='state'){if(soundRef.current)void Promise.all(m.room.players.map((p:{role:Role})=>unlock(p.role))).catch(()=>setError('A partner instrument could not load. Try Hear my band again.'));setRoom(m.room);roomRef.current=m.room;setPerformers(old=>Object.fromEntries(Object.entries(old).filter(([id])=>m.room.players.some((p:{id:string;connected:boolean})=>p.id===id&&p.connected))));}
    if(m.type==='camera-frame'&&typeof m.image==='string')setPerformers(old=>({...old,[m.id]:{image:m.image,tracking:m.tracking,received:Date.now()}}));
    if(m.type==='camera-off')setPerformers(old=>{const next={...old};delete next[m.id];return next;});
    if(m.type==='reaction')setReactions(old=>[...old.filter(r=>Date.now()-r.at<2500),{id:m.id,kind:m.reaction,at:Date.now()}].slice(-6));
    if(m.type==='camera-live')setCameraSentAt(Date.now());
    if(m.type==='perform'){
     setPartnerNotes(old=>({...old,[m.id]:{lane:m.lane,role:m.role,at:Date.now()}}));
     if(soundRef.current){try{play(m.lane,m.role);}catch{setError('Partner note arrived, but audio could not play. Click Hear my band again.');}}
    }

    if(m.type==='achievement-challenge'||m.type==='achievement-receipt'){const waiting=achievementWaiters.current.get(m.type);if(waiting){clearTimeout(waiting.timer);achievementWaiters.current.delete(m.type);waiting.resolve(m);}}
    if(m.type==='error'){setError(m.message);for(const waiting of achievementWaiters.current.values()){clearTimeout(waiting.timer);waiting.reject(new Error(m.message));}achievementWaiters.current.clear();}
    if(m.type==='judgement')setFeedback(m.judgement==='Extra tap'?'Extra tap':`${m.judgement} · ${m.error>0?'+':''}${m.error} ms`);
    if(m.type==='left'){setRoom(null);roomRef.current=null;setId('');intent.current=null;closed.current=true;ws.close();}
   }catch{setError('Could not read server response.');}
  };
  ws.onerror=()=>setError('Cannot reach the room server. Check the URL, Wi-Fi and server.');
  ws.onclose=()=>{for(const waiting of achievementWaiters.current.values()){clearTimeout(waiting.timer);waiting.reject(new Error('Room connection closed. Reconnect before claiming.'));}achievementWaiters.current.clear();clearInterval(heartbeat);setConnection('offline');if(!closed.current&&intent.current&&retries.current++<8){retryTimer.current=setTimeout(connect,2000);}else if(!closed.current)setError('Connection lost. Use Reconnect or leave the room.');};
 },[]);
 useEffect(()=>()=>{closed.current=true;clearTimeout(retryTimer.current);socket.current?.close();},[]);
 function enter(type:'create'|'join',name:string,code?:string){intent.current={type,name,code:code?.trim().toUpperCase(),role:preferredRole.current};setFeedback('');if(socket.current?.readyState===WebSocket.OPEN){socket.current.send(JSON.stringify({...intent.current}));}else connect();}
 const leave=()=>{closed.current=true;intent.current=null;clearTimeout(retryTimer.current);send({type:'leave'});socket.current?.close();socket.current=null;setRoom(null);roomRef.current=null;setId('');setError('');setFeedback('');setPerformers({});setPartnerNotes({});setCameraSentAt(0);soundRef.current=false;setBandSound(false);};
 const submitHit=useCallback((lane:number,mode:string,role:string)=>{const current=roomRef.current,me=current?.players.find(p=>p.id===idRef.current);if(!current||!me||role!==me.role)return;send({type:'perform',lane});if(current.phase!=='playing')return;send({type:'hit',lane,mode,role,chartId:current.chartId,matchId:current.matchId,eventId:`${Date.now()}-${++eventSequence.current}`,at:Date.now()+clockRef.current.offset});},[send]);
 const shareFrame=useCallback((image:string,tracking:number)=>{if(!roomRef.current||Date.now()-lastFrame.current<250)return;lastFrame.current=Date.now();send({type:'camera-frame',image,tracking});},[send]);
 const stopSharing=useCallback(()=>{setCameraSentAt(0);send({type:'camera-off'});},[send]);
 const enableBandSound=async()=>{await Promise.all((roomRef.current?.players??[]).map(p=>unlock(p.role)));if(!roomRef.current)await unlock();soundRef.current=true;setBandSound(true);};
 const muteBand=()=>{soundRef.current=false;setBandSound(false);};
 const chooseInstrument=(role:Role)=>{preferredRole.current=role;if(roomRef.current)send({type:'instrument',instrument:role});};
 function requestAchievement(type:string,message:unknown):Promise<any>{if(socket.current?.readyState!==WebSocket.OPEN)return Promise.reject(new Error('Reconnect to the room first.'));return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{achievementWaiters.current.delete(type);reject(new Error('Server response timed out. Try again.'));},10000);achievementWaiters.current.set(type,{resolve,reject,timer});send(message);});}
 return {requestAchievement,chooseInstrument,reactions,cameraSentAt,partnerNotes,performers,bandSound,enableBandSound,muteBand,shareFrame,stopSharing,room,id,inviteOrigin,connection,error,feedback,clock,enter,leave,reconnect:connect,send,submitHit,serverNow:()=>Date.now()+clockRef.current.offset,role:room?.players.find(p=>p.id===id)?.role as Role|undefined};
}
export type Band=ReturnType<typeof useBand>;
