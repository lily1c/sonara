import {base58} from '@metaplex-foundation/umi/serializers';
import type {AchievementPayload} from './achievement';
export const VOUCHER_SIZE=168;
export type ProgramVoucher={programId:string;issuer:string;message:string;signature:string};
const utf8=new TextEncoder();
export async function encodeVoucher(payload:AchievementPayload,programId:string){
 const message=new Uint8Array(VOUCHER_SIZE),view=new DataView(message.buffer);message.set(utf8.encode('SONARA_BAND_V1\0\0'));
 const programBytes=base58.serialize(programId),walletBytes=base58.serialize(payload.wallet);if(programBytes.length!==32||walletBytes.length!==32)throw new Error('Invalid public key.');message.set(programBytes,16);message.set(walletBytes,48);
 message.set(new Uint8Array(await crypto.subtle.digest('SHA-256',utf8.encode(payload.match))),80);
 message.set(new Uint8Array(await crypto.subtle.digest('SHA-256',utf8.encode(payload.song??'first-jam-v2'))),112);
 const percent=payload.performance;
 if(percent===undefined||!Number.isInteger(percent)||percent<0||percent>100||!Number.isInteger(payload.points)||payload.points<0||payload.points>6400||!Number.isInteger(payload.hits)||payload.hits<4||payload.hits>64||![2,3,4].includes(payload.band))throw new Error('Invalid earned performance data.');
 const role=['piano','drums','violin','saxophone'].indexOf(payload.role);if(role<0)throw new Error('Invalid instrument.');
 const ended=Math.floor(payload.ended/1000);if(!Number.isSafeInteger(ended)||ended<=0)throw new Error('Invalid session end time.');
 view.setUint16(144,payload.points,true);view.setUint16(146,percent!,true);message[148]=payload.hits;message[149]=payload.band;message[150]=role;
 view.setBigInt64(152,BigInt(ended),true);view.setBigInt64(160,BigInt(ended+7*24*60*60),true);return message;
}
export function toBase64(bytes:Uint8Array){return btoa(String.fromCharCode(...bytes));}
export function fromBase64(value:string){return Uint8Array.from(atob(value),c=>c.charCodeAt(0));}
export function progression(xp:bigint,sessions:bigint){return xp>=120n?{title:'Session Star',look:'Golden constellation',color:'#b48128',next:null}:xp>=60n?{title:'Groove Keeper',look:'Violet rays',color:'#9562ba',next:120}:sessions>0n?{title:'Bandmate',look:'Mint halo',color:'#25816b',next:60}:{title:'Newcomer',look:'Blue ink',color:'#3865da',next:10};}
