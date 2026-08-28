/**
 * 战技名称升级：同牌型连续压制等级映射（纯展示，不改规则）
 */
(function (global) {
  /** @type {{ type: string, level: number, name: string, description: string }[]} */
  const BATTLE_SKILLS = [
    // 单张
    {
      type: 'single',
      level: 1,
      name: '孤锋出鞘',
      description: '一柄孤剑划破黑暗，独自迎战命运。',
    },
    {
      type: 'single',
      level: 2,
      name: '破影之刃',
      description: '剑锋突破阴影，精准命中敌人的弱点。',
    },
    {
      type: 'single',
      level: 3,
      name: '圣剑裁决',
      description: '圣光附于剑身，凡挡路者皆受审判。',
    },
    {
      type: 'single',
      level: 4,
      name: '终焉一击',
      description: '最后一剑落下，战场迎来终结。',
    },
    // 对子
    {
      type: 'pair',
      level: 1,
      name: '双生契约',
      description: '两股相同的力量缔结契约，产生魔力共鸣。',
    },
    {
      type: 'pair',
      level: 2,
      name: '血契双刃',
      description: '双重力量觉醒，锋芒足以撕裂铠甲。',
    },
    {
      type: 'pair',
      level: 3,
      name: '圣辉双刃',
      description: '圣光降临，两柄神刃同时闪耀。',
    },
    {
      type: 'pair',
      level: 4,
      name: '终焉双刃',
      description: '两道终极剑锋合一，无人能够抵挡。',
    },
    // 三条
    {
      type: 'triple',
      level: 1,
      name: '圣域三锋',
      description: '三柄圣刃守护领域，形成绝对防线。',
    },
    {
      type: 'triple',
      level: 2,
      name: '三界轰鸣',
      description: '三重魔力震荡天地，敌人难以招架。',
    },
    {
      type: 'triple',
      level: 3,
      name: '三圣裁决',
      description: '三股力量同时降临，展开联合审判。',
    },
    {
      type: 'triple',
      level: 4,
      name: '神罚三连',
      description: '三道神罚同时落下，宣告战斗终结。',
    },
    // 四条
    {
      type: 'quad',
      level: 1,
      name: '四象封印',
      description: '四种力量汇聚，形成无法突破的封锁。',
    },
    {
      type: 'quad',
      level: 2,
      name: '四重觉醒',
      description: '四股相同魔力同时爆发，形成压倒性的力量。',
    },
    {
      type: 'quad',
      level: 3,
      name: '四界禁阵',
      description: '四方力量组成禁忌法阵，封锁天空。',
    },
    {
      type: 'quad',
      level: 4,
      name: '四神囚笼',
      description: '连神明也无法逃脱的终极封印。',
    },
    // 顺子
    {
      type: 'straight',
      level: 1,
      name: '幻影连斩',
      description: '五道剑影接连出现，攻击如暴雨般降临。',
    },
    {
      type: 'straight',
      level: 2,
      name: '星陨连击',
      description: '星辰化作剑雨，连续冲击敌人的防线。',
    },
    {
      type: 'straight',
      level: 3,
      name: '无间剑阵',
      description: '剑影首尾相连，形成没有间隙的攻击领域。',
    },
    {
      type: 'straight',
      level: 4,
      name: '无限剑域',
      description: '剑之领域展开，连绵攻势永不停歇。',
    },
    // 同花
    {
      type: 'flush',
      level: 1,
      name: '元素共鸣',
      description: '同源元素汇聚，释放纯净魔力。',
    },
    {
      type: 'flush',
      level: 2,
      name: '元素觉醒',
      description: '沉睡的元素之力逐渐苏醒。',
    },
    {
      type: 'flush',
      level: 3,
      name: '元素洪流',
      description: '五道元素力量汇聚成毁灭洪流。',
    },
    {
      type: 'flush',
      level: 4,
      name: '元素神域',
      description: '元素规则臣服于掌控者之手。',
    },
    // 三带二
    {
      type: 'fullhouse',
      level: 1,
      name: '骑士军团',
      description: '核心骑士率领护卫，组成战斗阵型。',
    },
    {
      type: 'fullhouse',
      level: 2,
      name: '皇家卫队',
      description: '王国精锐加入战场，守护荣耀。',
    },
    {
      type: 'fullhouse',
      level: 3,
      name: '荣耀远征',
      description: '骑士大军踏上不可阻挡的征途。',
    },
    {
      type: 'fullhouse',
      level: 4,
      name: '帝国军势',
      description: '整个帝国的力量皆为你而战。',
    },
    // 四带一
    {
      type: 'fourone',
      level: 1,
      name: '王权降临',
      description: '王之印记出现，力量开始觉醒。',
    },
    {
      type: 'fourone',
      level: 2,
      name: '王座审判',
      description: '至高权柄降下，无人能够挑战。',
    },
    {
      type: 'fourone',
      level: 3,
      name: '皇权天威',
      description: '皇者威严覆盖整个战场。',
    },
    {
      type: 'fourone',
      level: 4,
      name: '永恒君临',
      description: '永恒王权降临，万物低首。',
    },
    // 天子（同花顺）
    {
      type: 'flushstraight',
      level: 1,
      name: '神圣序曲',
      description: '五张圣印连接，奏响命运的第一章。',
    },
    {
      type: 'flushstraight',
      level: 2,
      name: '天命圣歌',
      description: '神谕回应召唤，圣光照耀战场。',
    },
    {
      type: 'flushstraight',
      level: 3,
      name: '诸神乐章',
      description: '众神之力共鸣，命运开始改变。',
    },
    {
      type: 'flushstraight',
      level: 4,
      name: '终焉神谕',
      description: '来自远古神明的最终裁决。',
    },
  ];

  const byTypeLevel = {};
  for (let i = 0; i < BATTLE_SKILLS.length; i++) {
    const row = BATTLE_SKILLS[i];
    if (!byTypeLevel[row.type]) byTypeLevel[row.type] = {};
    byTypeLevel[row.type][row.level] = row;
  }

  function isFreeLeadMarker(ev) {
    return !!(ev && ev.kind === 'system' && /自由出牌/.test(ev.text || ''));
  }

  function playTypeOfEvent(ev) {
    if (!ev || ev.kind !== 'play' || !ev.cards || !ev.cards.length) return null;
    if (!global.PokerRules || typeof global.PokerRules.identifyPlay !== 'function') {
      return null;
    }
    const play = global.PokerRules.identifyPlay(ev.cards);
    return play ? play.type : null;
  }

  /**
   * 从事件流末尾起，统计当前同牌型连续压制次数（遇异型或自由出牌分界则停）。
   */
  function countSameTypeStreak(events) {
    const list = events || [];
    let lastPlayIdx = -1;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].kind === 'play') {
        lastPlayIdx = i;
        break;
      }
      if (isFreeLeadMarker(list[i])) {
        return { type: null, count: 0 };
      }
    }
    if (lastPlayIdx < 0) return { type: null, count: 0 };

    const type = playTypeOfEvent(list[lastPlayIdx]);
    if (!type) return { type: null, count: 0 };

    let count = 0;
    for (let i = lastPlayIdx; i >= 0; i--) {
      const ev = list[i];
      if (isFreeLeadMarker(ev)) break;
      if (ev.kind !== 'play') continue;
      const t = playTypeOfEvent(ev);
      if (t !== type) break;
      count += 1;
    }
    return { type: type, count: count };
  }

  /**
   * 若即将出某牌型：自由出为 1；压同型为当前 streak+1；压异型为 1。
   */
  function previewStreakCount(events, playType, lastPlay) {
    if (!playType) return 0;
    if (!lastPlay) return 1;
    if (lastPlay.type !== playType) return 1;
    const streak = countSameTypeStreak(events);
    if (streak.type === playType && streak.count > 0) return streak.count + 1;
    return 1;
  }

  /**
   * @returns {{ type, level, name, description, streak, displayName, titleText }|null}
   */
  function resolveSkill(type, streakCount) {
    if (!type || !streakCount || streakCount < 1) return null;
    const level = Math.min(4, streakCount);
    const row = (byTypeLevel[type] && byTypeLevel[type][level]) || null;
    if (!row) return null;
    const bracketName = '【' + row.name + '】';
    const displayName =
      streakCount > 4 ? bracketName + ' X ' + streakCount : bracketName;
    return {
      type: row.type,
      level: row.level,
      name: row.name,
      description: row.description,
      streak: streakCount,
      displayName: displayName,
      titleText: row.description,
    };
  }

  function resolveFromEvents(events) {
    const streak = countSameTypeStreak(events);
    return resolveSkill(streak.type, streak.count);
  }

  global.PokerBattleSkills = {
    list: BATTLE_SKILLS,
    countSameTypeStreak: countSameTypeStreak,
    previewStreakCount: previewStreakCount,
    resolveSkill: resolveSkill,
    resolveFromEvents: resolveFromEvents,
  };
})(typeof window !== 'undefined' ? window : global);