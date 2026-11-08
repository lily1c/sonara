import {createHash,generateKeyPairSync,createPrivateKey,createPublicKey,sign,verify,randomBytes,type KeyObject} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {base58} from '@metaplex-foundation/umi/serializers';
import type {AchievementPayload,AchievementReceipt} from '../src/solana/achievement';
export function issuerKeyFromSeed(seed:string){if(seed.length<32)throw new Error('SONARA_ISSUER_SEED must contain at least 32 characters.');const bytes=createHash('sha256').update('SONARA achievement issuer v1\0').update(seed).digest();return createPrivateKey({key:Buffer.concat([Buffer.from('302e020100300506032b657004220420','hex'),bytes]),format:'der',type:'pkcs8'});}
export function createIssuer(key?:KeyObject){
 if(!key&&process.env.SONARA_ISSUER_SEED)key=issuerKeyFromSeed(process.env.SONARA_ISSUER_SEED);
 if(!key&&process.env.RENDER==='true')throw new Error('Set a persistent SONARA_ISSUER_SEED environment secret before starting on Render.');
 if(!key){const directory=resolve(process.env.SONARA_DATA_DIR??'.sonara-data');mkdirSync(directory,{recursive:true,mode:0o700});const file=resolve(directory,'achievement-issuer.pem');try{key=createPrivateKey(readFileSync(file));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;key=generateKeyPairSync('ed25519').privateKey;writeFileSync(file,key.export({format:'pem',type:'pkcs8'}),{mode:0o600,flag:'wx'});}}
 const pub=createPublicKey(key).export({format:'der',type:'spki'}).subarray(-32),issuer=base58.deserialize(pub)[0];
 return {issuer,signBytes(message:Uint8Array){return sign(null,message,key!);},issue(payload:AchievementPayload):AchievementReceipt{return {payload,issuer,signature:sign(null,Buffer.from(JSON.stringify(payload)),key!).toString('base64')};}};
}
export function verifyWallet(address:string,message:string,signature:string){try{const bytes=base58.serialize(address);if(bytes.length!==32)return false;const key=createPublicKey({key:Buffer.concat([Buffer.from('302a300506032b6570032100','hex'),bytes]),format:'der',type:'spki'});const sig=Buffer.from(signature,'base64');return sig.length===64&&verify(null,Buffer.from(message),key,sig);}catch{return false;}}
export function challengeMessage(origin:string,match:string,player:string,wallet:string){return `SONARA band achievement\nOrigin: ${origin}\nSession: ${match}\nPlayer: ${player}\nWallet: ${wallet}\nNonce: ${randomBytes(24).toString('hex')}\nThis signature binds your completed performance to your wallet. No transaction or transfer.`;}
