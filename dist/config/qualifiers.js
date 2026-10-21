'use strict';
const QUALIFIERS=Object.freeze({
 version:1,operators:['BLAST SLAM','PGL WALLACHIA','ESL ONE','DREAMLEAGUE'],
 regions:['EEU','EU','CN','SEA','NA'],invites:6,regionInviteCap:2,
 baseQuotas:{EEU:3,EU:2,CN:2,SEA:2,NA:1},minQuota:1,maxQuota:4,
 snapshotLead:35,listLead:7,defaultDuration:10,
 weights:{
  'BLAST SLAM':{season:30,eloForm:25,history:15,fame:30},
  'PGL WALLACHIA':{season:40,eloForm:20,history:30,fame:10},
  'ESL ONE':{season:45,eloForm:35,history:15,fame:5},
  'DREAMLEAGUE':{season:35,eloForm:35,history:20,fame:10}
 },
 normalNeutral:.5,eloForm:{elo:.7,form:.3},historyDays:365,historyExponent:1,
 homeById:{4:'EU',6:'SEA',7:'CN',10:'SEA',14:'EEU',16:'CN',17:'EEU',18:'SEA',19:'NA',20:'NA',21:'CN',22:'EEU',23:'SEA'},
 aliases:{CIS:'EEU','Китай':'CN','Европа':'EU','Северная Америка':'NA','ЮВА':'SEA'},
 fame:{min:0,max:100,skillReference:50,skillWeight:1.2,pointsWeight:.1,dailyDecay:.9995,
  bestPlayerGrowth:.15,mapWin:.12,upsetEloScale:400,upsetCap:1,upsetWin:.4,eventWin:4,placeExponent:1},
 provisional:{bo:3,eloScale:400,eloBase:10,formReference:75,formWeight:2,minProbability:.03,maxProbability:.97},
 precision:1e-10
});
