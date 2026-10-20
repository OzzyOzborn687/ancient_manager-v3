import {Capacitor} from '@capacitor/core';
import {App} from '@capacitor/app';
import {Filesystem,Directory,Encoding} from '@capacitor/filesystem';
import {Share} from '@capacitor/share';
if(Capacitor.isNativePlatform()){
 const shareJSON=async(data,name)=>{
  const result=await Filesystem.writeFile({path:name,data,directory:Directory.Cache,encoding:Encoding.UTF8});
  await Share.share({title:'Сохранение Ancient Manager',url:result.uri,dialogTitle:'Сохранить или передать карьеру'});
 };
 downloadCareer=async()=>{
  try{pauseLive4(false);await save();await shareJSON(JSON.stringify(makePacket(S,my().name+' · '+date()),null,2),'Ancient-Manager-'+S.day+'.json');}
  catch(_){toast('Не удалось открыть меню сохранения. Используйте копирование кода.');}
 };
 downloadStartupSave=async()=>{
  try{
   const copies={};if(typeof STORE_CACHE!=='undefined')for(const [key,raw] of STORE_CACHE)if(raw)copies[key]=raw;for(const key of ['ancient-manager-v1','ancient-manager-v1-previous','ancient-manager-backup',...Array.from({length:5},(_,i)=>'ancient-manager-slot-'+i)]){const raw=localStorage.getItem(key);if(raw)copies[key]=raw;}
   await shareJSON(copies['ancient-manager-v1']||JSON.stringify({format:'AncientManagerRecovery',copies}),'Ancient-Manager-recovery.json');
  }catch(_){toast('Не удалось передать файл сохранения.');}
 };
 App.addListener('appStateChange',async({isActive})=>{if(!isActive){if(typeof pauseLive4==='function')pauseLive4(false);if(typeof S!=='undefined'&&S)await save();}});
}
