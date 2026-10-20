'use strict';
Match22.window=function(m,reason){
 if(m.finishedSide!=null)return;
 if(!m.window22.pending&&m.clock-m.window22.last>=this.B.windowCooldown){m.window22.pending=true;m.window22.reason=reason;m.window22.last=m.clock;}
};
Match22.event=function(m,text,type='info',extra={}){event4(m,text,type,extra)};
Match22.name=(m,side)=>S.teams[m.sides[side].team].short;
