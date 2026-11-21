'use strict';
const PSGSupport91={
 day:Math.round((Date.UTC(2026,10,28)-Date.UTC(2026,9,15))/86400000),amount:1500000,
 grant(){if(!S||!PSG91.playing()||S.day<this.day||S.psgSupport91)return false;
  S.psgSupport91={version:1,club:S.club,day:S.day,amount:this.amount,acknowledged:false};
  money(this.amount,'Поддержка шейхов · PSG');log('Шейхи помогают клубу · PSG получил '+cash(this.amount)+'.');save();return true;
 },
 show(){const n=S?.psgSupport91;if(!n||n.acknowledged||!PSG91.playing()||n.club!==S.club||busy13||typeof document.querySelector!=='function'||document.querySelector('dialog[open]'))return;
  openModal('<section class="psg-support91"><span class="eyebrow">PSG / ПОДДЕРЖКА ШЕЙХОВ</span>'+clubAvatar12(my())+'<h2>Шейхи помогают клубу</h2><p>Разовая поддержка клуба · '+date(this.day)+'</p><strong>+'+cash(this.amount)+'</strong><p>Средства зачислены в бюджет PSG и доступны для трансферов и подготовки команды.</p>'+btn('Продолжить','PSGSupport91.close()',true)+'</section>');
  const state=S;$('modal').addEventListener('close',()=>{if(S===state&&state.psgSupport91===n){n.acknowledged=true;save();}},{once:true});
 },
 close(){if(S?.psgSupport91)S.psgSupport91.acknowledged=true;save();closeModal();render();}
};
const tickBeforePSGSupport91=tick;tick=function(...a){const r=tickBeforePSGSupport91(...a);PSGSupport91.grant();return r;};
const renderBeforePSGSupport91=Interface9.render;Interface9.render=function(...a){if(!S||Background51.finishing)return renderBeforePSGSupport91.apply(this,a);PSGSupport91.grant();const r=renderBeforePSGSupport91.apply(this,a);PSGSupport91.show();return r;};
const validBeforePSGSupport91=validSave;validSave=function(x){if(!validBeforePSGSupport91(x))return false;const n=x.psgSupport91;return n===undefined||!!n&&n.version===1&&Number.isInteger(n.club)&&x.teams[n.club]?.psg91===true&&Number.isInteger(n.day)&&n.day>=PSGSupport91.day&&n.day<=x.day&&n.amount===PSGSupport91.amount&&typeof n.acknowledged==='boolean';};
