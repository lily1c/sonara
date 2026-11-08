export type AchievementPayload={v:1;app:'sonara';badge:'first-band';match:string;wallet:string;role:string;points:number;hits:number;band:number;ended:number};
export type AchievementReceipt={payload:AchievementPayload;issuer:string;signature:string};
export function receiptMemo(receipt:AchievementReceipt){return JSON.stringify(receipt);}
export function qualified(players:Array<{connected:boolean;role:string;score:{perfect:number;good:number}}>){return players.length>=2&&players.every(p=>p.connected&&p.score.perfect+p.score.good>=4)&&new Set(players.map(p=>p.role)).size>=2;}
export function accuracy(score:{perfect:number;good:number;miss:number}){const total=score.perfect+score.good+score.miss;return total?Math.round((score.perfect+score.good)/total*100):0;}
export function assertReceiptRecord(transaction:{meta:{err:unknown};message:{accounts:readonly string[];header:{numRequiredSignatures:number};instructions:readonly {programIndex:number;data:Uint8Array}[]}},receipt:AchievementReceipt){
 if(transaction.meta.err)throw new Error('This transaction failed on Devnet.');
 if(!transaction.message.accounts.slice(0,transaction.message.header.numRequiredSignatures).includes(receipt.payload.wallet))throw new Error('The achievement wallet did not sign this transaction.');
 const memo=receiptMemo(receipt);
 if(!transaction.message.instructions.some(i=>transaction.message.accounts[i.programIndex]==='MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'&&new TextDecoder().decode(i.data)===memo))throw new Error('The transaction does not contain this achievement receipt.');
}
