'use strict';
// Fictional in-career celebration; never an announcement of Valve's schedule.
const TI_FESTIVAL=Object.freeze({
 version:'aegis-2027-1',year:2027,pool:30000000,participants:16,
 backup:'ancient-manager-before-ti-festival',checkpoint:'ancient-manager-ti-festival-start',
 query:'ti2027',entry:'aegis',chronicleLimit:80,comebackGold:5000,
 goals:[
  {id:'first',name:'Первый луч',description:'Одержать первую победу на карте.',field:'mapWins',target:1,reward:10000},
  {id:'wins',name:'Шаги к бессмертию',description:'Выиграть три карты на этом TI.',field:'mapWins',target:3,reward:30000},
  {id:'rosh',name:'Хозяева ямы',description:'Забрать трёх Рошанов за турнир.',field:'roshans',target:3,reward:25000},
  {id:'comeback',name:'Вопреки всему',description:'Победить на карте после отставания в 5 000 золота.',field:'comebacks',target:1,reward:45000},
  {id:'five',name:'Арена знает ваши имена',description:'Одержать пять побед на картах.',field:'mapWins',target:5,reward:50000}
 ],
 acts:[
  {id:'arrival',number:'I',title:'Прибытие',text:'Ваш клуб получает специальное приглашение. За кулисами уже произносят ваши имена.'},
  {id:'groups',number:'II',title:'Испытание',text:'Пять раундов Swiss BO3. Каждая карта меняет посев и дорогу к главной сцене.'},
  {id:'playoffs',number:'III',title:'Главная сцена',text:'Восемь команд. Верхняя и нижняя сетки. Последняя возможность остаться в истории.'},
  {id:'final',number:'IV',title:'Бессмертие',text:'Гранд-финал BO5. Один последний соперник между вами и Aegis.'}
 ]
});
