import {useEffect,useRef,useState} from 'react';
import {getWallets} from '@wallet-standard/app';
import type {Wallet} from '@wallet-standard/base';
import type {Band} from '../multiplayer/useBand';
import {supported,connectWallet,signAchievementChallenge,verifyAchievement,anchorAchievement,verifyRecordedAchievement} from './client';
import type {AchievementReceipt} from './achievement';
export default function AchievementClaim({band}:{band:Band}){
 const [wallets,setWallets]=useState<readonly Wallet[]>([]),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[receipt,setReceipt]=useState<AchievementReceipt|null>(null),[transaction,setTransaction]=useState(''),[confirmed,setConfirmed]=useState(false);const lock=useRef(false);
 function save(value:unknown){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Chain actions remain usable when storage is unavailable. */}}
 const match=band.room!.matchId,key=`sonara-achievement:${match}:${band.id}`;
 useEffect(()=>{const api=getWallets(),refresh=()=>setWallets(api.get().filter(supported));refresh();const a=api.on('register',refresh),b=api.on('unregister',refresh);try{const value=JSON.parse(localStorage.getItem(key)??'null');if(value){setTransaction(value.signature);setConfirmed(false);setReceipt(value.receipt);}}catch{}return()=>{a();b();};},[key]);
 async function claim(wallet:Wallet){if(lock.current)return;lock.current=true;setBusy(true);setNotice('Connect your wallet, then sign the performance binding message.');try{
  const connection=await connectWallet(wallet);
  const challenge=await band.requestAchievement('achievement-challenge',{type:'achievement-challenge',wallet:connection.account.address});
  const signature=await signAchievementChallenge(connection,challenge.message);
  const response=await band.requestAchievement('achievement-receipt',{type:'achievement-proof',signature});const earned=response.receipt as AchievementReceipt;
  await verifyAchievement(earned,challenge.issuer,connection.account.address);if(earned.payload.match!==match)throw new Error('The room moved to another session.');setReceipt(earned);
  setNotice('Performance verified. Approve the Devnet memo transaction to record your badge. Only the network fee is charged in test SOL.');
  const tx=await anchorAchievement(connection,earned,challenge.issuer,pending=>{setTransaction(pending);save({signature:pending,receipt:earned,confirmed:false});});
  setTransaction(tx);setConfirmed(true);save({signature:tx,receipt:earned,confirmed:true});setNotice('Your First Band achievement is confirmed on Devnet.');
 }catch(e){setNotice(e instanceof Error?e.message:'Achievement could not be recorded.');}finally{lock.current=false;setBusy(false);}}
 async function check(){if(!receipt||!transaction||lock.current)return;lock.current=true;setBusy(true);try{await verifyRecordedAchievement(transaction,receipt);setConfirmed(true);save({signature:transaction,receipt,confirmed:true});setNotice('Receipt, wallet signer and successful transaction verified from Devnet.');}catch(e){setNotice(e instanceof Error?e.message:'Could not verify from chain.');}finally{lock.current=false;setBusy(false);}}
 function download(){if(!receipt)return;const url=URL.createObjectURL(new Blob([JSON.stringify(receipt,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`sonara-first-band-${match}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <div className="earned-achievement"><span className="achievement-seal" aria-hidden="true">✧</span><h3>{confirmed?'First Band · recorded!':'You earned First Band.'}</h3><p>Two instruments. A complete shared take. At least four timed hits from every player.</p><p className="chain-note">Bind your result to your wallet, then record the signed receipt on Devnet. This is a verifiable performance badge, separate from your editable musician NFT traits. Your wallet, instrument and score will be public.</p>
 {!transaction&&!wallets.length&&<p>Open this game in a browser with your Solana wallet enabled. Your result remains available while this room is open.</p>}
 {!transaction&&wallets.map(wallet=><button className="primary-action" key={wallet.name} disabled={busy} onClick={()=>void claim(wallet)}>{busy?'Awaiting wallet / confirmation…':`Claim with ${wallet.name} →`}</button>)}
 {transaction&&<p><a href={`https://explorer.solana.com/tx/${transaction}?cluster=devnet`} target="_blank" rel="noreferrer">{confirmed?'View confirmed achievement ↗':'Check submitted transaction ↗'}</a>{!confirmed&&<span> Confirmation is uncertain. Check Explorer before submitting again; duplicate records do not earn another badge.</span>}</p>}
 {transaction&&receipt&&<button className="secondary" disabled={busy} onClick={()=>void check()}>{busy?'Checking…':'Verify record from Devnet ↻'}</button>}
 {receipt&&<><button className="secondary" onClick={download}>Download signed proof ↓</button><details><summary>How is this verified?</summary><p>The room server signs your completed session, wallet, role and score. Its issuer key is {receipt.issuer}. The Memo stores that signed receipt; verification trusts this server’s issuer. It is not an NFT mint or an on-chain anti-cheat program.</p></details></>}
 {notice&&<p role="status">{notice}</p>}
 </div>;
}
