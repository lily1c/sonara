import {performance,type RoomView} from './game';
export const SOLO_REWARDS_KEY='sonara-solo-rewards:v1';
export type SoloRewards={xp:number;takes:number;best:number;instruments:string[];songs:string[];lastTake:string};
export const emptyRewards=():SoloRewards=>({xp:0,takes:0,best:0,instruments:[],songs:[],lastTake:''});
export function loadRewards():SoloRewards{try{const r=JSON.parse(localStorage.getItem(SOLO_REWARDS_KEY)??'null');if(r&&[r.xp,r.takes,r.best].every((n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&n>=0)&&r.best<=100&&Array.isArray(r.instruments)&&r.instruments.every((s:unknown)=>typeof s==='string')&&Array.isArray(r.songs)&&r.songs.every((s:unknown)=>typeof s==='string')&&typeof r.lastTake==='string')return r;}catch{}return emptyRewards();}
export function awardSolo(previous:SoloRewards,room:RoomView):SoloRewards{
 if(room.code!=='SOLO'||room.phase!=='results'||room.matchId===previous.lastTake)return previous;
 const player=room.players[0];if(!player||player.score.perfect+player.score.good<4)return previous;
 const percent=performance(player.score,player.role,room.chartId);
 return {xp:previous.xp+10+Math.floor(percent/10),takes:previous.takes+1,best:Math.max(previous.best,percent),instruments:[...new Set([...previous.instruments,player.role])],songs:[...new Set([...previous.songs,room.chartId])],lastTake:room.matchId};
}
export function soloTitle(xp:number){return xp>=120?'Solo Star':xp>=60?'Rhythm Keeper':xp>0?'First Notes':'Newcomer';}
export function soloBadges(r:SoloRewards){return [{name:'First Notes',earned:r.takes>=1,rule:'Finish a song with 4 timed hits'},{name:'High Note',earned:r.best>=80,rule:'Reach 80% performance on a qualifying take'},{name:'Instrument Explorer',earned:r.instruments.length>=4,rule:'Qualify on all 4 instruments'},{name:'Song Collector',earned:r.songs.length>=3,rule:'Qualify on 3 different songs'}];}
