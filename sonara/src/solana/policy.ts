export const DEVNET_RPC='https://api.devnet.solana.com';
export const DEVNET_CHAIN='solana:devnet' as const;
export const DEVNET_GENESIS='EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG';
export type Attribute={key:string;value:string};
export function assertDevnet(genesis:string){if(genesis!==DEVNET_GENESIS)throw new Error('Wrong network. SONARA only permits Solana Devnet transactions.');}
export function isMusician(list:Attribute[]){return list.some(a=>a.key==='app'&&a.value==='sonara')&&list.some(a=>a.key==='proof_mode'&&a.value==='owner_managed_demo');}
export function initialAttributes(instrument:string):Attribute[]{return [{key:'app',value:'sonara'},{key:'schema_version',value:'1'},{key:'network',value:'devnet'},{key:'proof_mode',value:'owner_managed_demo'},{key:'primary_instrument',value:instrument},{key:'demo_updates',value:'0'}];}
export function nextDemoAttributes(list:Attribute[]):Attribute[]{
 if(!isMusician(list))throw new Error('This asset is not a SONARA demo musician.');
 const values=new Map(list.map(a=>[a.key,a.value]));const count=Number(values.get('demo_updates')??'0');
 if(!Number.isSafeInteger(count)||count<0||count>=999999)throw new Error('Invalid demo counter.');
 values.set('demo_updates',String(count+1));return [...values].map(([key,value])=>({key,value}));
}
export function metadataUrl(origin:string){const url=new URL('/musician/metadata.json',origin);if(url.protocol!=='https:'||['localhost','127.0.0.1','[::1]'].includes(url.hostname))throw new Error('Mint from the public HTTPS game URL so other viewers can load the artwork.');return url.href;}
