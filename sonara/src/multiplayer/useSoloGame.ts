import {useCallback,useEffect,useRef,useState} from 'react';
import {chartId,duration,emptyScore,expire,judge,performance,type Role,type RoomView} from './game';
import {validSong} from './songs';
import {awardSolo,loadRewards,SOLO_REWARDS_KEY} from './soloRewards';
import {unlock} from '../lib/audio';
export function useSoloGame(role:Role){
 const [rewards,setRewards]=useState(loadRewards),[rewardsSaved,setRewardsSaved]=useState(true);
 const rewardRef=useRef(rewards);
 const [best,setBest]=useState(0);
 const [room,setRoom]=useState<RoomView|null>(null),[feedback,setFeedback]=useState('');
 const current=useRef(room);current.current=room;
 const reset=useCallback(()=>{current.current=null;setRoom(null);setFeedback('');},[]);
 async function start(bpm=60,songId=chartId){if(!validSong(songId))songId=chartId;if(![60,80,100].includes(bpm))bpm=60;await unlock(role);try{const value=Number(localStorage.getItem(`sonara-best:${songId}:${role}:${bpm}`)??0);setBest(Number.isFinite(value)&&value>=0&&value<=100?value:0);}catch{setBest(0);}const state:RoomView={code:'SOLO',host:'solo',players:[{id:'solo',name:'You',role,connected:true,ready:true,score:emptyScore()}],phase:'playing',startAt:Date.now()+5000,bpm,matchId:`solo-${Date.now()}`,chartId:songId,reason:''};current.current=state;setRoom(state);setFeedback('');}
 useEffect(()=>{if(room?.phase!=='playing')return;const timer=setInterval(()=>{const r=current.current;if(!r||r.phase!=='playing')return;const elapsed=Date.now()-r.startAt;const changed=expire(r.players[0].score,role,elapsed,r.bpm,r.chartId);if(elapsed>duration(r.bpm,r.chartId)+400){expire(r.players[0].score,role,Infinity,r.bpm,r.chartId);r.phase='results';const awarded=awardSolo(rewardRef.current,r);rewardRef.current=awarded;setRewards(awarded);try{localStorage.setItem(SOLO_REWARDS_KEY,JSON.stringify(awarded));setRewardsSaved(true);}catch{setRewardsSaved(false);}const percent=performance(r.players[0].score,role,r.chartId);setBest(previous=>{const next=Math.max(previous,percent);try{localStorage.setItem(`sonara-best:${r.chartId}:${role}:${r.bpm}`,String(next));}catch{}return next;});}if(changed||r.phase==='results')setRoom({...r,players:[{...r.players[0],score:{...r.players[0].score}}]});},50);return()=>clearInterval(timer);},[room?.matchId,room?.phase,role]);
 const submitHit=useCallback((lane:number)=>{const r=current.current;if(!r||r.phase!=='playing'||Date.now()<r.startAt)return;const result=judge(r.players[0].score,r.players[0].role,lane,Date.now()-r.startAt,r.bpm,r.chartId);setFeedback(result?`${result.judgement} · ${result.error} ms`:'Keep the rhythm');if(result)setRoom({...r,players:[{...r.players[0],score:{...r.players[0].score}}]});},[]);
 return {rewards,rewardsSaved,best,room,feedback,start,reset,submitHit};
}
