import {it,expect} from 'vitest';
import {createUmi} from '@metaplex-foundation/umi-bundle-defaults';
import {generateSigner,signerIdentity} from '@metaplex-foundation/umi';
import {create,mplCore} from '@metaplex-foundation/mpl-core';
import {initialAttributes} from './policy';
it('builds and signs a Core musician locally without spending or sending a transaction',async()=>{
 const umi=createUmi('https://api.devnet.solana.com').use(mplCore());const payer=generateSigner(umi);umi.use(signerIdentity(payer));const asset=generateSigner(umi);
 const builder=create(umi,{asset,name:'SONARA Devnet Musician',uri:'https://game.example/musician/metadata.json',owner:payer.publicKey,updateAuthority:payer.publicKey,plugins:[{type:'Attributes',attributeList:initialAttributes('saxophone')}]}).setVersion('legacy').setBlockhash({blockhash:'11111111111111111111111111111111',lastValidBlockHeight:123});
 expect(builder.getInstructions()[0].programId).toBe('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d');
 const signed=await builder.buildAndSign(umi),wire=umi.transactions.serialize(signed),decoded=umi.transactions.deserialize(wire);
 expect(decoded.signatures).toHaveLength(2);for(const signature of decoded.signatures){expect(signature).toHaveLength(64);expect(signature.some(byte=>byte!==0)).toBe(true);}expect(wire.length).toBeLessThanOrEqual(1232);
});
it('fits a signed achievement Memo in a legacy transaction',async()=>{
 const umi=createUmi('https://api.devnet.solana.com'),payer=generateSigner(umi);umi.use(signerIdentity(payer));const {transactionBuilder,publicKey}=await import('@metaplex-foundation/umi');const {receiptMemo}=await import('./achievement');
 const data=new TextEncoder().encode(receiptMemo({payload:{v:1,app:'sonara',badge:'first-band',match:'00000000-0000-0000-0000-000000000000',wallet:payer.publicKey,role:'saxophone',points:1600,hits:16,band:4,ended:Date.now()},issuer:payer.publicKey,signature:'A'.repeat(88)}));expect(data.length).toBeLessThanOrEqual(566);
 const tx=await transactionBuilder().add({instruction:{programId:publicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),keys:[{pubkey:payer.publicKey,isSigner:true,isWritable:false}],data},signers:[payer],bytesCreatedOnChain:0}).setVersion('legacy').setBlockhash({blockhash:'11111111111111111111111111111111',lastValidBlockHeight:123}).buildAndSign(umi);expect(umi.transactions.serialize(tx).length).toBeLessThanOrEqual(1232);
});
