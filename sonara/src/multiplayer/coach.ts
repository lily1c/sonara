import {chart,type Role,type Score} from './game';
export function practiceAdvice(score:Score,role:Role,bpm:number){
 const hits=score.perfect+score.good,total=hits+score.miss,accuracy=total?Math.round(hits/total*100):0;
 const errors=score.timingErrors??[],mean=errors.length?errors.reduce((a,b)=>a+b,0)/errors.length:0;
 const misses=new Map<number,number>();for(const note of chart(role))if(score.judged[note.id]==='Miss')misses.set(note.lane,(misses.get(note.lane)??0)+1);
 const lane=[...misses].sort((a,b)=>b[1]-a[1])[0]?.[0];
 const tempo=accuracy<65?60:accuracy>=90&&score.perfect>=8?Math.min(100,bpm+20):bpm;
 const timing=hits<3?'Start with keyboard or touch to learn where the targets are.':mean>45?'You tend to arrive late. Start your downward movement a little before the note reaches the target.':mean< -45?'You tend to arrive early. Wait a little longer before crossing the target.':'Your timing is centered. Keep movements small and repeatable.';
 return {accuracy,tempo,lane,timing,heading:accuracy>=90?'That rhythm is settling in.':accuracy>=50?'You’re finding your groove.':'Take it one note at a time.',mean:Math.round(mean)};
}
