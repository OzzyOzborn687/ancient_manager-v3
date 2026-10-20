'use strict';
const {app,BrowserWindow,Menu,shell}=require('electron');
const path=require('node:path');
app.setName('Ancient Manager');
let mainWindow,allowQuit=false;
function flushCareer(){
 if(!mainWindow||mainWindow.isDestroyed())return Promise.resolve();
 return mainWindow.webContents.executeJavaScript('(()=>{if(typeof pauseLive4==="function")pauseLive4(false);if(typeof save==="function")save();return typeof saveQueue!=="undefined"?saveQueue:null;})()').catch(()=>{});
}
const openExternal=url=>{try{const parsed=new URL(url);if(['https:','http:'].includes(parsed.protocol))shell.openExternal(parsed.href);}catch(_){}};
function createWindow(){
 mainWindow=new BrowserWindow({width:1440,height:1000,minWidth:390,minHeight:600,backgroundColor:'#08090d',title:'Ancient Manager',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
 const page=path.join(__dirname,'..','web','index.html');mainWindow.loadFile(page);
 mainWindow.webContents.setWindowOpenHandler(({url})=>{openExternal(url);return {action:'deny'};});
 mainWindow.webContents.on('will-navigate',(event,url)=>{if(url!==require('node:url').pathToFileURL(page).href){event.preventDefault();openExternal(url);}});
 mainWindow.webContents.session.setPermissionRequestHandler((_contents,permission,callback)=>callback(permission==='clipboard-sanitized-write'));
 mainWindow.on('close',event=>{
  if(mainWindow.forceClose||allowQuit)return;event.preventDefault();
  mainWindow.webContents.executeJavaScript('(()=>{if(typeof pauseLive4==="function")pauseLive4(false);if(typeof save==="function")save();return typeof saveQueue!=="undefined"?saveQueue:null;})()')
   .catch(()=>{}).finally(()=>{mainWindow.forceClose=true;mainWindow.close();});
 });
 mainWindow.on('closed',()=>{mainWindow=null;});
}
if(!app.requestSingleInstanceLock())app.quit();
else{
 app.on('second-instance',()=>{if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.focus();}});
 app.whenReady().then(()=>{
  Menu.setApplicationMenu(Menu.buildFromTemplate([
   {label:'Ancient Manager',submenu:[{role:'about'},{type:'separator'},{role:'hide'},{role:'hideOthers'},{role:'unhide'},{type:'separator'},{role:'quit'}]},
   {label:'Правка',submenu:[{role:'undo'},{role:'redo'},{type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'},{role:'selectAll'}]},
   {label:'Вид',submenu:[{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{type:'separator'},{role:'togglefullscreen'}]},
   {label:'Игра',submenu:[
    {label:'Главная',click:()=>mainWindow?.webContents.executeJavaScript("go('home')")},
    {label:'Матч-центр',click:()=>mainWindow?.webContents.executeJavaScript("go('match')")},
    {label:'Сохранения',click:()=>mainWindow?.webContents.executeJavaScript("go('saves')")},
    {label:'Карьера и данные',click:()=>mainWindow?.webContents.executeJavaScript("go('settings')")}
   ]}
  ]));createWindow();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)createWindow();});
 });
 app.on('before-quit',event=>{if(allowQuit)return;event.preventDefault();flushCareer().finally(()=>{allowQuit=true;app.quit();});});
 app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
}
