import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat,readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createIssuer} from './achievements';
import {deploymentOrigin,hostedMetadata} from './deployment';
import {attachRooms} from './rooms';
const root=resolve('dist'),types:Record<string,string>={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.wav':'audio/wav','.png':'image/png','.svg':'image/svg+xml','.task':'application/octet-stream','.txt':'text/plain','.md':'text/plain'};
const publicOrigin=deploymentOrigin(process.env);const issuer=createIssuer();
const server=createServer(async(req,res)=>{
 try{
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
  const url=new URL(req.url??'/','http://localhost');
  if(url.pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'}).end('{"ok":true}');return;}
  if(url.pathname==='/api/issuer'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-cache'}).end(JSON.stringify({network:'devnet',issuer:issuer.issuer}));return;}
  if(url.pathname==='/musician/metadata.json'&&publicOrigin){const metadata=hostedMetadata(JSON.parse(await readFile(resolve(root,'musician/metadata.json'),'utf8')),publicOrigin);const body=JSON.stringify(metadata);res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-cache','Content-Length':Buffer.byteLength(body)}).end(req.method==='HEAD'?undefined:body);return;}
  const file=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
  const info=await stat(file);if(!info.isFile()){res.writeHead(404).end();return;}
  res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream','Content-Length':info.size,'X-Content-Type-Options':'nosniff','Cache-Control':extname(file)==='.html'?'no-cache':'public, max-age=3600'});
  if(req.method==='HEAD'){res.end();return;}createReadStream(file).on('error',()=>res.destroy()).pipe(res);
 }catch{res.writeHead(404).end('Not found');}
});
const close=attachRooms(server,Date.now,issuer);const port=Number(process.env.PORT??4173);
server.listen(port,'0.0.0.0',()=>console.log(`SONARA band server: http://localhost:${port} (LAN enabled; use HTTPS for remote webcams)`));
let shuttingDown=false;function shutdown(){if(shuttingDown)return;shuttingDown=true;close();server.close();const timeout=setTimeout(()=>process.exit(0),10000);timeout.unref();}process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
