import {readFile,writeFile} from 'node:fs/promises';
const input=process.argv[2];if(!input)throw new Error('Usage: node scripts/musician-metadata.mjs https://your-public-game-origin');
const origin=new URL(input);if(origin.protocol!=='https:')throw new Error('Use a public HTTPS origin.');
const path=new URL('../public/musician/metadata.json',import.meta.url),metadata=JSON.parse(await readFile(path,'utf8'));
metadata.image=new URL('/musician/avatar.svg',origin).href;metadata.external_url=origin.origin+'/';metadata.properties.files[0].uri=metadata.image;
await writeFile(path,JSON.stringify(metadata,null,2)+'\n');console.log('Metadata image points to '+metadata.image);
