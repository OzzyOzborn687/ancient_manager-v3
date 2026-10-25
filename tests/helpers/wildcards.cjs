'use strict';
exports.setup=(series='PGL WALLACHIA',season=30,seed=1,freeze=true)=>`{
 fresh();S.seed=551;S.calendar21.installedDay=100000;
 S.events=[{id:0,name:'Wildcard '+${JSON.stringify(series)},series:${JSON.stringify(series)},season:${season},day:50,duration:8,pool:1000000}];
 Qualifiers.ensureScene();my().tier=3;clubState13(my()).elo=0;clubState13(my()).seasonPoints=0;my().fame=0;
 const region=Qualifiers.region(my());
 while(S.teams.filter(t=>Qualifiers.region(t)===region).length<=QUALIFIERS.regional.largeField+QUALIFIERS.regionInviteCap)Qualifiers.generateClub(region,3);
 Qualifiers.markCareer(S.events[0]);${freeze?'Qualifiers.freeze(S.events[0]);':''}migrate();ensureDevelopment21();S.seed=${seed};
}`;
