import {describe,it,expect} from 'vitest';
import {assertDevnet,DEVNET_GENESIS,initialAttributes,isMusician,nextDemoAttributes,metadataUrl} from './policy';
describe('Devnet-only musician policy',()=>{
 it('rejects a different cluster before signing',()=>{expect(()=>assertDevnet(DEVNET_GENESIS)).not.toThrow();expect(()=>assertDevnet('mainnet')).toThrow('only permits');});
 it('preserves the full attribute list when changing a demo counter',()=>{const original=[...initialAttributes('saxophone'),{key:'custom_trait',value:'blue'}];const next=nextDemoAttributes(original);expect(next.find(a=>a.key==='demo_updates')?.value).toBe('1');expect(next.find(a=>a.key==='custom_trait')?.value).toBe('blue');expect(original.find(a=>a.key==='demo_updates')?.value).toBe('0');expect(isMusician(next)).toBe(true);});
 it('rejects unrelated assets and invalid counters',()=>{expect(()=>nextDemoAttributes([])).toThrow();expect(()=>nextDemoAttributes(initialAttributes('piano').map(a=>a.key==='demo_updates'?{...a,value:'-1'}:a))).toThrow('Invalid');});
 it('does not mint inaccessible localhost metadata',()=>{expect(()=>metadataUrl('http://localhost:5173')).toThrow();expect(()=>metadataUrl('https://127.0.0.1:5173')).toThrow();expect(metadataUrl('https://game.example')).toBe('https://game.example/musician/metadata.json');});
});
