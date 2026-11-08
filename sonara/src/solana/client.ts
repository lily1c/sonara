import {createUmi} from '@metaplex-foundation/umi-bundle-defaults';
import {generateSigner,publicKey,signerIdentity,transactionBuilder,type Signer,type Transaction} from '@metaplex-foundation/umi';
import {base58} from '@metaplex-foundation/umi/serializers';
import {create,mplCore,fetchAsset,fetchAssetsByOwner,updatePlugin,type AssetV1} from '@metaplex-foundation/mpl-core';
import type {Wallet,WalletAccount} from '@wallet-standard/base';
import {StandardConnect,type StandardConnectFeature} from '@wallet-standard/features';
import {SolanaSignTransaction,type SolanaSignTransactionFeature} from '@solana/wallet-standard-features';
import {DEVNET_RPC,DEVNET_CHAIN,assertDevnet,initialAttributes,isMusician,nextDemoAttributes,metadataUrl} from './policy';
export type Connected={wallet:Wallet;account:WalletAccount};
export type Musician={address:string;owner:string;name:string;uri:string;attributes:Array<{key:string;value:string}>;canUpdate:boolean};
const endpoint=import.meta.env.VITE_SOLANA_RPC_URL||DEVNET_RPC;
export function supported(wallet:Wallet){return !!wallet.features[StandardConnect]&&!!wallet.features[SolanaSignTransaction]&&wallet.chains.includes(DEVNET_CHAIN);}
export async function connectWallet(wallet:Wallet):Promise<Connected>{
 if(!supported(wallet))throw new Error('This wallet does not support Devnet transaction signing.');
 const {accounts}=await (wallet.features[StandardConnect] as StandardConnectFeature[typeof StandardConnect]).connect();
 const account=accounts.find(a=>a.chains.includes(DEVNET_CHAIN)&&a.features.includes(SolanaSignTransaction));
 if(!account)throw new Error('No Devnet-capable account was selected. Enable Devnet/test networks in your wallet.');
 return {wallet,account};
}
export function readClient(){return createUmi(endpoint,{commitment:'confirmed'}).use(mplCore());}
export async function checkedClient(connection:Connected){
 const umi=readClient();await assertNetwork(umi);const key=publicKey(connection.account.address);
 const signer:Signer={publicKey:key,signMessage:async()=>{throw new Error('Message signing is not used by this demo.');},signTransaction:async(transaction:Transaction)=>{
  // Check again immediately before asking a wallet to sign.
  await assertNetwork(umi);
  if(!connection.wallet.accounts.some(a=>a.address===connection.account.address&&a.chains.includes(DEVNET_CHAIN)))throw new Error('Wallet account changed. Reconnect.');
  const feature=connection.wallet.features[SolanaSignTransaction] as SolanaSignTransactionFeature[typeof SolanaSignTransaction];
  const [result]=await feature.signTransaction({account:connection.account,chain:DEVNET_CHAIN,transaction:umi.transactions.serialize(transaction)});
  if(!result)throw new Error('Wallet returned no signed transaction.');
  const signed=umi.transactions.deserialize(result.signedTransaction),before=umi.transactions.serializeMessage(transaction.message),after=umi.transactions.serializeMessage(signed.message);
  if(before.length!==after.length||before.some((b,i)=>b!==after[i]))throw new Error('Wallet changed the transaction message; sending was stopped.');
  return signed;
 },signAllTransactions:async transactions=>{const signed:Transaction[]=[];for(const t of transactions)signed.push(await signer.signTransaction(t));return signed;}};
 return umi.use(signerIdentity(signer));
}
export async function assertNetwork(umi=readClient()){assertDevnet(await umi.rpc.getGenesisHash());}
function view(asset:AssetV1,owner:string):Musician{
 const attributes=asset.attributes?.attributeList??[];
 if(asset.owner!==owner)throw new Error('The connected wallet no longer owns this asset.');
 if(!isMusician(attributes))throw new Error('This asset does not have the SONARA demo schema.');
 return {address:asset.publicKey,owner:asset.owner,name:asset.name,uri:asset.uri,attributes,canUpdate:asset.updateAuthority.type==='Address'&&asset.updateAuthority.address===owner};
}
export async function balance(connection:Connected){const umi=readClient();await assertNetwork(umi);return Number((await umi.rpc.getBalance(publicKey(connection.account.address))).basisPoints)/1e9;}
export async function readMusician(connection:Connected,address:string){const umi=readClient();await assertNetwork(umi);return view(await fetchAsset(umi,publicKey(address),{commitment:'confirmed'}),connection.account.address);}
export async function findMusician(connection:Connected){const umi=readClient();await assertNetwork(umi);const assets=await fetchAssetsByOwner(umi,publicKey(connection.account.address));const match=assets.find(a=>isMusician(a.attributes?.attributeList??[]));return match?view(match,connection.account.address):null;}
export async function mintMusician(connection:Connected,instrument:string,savePending:(address:string)=>void){
 const umi=await checkedClient(connection);
 // Try discovery before allowing another mint; if RPC fails, do not silently mint duplicates.
 const existing=await findMusician(connection);if(existing)return {musician:existing,signature:null};
 const uri=metadataUrl(location.origin);const response=await fetch(uri);if(!response.ok)throw new Error('Public musician metadata could not load.');const metadata=await response.json();if(metadata.name!=='SONARA Devnet Musician')throw new Error('Unexpected musician metadata.');const image=new URL(metadata.image);if(image.protocol!=='https:'||image.origin!==new URL(uri).origin)throw new Error('Metadata image points to a different host. Update musician metadata for this HTTPS URL before minting.');if(!(await fetch(image.href,{method:'HEAD'})).ok)throw new Error('Musician artwork is not reachable.');
 const amount=Number((await umi.rpc.getBalance(umi.identity.publicKey)).basisPoints)/1e9;
 if(amount<.02)throw new Error('Add at least 0.02 test SOL using the Devnet faucet, then refresh balance. This is test money, not real SOL.');
 const asset=generateSigner(umi);savePending(asset.publicKey);
 const result=await create(umi,{asset,name:'SONARA Devnet Musician',uri,owner:umi.identity.publicKey,updateAuthority:umi.identity.publicKey,plugins:[{type:'Attributes',attributeList:initialAttributes(instrument)}]}).setVersion('legacy').sendAndConfirm(umi,{confirm:{commitment:'confirmed'}});
 if(result.result.value.err)throw new Error(`Mint transaction failed: ${JSON.stringify(result.result.value.err)}`);
 return {musician:await readMusician(connection,asset.publicKey),signature:base58.deserialize(result.signature)[0]};
}
export async function testUpdate(connection:Connected,address:string){
 const umi=await checkedClient(connection),current=await readMusician(connection,address);
 if(!current.canUpdate)throw new Error('This wallet is not the asset update authority.');
 const list=nextDemoAttributes(current.attributes);
 const result=await updatePlugin(umi,{asset:publicKey(address),plugin:{type:'Attributes',attributeList:list}}).setVersion('legacy').sendAndConfirm(umi,{confirm:{commitment:'confirmed'}});
 if(result.result.value.err)throw new Error(`Update failed: ${JSON.stringify(result.result.value.err)}`);
 const musician=await readMusician(connection,address);
 if(musician.attributes.find(a=>a.key==='demo_updates')?.value!==list.find(a=>a.key==='demo_updates')?.value)throw new Error('Transaction confirmed, but the new attributes have not been read back yet. Refresh from chain.');
 return {musician,signature:base58.deserialize(result.signature)[0]};
}

// Achievements are issuer-signed receipts, anchored with a wallet-signed Memo.
export async function signAchievementChallenge(connection:Connected,message:string){
 const {SolanaSignMessage}=await import('@solana/wallet-standard-features');
 const feature=connection.wallet.features[SolanaSignMessage] as import('@solana/wallet-standard-features').SolanaSignMessageFeature[typeof SolanaSignMessage]|undefined;
 if(!feature)throw new Error('This wallet must support message signing to bind your performance.');
 if(!message.startsWith('SONARA band achievement\n')||!message.includes(`Wallet: ${connection.account.address}\n`)||!message.includes(`Origin: ${location.origin}\n`))throw new Error('Unexpected wallet challenge.');
 const bytes=new TextEncoder().encode(message),[result]=await feature.signMessage({account:connection.account,message:bytes});
 if(!result||result.signedMessage.length!==bytes.length||result.signedMessage.some((b,i)=>b!==bytes[i]))throw new Error('Wallet changed the authentication message.');
 return btoa(String.fromCharCode(...result.signature));
}
export async function verifyAchievement(receipt:import('./achievement').AchievementReceipt,issuer:string,wallet:string){
 if(receipt.issuer!==issuer||receipt.payload.wallet!==wallet||receipt.payload.app!=='sonara'||receipt.payload.badge!=='first-band'||receipt.payload.v!==1)throw new Error('Achievement identity mismatch.');
 const key=await crypto.subtle.importKey('raw',base58.serialize(issuer),{name:'Ed25519'},false,['verify']);
 const signature=Uint8Array.from(atob(receipt.signature),c=>c.charCodeAt(0));
 if(!await crypto.subtle.verify('Ed25519',key,signature,new TextEncoder().encode(JSON.stringify(receipt.payload))))throw new Error('Invalid achievement issuer signature.');
}
export async function anchorAchievement(connection:Connected,receipt:import('./achievement').AchievementReceipt,issuer:string,onSigned:(signature:string)=>void){
 await verifyAchievement(receipt,issuer,connection.account.address);
 const umi=await checkedClient(connection);
 const {receiptMemo}=await import('./achievement');const data=new TextEncoder().encode(receiptMemo(receipt));
 if(data.length>566)throw new Error('Achievement receipt exceeds the memo size limit.');
 const blockhash=await umi.rpc.getLatestBlockhash();
 const transaction=await transactionBuilder().add({instruction:{programId:publicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),keys:[{pubkey:umi.identity.publicKey,isSigner:true,isWritable:false}],data},signers:[umi.identity],bytesCreatedOnChain:0}).setVersion('legacy').setBlockhash(blockhash).buildAndSign(umi);
 const signature=base58.deserialize(transaction.signatures[0])[0];onSigned(signature);
 const sig=await umi.rpc.sendTransaction(transaction);
 const result=await umi.rpc.confirmTransaction(sig,{strategy:{type:'blockhash',...blockhash},commitment:'confirmed'});
 if(result.value.err)throw new Error('Achievement transaction failed. Check Explorer.');
 const confirmed=await umi.rpc.getTransaction(sig,{commitment:'confirmed'});
 if(!confirmed)throw new Error('Confirmation readback is pending. Check Explorer before retrying.');
 const {assertReceiptRecord}=await import('./achievement');assertReceiptRecord(confirmed,receipt);
 return signature;
}
export async function verifyRecordedAchievement(signature:string,receipt:import('./achievement').AchievementReceipt){
 await verifyAchievement(receipt,receipt.issuer,receipt.payload.wallet);
 const umi=readClient();await assertNetwork(umi);const transaction=await umi.rpc.getTransaction(base58.serialize(signature),{commitment:'confirmed'});
 if(!transaction)throw new Error('Transaction not found at confirmed commitment. Wait and check again; do not resubmit yet.');
 const {assertReceiptRecord}=await import('./achievement');assertReceiptRecord(transaction,receipt);
}
