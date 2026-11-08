import {it,expect} from 'vitest';
import {awardSolo,emptyRewards,soloBadges,soloTitle} from './soloRewards';
import {emptyScore,type RoomView} from './game';
const take=():RoomView=>({code:'SOLO',host:'solo',players:[{id:'solo',name:'You',role:'piano',connected:true,ready:true,score:{...emptyScore(),perfect:4,points:400}}],phase:'results',startAt:1,bpm:60,matchId:'take',chartId:'twinkle-v1',reason:''});
it('awards a qualifying take once',()=>{const room=take(),r=awardSolo(emptyRewards(),room);expect(r.takes).toBe(1);expect(r.xp).toBeGreaterThanOrEqual(10);expect(r.xp).toBeLessThanOrEqual(20);expect(awardSolo(r,room)).toBe(r);expect(soloBadges(r)[0].earned).toBe(true);});
it('rejects incomplete, band and low-hit sessions',()=>{for(const change of [{phase:'playing'},{code:'BAND'}] as const)expect(awardSolo(emptyRewards(),{...take(),...change}).xp).toBe(0);const room=take();room.players[0].score.perfect=3;expect(awardSolo(emptyRewards(),room).xp).toBe(0);});
it('uses separate solo title thresholds',()=>{expect(soloTitle(0)).toBe('Newcomer');expect(soloTitle(60)).toBe('Rhythm Keeper');expect(soloTitle(120)).toBe('Solo Star');});
