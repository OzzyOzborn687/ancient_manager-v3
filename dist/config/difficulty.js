'use strict';
// Applied once to combat strength; player ratings and economic coefficients stay intact.
const CAREER_DIFFICULTY={
 default:'normal',
 levels:{
  easy:{label:'Легко',own:1.15,rival:1,againstClubOnly:false,description:'+15% к силе вашей команды'},
  normal:{label:'Нормально',own:1,rival:1,againstClubOnly:false,description:'Без бонусов к силе'},
  hard:{label:'Сложно',own:1,rival:1.07,againstClubOnly:false,description:'+7% к силе всех команд, кроме вашей'},
  heavy:{label:'Тяжело',own:1,rival:1.15,againstClubOnly:false,description:'+15% к силе всех команд, кроме вашей'},
  impossible:{label:'Невозможно',own:1,rival:1.20,againstClubOnly:true,description:'+20% к силе соперника в матчах против вашей команды'}
 }
};
