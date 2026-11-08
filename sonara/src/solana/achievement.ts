export type AchievementPayload={v:1;app:'sonara';badge:'first-band'|'first-solo';song?:string;match:string;wallet:string;role:string;points:number;performance?:number;hits:number;band:number;ended:number};
export type AchievementReceipt={payload:AchievementPayload;issuer:string;signature:string};
export function receiptMemo(receipt:AchievementReceipt){return JSON.stringify(receipt);}
export type BandCandidate={name?:string;connected:boolean;role:string;score:{perfect:number;good:number}};
export type BandRequirement={id:string;label:string;passed:boolean;detail:string};
export function bandRequirements(players:BandCandidate[],finished=false):BandRequirement[]{const roles=new Set(players.map(p=>p.role)).size;return [
 {id:'players',label:'Bring 2–4 players',passed:players.length>=2&&players.length<=4,detail:`${players.length}/2 minimum players`},
 {id:'instruments',label:'Choose at least two different instruments',passed:roles>=2,detail:`${roles}/2 instrument types`},
 {id:'connection',label:'Stay connected through the whole take',passed:players.length>=2&&players.every(p=>p.connected),detail:players.length?`${players.filter(p=>p.connected).length}/${players.length} connected`:'Create or join a room first'},
 {id:'hits',label:'Every player lands 4 timed notes',passed:players.length>=2&&players.every(p=>p.score.perfect+p.score.good>=4),detail:players.length?players.map((p,i)=>`${p.name??`Player ${i+1}`}: ${p.score.perfect+p.score.good}/4`).join(' · '):'Perfect and Good hits count; extra taps do not'},
 {id:'finish',label:'Finish the song together',passed:finished,detail:finished?'Take completed':'Host starts after everyone is Ready; play through to results'}
 ];}
export function qualified(players:BandCandidate[]){return bandRequirements(players,true).every(rule=>rule.passed);}
export function accuracy(score:{perfect:number;good:number;miss:number}){const total=score.perfect+score.good+score.miss;return total?Math.round((score.perfect+score.good)/total*100):0;}
export function assertReceiptRecord(transaction:{meta:{err:unknown};message:{accounts:readonly string[];header:{numRequiredSignatures:number};instructions:readonly {programIndex:number;data:Uint8Array}[]}},receipt:AchievementReceipt){
 if(transaction.meta.err)throw new Error('This transaction failed on Devnet.');
 if(!transaction.message.accounts.slice(0,transaction.message.header.numRequiredSignatures).includes(receipt.payload.wallet))throw new Error('The achievement wallet did not sign this transaction.');
 const memo=receiptMemo(receipt);
 if(!transaction.message.instructions.some(i=>transaction.message.accounts[i.programIndex]==='MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'&&new TextDecoder().decode(i.data)===memo))throw new Error('The transaction does not contain this achievement receipt.');
}
