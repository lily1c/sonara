import {WebSocketServer,WebSocket} from 'ws';
import type {IncomingMessage} from 'node:http';
import type {Duplex} from 'node:stream';
import type {EventEmitter} from 'node:events';
import {randomBytes,randomUUID} from 'node:crypto';
import {createIssuer,verifyWallet,challengeMessage} from './achievements';
import {qualified} from '../src/solana/achievement';
import type {AchievementPayload} from '../src/solana/achievement';
import {networkInterfaces} from 'node:os';
import {songById,validSong} from '../src/multiplayer/songs';
import {chartId,duration,emptyScore,judge,expire,laneCount,type Role,type RoomView,type PlayerView} from '../src/multiplayer/game';
type Player=PlayerView&{token:string;ws:WebSocket|null;seen:Set<string>;rateAt:number;rate:number;expires:number;frameAt:number;musicAt:number;musicRate:number;achievementBinding?:{match:string;wallet:string;receipt:ReturnType<ReturnType<typeof createIssuer>['issue']>}};
type Room=Omit<RoomView,'players'>&{players:Player[];touched:number;claimBindings?:Record<string,string>;completion?:{band:number;ended:number;players:Record<string,{role:string;points:number;hits:number}>}};
export function attachRooms(server:EventEmitter,clock:()=>number=Date.now,issuer=createIssuer()){
 const rooms=new Map<string,Room>(),peers=new Set<WebSocket>();
 const wss=new WebSocketServer({noServer:true,maxPayload:100000});
 const upgrade=(req:IncomingMessage,socket:Duplex,head:Buffer)=>{
  if(req.url?.split('?')[0]!=='/room')return;
  // Same-origin browser clients only. Native integration tests omit Origin.
  if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host){socket.destroy();return;}}catch{socket.destroy();return;}}
  if(peers.size>=100){socket.destroy();return;}
  wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));
 };
 server.on('upgrade',upgrade);
 function send(ws:WebSocket|null,value:unknown){if(ws?.readyState===WebSocket.OPEN){if(ws.bufferedAmount>100000){ws.terminate();return;}ws.send(JSON.stringify(value));}}
 function snapshot(room:Room):RoomView{return {code:room.code,host:room.host,phase:room.phase,startAt:room.startAt,bpm:room.bpm,matchId:room.matchId,chartId:room.chartId,reason:room.reason,achievementEligible:room.achievementEligible,players:room.players.map(({id,name,role,ready,connected,score})=>({id,name,role,ready,connected,score}))};}
 function publish(room:Room){const state=snapshot(room);for(const p of room.players)send(p.ws,{type:'state',room:state});}
 function interrupt(room:Room,reason:string){if(room.phase==='playing'){room.phase='interrupted';room.reason=reason;room.players.forEach(p=>p.ready=false);}}
 wss.on('connection',(ws,request)=>{
  let inviteOrigin=request.headers.origin??`http://${request.headers.host}`;
  try{
   const url=new URL(inviteOrigin);
   if(['localhost','127.0.0.1','[::1]'].includes(url.hostname)){
    const interfaces=networkInterfaces();const candidates=[...(interfaces.en0??[]),...Object.values(interfaces).flatMap(v=>v??[])];
    const lan=candidates.find(n=>n.family==='IPv4'&&!n.internal);
    if(lan){url.hostname=lan.address;inviteOrigin=url.origin;}
   }
   if(process.env.SONARA_PUBLIC_URL||process.env.RENDER_EXTERNAL_URL)inviteOrigin=new URL(process.env.SONARA_PUBLIC_URL||process.env.RENDER_EXTERNAL_URL!).origin;
  }catch{}

  peers.add(ws);let room:Room|undefined,player:Player|undefined;let alive=true,lastReaction=0;
  let challenge:{message:string;wallet:string;match:string;expires:number}|undefined;const bound=new Map<string,{wallet:string;receipt:ReturnType<typeof issuer.issue>}>();
  ws.on('pong',()=>{alive=true;});
  const heartbeat=setInterval(()=>{if(!alive){ws.terminate();return;}alive=false;ws.ping();},15000);heartbeat.unref();
  const fail=(message:string)=>send(ws,{type:'error',message});
  function leave(){if(!room||!player)return;const old=room;old.players=old.players.filter(p=>p!==player);interrupt(old,'A player left. Invite a partner and ready up again.');if(old.host===player.id)old.host=old.players[0]?.id??'';player.ws=null;player=undefined;room=undefined;if(old.players.length)publish(old);else rooms.delete(old.code);}
  let windowAt=clock(),messages=0;
  ws.on('message',raw=>{
   try{
    const now=clock();if(now-windowAt>1000){windowAt=now;messages=0;}if(++messages>40){ws.close(1008,'Too many messages');return;}
    const m=JSON.parse(raw.toString());if(!m||typeof m!=='object')return;
    if(m.type==='ping'){if(typeof m.sent==='number')send(ws,{type:'pong',sent:m.sent,serverTime:now});return;}
    if(m.type==='leave'){leave();send(ws,{type:'left'});return;}
    if(m.type==='create'||m.type==='join'){
     if(room)return fail('Leave your current room first.');
     if(m.type==='create'){
      if(rooms.size>=50)return fail('Server is full. Try again later.');
      let code='';do{code=randomBytes(4).toString('hex').slice(0,6).toUpperCase();}while(rooms.has(code));
      room={code,host:'',players:[],phase:'lobby',bpm:80,startAt:0,matchId:'',chartId,reason:'',touched:now};rooms.set(code,room);
     }else{
      if(typeof m.code!=='string'||!/^[A-F0-9]{6}$/.test(m.code))return fail('Enter a six-character room code.');
      room=rooms.get(m.code);if(!room)return fail('Room not found. Check the code or create a new room.');
     }
     if(typeof m.token==='string')player=room.players.find(p=>p.token===m.token);
     if(player){if(player.connected){room=undefined;player=undefined;return fail('That player is already connected in another tab.');}player.ws=ws;player.connected=true;player.expires=0;}
     else{
      if(room.players.length>=4){room=undefined;return fail('This room already has four players (disconnected seats are held for 45 seconds).');}
      if(room.phase==='playing'){room=undefined;return fail('This performance has already started.');}
      player={id:randomUUID(),token:randomBytes(24).toString('hex'),name:typeof m.name==='string'?m.name.trim().slice(0,24)||'Musician':'Musician',role:['piano','drums','violin','saxophone'].includes(m.role)?m.role:room.players.length%2?'drums':'piano',ready:false,connected:true,score:emptyScore(),ws,seen:new Set(),rateAt:now,rate:0,expires:0,frameAt:0,musicAt:0,musicRate:0};room.players.push(player);
     }
     if(!room.host)room.host=player.id;
     room.touched=now;send(ws,{type:'welcome',id:player.id,token:player.token,code:room.code,inviteOrigin});publish(room);return;
    }
    if(!room||!player)return fail('Join a room first.');
    room.touched=now;
    if(m.type==='achievement-challenge'){
     if(room.phase!=='results'||!room.achievementEligible||!room.completion?.players[player.id])return fail('Finish a qualifying band session first: two instruments and at least four timed hits per player.');
     if(typeof m.wallet!=='string'||!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(m.wallet))return fail('Invalid wallet address.');
     const previous=bound.get(room.matchId);if(previous&&previous.wallet!==m.wallet)return fail('This player already bound this performance to another wallet.');
     challenge={message:challengeMessage(request.headers.origin??inviteOrigin,room.matchId,player.id,m.wallet),wallet:m.wallet,match:room.matchId,expires:now+120000};
     send(ws,{type:'achievement-challenge',message:challenge.message,issuer:issuer.issuer});return;
    }
    if(m.type==='achievement-proof'){
     const pending=challenge;challenge=undefined;
     if(!pending||pending.expires<now||room.phase!=='results'||!room.achievementEligible||!room.completion?.players[player.id]||room.matchId!==pending.match||typeof m.signature!=='string'||!verifyWallet(pending.wallet,pending.message,m.signature))return fail('Wallet proof expired or invalid. Request a fresh achievement challenge.');
     // Binding is stored on the player, surviving reconnects. Never accept client scores.
     const previous=player.achievementBinding;
     if(previous?.match===room.matchId){if(previous.wallet!==pending.wallet)return fail('This performance is already bound to another wallet.');send(ws,{type:'achievement-receipt',receipt:previous.receipt});return;}
     if(room.claimBindings?.[pending.wallet]&&room.claimBindings[pending.wallet]!==player.id)return fail('Each band player must use a different wallet.');
     const payload:AchievementPayload={v:1,app:'sonara',badge:'first-band',song:room.chartId,match:room.matchId,wallet:pending.wallet,...room.completion!.players[player.id],band:room.completion!.band,ended:room.completion!.ended};
     const receipt=issuer.issue(payload);room.claimBindings??={};room.claimBindings[pending.wallet]=player.id;player.achievementBinding={match:room.matchId,wallet:pending.wallet,receipt};bound.set(room.matchId,{wallet:pending.wallet,receipt});send(ws,{type:'achievement-receipt',receipt});return;
    }
    if(m.type==='camera-frame'){
     if(typeof m.image!=='string'||m.image.length>90000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(m.image)||now-player.frameAt<240)return;
     player.frameAt=now;send(ws,{type:'camera-live'});
     for(const p of room.players)if(p!==player)send(p.ws,{type:'camera-frame',id:player.id,image:m.image,tracking:Number.isInteger(m.tracking)?Math.max(0,Math.min(2,m.tracking)):0});
     return;
    }
    if(m.type==='camera-off'){
     for(const p of room.players)if(p!==player)send(p.ws,{type:'camera-off',id:player.id});return;
    }
    if(m.type==='reaction'){
     if(!['nice','star','applause'].includes(m.reaction)||now-lastReaction<1500)return;lastReaction=now;
     for(const p of room.players)send(p.ws,{type:'reaction',id:player.id,reaction:m.reaction});return;
    }
    if(m.type==='perform'){
     if(!Number.isInteger(m.lane)||m.lane<0||m.lane>=laneCount(player.role))return;
     if(now-player.musicAt>1000){player.musicAt=now;player.musicRate=0;}if(++player.musicRate>12)return;
     for(const p of room.players)if(p!==player)send(p.ws,{type:'perform',id:player.id,role:player.role,lane:m.lane});return;
    }
    if(m.type==='instrument'){
     if(room.phase==='playing'||!['piano','drums','violin','saxophone'].includes(m.instrument))return;
     player.role=m.instrument;player.ready=false;publish(room);return;
    }
    if(m.type==='ready'){
     if(room.phase==='playing')return;
     if(typeof m.ready!=='boolean')return;
     player.ready=m.ready;publish(room);return;
    }
    if(m.type==='song'){
     if(room.host!==player.id)return fail('Only the host can choose the song.');
     if(room.phase==='playing'||!validSong(m.songId))return;
     room.chartId=m.songId;room.bpm=songById(m.songId).tempo;room.phase='lobby';room.achievementEligible=false;room.completion=undefined;room.players.forEach(p=>p.ready=false);publish(room);return;
    }
    if(m.type==='tempo'){
     if(room.host!==player.id||room.phase==='playing')return;
     if(![60,80,100].includes(m.bpm))return;
     room.bpm=m.bpm;room.players.forEach(p=>p.ready=false);publish(room);return;
    }
    if(m.type==='start'){
     if(room.host!==player.id)return fail('Only the room creator can start.');
     if(room.phase==='playing')return;
     if(room.players.length<2||room.players.some(p=>!p.connected||!p.ready))return fail('At least two players must join, and everyone must be connected and ready.');
     room.completion=undefined;room.claimBindings={};room.achievementEligible=false;room.phase='playing';room.startAt=now+5000;room.matchId=randomUUID();room.reason='';for(const p of room.players){p.score=emptyScore();p.seen.clear();p.rate=0;}publish(room);return;
    }
    if(m.type==='hit'){
     if(room.phase!=='playing'||m.matchId!==room.matchId||m.chartId!==room.chartId||m.role!==player.role)return;
     if(!Number.isInteger(m.lane)||m.lane<0||m.lane>=laneCount(player.role)||typeof m.eventId!=='string'||m.eventId.length>80||!['webcam','keyboard','mouse / touch','diagram','bow','sax fingers'].includes(m.mode))return;
     if(typeof m.at!=='number'||!Number.isFinite(m.at)||Math.abs(now-m.at)>800||m.at>now+100||now<room.startAt||now>room.startAt+duration(room.bpm,room.chartId)+1000)return;
     if(now-player.rateAt>1000){player.rateAt=now;player.rate=0;}if(++player.rate>12||player.seen.size>=1000||player.seen.has(m.eventId))return;
     player.seen.add(m.eventId);
     const result=judge(player.score,player.role,m.lane,m.at-room.startAt,room.bpm,room.chartId);
     send(ws,{type:'judgement',...(result??{judgement:'Extra tap',error:0})});if(result)publish(room);return;
    }
   }catch{fail('Invalid room message.');}
  });
  ws.on('error',()=>{});
  ws.on('close',()=>{clearInterval(heartbeat);peers.delete(ws);if(room&&player&&player.ws===ws){player.connected=false;player.ready=false;player.ws=null;player.expires=clock()+45000;interrupt(room,'Connection interrupted. Reconnect, then both players can ready up for a fresh take.');publish(room);}});
 });
 const ticker=setInterval(()=>{
  const now=clock();for(const room of rooms.values()){
   const removed=room.players.filter(p=>!p.connected&&p.expires<now);
   if(removed.length){room.players=room.players.filter(p=>!removed.includes(p));if(!room.players.some(p=>p.id===room.host))room.host=room.players[0]?.id??'';publish(room);}
   if(!room.players.length||now-room.touched>3600000){for(const p of room.players)p.ws?.close(1000,'Room expired');rooms.delete(room.code);continue;}
   if(room.phase==='playing'){
    let changed=false;for(const p of room.players)changed=expire(p.score,p.role,now-room.startAt-800,room.bpm,room.chartId)||changed;
    if(now>room.startAt+duration(room.bpm,room.chartId)+1100){for(const p of room.players){expire(p.score,p.role,Infinity,room.bpm,room.chartId);p.ready=false;}room.achievementEligible=qualified(room.players);room.completion={band:room.players.length,ended:Math.round(room.startAt+duration(room.bpm,room.chartId)),players:Object.fromEntries(room.players.map(p=>[p.id,{role:p.role,points:p.score.points,hits:p.score.perfect+p.score.good}]))};room.phase='results';changed=true;}
    if(changed)publish(room);
   }
  }
 },100);ticker.unref();
 return ()=>{clearInterval(ticker);server.off('upgrade',upgrade);for(const ws of peers)ws.terminate();wss.close();};
}
