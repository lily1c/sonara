import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'node:path';
import {readFileSync} from 'node:fs';
import {attachRooms} from './server/rooms';
export default defineConfig({
 resolve:{alias:[{find:/^@solana\/web3\.js$/,replacement:resolve('node_modules/@solana/web3.js/lib/index.browser.esm.js')},{find:/^node-fetch$/,replacement:resolve('src/solana/browser-fetch.ts')}]},
 plugins:[react(),{name:'sonara-rooms',configureServer(server){if(server.httpServer){const close=attachRooms(server.httpServer);server.httpServer.once('close',close);}}}],
 server:{host:'0.0.0.0',strictPort:true,https:process.env.SONARA_TLS_CERT&&process.env.SONARA_TLS_KEY?{cert:readFileSync(process.env.SONARA_TLS_CERT),key:readFileSync(process.env.SONARA_TLS_KEY)}:undefined},
 build:{rollupOptions:{output:{manualChunks:{vision:['@mediapipe/tasks-vision'],audio:['tone'],react:['react','react-dom'],walletSdk:['@solana/web3.js']}}}}
});
