'use strict';
// AM - Draft update. Conservative mechanic-based design data, not statistical win rates.
const DRAFT_HEROES = {
 "Abaddon": {
  "roles": [
   "offlane",
   "hard_support"
  ],
  "secondary_roles": [],
  "tags": [
   "frontline",
   "save",
   "sustain",
   "physical_damage"
  ],
  "counters": [
   "Batrider"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Alchemist": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [
   "mid"
  ],
  "tags": [
   "physical_damage",
   "scaling",
   "farm_dependent",
   "frontline",
   "waveclear"
  ],
  "counters": [],
  "countered_by": [
   "Ancient Apparition"
  ],
  "conditional_counters": {}
 },
 "Ancient Apparition": {
  "roles": [
   "hard_support",
   "soft_support"
  ],
  "secondary_roles": [],
  "tags": [
   "magic_damage",
   "burst",
   "teamfight"
  ],
  "counters": [
   "Huskar",
   "Alchemist",
   "Morphling",
   "Io",
   "Timbersaw",
   "Dazzle",
   "Oracle"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Anti-Mage": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "scaling",
   "farm_dependent",
   "waveclear"
  ],
  "counters": [
   "Medusa",
   "Storm Spirit"
  ],
  "countered_by": [
   "Faceless Void",
   "Legion Commander",
   "Shadow Shaman"
  ],
  "conditional_counters": {
   "Zeus": "Зависит от стадии и предметов: магическая защита и Mana Void против раннего давления Zeus"
  }
 },
 "Axe": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "teamfight",
   "frontline",
   "pure_damage"
  ],
  "counters": [
   "Dazzle"
  ],
  "countered_by": [
   "Outworld Destroyer",
   "Ursa",
   "Venomancer"
  ],
  "conditional_counters": {
   "Sniper": "Только при успешном доступе к задней линии; дистанция и обзор могут помешать",
   "Phantom Lancer": "Culling Blade против Shallow Grave; массовый контроль и Counter Helix против иллюзий. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется.",
   "Naga Siren": "Culling Blade против Shallow Grave; массовый контроль и Counter Helix против иллюзий. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Bane": {
  "roles": [
   "hard_support"
  ],
  "secondary_roles": [
   "soft_support"
  ],
  "tags": [
   "control",
   "catch",
   "save"
  ],
  "counters": [
   "Ursa",
   "Lifestealer"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Batrider": {
  "roles": [
   "offlane",
   "mid"
  ],
  "secondary_roles": [
   "soft_support"
  ],
  "tags": [
   "initiation",
   "control",
   "catch",
   "magic_damage",
   "waveclear"
  ],
  "counters": [
   "Templar Assassin"
  ],
  "countered_by": [
   "Oracle",
   "Abaddon"
  ],
  "conditional_counters": {}
 },
 "Beastmaster": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "catch",
   "push",
   "physical_damage"
  ],
  "counters": [
   "Lifestealer"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Bounty Hunter": {
  "roles": [
   "soft_support"
  ],
  "secondary_roles": [],
  "tags": [
   "catch",
   "physical_damage"
  ],
  "counters": [
   "Weaver"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Brewmaster": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "teamfight",
   "frontline"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Ursa": "Циклон позволяет выключить ближнего керри на время усиления. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Bristleback": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [
   "carry"
  ],
  "tags": [
   "frontline",
   "physical_damage",
   "sustain",
   "farm_dependent"
  ],
  "counters": [
   "Phantom Lancer"
  ],
  "countered_by": [
   "Hoodwink"
  ],
  "conditional_counters": {}
 },
 "Broodmother": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [
   "mid"
  ],
  "tags": [
   "push",
   "physical_damage",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [
   "Kunkka",
   "Sand King"
  ],
  "conditional_counters": {}
 },
 "Centaur Warrunner": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "frontline",
   "save"
  ],
  "counters": [
   "Windranger"
  ],
  "countered_by": [
   "Lifestealer"
  ],
  "conditional_counters": {}
 },
 "Chaos Knight": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "burst",
   "control",
   "scaling",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [
   "Earthshaker",
   "Lich",
   "Sven",
   "Underlord",
   "Warlock",
   "Winter Wyvern"
  ],
  "conditional_counters": {}
 },
 "Chen": {
  "roles": [
   "hard_support"
  ],
  "secondary_roles": [
   "soft_support"
  ],
  "tags": [
   "sustain",
   "push",
   "save"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Bane": "Дополнительные юниты могут прервать Fiend’s Grip. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Clockwerk": {
  "roles": [
   "soft_support"
  ],
  "secondary_roles": [
   "offlane",
   "hard_support"
  ],
  "tags": [
   "initiation",
   "control",
   "catch",
   "frontline"
  ],
  "counters": [
   "Sniper",
   "Tinker"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Crystal Maiden": {
  "roles": [
   "hard_support",
   "soft_support"
  ],
  "secondary_roles": [],
  "tags": [
   "control",
   "magic_damage",
   "teamfight",
   "waveclear"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Ursa": "Frostbite помогает держать дистанцию; результат зависит от развеиваний и предметов Ursa"
  }
 },
 "Dark Seer": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "teamfight",
   "waveclear",
   "save"
  ],
  "counters": [
   "Terrorblade"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Dark Willow": {
  "roles": [
   "soft_support",
   "hard_support"
  ],
  "secondary_roles": [],
  "tags": [
   "control",
   "magic_damage",
   "burst",
   "teamfight"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Spirit Breaker": "Контроль мешает прямолинейному врыву. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Dawnbreaker": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "frontline",
   "sustain",
   "save",
   "physical_damage",
   "teamfight"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Faceless Void": "Solar Guardian может поддержать союзников в Chronosphere; зависит от позиции и своевременного применения"
  }
 },
 "Dazzle": {
  "roles": [
   "hard_support"
  ],
  "secondary_roles": [],
  "tags": [
   "sustain",
   "save",
   "physical_damage"
  ],
  "counters": [],
  "countered_by": [
   "Ancient Apparition",
   "Axe"
  ],
  "conditional_counters": {
   "Faceless Void": "Shallow Grave может спасти союзника внутри Chronosphere извне. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Death Prophet": {
  "roles": [
   "mid",
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "push",
   "magic_damage",
   "sustain",
   "frontline",
   "teamfight"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Timbersaw": "Spirit Siphon помогает против героя с большим запасом здоровья. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Disruptor": {
  "roles": [
   "hard_support"
  ],
  "secondary_roles": [
   "soft_support"
  ],
  "tags": [
   "control",
   "catch",
   "magic_damage",
   "teamfight"
  ],
  "counters": [
   "Storm Spirit",
   "Slark"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Doom": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "frontline",
   "farm_dependent"
  ],
  "counters": [
   "Storm Spirit",
   "Ember Spirit",
   "Timbersaw"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Dragon Knight": {
  "roles": [
   "mid",
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "frontline",
   "control",
   "push",
   "physical_damage",
   "waveclear"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Phantom Assassin": "Высокая броня помогает пережить физический урон; преимущество зависит от стадии и предметов"
  }
 },
 "Drow Ranger": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "scaling",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [
   "Magnus",
   "Mars"
  ],
  "conditional_counters": {}
 },
 "Earth Spirit": {
  "roles": [
   "soft_support"
  ],
  "secondary_roles": [
   "mid"
  ],
  "tags": [
   "initiation",
   "control",
   "magic_damage",
   "teamfight"
  ],
  "counters": [
   "Sniper"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Earthshaker": {
  "roles": [
   "soft_support"
  ],
  "secondary_roles": [
   "offlane",
   "mid"
  ],
  "tags": [
   "initiation",
   "control",
   "magic_damage",
   "burst",
   "teamfight"
  ],
  "counters": [
   "Phantom Lancer",
   "Naga Siren",
   "Chaos Knight"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Ember Spirit": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [],
  "tags": [
   "catch",
   "magic_damage",
   "physical_damage",
   "waveclear"
  ],
  "counters": [
   "Phantom Lancer"
  ],
  "countered_by": [
   "Doom",
   "Lion"
  ],
  "conditional_counters": {}
 },
 "Enchantress": {
  "roles": [
   "hard_support",
   "soft_support"
  ],
  "secondary_roles": [],
  "tags": [
   "sustain",
   "physical_damage",
   "push"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Ursa": "Untouchable затрудняет серии обычных атак. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Enigma": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [
   "soft_support"
  ],
  "tags": [
   "initiation",
   "control",
   "teamfight",
   "push",
   "farm_dependent"
  ],
  "counters": [
   "Lifestealer",
   "Juggernaut"
  ],
  "countered_by": [
   "Rubick",
   "Vengeful Spirit"
  ],
  "conditional_counters": {}
 },
 "Faceless Void": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "teamfight",
   "physical_damage",
   "scaling",
   "farm_dependent"
  ],
  "counters": [
   "Anti-Mage",
   "Weaver"
  ],
  "countered_by": [
   "Shadow Demon",
   "Tusk"
  ],
  "conditional_counters": {}
 },
 "Grimstroke": {
  "roles": [
   "hard_support",
   "soft_support"
  ],
  "secondary_roles": [],
  "tags": [
   "control",
   "save",
   "magic_damage",
   "teamfight",
   "waveclear"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Phantom Lancer": "Soulbind затрудняет уход, Stroke of Fate поражает скопления. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Gyrocopter": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "magic_damage",
   "teamfight",
   "waveclear",
   "farm_dependent"
  ],
  "counters": [
   "Phantom Lancer",
   "Naga Siren"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Hoodwink": {
  "roles": [
   "soft_support"
  ],
  "secondary_roles": [
   "hard_support"
  ],
  "tags": [
   "control",
   "burst",
   "physical_damage",
   "magic_damage",
   "waveclear"
  ],
  "counters": [
   "Bristleback"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Huskar": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [],
  "tags": [
   "frontline",
   "magic_damage",
   "sustain"
  ],
  "counters": [],
  "countered_by": [
   "Ancient Apparition"
  ],
  "conditional_counters": {
   "Ember Spirit": "Магическое сопротивление и давление на линии. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Invoker": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [],
  "tags": [
   "control",
   "magic_damage",
   "physical_damage",
   "teamfight",
   "scaling",
   "farm_dependent"
  ],
  "counters": [
   "Medusa"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Io": {
  "roles": [
   "hard_support",
   "soft_support"
  ],
  "secondary_roles": [],
  "tags": [
   "save",
   "sustain"
  ],
  "counters": [],
  "countered_by": [
   "Ancient Apparition"
  ],
  "conditional_counters": {}
 },
 "Jakiro": {
  "roles": [
   "hard_support"
  ],
  "secondary_roles": [
   "soft_support"
  ],
  "tags": [
   "control",
   "magic_damage",
   "teamfight",
   "push",
   "waveclear"
  ],
  "counters": [
   "Templar Assassin"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Juggernaut": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "sustain",
   "scaling",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [
   "Enigma"
  ],
  "conditional_counters": {
   "Venomancer": "Blade Fury помогает пережить магическое давление. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Keeper of the Light": {
  "roles": [
   "soft_support",
   "hard_support"
  ],
  "secondary_roles": [],
  "tags": [
   "sustain",
   "magic_damage",
   "waveclear"
  ],
  "counters": [
   "Phantom Lancer"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Kez": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "burst",
   "scaling",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {},
  "notes": "Подтверждённые устойчивые контрсвязи в этой редакции не заданы: требуется отдельная проверка актуальной версии способностей. Нулевые списки не означают отсутствие контрпиков в игре."
 },
 "Kunkka": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [
   "offlane"
  ],
  "tags": [
   "initiation",
   "control",
   "teamfight",
   "physical_damage",
   "waveclear",
   "save"
  ],
  "counters": [
   "Broodmother"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Legion Commander": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "catch",
   "physical_damage",
   "save"
  ],
  "counters": [
   "Anti-Mage",
   "Weaver"
  ],
  "countered_by": [
   "Outworld Destroyer",
   "Shadow Demon"
  ],
  "conditional_counters": {}
 },
 "Leshrac": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [
   "offlane"
  ],
  "tags": [
   "magic_damage",
   "push",
   "waveclear",
   "teamfight",
   "farm_dependent"
  ],
  "counters": [
   "Phantom Lancer",
   "Naga Siren"
  ],
  "countered_by": [
   "Nyx Assassin"
  ],
  "conditional_counters": {}
 },
 "Lich": {
  "roles": [
   "hard_support"
  ],
  "secondary_roles": [],
  "tags": [
   "magic_damage",
   "control",
   "save",
   "teamfight"
  ],
  "counters": [
   "Chaos Knight"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Lifestealer": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "sustain",
   "frontline",
   "scaling",
   "farm_dependent"
  ],
  "counters": [
   "Centaur Warrunner",
   "Primal Beast"
  ],
  "countered_by": [
   "Bane",
   "Beastmaster",
   "Enigma"
  ],
  "conditional_counters": {}
 },
 "Lina": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [
   "carry",
   "soft_support"
  ],
  "tags": [
   "magic_damage",
   "physical_damage",
   "burst",
   "control",
   "waveclear",
   "farm_dependent"
  ],
  "counters": [
   "Phoenix"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Lion": {
  "roles": [
   "soft_support",
   "hard_support"
  ],
  "secondary_roles": [],
  "tags": [
   "control",
   "catch",
   "magic_damage",
   "burst"
  ],
  "counters": [
   "Storm Spirit",
   "Ember Spirit"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Lone Druid": {
  "roles": [
   "mid",
   "offlane"
  ],
  "secondary_roles": [
   "carry"
  ],
  "tags": [
   "physical_damage",
   "push",
   "frontline",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Bane": "Медведь может прервать длительный контроль. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Luna": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "magic_damage",
   "push",
   "teamfight",
   "waveclear",
   "scaling",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Phantom Lancer": "Moon Glaives помогают зачищать иллюзии. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Lycan": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [
   "carry"
  ],
  "tags": [
   "physical_damage",
   "push",
   "farm_dependent"
  ],
  "counters": [
   "Sniper"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Magnus": {
  "roles": [
   "offlane",
   "mid"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "teamfight",
   "save",
   "physical_damage"
  ],
  "counters": [
   "Drow Ranger"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Marci": {
  "roles": [
   "soft_support"
  ],
  "secondary_roles": [
   "carry",
   "offlane"
  ],
  "tags": [
   "initiation",
   "control",
   "physical_damage",
   "burst",
   "save"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Sniper": "Быстрое сближение с уязвимой задней линией. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Mars": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "frontline",
   "teamfight"
  ],
  "counters": [
   "Drow Ranger"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Medusa": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "scaling",
   "farm_dependent",
   "frontline",
   "waveclear",
   "teamfight"
  ],
  "counters": [],
  "countered_by": [
   "Anti-Mage",
   "Invoker"
  ],
  "conditional_counters": {}
 },
 "Mirana": {
  "roles": [
   "soft_support",
   "hard_support"
  ],
  "secondary_roles": [],
  "tags": [
   "control",
   "magic_damage",
   "catch",
   "save",
   "waveclear"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Enigma": "Дальняя Sacred Arrow может прервать канал извне. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Monkey King": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [
   "mid",
   "soft_support"
  ],
  "tags": [
   "physical_damage",
   "control",
   "teamfight",
   "farm_dependent"
  ],
  "counters": [
   "Underlord"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Morphling": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "burst",
   "scaling",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [
   "Ancient Apparition"
  ],
  "conditional_counters": {
   "Juggernaut": "Waveform помогает уклониться от Omnislash. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Muerta": {
  "roles": [
   "carry",
   "soft_support"
  ],
  "secondary_roles": [],
  "tags": [
   "magic_damage",
   "physical_damage",
   "control",
   "scaling",
   "farm_dependent"
  ],
  "counters": [
   "Phantom Assassin"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Naga Siren": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "scaling",
   "farm_dependent",
   "push",
   "waveclear",
   "save"
  ],
  "counters": [],
  "countered_by": [
   "Earthshaker",
   "Gyrocopter",
   "Leshrac",
   "Underlord"
  ],
  "conditional_counters": {
   "Night Stalker": "Иллюзии затрудняют фокус одной цели. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Nature's Prophet": {
  "roles": [
   "carry",
   "offlane"
  ],
  "secondary_roles": [
   "mid",
   "soft_support"
  ],
  "tags": [
   "physical_damage",
   "push",
   "waveclear",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [
   "Spirit Breaker"
  ],
  "conditional_counters": {
   "Bane": "Призванные юниты могут прервать канал. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Night Stalker": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "catch",
   "control",
   "physical_damage",
   "frontline"
  ],
  "counters": [
   "Puck",
   "Storm Spirit"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Nyx Assassin": {
  "roles": [
   "soft_support"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "burst",
   "magic_damage",
   "catch"
  ],
  "counters": [
   "Leshrac"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Ogre Magi": {
  "roles": [
   "hard_support"
  ],
  "secondary_roles": [
   "soft_support"
  ],
  "tags": [
   "control",
   "sustain",
   "magic_damage",
   "frontline"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Phantom Assassin": "Магический урон обходит уклонение, но преимущество зависит от стадии и защиты от магии"
  }
 },
 "Oracle": {
  "roles": [
   "hard_support"
  ],
  "secondary_roles": [],
  "tags": [
   "save",
   "sustain",
   "magic_damage"
  ],
  "counters": [
   "Batrider"
  ],
  "countered_by": [
   "Ancient Apparition"
  ],
  "conditional_counters": {}
 },
 "Outworld Destroyer": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [],
  "tags": [
   "magic_damage",
   "burst",
   "save",
   "control",
   "scaling",
   "farm_dependent",
   "pure_damage"
  ],
  "counters": [
   "Axe",
   "Legion Commander"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Pangolier": {
  "roles": [
   "mid",
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "teamfight",
   "waveclear"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Naga Siren": "Массовые способности помогают против иллюзий. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Phantom Assassin": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "burst",
   "scaling",
   "farm_dependent"
  ],
  "counters": [
   "Sniper"
  ],
  "countered_by": [
   "Muerta",
   "Slardar"
  ],
  "conditional_counters": {}
 },
 "Phantom Lancer": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "scaling",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [
   "Bristleback",
   "Earthshaker",
   "Ember Spirit",
   "Gyrocopter",
   "Keeper of the Light",
   "Leshrac",
   "Sand King",
   "Sven",
   "Tiny",
   "Zeus"
  ],
  "conditional_counters": {}
 },
 "Phoenix": {
  "roles": [
   "soft_support",
   "hard_support"
  ],
  "secondary_roles": [
   "offlane"
  ],
  "tags": [
   "magic_damage",
   "teamfight",
   "sustain"
  ],
  "counters": [
   "Templar Assassin"
  ],
  "countered_by": [
   "Snapfire",
   "Troll Warlord",
   "Visage",
   "Lina"
  ],
  "conditional_counters": {}
 },
 "Primal Beast": {
  "roles": [
   "offlane",
   "mid"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "frontline",
   "magic_damage"
  ],
  "counters": [
   "Sniper"
  ],
  "countered_by": [
   "Lifestealer"
  ],
  "conditional_counters": {}
 },
 "Puck": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "catch",
   "magic_damage",
   "waveclear"
  ],
  "counters": [],
  "countered_by": [
   "Night Stalker"
  ],
  "conditional_counters": {
   "Storm Spirit": "Dream Coil и безмолвие мешают уходу. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Pugna": {
  "roles": [
   "soft_support",
   "hard_support",
   "mid"
  ],
  "secondary_roles": [],
  "tags": [
   "magic_damage",
   "push",
   "save",
   "sustain",
   "waveclear"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Ursa": "Decrepify может защитить цель от атак; зависит от развеиваний и предметов"
  }
 },
 "Queen of Pain": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [],
  "tags": [
   "magic_damage",
   "burst",
   "waveclear"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Templar Assassin": "Продолжительный урон Shadow Strike снимает Refraction. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Razor": {
  "roles": [
   "offlane",
   "mid"
  ],
  "secondary_roles": [
   "carry"
  ],
  "tags": [
   "physical_damage",
   "magic_damage",
   "frontline"
  ],
  "counters": [
   "Ursa",
   "Sven"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Ringmaster": {
  "roles": [
   "soft_support",
   "hard_support"
  ],
  "secondary_roles": [],
  "tags": [
   "control",
   "save",
   "magic_damage"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Legion Commander": "Escape Act позволяет спасти цель Duel. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Rubick": {
  "roles": [
   "soft_support"
  ],
  "secondary_roles": [
   "hard_support",
   "mid"
  ],
  "tags": [
   "control",
   "save",
   "magic_damage",
   "waveclear"
  ],
  "counters": [
   "Enigma"
  ],
  "countered_by": [],
  "conditional_counters": {
   "Magnus": "Преимущество зависит от доступного для кражи заклинания и позиции Rubick"
  }
 },
 "Sand King": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [
   "mid"
  ],
  "tags": [
   "initiation",
   "control",
   "magic_damage",
   "teamfight",
   "waveclear"
  ],
  "counters": [
   "Phantom Lancer",
   "Broodmother"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Shadow Demon": {
  "roles": [
   "soft_support",
   "hard_support"
  ],
  "secondary_roles": [],
  "tags": [
   "save",
   "control",
   "magic_damage"
  ],
  "counters": [
   "Legion Commander",
   "Faceless Void"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Shadow Fiend": {
  "roles": [
   "mid",
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "magic_damage",
   "burst",
   "waveclear",
   "scaling",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Templar Assassin": "Shadowraze может создавать давление на линии, но результат зависит от уровня Refraction и исполнения"
  }
 },
 "Shadow Shaman": {
  "roles": [
   "soft_support",
   "hard_support"
  ],
  "secondary_roles": [],
  "tags": [
   "control",
   "catch",
   "push",
   "magic_damage"
  ],
  "counters": [
   "Anti-Mage"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Silencer": {
  "roles": [
   "hard_support"
  ],
  "secondary_roles": [
   "mid"
  ],
  "tags": [
   "control",
   "magic_damage",
   "teamfight"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Enigma": "Global Silence прерывает канал при отсутствии защиты. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Slardar": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "catch",
   "physical_damage",
   "frontline"
  ],
  "counters": [
   "Weaver",
   "Phantom Assassin"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Slark": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "scaling",
   "farm_dependent",
   "sustain"
  ],
  "counters": [],
  "countered_by": [
   "Disruptor"
  ],
  "conditional_counters": {
   "Batrider": "Dark Pact снимает накопленные Sticky Napalm. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Snapfire": {
  "roles": [
   "soft_support",
   "hard_support"
  ],
  "secondary_roles": [
   "mid"
  ],
  "tags": [
   "magic_damage",
   "burst",
   "teamfight",
   "save",
   "waveclear"
  ],
  "counters": [
   "Phoenix"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Sniper": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [
   "carry"
  ],
  "tags": [
   "physical_damage",
   "scaling",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [
   "Clockwerk",
   "Earth Spirit",
   "Lycan",
   "Phantom Assassin",
   "Primal Beast",
   "Spectre",
   "Storm Spirit",
   "Void Spirit"
  ],
  "conditional_counters": {}
 },
 "Spectre": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "scaling",
   "farm_dependent",
   "frontline"
  ],
  "counters": [
   "Sniper"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Spirit Breaker": {
  "roles": [
   "soft_support"
  ],
  "secondary_roles": [
   "offlane"
  ],
  "tags": [
   "initiation",
   "catch",
   "control",
   "frontline"
  ],
  "counters": [
   "Nature's Prophet"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Storm Spirit": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "catch",
   "magic_damage",
   "scaling",
   "farm_dependent"
  ],
  "counters": [
   "Sniper",
   "Tinker"
  ],
  "countered_by": [
   "Anti-Mage",
   "Disruptor",
   "Doom",
   "Lion",
   "Night Stalker"
  ],
  "conditional_counters": {}
 },
 "Sven": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "burst",
   "control",
   "waveclear",
   "scaling",
   "farm_dependent"
  ],
  "counters": [
   "Phantom Lancer",
   "Chaos Knight"
  ],
  "countered_by": [
   "Razor"
  ],
  "conditional_counters": {}
 },
 "Techies": {
  "roles": [
   "soft_support"
  ],
  "secondary_roles": [
   "hard_support"
  ],
  "tags": [
   "magic_damage",
   "burst",
   "waveclear",
   "teamfight"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Templar Assassin": "Частый магический урон снимает Refraction. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Templar Assassin": {
  "roles": [
   "mid",
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "burst",
   "push",
   "scaling",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [
   "Batrider",
   "Jakiro",
   "Phoenix"
  ],
  "conditional_counters": {}
 },
 "Terrorblade": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "push",
   "scaling",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [
   "Dark Seer"
  ],
  "conditional_counters": {
   "Anti-Mage": "Сильный физический урон и иллюзии в прямом бою. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Tidehunter": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "frontline",
   "teamfight"
  ],
  "counters": [],
  "countered_by": [
   "Ursa"
  ],
  "conditional_counters": {
   "Phantom Lancer": "Anchor Smash и Ravage работают по иллюзиям. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Timbersaw": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [
   "mid"
  ],
  "tags": [
   "frontline",
   "waveclear",
   "sustain",
   "pure_damage"
  ],
  "counters": [
   "Treant Protector",
   "Undying"
  ],
  "countered_by": [
   "Ancient Apparition",
   "Doom"
  ],
  "conditional_counters": {}
 },
 "Tinker": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [],
  "tags": [
   "magic_damage",
   "burst",
   "waveclear",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [
   "Clockwerk",
   "Storm Spirit"
  ],
  "conditional_counters": {}
 },
 "Tiny": {
  "roles": [
   "mid",
   "soft_support"
  ],
  "secondary_roles": [
   "carry"
  ],
  "tags": [
   "initiation",
   "control",
   "burst",
   "physical_damage",
   "magic_damage",
   "waveclear"
  ],
  "counters": [
   "Phantom Lancer"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Treant Protector": {
  "roles": [
   "hard_support"
  ],
  "secondary_roles": [
   "soft_support"
  ],
  "tags": [
   "control",
   "teamfight",
   "save",
   "sustain",
   "frontline"
  ],
  "counters": [],
  "countered_by": [
   "Timbersaw"
  ],
  "conditional_counters": {
   "Storm Spirit": "Overgrowth ограничивает мобильность. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Troll Warlord": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "scaling",
   "farm_dependent",
   "sustain"
  ],
  "counters": [
   "Phoenix"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Tusk": {
  "roles": [
   "soft_support"
  ],
  "secondary_roles": [
   "hard_support"
  ],
  "tags": [
   "initiation",
   "control",
   "catch",
   "save",
   "physical_damage"
  ],
  "counters": [
   "Faceless Void"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Underlord": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "frontline",
   "control",
   "magic_damage",
   "waveclear",
   "save"
  ],
  "counters": [
   "Naga Siren",
   "Chaos Knight"
  ],
  "countered_by": [
   "Monkey King"
  ],
  "conditional_counters": {}
 },
 "Undying": {
  "roles": [
   "hard_support"
  ],
  "secondary_roles": [],
  "tags": [
   "frontline",
   "sustain",
   "magic_damage",
   "teamfight"
  ],
  "counters": [],
  "countered_by": [
   "Timbersaw"
  ],
  "conditional_counters": {
   "Centaur Warrunner": "Decay снижает силу на линии. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Ursa": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [],
  "tags": [
   "physical_damage",
   "burst",
   "farm_dependent"
  ],
  "counters": [
   "Axe",
   "Tidehunter"
  ],
  "countered_by": [
   "Bane",
   "Razor"
  ],
  "conditional_counters": {}
 },
 "Vengeful Spirit": {
  "roles": [
   "hard_support",
   "soft_support"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "save",
   "physical_damage"
  ],
  "counters": [
   "Enigma"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Venomancer": {
  "roles": [
   "hard_support",
   "offlane"
  ],
  "secondary_roles": [
   "soft_support"
  ],
  "tags": [
   "magic_damage",
   "teamfight",
   "waveclear"
  ],
  "counters": [
   "Axe"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Viper": {
  "roles": [
   "mid",
   "offlane"
  ],
  "secondary_roles": [],
  "tags": [
   "magic_damage",
   "physical_damage"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Bristleback": "Viper Strike подавляет важные пассивные способности. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется.",
   "Huskar": "Viper Strike подавляет важные пассивные способности. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Visage": {
  "roles": [
   "offlane"
  ],
  "secondary_roles": [
   "mid"
  ],
  "tags": [
   "magic_damage",
   "physical_damage",
   "burst",
   "push",
   "farm_dependent"
  ],
  "counters": [
   "Phoenix"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Void Spirit": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "catch",
   "burst",
   "magic_damage",
   "waveclear"
  ],
  "counters": [
   "Sniper"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Warlock": {
  "roles": [
   "hard_support"
  ],
  "secondary_roles": [],
  "tags": [
   "initiation",
   "control",
   "teamfight",
   "sustain",
   "magic_damage"
  ],
  "counters": [
   "Chaos Knight"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Weaver": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [
   "soft_support"
  ],
  "tags": [
   "physical_damage",
   "scaling",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [
   "Bounty Hunter",
   "Faceless Void",
   "Legion Commander",
   "Slardar"
  ],
  "conditional_counters": {
   "Lifestealer": "Мобильность помогает держать дистанцию от ближнего керри. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Windranger": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [
   "offlane",
   "soft_support"
  ],
  "tags": [
   "physical_damage",
   "control",
   "catch"
  ],
  "counters": [],
  "countered_by": [
   "Centaur Warrunner"
  ],
  "conditional_counters": {
   "Ursa": "Windrun затрудняет серии обычных атак. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Winter Wyvern": {
  "roles": [
   "hard_support",
   "soft_support"
  ],
  "secondary_roles": [],
  "tags": [
   "save",
   "sustain",
   "control",
   "teamfight",
   "magic_damage"
  ],
  "counters": [
   "Chaos Knight"
  ],
  "countered_by": [],
  "conditional_counters": {}
 },
 "Witch Doctor": {
  "roles": [
   "hard_support"
  ],
  "secondary_roles": [
   "soft_support"
  ],
  "tags": [
   "control",
   "sustain",
   "burst",
   "teamfight"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Timbersaw": "Maledict и Death Ward угрожают герою, принимающему длительный урон. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Wraith King": {
  "roles": [
   "carry"
  ],
  "secondary_roles": [
   "offlane"
  ],
  "tags": [
   "physical_damage",
   "control",
   "frontline",
   "scaling",
   "farm_dependent"
  ],
  "counters": [],
  "countered_by": [],
  "conditional_counters": {
   "Faceless Void": "Reincarnation даёт вторую жизнь после Chronosphere. Зависит от позиции, стадии, предметов или версии способностей; численный бонус не начисляется."
  }
 },
 "Zeus": {
  "roles": [
   "mid"
  ],
  "secondary_roles": [],
  "tags": [
   "magic_damage",
   "burst",
   "waveclear"
  ],
  "counters": [
   "Phantom Lancer"
  ],
  "countered_by": [],
  "conditional_counters": {}
 }
};
const DRAFT_COUNTER_REASONS = {
 "Ancient Apparition|Huskar": "Ice Blast ограничивает восстановление здоровья",
 "Ancient Apparition|Alchemist": "Ice Blast ограничивает восстановление здоровья",
 "Ancient Apparition|Morphling": "Ice Blast ограничивает восстановление здоровья",
 "Ancient Apparition|Io": "Ice Blast ограничивает восстановление здоровья",
 "Ancient Apparition|Timbersaw": "Ice Blast ограничивает восстановление здоровья",
 "Ancient Apparition|Dazzle": "Ice Blast ограничивает восстановление здоровья",
 "Ancient Apparition|Oracle": "Ice Blast ограничивает восстановление здоровья",
 "Anti-Mage|Medusa": "Выжигание маны и Mana Void против зависимости от маны",
 "Anti-Mage|Storm Spirit": "Выжигание маны и Mana Void против зависимости от маны",
 "Axe|Dazzle": "Culling Blade против Shallow Grave; массовый контроль и Counter Helix против иллюзий",
 "Bane|Ursa": "Контроль сквозь невосприимчивость к эффектам",
 "Bane|Lifestealer": "Контроль сквозь невосприимчивость к эффектам",
 "Batrider|Templar Assassin": "Частый урон снимает Refraction",
 "Beastmaster|Lifestealer": "Primal Roar даёт контроль сквозь невосприимчивость к эффектам",
 "Bounty Hunter|Weaver": "Track помогает отслеживать героя с невидимостью",
 "Bristleback|Phantom Lancer": "Частый массовый урон против иллюзий",
 "Centaur Warrunner|Windranger": "Return наказывает частые атаки Focus Fire",
 "Clockwerk|Sniper": "Доступ к задней линии и прерывание Battery Assault",
 "Clockwerk|Tinker": "Доступ к задней линии и прерывание Battery Assault",
 "Dark Seer|Terrorblade": "Wall создаёт сильные иллюзии физического керри",
 "Disruptor|Storm Spirit": "Glimpse и Static Storm ограничивают уход из боя",
 "Disruptor|Slark": "Glimpse и Static Storm ограничивают уход из боя",
 "Doom|Storm Spirit": "Длительное выключение способностей",
 "Doom|Ember Spirit": "Длительное выключение способностей",
 "Doom|Timbersaw": "Длительное выключение способностей",
 "Earth Spirit|Sniper": "Доступ к задней линии и контроль",
 "Earthshaker|Phantom Lancer": "Echo Slam использует скопления юнитов",
 "Earthshaker|Naga Siren": "Echo Slam использует скопления юнитов",
 "Earthshaker|Chaos Knight": "Echo Slam использует скопления юнитов",
 "Ember Spirit|Phantom Lancer": "Массовые атаки и магический урон против иллюзий",
 "Enigma|Lifestealer": "Black Hole контролирует сквозь невосприимчивость к эффектам",
 "Enigma|Juggernaut": "Black Hole контролирует сквозь невосприимчивость к эффектам",
 "Faceless Void|Anti-Mage": "Chronosphere не позволяет использовать способности ухода",
 "Faceless Void|Weaver": "Chronosphere не позволяет использовать способности ухода",
 "Gyrocopter|Phantom Lancer": "Flak Cannon и массовый урон против иллюзий",
 "Gyrocopter|Naga Siren": "Flak Cannon и массовый урон против иллюзий",
 "Hoodwink|Bristleback": "Sharpshooter накладывает истощение пассивных способностей",
 "Invoker|Medusa": "EMP лишает маны для Mana Shield",
 "Jakiro|Templar Assassin": "Продолжительный урон снимает Refraction",
 "Keeper of the Light|Phantom Lancer": "Illuminate наносит массовый урон иллюзиям",
 "Kunkka|Broodmother": "Tidebringer и массовые способности против пауков",
 "Legion Commander|Anti-Mage": "Duel не позволяет использовать уход",
 "Legion Commander|Weaver": "Duel не позволяет использовать уход",
 "Leshrac|Phantom Lancer": "Постоянный массовый магический урон против иллюзий",
 "Leshrac|Naga Siren": "Постоянный массовый магический урон против иллюзий",
 "Lich|Chaos Knight": "Frost Shield снижает физический урон; Chain Frost использует скопления",
 "Lifestealer|Centaur Warrunner": "Урон и восстановление против героев с высоким здоровьем",
 "Lifestealer|Primal Beast": "Урон и восстановление против героев с высоким здоровьем",
 "Lion|Storm Spirit": "Быстрый контроль ограничивает мобильных героев",
 "Lion|Ember Spirit": "Быстрый контроль ограничивает мобильных героев",
 "Lycan|Sniper": "Быстрое сближение и давление несколькими юнитами",
 "Magnus|Drow Ranger": "Принудительное сближение и массовый контроль",
 "Mars|Drow Ranger": "Arena ограничивает дальние атаки; Bulwark снижает фронтальный урон",
 "Monkey King|Underlord": "Jingu Mastery наказывает затяжной контакт в ближнем бою",
 "Muerta|Phantom Assassin": "Магический урон Pierce the Veil обходит уклонение от атак",
 "Night Stalker|Puck": "Зона безмолвия мешает использовать уход",
 "Night Stalker|Storm Spirit": "Зона безмолвия мешает использовать уход",
 "Nyx Assassin|Leshrac": "Spiked Carapace позволяет оглушить Leshrac в ответ на постоянный урон по области",
 "Oracle|Batrider": "Fortune’s End снимает Sticky Napalm, Fate’s Edict защищает от магического урона",
 "Outworld Destroyer|Axe": "Astral Imprisonment спасает союзника от фокусировки во время контроля",
 "Outworld Destroyer|Legion Commander": "Astral Imprisonment спасает союзника от фокусировки во время контроля",
 "Phantom Assassin|Sniper": "Phantom Strike позволяет быстро сблизиться",
 "Phoenix|Templar Assassin": "Частый урон снимает Refraction",
 "Primal Beast|Sniper": "Onslaught даёт доступ к задней линии",
 "Razor|Ursa": "Static Link снижает урон ближнего керри",
 "Razor|Sven": "Static Link снижает урон ближнего керри",
 "Rubick|Enigma": "Дальнее прерывание и угроза кражи Black Hole",
 "Sand King|Phantom Lancer": "Массовый урон против множества юнитов",
 "Sand King|Broodmother": "Массовый урон против множества юнитов",
 "Shadow Demon|Legion Commander": "Disruption спасает союзника от фокусировки извне",
 "Shadow Demon|Faceless Void": "Disruption спасает союзника от фокусировки извне",
 "Shadow Shaman|Anti-Mage": "Мгновенный Hex ограничивает уход",
 "Slardar|Weaver": "Corrosive Haze раскрывает невидимость и снижает броню",
 "Slardar|Phantom Assassin": "Corrosive Haze раскрывает невидимость и снижает броню",
 "Snapfire|Phoenix": "Lil’ Shredder позволяет быстро атаковать Supernova",
 "Spectre|Sniper": "Глобальный доступ к уязвимой задней линии",
 "Spirit Breaker|Nature's Prophet": "Глобальное преследование мешает раздельному давлению",
 "Storm Spirit|Sniper": "Быстрый доступ к задней линии",
 "Storm Spirit|Tinker": "Быстрый доступ к задней линии",
 "Sven|Phantom Lancer": "Cleave против скоплений иллюзий",
 "Sven|Chaos Knight": "Cleave против скоплений иллюзий",
 "Timbersaw|Treant Protector": "Whirling Death особенно опасен героям силы",
 "Timbersaw|Undying": "Whirling Death особенно опасен героям силы",
 "Tiny|Phantom Lancer": "Массовый урон Avalanche и атак по области",
 "Troll Warlord|Phoenix": "Высокая скорость атак против Supernova",
 "Tusk|Faceless Void": "Snowball может спасти союзника от Chronosphere извне",
 "Underlord|Naga Siren": "Firestorm и Atrophy Aura против иллюзий и физического урона",
 "Underlord|Chaos Knight": "Firestorm и Atrophy Aura против иллюзий и физического урона",
 "Ursa|Axe": "Fury Swipes усиливает урон в затяжном ближнем бою",
 "Ursa|Tidehunter": "Fury Swipes усиливает урон в затяжном ближнем бою",
 "Vengeful Spirit|Enigma": "Nether Swap может прервать Black Hole сквозь невосприимчивость",
 "Venomancer|Axe": "Продолжительное замедление затрудняет сближение и использование Blink",
 "Visage|Phoenix": "Дополнительные атаки фамильяров против Supernova",
 "Void Spirit|Sniper": "Доступ к задней линии и взрывной урон",
 "Warlock|Chaos Knight": "Fatal Bonds наказывает скопление иллюзий",
 "Winter Wyvern|Chaos Knight": "Winter’s Curse использует урон соседних юнитов",
 "Zeus|Phantom Lancer": "Массовый магический урон против иллюзий",
 "Abaddon|Batrider": "Aphotic Shield даёт сильное развеивание для спасения союзника от Flaming Lasso",
 "Lina|Phoenix": "Fiery Soul позволяет быстро атаковать Supernova"
};
