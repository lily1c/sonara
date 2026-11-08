import {it,expect} from 'vitest';
import {generateKeyPairSync,createPublicKey,sign} from 'node:crypto';
import {base58} from '@metaplex-foundation/umi/serializers';
import {verifyWallet,challengeMessage} from './achievements';
import {qualified} from '../src/solana/achievement';
it('requires two roles and four actual hits from every connected player',()=>{const p={connected:true,role:'piano',score:{perfect:4,good:0}};expect(qualified([p])).toBe(false);expect(qualified([p,p])).toBe(false);expect(qualified([p,{...p,role:'drums'}])).toBe(true);expect(qualified([p,{...p,role:'drums',connected:false}])).toBe(false);expect(qualified([p,{...p,role:'drums',score:{perfect:0,good:0}}])).toBe(false);});
it('binds a fresh nonce and rejects forged messages and invalid keys',()=>{const key=generateKeyPairSync('ed25519'),wallet=base58.deserialize(createPublicKey(key.privateKey).export({format:'der',type:'spki'}).subarray(-32))[0],message=challengeMessage('https://game.example','match','player',wallet),signature=sign(null,Buffer.from(message),key.privateKey).toString('base64');expect(verifyWallet(wallet,message,signature)).toBe(true);expect(verifyWallet(wallet,message+'changed',signature)).toBe(false);expect(verifyWallet('bad',message,signature)).toBe(false);expect(challengeMessage('https://game.example','match','player',wallet)).not.toBe(message);});
