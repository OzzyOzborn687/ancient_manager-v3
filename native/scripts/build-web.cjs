'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),target=path.join(root,'web'),source=path.join(root,'..','dist');
fs.rmSync(target,{recursive:true,force:true});fs.cpSync(source,target,{recursive:true});
require('esbuild').buildSync({entryPoints:[path.join(root,'adapter.js')],bundle:true,format:'iife',platform:'browser',target:'safari15',outfile:path.join(target,'native-adapter.js')});
const page=path.join(target,'index.html');
fs.writeFileSync(page,fs.readFileSync(page,'utf8').replace('width=device-width, initial-scale=1','width=device-width, initial-scale=1, viewport-fit=cover').replace('</head>','<style>body{padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}</style></head>').replace('<script>window.gameReady=', '<script src="native-adapter.js"></script><script>window.gameReady='));
console.log('Bundled game and native save/lifecycle adapter:',target);

const icon=path.join(root,'ios','App','App','Assets.xcassets','AppIcon.appiconset','AppIcon-512@2x.png');if(fs.existsSync(path.dirname(icon)))fs.copyFileSync(path.join(source,'assets','club-logos','0-square.png'),icon);
