import {describe,it,expect} from 'vitest';
import {judge,expire,emptyScore,chart,duration} from './game';
describe('shared lesson scoring',()=>{
 it('includes exact timing boundaries and scores each note once',()=>{const s=emptyScore();expect(judge(s,'piano',0,110,80)?.judgement).toBe('Perfect');expect(judge(s,'piano',0,110,80)).toBeNull();expect(s.points).toBe(100);const good=emptyScore();expect(judge(good,'piano',0,220,80)?.judgement).toBe('Good');expect(judge(emptyScore(),'piano',0,221,80)).toBeNull();});
 it('rejects wrong lanes and marks missed notes once',()=>{const s=emptyScore();expect(judge(s,'piano',3,0,80)).toBeNull();expire(s,'piano',221,80);expire(s,'piano',221,80);expect(s.miss).toBe(1);expect(s.points).toBe(0);});
 it('uses the same beat chart at reduced tempo and finalizes every note',()=>{expect(duration(80)).toBe(24000);expect(duration(60)).toBe(32000);const s=emptyScore();const n=chart('drums')[0];expect(judge(s,'drums',n.lane,n.beat*1000,60)?.judgement).toBe('Perfect');expire(s,'drums',Infinity,60);expect(s.perfect+s.good+s.miss).toBe(chart('drums').length);});
});
