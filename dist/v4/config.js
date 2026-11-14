'use strict';
const V4_CONFIG=Object.freeze({version:4,major:{minimumPool:500000,minimumField:16,invites16:15,invites24:16},
 camp:{days:7,window:14,cancellationRefund:.8,tiers:{
  online:{label:'Онлайн-подготовка',cost:0,form:0,growth:0,recovery:0,tag:'БЕЗ ДОПЛАТЫ',description:'Обычные тренировки в инфраструктуре клуба. Никаких бонусов буткемпа.'},
  standard:{label:'Team House',cost:35000,form:.2,growth:.15,recovery:.75,tag:'БАЗОВЫЙ',description:'Совместный тренировочный дом, стабильное расписание и восстановление после занятий.'},
  advanced:{label:'Performance Lab',cost:75000,form:.4,growth:.3,recovery:1.5,tag:'ПРОФЕССИОНАЛЬНЫЙ',description:'Выделенные тренировочные комнаты, аналитика занятий и ежедневная работа с восстановлением.'},
  elite:{label:'Championship Campus',cost:140000,form:.6,growth:.5,recovery:2.5,tag:'ПРЕМИУМ',description:'Закрытый кампус для пятёрки: индивидуальный режим, тренировочный штаб и расширенная программа восстановления.'}
 }},fans:{reference:10000,scale:.8,max:4,minMorale:20,maxMorale:98}});
