import {useCallback,useEffect,useRef,useState} from 'react';
import {chartId,duration,emptyScore,expire,judge,type Role,type RoomView} from './game';
import {unlock} from '../lib/audio';
export function useSoloGame(role:Role){
 const [room,setRoom]=useState<RoomView|null>(null),[feedback,setFeedback]=useState('');
 const current=useRef(room);current.current=room;
 const reset=useCallback(()=>{current.current=null;setRoom(null);setFeedback('');},[]);
 async function start(bpm=60){if(![60,80,100].includes(bpm))bpm=60;await unlock(role);const state:RoomView={code:'SOLO',host:'solo',players:[{id:'solo',name:'You',role,connected:true,ready:true,score:emptyScore()}],phase:'playing',startAt:Date.now()+5000,bpm,matchId:`solo-${Date.now()}`,chartId,reason:''};current.current=state;setRoom(state);setFeedback('');}
 useEffect(()=>{if(room?.phase!=='playing')return;const timer=setInterval(()=>{const r=current.current;if(!r||r.phase!=='playing')return;const elapsed=Date.now()-r.startAt;const changed=expire(r.players[0].score,role,elapsed,r.bpm);if(elapsed>duration(r.bpm)+400){expire(r.players[0].score,role,Infinity,r.bpm);r.phase='results';}if(changed||r.phase==='results')setRoom({...r,players:[{...r.players[0],score:{...r.players[0].score}}]});},50);return()=>clearInterval(timer);},[room?.matchId,room?.phase,role]);
 const submitHit=useCallback((lane:number)=>{const r=current.current;if(!r||r.phase!=='playing'||Date.now()<r.startAt)return;const result=judge(r.players[0].score,r.players[0].role,lane,Date.now()-r.startAt,r.bpm);setFeedback(result?`${result.judgement} · ${result.error} ms`:'Keep the rhythm');if(result)setRoom({...r,players:[{...r.players[0],score:{...r.players[0].score}}]});},[]);
 return {room,feedback,start,reset,submitHit};
}
