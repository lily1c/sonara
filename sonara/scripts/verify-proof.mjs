import {readFile} from 'node:fs/promises';
import {createPublicKey,verify} from 'node:crypto';
import {base58} from '@metaplex-foundation/umi/serializers';
try{
 const [file,expectedIssuer]=process.argv.slice(2);if(!file||!expectedIssuer)throw new Error('Usage: npm run verify:proof -- proof.json TRUSTED_ISSUER_PUBLIC_KEY');
 const receipt=JSON.parse(await readFile(file,'utf8'));
 if(receipt.issuer!==expectedIssuer)throw new Error('Issuer does not match your trusted SONARA server key.');
 const raw=base58.serialize(expectedIssuer);if(raw.length!==32)throw new Error('Invalid issuer public key.');
 const key=createPublicKey({key:Buffer.concat([Buffer.from('302a300506032b6570032100','hex'),raw]),format:'der',type:'spki'});
 if(!verify(null,Buffer.from(JSON.stringify(receipt.payload)),key,Buffer.from(receipt.signature,'base64')))throw new Error('Invalid signature.');
 const p=receipt.payload;if(p.app!=='sonara'||p.v!==1||p.badge!=='first-band'||p.hits<4||p.band<2)throw new Error('Unexpected achievement schema.');
 console.log('Verified issuer signature and First Band receipt.');console.log(JSON.stringify(p,null,2));console.log('This checks the signed proof offline. Use the game’s Verify record from Devnet button to check its transaction.');
}catch(e){console.error(e.message);process.exitCode=1;}
