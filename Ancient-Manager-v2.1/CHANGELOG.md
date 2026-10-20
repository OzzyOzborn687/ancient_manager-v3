# Восстановление клуба — 20 October 2026

- Added Recovery to Development: five levels. Fatigue accumulation divisors: 1 / 1.4 / 2 / 2.75 / 3.5. Daily recovery multipliers outside tournaments: 1 / 1.25 / 1.5 / 1.75 / 2.
- Level 1 is the default; upgrades to levels 2–5 cost $125,000 / $250,000 / $450,000 / $700,000. Map fatigue (manual, automatic, AI, scrims and legacy formats) and intensive training use the club's recovery level. Inside tournaments, daily recovery keeps its previous rate; paid rest stays at −15 / −30 fatigue.
- Paid tournament rest is limited to two purchases for groups/qualifiers and two for playoffs, still no more than one package per series. Basic and premium packages share the limit. Swiss, seeding and last-chance rounds use the group allowance; upper/lower brackets and finals share the playoff allowance. Limits persist on save/reload and reset for a new tournament.
- Existing careers start Recovery at level 1 without changing other upgrades. Old saves only recorded the last paid-rest series; migration counts that known purchase once in its original stage. Earlier unrecorded purchases cannot be reconstructed.
- Tested deployed HTML (including the pinned tournament script), actual calendar ticks and a complete map/finish, save/reload, costs/locks, quota exhaustion, stage transitions and legacy purchase migration. Both dist trees are updated and script cache keys refreshed.

# Баланс камбэков — 19 October 2026

- Reduced compounded gold/rating snowball while retaining item, XP, draft and execution advantages.
- Added earned deficit kill bounties, stronger high-ground defense and local objective strength checks.
- Synced both editable dist trees; refreshed script cache keys; existing saves remain compatible.
- Added full-production-stack seeded balance and mechanics regression tests. See BALANCE.md for formulas, before/after results and limitations.

# v2.1 — 19 October 2026

- Rebuilt the shell and home layout around the supplied reference: a club header, six large left controls including time advancement, centered news and compact standings, a right fixture rail and working previous/next event controls. All prior sections remain available through All sections, Settings and Saves.
- Added 21 historical main-event slots from 2024 and 23 from 2025 as the templates for 2026 and 2027. Dates, venues and source links are retained; later years alternate the templates with continuous fictional edition numbering. DreamLeague 25 uses the actual extended March 4 finish. TI 2027 retains the requested $30m pool.
- Replaced only unplayed pending events during migration. Active event objects/IDs, played brackets and results remain unchanged. Overlapping career participation moves forward while baseline dates stay visible; the full-year plan includes pre-career dates for read-only inspection.
- Added Development: five levels each for the training base and staff, fixed costs, budget/lock/cap guards and migration of previously purchased levels.
- The base builds preparation over calendar days and gives a frozen +1–5% maximum team-efficiency bonus per new map. Already-running legacy maps gain no retroactive bonus.
- Replaced training-to-flat-form behavior with official-result history, a calendar-time peak, title effects, inactivity decline and one-time relative early-exit penalties (5–8: 4%; 9+: 7%). Scrims do not farm official form progression.
- Potential realization is gradual and bounded by potential, with result, energy and staff effects. Tests: ideal winning-season peak at day 72 with level-1 staff and day 60 with level-5 staff; +0.54 and +1.08 OVR over 90 days in the controlled fixture.
- Verified startup/reload/migration, profile/navigation/awards, retirement, TI recovery, coach handoff, historical templates, upgrade economy/locks, form and skill progression, active-calendar preservation, frozen buffs, Swiss table rows and a complete automatic tournament through the new development hooks. Browser visual QA unavailable.

# v2.0 — 19 October 2026

- New responsive purple/blue management interface inspired by the supplied references, with light panels, a redesigned club dashboard and permanent match-center navigation.
- Preserved all career sections, tournament simulation, scrims, transfers, training, saves, TI event and player retirement.
- Searchable player directory and full-page dossiers: first/family names, country, career position/region, OVR, form, price and observed portraits. No personality descriptions.
- Liquipedia biographical sources linked in dossiers; CyberScore portrait attribution. Unknown/generated biographies stay blank; failed image loads show an honest fallback.
- Career-aware club tags from Liquipedia match abbreviations, updated dynamically when players change clubs; custom tags are respected.
- Hall of awards with calendar-year and club selectors, based on saved tournament champions; completion dates are retained for future awards.
- Existing save versions remain accepted; current saves identify version 2.0.
- Validation: startup/reload/migration, full v2 navigation/profile/filter/award checks, retirement, career simulation, scrims, coach return and TI recovery suites passed. Browser visual QA unavailable in this environment.

# Позиции решафлов, эмблема XG и свободные агенты · 16.10.2026

- В решафлах оцениваются все пять позиций относительно игроков той же роли. Повтор недавно изменённой позиции имеет меньший вес.
- При узком рынке свободных агентов доступны оплаченные обмены сопоставимых игроков между клубами ИИ; состав пользователя не затрагивается.
- Для Xtreme Gaming установлен квадратный логотип из Steam и центрирование эмблемы без искажения пропорций.
- Parker: позиция 1, игровой рейтинг 92, потенциал 96. Tailung: позиция 2, рейтинг 94, потенциал 99. Оба добавляются свободными агентами в новые и существующие карьеры один раз.

# Возврат из режима тренера · 16.10.2026

- Кнопка «Вернуться к обычной симуляции» доступна на паузе и во время автоматического участия.
- Незаконченная карта, золото, состав и счёт сохраняются; управление возвращается в пошаговый режим без запуска часов.
- Уже начатая серия других клубов завершается один раз перед возвратом к следующему матчу игрока. Поддерживается продолжение из сохранения.

# Исправление подключения файлов · 16.10.2026

- В HTML возвращено подключение world-v1.2.js перед world-v1.3.js; устранено повторное подключение v1.3.
- Исправлена ошибка «Can’t find variable: initV12» при загрузке.
- Проверка запуска использует фактические теги script из index.html и проверяет уникальность и порядок зависимостей.

# Исправление запуска v1.3 · 16.10.2026

- Ограничено ожидание запросов чтения и записи IndexedDB; зависший запрос не блокирует загрузку копии из localStorage.
- Запись сохранений приостановлена до успешного завершения переноса и первого отображения карьеры.
- Ошибка запуска показывает причину, повторную попытку и скачивание исходного сохранения вместо бесконечного экрана загрузки.
- Обновлены параметры кеширования файлов игры.
- Проверен полный boot новой карьеры, загрузка v1.3, перенос v1.2, зависшее/запрещённое хранилище, ошибка миграции и сохранность исходных данных.

# Ancient Manager v1.3

- Единая формула развития всех клубов, убывающая отдача от тренировок, пять характеристик и практика героев.
- Даты серий, зарплаты и контракты внутри турниров; перенос пересекающихся событий в календаре карьеры.
- Бюджеты ИИ, расходы, призовые, улучшение базы/тренера, возвратный заём один раз в сезон.
- Переговоры о зарплате и месте в составе. Освобождение контракта переводит игрока в свободные агенты без выдуманного покупателя.
- Решафлы зависят от последних результатов, финансов и доступных замен.
- Изменения восьми героев в каждом игровом патче, бонусы клубам сохранены. Эффекты фиксируются на карту.
- Сборки предметов по роли, герою и контролю соперника; упрощённые игровые эффекты.
- Награды поступают полностью; сняты лимит изменения перевеса и искусственный таймер запрета на победу.
- Ручные отрезки 1/3/5/10 минут; отключаемые автопаузы перед дракой, Рошаном и осадой базы.
- Автоматическое участие тренера, сезонные очки, Elo, приглашения и отборочные BO3.
- Платная разведка и тренировочные серии КВ BO2. Цена КВ зависит от рейтинга игроков и силы клуба; оплата один раз, доход сопернику, практика/усталость обоим клубам, без призовых и очков.
- Три ключевых эпизода после карты; история КВ и разборы в истории матчей.
- Collapse (94, офлейн), fy (92, позиция 4), Paparazi (91, мид), xNova (89, позиция 5), Xxs (92, офлейн) добавляются свободными агентами. Статус и рейтинги — сценарий игры. Источники биографий: Liquipedia; карьерные пулы: Dotabuff, проверены 16.10.2026. Ссылки доступны в профиле каждого игрока.
- Старые карьеры сохраняют деньги, состав и ход начатой карты. КВ и автоматическое участие продолжаются после загрузки; фоновые вкладки ставят их на паузу.

Проверка: сценарии v1.3, все восемь форматов сеток, настоящие BO2 КВ и полный FISSURE под управлением тренера, перенос сохранений/сдача/контракты/финансы, контроль 100 карт равных команд. Проверка интерфейса — программная; браузерная визуальная проверка недоступна в текущем окружении.
