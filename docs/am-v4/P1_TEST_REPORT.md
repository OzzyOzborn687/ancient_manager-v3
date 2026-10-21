# AM V4 — фаза 1: результаты проверок

Полный прогон: `RESULTS_DIR=/tmp/am-v4-p1-final2 node tests/run.cjs` — **37/37 PASS**. Никакие существующие тесты не ослаблялись и не переписывались. После финальной правки охвата fame отдельно перепроверены tests/qualifiers.cjs и tests/world-v1.2.cjs.

| Тест | Результат | Секунды |
| --- | --- | ---: |
| ai-tactics.cjs | PASS | 0.2 |
| auto-fatigue-v26.cjs | PASS | 0.2 |
| balance-v1.3.cjs | PASS | 20.9 |
| balance-v26.cjs | PASS | 2.6 |
| balance-v8.cjs | PASS | 52.3 |
| career-v1.3.cjs | PASS | 14.8 |
| career-v1.cjs | PASS | 0.4 |
| coach-return.cjs | PASS | 0.1 |
| comebacks.cjs | PASS | 70.5 |
| decisions-v8.cis | PASS | 234.5 |
| defense-v8.cjs | PASS | 0.1 |
| development-v21.cjs | PASS | 18.1 |
| difficulty.cjs | PASS | 4.3 |
| engine-v6.cjs | PASS | 60 |
| fatigue-v26.cjs | PASS | 0.5 |
| interface-v2.cjs | PASS | 1.5 |
| interface-v8.cjs | PASS | 0.9 |
| match-rules.cjs | PASS | 2.3 |
| match-v22.cjs | PASS | 1.8 |
| match-v26.cjs | PASS | 0.1 |
| model-v8.cjs | PASS | 1.3 |
| native-adapter.cjs | PASS | 0 |
| neon-tournaments.cjs | PASS | 0.1 |
| neon-ui.cjs | PASS | 0.1 |
| player-retirement.cjs | PASS | 0.3 |
| qualifiers-performance.cjs | PASS | 0.7 |
| qualifiers.cjs | PASS | 2.2 |
| recovery-v21.cjs | PASS | 0.9 |
| recovery-v26.cjs | PASS | 1.1 |
| reshuffle-positions.cjs | PASS | 0.3 |
| startup.cjs | PASS | 8.2 |
| tactics-mirror.cjs | PASS | 13.5 |
| tactics-v1.1.cjs | PASS | 3.9 |
| ti-event.cjs | PASS | 0.7 |
| ti-festival.cjs | PASS | 1.5 |
| variation-v7.cjs | PASS | 12.7 |
| world-v1.2.cjs | PASS | 7.1 |

## Chromium

Все три браузерных скрипта прошли на финальном коде перед PR. Результаты сохранялись в /tmp, а не в test-results/.

| Проверка | Результат |
| --- | --- |
| Общий интерфейс, 22 раздела × 390/590/1440 | 66/66 PASS |
| Существующие групповые/плей-офф форматы | 16/16 PASS |
| TI-ивент, четыре вкладки × четыре ширины | 16/16 PASS |
| P1: пять форматов × 390/590/1440 | 15/15 PASS |
| P1: локальные ресурсы рейтинга, старт турнира, загрузка | PASS |
| JS-ошибки в трёх сценариях | 0 |

Это проверка совместимости p1. Экран квалификаций с тремя вкладками ещё не создан; он относится к p4.

## Производительность

100 замеров на текущем поле: 24 клуба, 120 игроков. Измерения сделаны в этой облачной среде; гарантия скорости конкретного телефона из них не выводится.

| Операция | Медиана, мс | p95, мс |
| --- | ---: | ---: |
| Прежний tick | 1.146 | 2.308 |
| Обычный новый tick | 1.154 | 1.390 |
| День объявления приглашений | 1.264 | 1.786 |
| Все регионы одного события | 0.147 | 0.332 |

Добавленное время обычного дня по медианам: 0.008 мс. Дополнение сцены Tier 2/3 пока не реализовано; его скорость будет измерена в p2.

## Сохранность и границы

SHA-256 совпали для всех 238 файлов в Ancient-Manager-v2.1/ и test-results/. Main и Pages не менялись.

Проверено 100 составов (пять форматов × 20 сидов), крайние случаи гарантий/конфликтов, реальная эквивалентность старому qualify13 по исходам/RNG/усталости, сохранение новых результатов, откат будущих кешей при TI-реконструкции и идемпотентность fame. 200 сезонов с Tier 1/2/3 не запускались: сцена и окончательные сетки ещё впереди.

Машинные сводки: p1-checks.json, p1-performance.json, p1-browser.json.
