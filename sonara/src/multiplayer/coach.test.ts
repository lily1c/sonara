import {it,expect} from 'vitest';
import {emptyScore,judge} from './game';
import {practiceAdvice} from './coach';
it('suggests a gentle pace and a concrete missed target for a struggling player',()=>{const score=emptyScore();score.miss=16;score.judged={p0:'Miss',p1:'Miss'};const advice=practiceAdvice(score,'piano',80);expect(advice.tempo).toBe(60);expect(advice.accuracy).toBe(0);expect(advice.lane).toBe(0);});
it('uses measured late hits for advice and raises tempo only after strong timing',()=>{const score=emptyScore();judge(score,'piano',0,150,80);judge(score,'piano',2,1650,80);judge(score,'piano',4,3150,80);expect(practiceAdvice(score,'piano',80).timing).toContain('late');score.perfect=16;score.good=0;score.timingErrors=[0,5,-5];expect(practiceAdvice(score,'piano',80).tempo).toBe(100);});
