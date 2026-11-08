//! SONARA Devnet achievements. Only the configured issuer can attest gameplay.
//! Every successful claim creates a permanent (wallet, session) PDA; there is no close path.
use solana_program::{account_info::{next_account_info,AccountInfo},clock::Clock,entrypoint,entrypoint::ProgramResult,instruction::{get_stack_height,TRANSACTION_LEVEL_STACK_HEIGHT},program::{invoke,invoke_signed},program_error::ProgramError,pubkey::Pubkey,rent::Rent,system_instruction,system_program,sysvar::{Sysvar,instructions::{load_current_index_checked,load_instruction_at_checked}}};
mod identity;
#[cfg(not(feature="no-entrypoint"))]
entrypoint!(process_instruction);
pub const DOMAIN: &[u8;16]=b"SONARA_BAND_V1\0\0";
pub const VOUCHER_LEN:usize=168;
pub const PROFILE_LEN:usize=64;
pub const CLAIM_LEN:usize=120;
const CONFIG_LEN:usize=40;
const BAD_AUTH:u32=7000;const REPLAY:u32=7001;const BAD_VOUCHER:u32=7002;const EXPIRED:u32=7003;
fn error(code:u32)->ProgramError{ProgramError::Custom(code)}
fn u16_at(b:&[u8],i:usize)->u16{u16::from_le_bytes([b[i],b[i+1]])}
fn u64_at(b:&[u8],i:usize)->u64{u64::from_le_bytes(b[i..i+8].try_into().unwrap())}
fn i64_at(b:&[u8],i:usize)->i64{i64::from_le_bytes(b[i..i+8].try_into().unwrap())}
fn signer(a:&AccountInfo)->ProgramResult{if !a.is_signer||!a.is_writable{return Err(ProgramError::MissingRequiredSignature)}Ok(())}
fn pda(account:&AccountInfo,seeds:&[&[u8]],program:&Pubkey)->Result<u8,ProgramError>{let (key,bump)=Pubkey::find_program_address(seeds,program);if key!=*account.key{return Err(ProgramError::InvalidSeeds)}Ok(bump)}
fn create<'a>(payer:&AccountInfo<'a>,target:&AccountInfo<'a>,system:&AccountInfo<'a>,program:&Pubkey,seeds:&[&[u8]],len:usize)->ProgramResult{
 if *system.key!=system_program::id()||!target.is_writable||*target.owner!=system_program::id()||!target.data_is_empty(){return Err(ProgramError::InvalidAccountData)}
 let rent=Rent::get()?.minimum_balance(len);
 if target.lamports()==0{return invoke_signed(&system_instruction::create_account(payer.key,target.key,rent,len as u64,program),&[payer.clone(),target.clone(),system.clone()],&[seeds]);}
 // A one-lamport pre-fund must not let an attacker block a profile or claim PDA.
 let needed=rent.saturating_sub(target.lamports());if needed>0{invoke(&system_instruction::transfer(payer.key,target.key,needed),&[payer.clone(),target.clone(),system.clone()])?;}
 invoke_signed(&system_instruction::allocate(target.key,len as u64),&[target.clone(),system.clone()],&[seeds])?;
 invoke_signed(&system_instruction::assign(target.key,program),&[target.clone(),system.clone()],&[seeds])
}
fn profile<'a>(wallet:&AccountInfo<'a>,account:&AccountInfo<'a>,system:&AccountInfo<'a>,program:&Pubkey)->ProgramResult{
 let bump=pda(account,&[b"profile",wallet.key.as_ref()],program)?;
 if *account.owner==system_program::id()&&account.data_is_empty(){create(wallet,account,system,program,&[b"profile",wallet.key.as_ref(),&[bump]],PROFILE_LEN)?;let mut data=account.try_borrow_mut_data()?;data[..8].copy_from_slice(b"SONPROF1");data[8..40].copy_from_slice(wallet.key.as_ref());}
 let data=account.try_borrow_data()?;if *account.owner!=*program||data.len()!=PROFILE_LEN||&data[..8]!=b"SONPROF1"||&data[8..40]!=wallet.key.as_ref(){return Err(ProgramError::InvalidAccountData)}Ok(())
}
pub fn validate_voucher(message:&[u8],program:&Pubkey,wallet:&Pubkey,now:i64)->ProgramResult{
 if message.len()!=VOUCHER_LEN||&message[..16]!=DOMAIN||&message[16..48]!=program.as_ref()||&message[48..80]!=wallet.as_ref(){return Err(error(BAD_VOUCHER))}
 let performance=u16_at(message,146);let points=u16_at(message,144);let ended=i64_at(message,152);let expires=i64_at(message,160);
 if performance>100||points>6400||message[148]<4||message[148]>64||!(2..=4).contains(&message[149])||message[150]>3||message[151]!=0||ended<=0||ended>now.saturating_add(60)||expires<=ended||expires>ended.saturating_add(604800){return Err(error(BAD_VOUCHER))}
 if now>expires{return Err(error(EXPIRED))}Ok(())
}
pub fn validate_ed25519(data:&[u8],issuer:&[u8],message:&[u8])->ProgramResult{
 // Require canonical self-contained offsets. Never accept references into other instructions.
 let expected=[1,0,48,0,255,255,16,0,255,255,112,0,168,0,255,255];
 if data.len()!=112+VOUCHER_LEN||data[..16]!=expected||&data[16..48]!=issuer||&data[112..]!=message{return Err(error(BAD_AUTH))}Ok(())
}
pub fn process_instruction(program:&Pubkey,accounts:&[AccountInfo],data:&[u8])->ProgramResult{
 if get_stack_height()!=TRANSACTION_LEVEL_STACK_HEIGHT{return Err(error(BAD_AUTH))}
 let mut iter=accounts.iter();let wallet=next_account_info(&mut iter)?;signer(wallet)?;
 match data.first(){
 Some(0)|Some(3)=>{
  if data.len()!=33||*wallet.key!=identity::ADMIN{return Err(error(BAD_AUTH))}let config=next_account_info(&mut iter)?;let system=next_account_info(&mut iter)?;let bump=pda(config,&[b"config"],program)?;
  if data[0]==0{if *config.owner==*program{return Err(ProgramError::AccountAlreadyInitialized)}create(wallet,config,system,program,&[b"config",&[bump]],CONFIG_LEN)?;}else{if *config.owner!=*program||config.data_len()!=CONFIG_LEN||&config.try_borrow_data()?[..8]!=b"SONCONF1"{return Err(ProgramError::InvalidAccountData)}}
  let mut bytes=config.try_borrow_mut_data()?;bytes[..8].copy_from_slice(b"SONCONF1");bytes[8..].copy_from_slice(&data[1..]);Ok(())
 },
 Some(1)=>{if data.len()!=1{return Err(ProgramError::InvalidInstructionData)}let account=next_account_info(&mut iter)?;let system=next_account_info(&mut iter)?;profile(wallet,account,system,program)},
 Some(2)=>{
  if data.len()!=1+VOUCHER_LEN{return Err(ProgramError::InvalidInstructionData)}let message=&data[1..];validate_voucher(message,program,wallet.key,Clock::get()?.unix_timestamp)?;
  let player=next_account_info(&mut iter)?;let claim=next_account_info(&mut iter)?;let config=next_account_info(&mut iter)?;let instructions=next_account_info(&mut iter)?;let system=next_account_info(&mut iter)?;
  pda(config,&[b"config"],program)?;if *config.owner!=*program||config.data_len()!=CONFIG_LEN{return Err(error(BAD_AUTH))}let config_data=config.try_borrow_data()?;if &config_data[..8]!=b"SONCONF1"{return Err(error(BAD_AUTH))}
  let current=load_current_index_checked(instructions)?;if current==0{return Err(error(BAD_AUTH))}let previous=load_instruction_at_checked((current-1) as usize,instructions)?;
  if previous.program_id!=solana_program::ed25519_program::id()||!previous.accounts.is_empty(){return Err(error(BAD_AUTH))}validate_ed25519(&previous.data,&config_data[8..40],message)?;drop(config_data);
  let session=&message[80..112];let bump=pda(claim,&[b"claim",wallet.key.as_ref(),session],program)?;
  if *claim.owner==*program||!claim.data_is_empty(){return Err(error(REPLAY))}
  profile(wallet,player,system,program)?;create(wallet,claim,system,program,&[b"claim",wallet.key.as_ref(),session,&[bump]],CLAIM_LEN)?;
  let percent=u16_at(message,146);let xp=10+percent/10;let mut p=player.try_borrow_mut_data()?;let total=u64_at(&p,40).checked_add(xp as u64).ok_or(ProgramError::ArithmeticOverflow)?;let sessions=u64_at(&p,48).checked_add(1).ok_or(ProgramError::ArithmeticOverflow)?;let best=u16_at(&p,56).max(percent);p[40..48].copy_from_slice(&total.to_le_bytes());p[48..56].copy_from_slice(&sessions.to_le_bytes());p[56..58].copy_from_slice(&best.to_le_bytes());p[58]=1;drop(p);
  let mut c=claim.try_borrow_mut_data()?;c[..8].copy_from_slice(b"SONCLM01");c[8..40].copy_from_slice(wallet.key.as_ref());c[40..72].copy_from_slice(session);c[72..104].copy_from_slice(&message[112..144]);c[104..108].copy_from_slice(&message[144..148]);c[108]=message[150];c[109]=message[149];c[110..118].copy_from_slice(&message[152..160]);c[118..120].copy_from_slice(&xp.to_le_bytes());Ok(())
 },_=>Err(ProgramError::InvalidInstructionData)
 }
}
#[cfg(test)]mod tests{
 use super::*;
 fn voucher(program:&Pubkey,wallet:&Pubkey)->Vec<u8>{let mut m=vec![0;168];m[..16].copy_from_slice(DOMAIN);m[16..48].copy_from_slice(program.as_ref());m[48..80].copy_from_slice(wallet.as_ref());m[144..146].copy_from_slice(&400u16.to_le_bytes());m[146..148].copy_from_slice(&50u16.to_le_bytes());m[148]=4;m[149]=2;m[152..160].copy_from_slice(&1000i64.to_le_bytes());m[160..168].copy_from_slice(&2000i64.to_le_bytes());m}
 #[test]fn binds_wallet_program_and_expiry(){let p=Pubkey::new_unique();let w=Pubkey::new_unique();let m=voucher(&p,&w);assert!(validate_voucher(&m,&p,&w,1500).is_ok());assert!(validate_voucher(&m,&p,&Pubkey::new_unique(),1500).is_err());assert!(validate_voucher(&m,&Pubkey::new_unique(),&w,1500).is_err());assert!(validate_voucher(&m,&p,&w,2001).is_err());let mut bad=m.clone();bad[148]=3;assert!(validate_voucher(&bad,&p,&w,1500).is_err());bad=m;bad[146..148].copy_from_slice(&101u16.to_le_bytes());assert!(validate_voucher(&bad,&p,&w,1500).is_err());}
 #[test]fn refuses_cross_instruction_signature_offsets(){let mut d=vec![0;280];d[..16].copy_from_slice(&[1,0,48,0,255,255,16,0,255,255,112,0,168,0,255,255]);let issuer=[7;32];d[16..48].copy_from_slice(&issuer);let m=[3;168];d[112..].copy_from_slice(&m);assert!(validate_ed25519(&d,&issuer,&m).is_ok());d[4]=0;assert!(validate_ed25519(&d,&issuer,&m).is_err());}
}
