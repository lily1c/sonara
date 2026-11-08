"""Normalize downloaded VSCO PCM16 WAVs to -3 dBFS peak; no trimming or resampling."""
from pathlib import Path
import array, hashlib, json, math, sys, wave
root=Path(__file__).resolve().parents[1]/'public/samples/violin'
files=[]
for p in sorted(root.glob('*.wav')):
    original_hash=hashlib.sha256(p.read_bytes()).hexdigest()
    with wave.open(str(p),'rb') as source:
        params=source.getparams()
        assert params.sampwidth==2 and params.comptype=='NONE'
        samples=array.array('h',source.readframes(params.nframes))
    if sys.byteorder!='little': samples.byteswap()
    peak=max(abs(x) for x in samples)
    gain=(32767*10**(-3/20))/peak
    normalized=array.array('h',(round(x*gain) for x in samples))
    if sys.byteorder!='little': normalized.byteswap()
    with wave.open(str(p),'wb') as target:
        target.setparams(params); target.writeframes(normalized.tobytes())
    files.append({'file':p.name,'sourcePath':f'Strings/Solo Violin/Arco Vib/LLVln_ArcoVib_{p.stem}_p.wav','originalSha256':original_hash,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'gainDb':round(20*math.log10(gain),3),'durationSeconds':params.nframes/params.framerate})
(root/'manifest.json').write_text(json.dumps({'repository':'https://github.com/sgossner/VSCO-2-CE','commit':'440300901dfe9275fd84e0b7763af1f8443ae62e','license':'CC0-1.0','modifications':'Peak normalized independently to -3 dBFS; PCM16 stereo 44.1kHz preserved; WAV metadata removed.','files':files},indent=2))
