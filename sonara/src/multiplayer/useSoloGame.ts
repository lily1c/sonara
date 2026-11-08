import {useEffect,useRef,useState} from 'react';
import {chartId,performance,type Role} from './game';
import {validSong} from './songs';
import {awardSolo,loadRewards,SOLO_REWARDS_KEY} from './soloRewards';
import {unlock} from '../lib/audio';
import {useBand} from './useBand';
export function useSoloGame(role:Role){
 const session=useBand();
 const [rewards,setRewards]=useState(loadRewards),[rewardsSaved,setRewardsSaved]=useState(true),[best,setBest]=useState(0),[starting,setStarting]=useState(false);
 const rewardRef=useRef(rewards),pending=useRef<{bpm:number;song:string;role:Role}|null>(null),finished=useRef('');
 const room=session.room?{...session.room,code:'SOLO'}:null;
 function launch(){const value=pending.current;if(!value||!session.room||session.room.phase==='playing')return;pending.current=null;setStarting(false);session.chooseInstrument(value.role);session.send({type:'song',songId:value.song});session.send({type:'tempo',bpm:value.bpm});session.send({type:'ready',ready:true});session.send({type:'start'});}
 useEffect(()=>{launch();},[session.room?.code]);
 useEffect(()=>{if(session.error)setStarting(false);},[session.error]);
 const reset=()=>{setStarting(false);pending.current=null;session.leave();};
 async function start(bpm=60,songId=chartId){if(!validSong(songId))songId=chartId;if(![60,80,100].includes(bpm))bpm=60;await unlock(role);setStarting(true);pending.current={bpm,song:songId,role};try{setBest(Number(localStorage.getItem(`sonara-best:${songId}:${role}:${bpm}`)??0)||0);}catch{setBest(0);}if(session.room)launch();else{session.chooseInstrument(role);session.enter('create','You',undefined,true);}}
 useEffect(()=>{if(!room||room.phase!=='results'||finished.current===room.matchId)return;finished.current=room.matchId;const earned=awardSolo(rewardRef.current,room);rewardRef.current=earned;setRewards(earned);const percent=performance(room.players[0].score,room.players[0].role,room.chartId);setBest(old=>Math.max(old,percent));try{localStorage.setItem(SOLO_REWARDS_KEY,JSON.stringify(earned));const key=`sonara-best:${room.chartId}:${room.players[0].role}:${room.bpm}`;localStorage.setItem(key,String(Math.max(Number(localStorage.getItem(key))||0,percent)));setRewardsSaved(true);}catch{setRewardsSaved(false);}},[room?.phase,room?.matchId]);
 return {...session,starting,rewards,rewardsSaved,best,room,start,reset,submitHit:(lane:number,mode='keyboard')=>session.submitHit(lane,mode,role)};
}
