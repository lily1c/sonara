import {songById} from './songs';
export type Role='piano'|'drums'|'violin'|'saxophone';
export type ChartNote={id:string;beat:number;lane:number};
export const chartId='first-jam-v2';
// Original SONARA composition and chart, MIT. 32 beats at 80 BPM = 24 seconds.
const melody=[0,2,4,7,5,4,2,0,1,3,5,7,6,4,2,0];
const violinMelody=[0,4,2,5,1,6,3,7,5,2,4,1,6,3,2,0];
const saxMelody=[0,1,2,3,6,4,5,7,3,2,1,0,4,6,5,4];
export function chart(role:Role,songId=chartId):ChartNote[]{const song=songById(songId);if(song.id!==chartId)return role==='drums'?Array.from({length:song.beats/2},(_,i)=>({id:`d${i}`,beat:i*2+1,lane:[0,2,1,2][i%4]})):song.melody.map((n,i)=>({id:`p${i}`,...n}));return role!=='drums'?(role==='violin'?violinMelody:role==='saxophone'?saxMelody:melody).map((lane,i)=>({id:`p${i}`,beat:i*2+(role==='violin'?.5:role==='saxophone'?1:0),lane})):Array.from({length:16},(_,i)=>({id:`d${i}`,beat:i*2+1,lane:[0,2,1,2][i%4]}));}
export const duration=(bpm:number,songId=chartId)=>songById(songId).beats*60000/bpm;
export type Score={points:number;perfect:number;good:number;miss:number;combo:number;best:number;timingErrors?:number[];judged:Record<string,string>};
export function emptyScore():Score{return {points:0,perfect:0,good:0,miss:0,combo:0,best:0,judged:{}};}
export function judge(score:Score,role:Role,lane:number,elapsed:number,bpm:number,songId=chartId){
 const note=chart(role,songId).filter(n=>n.lane===lane&&!score.judged[n.id]).sort((a,b)=>Math.abs(a.beat*60000/bpm-elapsed)-Math.abs(b.beat*60000/bpm-elapsed))[0];
 if(!note)return null;
 const error=elapsed-note.beat*60000/bpm;
 if(Math.abs(error)>220)return null;
 const judgement=Math.abs(error)<=110?'Perfect':'Good';score.judged[note.id]=judgement;
 (score.timingErrors??=[]).push(Math.round(error));
 score.points+=judgement==='Perfect'?100:60;score[judgement==='Perfect'?'perfect':'good']++;score.combo++;score.best=Math.max(score.best,score.combo);
 return {noteId:note.id,judgement,error:Math.round(error)};
}
export function expire(score:Score,role:Role,elapsed:number,bpm:number,songId=chartId){let changed=false;for(const n of chart(role,songId)){if(!score.judged[n.id]&&elapsed>n.beat*60000/bpm+220){score.judged[n.id]='Miss';score.miss++;score.combo=0;changed=true;}}return changed;}
export type PlayerView={id:string;name:string;role:Role;ready:boolean;connected:boolean;score:Score};
export type RoomView={solo?:boolean;code:string;host:string;players:PlayerView[];phase:'lobby'|'playing'|'results'|'interrupted';startAt:number;bpm:number;matchId:string;chartId:string;reason:string;completedPlayers?:PlayerView[];achievementChecks?:import('../solana/achievement').BandRequirement[];achievementEligible?:boolean};

export function laneCount(role:Role){return role==='drums'?4:8;}
export function roleName(role:Role){return role[0].toUpperCase()+role.slice(1);}

export function performance(score:Score,role:Role,songId=chartId){return Math.round(score.points/(chart(role,songId).length*100)*100);}
