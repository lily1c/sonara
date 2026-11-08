export type Song={id:string;title:string;composer:string;difficulty:'Beginner'|'Easy'|'Intermediate';beats:number;tempo:number;credit:string;source:string;melody:Array<{lane:number;beat:number}>};
function phrase(notes:number[],lengths:number[]=[]){let beat=0;return notes.map((lane,i)=>{const note={lane,beat};beat+=lengths[i]??1;return note;});}
const twinkle=[0,0,4,4,5,5,4,3,3,2,2,1,1,0,4,4,3,3,2,2,1,4,4,3,3,2,2,1,0,0,4,4,5,5,4,3,3,2,2,1,1,0];
const twinkleLengths=twinkle.map((_,i)=>[6,13,20,27,34,41].includes(i)?2:1);
const ode=[2,2,3,4,4,3,2,1,0,0,1,2,2,1,1,2,2,3,4,4,3,2,1,0,0,1,2,1,0,0];
export const songs:Song[]=[
 {id:'first-jam-v2',title:'First Jam',composer:'SONARA original',difficulty:'Intermediate',beats:32,tempo:80,credit:'Original composition and charts · MIT',source:'',melody:[]},
 {id:'twinkle-v1',title:'Twinkle, Twinkle Little Star',composer:'Traditional French melody',difficulty:'Beginner',beats:48,tempo:60,credit:'Public-domain melody · new SONARA arrangement (MIT)',source:'https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2236',melody:phrase(twinkle,twinkleLengths)},
 {id:'ode-to-joy-v1',title:'Ode to Joy',composer:'Ludwig van Beethoven',difficulty:'Easy',beats:32,tempo:60,credit:'Public-domain melody · new SONARA arrangement (MIT)',source:'https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=528',melody:phrase(ode,ode.map((_,i)=>i===14||i===29?2:1))}
];
export const songById=(id='first-jam-v2')=>songs.find(song=>song.id===id)??songs[0];
export const validSong=(id:unknown):id is string=>typeof id==='string'&&songs.some(song=>song.id===id);
