import {generateKeyPairSync,sign,verify,createPublicKey} from 'node:crypto';
import {base58} from '@metaplex-foundation/umi/serializers';
import {createIssuer} from './achievements';
import {createServer} from 'node:http';
import {WebSocket} from 'ws';
import {afterEach,describe,it,expect} from 'vitest';
import {attachRooms} from './rooms';
import {chartId,duration} from '../src/multiplayer/game';
type Message={type:string;[key:string]:any};
const cleanup:Array<()=>void>=[];
afterEach(()=>{cleanup.splice(0).reverse().forEach(f=>f());});
async function setup(){
 let time=Date.now();const server=createServer();const close=attachRooms(server,()=>time,createIssuer(generateKeyPairSync('ed25519').privateKey));cleanup.push(()=>{close();server.close();});
 await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const address=server.address() as {port:number};
 async function client(){const ws=new WebSocket(`ws://127.0.0.1:${address.port}/room`),messages:Message[]=[];ws.on('message',raw=>messages.push(JSON.parse(raw.toString())));cleanup.push(()=>ws.terminate());await new Promise<void>(r=>ws.once('open',r));return {ws,send:(m:unknown)=>ws.send(JSON.stringify(m)),async next(type:string,predicate:(m:Message)=>boolean=()=>true){const start=Date.now();while(Date.now()-start<2000){const index=messages.findIndex(m=>m.type===type&&predicate(m));if(index>=0)return messages.splice(index,1)[0];await new Promise(r=>setTimeout(r,5));}throw new Error(`No ${type}: ${JSON.stringify(messages)}`);}};}
 return {client,advance:(ms:number)=>time+=ms,now:()=>time};
}
describe('two real WebSocket clients',()=>{
 it('creates, joins, enforces capacity/readiness, scores on server and returns identical results',async()=>{
  const s=await setup(),a=await s.client(),b=await s.client(),c=await s.client();a.send({type:'create',name:'Pianist'});const aw=await a.next('welcome');const initial=await a.next('state');expect(initial.room.code).toMatch(/^[A-F0-9]{6}$/);expect(JSON.stringify(initial)).not.toContain(aw.token);expect(aw.inviteOrigin).toMatch(/^http/);
  a.send({type:'start'});expect((await a.next('error')).message).toContain('ready');
  b.send({type:'join',code:aw.code,name:'Drummer'});await b.next('welcome');expect((await b.next('state')).room.players[1].role).toBe('drums');
  const d=await s.client(),e=await s.client();c.send({type:'join',code:aw.code,role:'saxophone'});await c.next('welcome');expect((await c.next('state')).room.players[2].role).toBe('saxophone');c.send({type:'instrument',instrument:'violin'});expect((await c.next('state',m=>m.room.players[2]?.role==='violin')).room.players[2].ready).toBe(false);d.send({type:'join',code:aw.code});await d.next('welcome');e.send({type:'join',code:aw.code});expect((await e.next('error')).message).toContain('four players');c.send({type:'leave'});d.send({type:'leave'});await a.next('state',m=>m.room.players.length===2);
  a.send({type:'reaction',reaction:'nice'});expect((await b.next('reaction')).reaction).toBe('nice');expect((await a.next('reaction')).id).toBe(aw.id);a.send({type:'perform',lane:2});expect((await b.next('perform')).role).toBe('piano');a.send({type:'camera-frame',image:'data:image/jpeg;base64,/9j/2Q==',tracking:1});expect((await b.next('camera-frame')).tracking).toBe(1);expect((await a.next('camera-live')).type).toBe('camera-live');a.send({type:'camera-off'});expect((await b.next('camera-off')).id).toBe(aw.id);a.send({type:'ready',ready:true});b.send({type:'ready',ready:true});await a.next('state',m=>m.room.players.length===2&&m.room.players.every((p:any)=>p.ready));
  a.send({type:'start'});const start=(await a.next('state',m=>m.room.phase==='playing')).room;const other=(await b.next('state',m=>m.room.phase==='playing')).room;expect(other.startAt).toBe(start.startAt);expect(other.matchId).toBe(start.matchId);
  s.advance(5000);const event={type:'hit',role:'piano',chartId,matchId:start.matchId,lane:0,at:s.now(),eventId:'once',mode:'keyboard'};
  a.send({...event,role:'drums'});a.send(event);a.send(event);expect((await a.next('judgement')).judgement).toBe('Perfect');const scored=(await a.next('state',m=>m.room.players[0].score.points===100)).room;expect(scored.players[0].score.perfect).toBe(1);
  s.advance(duration(80)+1200);const ar=(await a.next('state',m=>m.room.phase==='results')).room,br=(await b.next('state',m=>m.room.phase==='results')).room;expect(ar).toEqual(br);expect(ar.players[0].score.points).toBe(100);expect(ar.players[0].score.miss).toBe(15);expect(ar.players[1].score.miss).toBe(16);
 },10000);
 it('reserves disconnected seats, restores by token, and interrupts a running take',async()=>{
  const s=await setup(),a=await s.client(),b=await s.client();a.send({type:'create'});const aw=await a.next('welcome');b.send({type:'join',code:aw.code});const bw=await b.next('welcome');a.send({type:'ready',ready:true});b.send({type:'ready',ready:true});await a.next('state',m=>m.room.players.length===2&&m.room.players.every((p:any)=>p.ready));a.send({type:'start'});await a.next('state',m=>m.room.phase==='playing');b.ws.close();expect((await a.next('state',m=>m.room.phase==='interrupted')).room.players[1].connected).toBe(false);
  const restored=await s.client();restored.send({type:'join',code:aw.code,token:bw.token});expect((await restored.next('welcome')).id).toBe(bw.id);expect((await restored.next('state')).room.players[1].ready).toBe(false);
 });
});

it('issues an authenticated receipt only for an eligible completed take and rejects replay or changed wallets',async()=>{
 const s=await setup(),a=await s.client(),b=await s.client();a.send({type:'create'});const aw=await a.next('welcome');b.send({type:'join',code:aw.code});await b.next('welcome');
 const wallet=generateKeyPairSync('ed25519'),address=base58.deserialize(createPublicKey(wallet.privateKey).export({format:'der',type:'spki'}).subarray(-32))[0];
 a.send({type:'achievement-challenge',wallet:address});expect((await a.next('error')).message).toContain('Finish');
 a.send({type:'ready',ready:true});b.send({type:'ready',ready:true});await a.next('state',m=>m.room.players.every((p:any)=>p.ready)&&m.room.players.length===2);a.send({type:'start'});const room=(await a.next('state',m=>m.room.phase==='playing')).room;s.advance(5000);
 for(let beat=0;beat<8;beat++){if(beat)s.advance(750);const piano=beat%2===0,client=piano?a:b;client.send({type:'hit',role:piano?'piano':'drums',chartId,matchId:room.matchId,lane:(piano?[0,2,4,7]:[0,2,1,2])[Math.floor(beat/2)],at:s.now(),eventId:`beat-${beat}`,mode:'keyboard'});await client.next('judgement');}
 s.advance(duration(80));const results=(await a.next('state',m=>m.room.phase==='results')).room;expect(results.achievementEligible).toBe(true);
 a.send({type:'instrument',instrument:'saxophone'});await a.next('state',m=>m.room.players[0].role==='saxophone');
 a.send({type:'achievement-challenge',wallet:address});const challenge=await a.next('achievement-challenge');const signature=sign(null,Buffer.from(challenge.message),wallet.privateKey).toString('base64');a.send({type:'achievement-proof',signature,points:999999});const receipt=(await a.next('achievement-receipt')).receipt;
 expect(receipt.payload.points).toBe(400);expect(receipt.payload.role).toBe('piano');expect(receipt.payload.wallet).toBe(address);expect(receipt.payload.hits).toBe(4);
 const key=createPublicKey({key:Buffer.concat([Buffer.from('302a300506032b6570032100','hex'),base58.serialize(receipt.issuer)]),format:'der',type:'spki'});expect(verify(null,Buffer.from(JSON.stringify(receipt.payload)),key,Buffer.from(receipt.signature,'base64'))).toBe(true);expect(Buffer.byteLength(JSON.stringify(receipt))).toBeLessThanOrEqual(566);
 a.send({type:'achievement-proof',signature});expect((await a.next('error')).message).toContain('invalid');
 b.send({type:'achievement-challenge',wallet:address});const bc=await b.next('achievement-challenge');b.send({type:'achievement-proof',signature:sign(null,Buffer.from(bc.message),wallet.privateKey).toString('base64')});expect((await b.next('error')).message).toContain('different wallet');
},10000);
it('lets only the host choose a song, resets readiness and rejects stale song events',async()=>{
 const s=await setup(),a=await s.client(),b=await s.client();a.send({type:'create'});const aw=await a.next('welcome');b.send({type:'join',code:aw.code});await b.next('welcome');b.send({type:'song',songId:'ode-to-joy-v1'});expect((await b.next('error')).message).toContain('host');
 a.send({type:'ready',ready:true});b.send({type:'ready',ready:true});await a.next('state',m=>m.room.players.length===2&&m.room.players.every((p:any)=>p.ready));a.send({type:'song',songId:'ode-to-joy-v1'});const changed=(await a.next('state',m=>m.room.chartId==='ode-to-joy-v1')).room;expect(changed.bpm).toBe(60);expect(changed.players.every((p:any)=>!p.ready)).toBe(true);
 a.send({type:'ready',ready:true});b.send({type:'ready',ready:true});await a.next('state',m=>m.room.chartId==='ode-to-joy-v1'&&m.room.players.every((p:any)=>p.ready));a.send({type:'start'});const round=(await a.next('state',m=>m.room.phase==='playing')).room;s.advance(5000);
 a.send({type:'hit',chartId:'first-jam-v2',matchId:round.matchId,role:'piano',lane:2,at:s.now(),eventId:'stale',mode:'keyboard'});a.send({type:'hit',chartId:'ode-to-joy-v1',matchId:round.matchId,role:'piano',lane:2,at:s.now(),eventId:'selected',mode:'keyboard'});expect((await a.next('judgement')).judgement).toBe('Perfect');s.advance(34200);const results=(await a.next('state',m=>m.room.phase==='results')).room;expect(results.chartId).toBe('ode-to-joy-v1');expect(results.players[0].score.points).toBe(100);expect(results.players[0].score.miss).toBe(29);
},10000);
