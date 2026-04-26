export const STAT_META = {
  vitality: {
    label: "Vitality",
    copy: "Health, stamina, recovery, and physical confidence.",
    benefits: ["health", "stamina", "recovery"],
  },
  wealth: {
    label: "Wealth",
    copy: "Savings discipline, leverage, and financial optionality.",
    benefits: ["money awareness", "savings discipline", "optionality"],
  },
  intellect: {
    label: "Intellect",
    copy: "Knowledge depth, reasoning range, and pattern recognition.",
    benefits: ["knowledge", "reasoning", "pattern recognition"],
  },
  focus: {
    label: "Focus",
    copy: "Discipline, consistency, and execution speed.",
    benefits: ["discipline", "consistency", "execution speed"],
  },
};

export const CATEGORY_META = {
  health: {
    label: "Health",
    rewards: { vitality: 8, wealth: 0, intellect: 0, focus: 2 },
    defaultUnit: "minutes",
    defaultTarget: 25,
    defaultDescription: "Builds energy, movement quality, recovery, and physical resilience.",
    defaultDueTime: "20:30",
  },
  mind: {
    label: "Mind",
    rewards: { vitality: 1, wealth: 0, intellect: 2, focus: 8 },
    defaultUnit: "minutes",
    defaultTarget: 10,
    defaultDescription: "Settles stress, sharpens self-control, and improves calm execution.",
    defaultDueTime: "22:00",
  },
  money: {
    label: "Money",
    rewards: { vitality: 0, wealth: 8, intellect: 1, focus: 3 },
    defaultUnit: "minutes",
    defaultTarget: 15,
    defaultDescription: "Improves financial visibility, savings, and better money decisions.",
    defaultDueTime: "21:00",
  },
  intelligence: {
    label: "Intelligence",
    rewards: { vitality: 0, wealth: 0, intellect: 8, focus: 3 },
    defaultUnit: "pages",
    defaultTarget: 15,
    defaultDescription: "Raises comprehension, memory, and reasoning range.",
    defaultDueTime: "22:15",
  },
  skills: {
    label: "Skills",
    rewards: { vitality: 0, wealth: 4, intellect: 5, focus: 6 },
    defaultUnit: "minutes",
    defaultTarget: 30,
    defaultDescription: "Compounds marketable skills, execution quality, and output.",
    defaultDueTime: "21:30",
  },
};

const CATEGORY_ALIASES = {
  physical: "health",
  financial: "money",
  intellectual: "intelligence",
  genius: "mind",
};

export const DIFFICULTY_META = {
  foundation: { label: "Foundation", multiplier: 1 },
  hunter: { label: "Hunter", multiplier: 1.24 },
  monarch: { label: "Monarch", multiplier: 1.58 },
};

export const GOAL_META = [
  {
    label: "Physically Fit",
    description: "Build a stronger frame with more stamina and recovery.",
    getValue: (profile) => profile.stats.vitality,
    target: 260,
  },
  {
    label: "Financially Independent",
    description: "Stack smarter decisions, leverage, and money discipline.",
    getValue: (profile) => profile.stats.wealth,
    target: 280,
  },
  {
    label: "Intellectually High",
    description: "Grow comprehension, memory, and pattern recognition.",
    getValue: (profile) => profile.stats.intellect,
    target: 260,
  },
  {
    label: "Genius Mode",
    description: "Blend intellect and focus into hard-to-ignore output.",
    getValue: (profile) => Math.round((profile.stats.intellect + profile.stats.focus) / 2),
    target: 300,
  },
];

export const STARTER_QUESTS = [
  {
    id: "starter-mobility",
    name: "10-Minute Mobility Reset",
    category: "health",
    difficulty: "foundation",
    target: 10,
    unit: "minutes",
    step: 5,
    xp: 20,
    dueTime: "09:30",
    description: "Loosen your hips, shoulders, and back before the day hardens into stiffness.",
    rewards: { vitality: 6, wealth: 0, intellect: 0, focus: 2 },
    custom: false,
  },
  {
    id: "starter-walk",
    name: "25-Minute Strength Or Brisk Walk Block",
    category: "health",
    difficulty: "foundation",
    target: 25,
    unit: "minutes",
    step: 5,
    xp: 30,
    dueTime: "20:30",
    description: "Gym, bodyweight circuit, or brisk walk. The win is one honest movement block.",
    rewards: { vitality: 9, wealth: 0, intellect: 0, focus: 3 },
    custom: false,
  },
  {
    id: "starter-hydration",
    name: "Protein Breakfast + 2L Hydration Check",
    category: "health",
    difficulty: "foundation",
    target: 1,
    unit: "check-in",
    step: 1,
    xp: 22,
    dueTime: "11:00",
    description: "A simple nutrition anchor that lifts energy and makes later decisions easier.",
    rewards: { vitality: 7, wealth: 0, intellect: 0, focus: 2 },
    custom: false,
  },
  {
    id: "starter-mind",
    name: "10-Minute Meditation Or Breath Reset",
    category: "mind",
    difficulty: "foundation",
    target: 10,
    unit: "minutes",
    step: 5,
    xp: 22,
    dueTime: "22:00",
    description: "Downshifts stress and gives your attention a clean reset.",
    rewards: { vitality: 1, wealth: 0, intellect: 2, focus: 7 },
    custom: false,
  },
  {
    id: "starter-plan",
    name: "10-Minute Night Shutdown + Tomorrow Plan",
    category: "mind",
    difficulty: "foundation",
    target: 10,
    unit: "minutes",
    step: 5,
    xp: 24,
    dueTime: "22:45",
    description: "Close open loops, set your top tasks, and make the next morning easier to execute.",
    rewards: { vitality: 0, wealth: 1, intellect: 2, focus: 7 },
    custom: false,
  },
  {
    id: "starter-money",
    name: "Log Today's Spending + Savings Check",
    category: "money",
    difficulty: "foundation",
    target: 1,
    unit: "check-in",
    step: 1,
    xp: 24,
    dueTime: "21:00",
    description: "Know where the money went and confirm savings stayed protected today.",
    rewards: { vitality: 0, wealth: 9, intellect: 1, focus: 3 },
    custom: false,
  },
  {
    id: "starter-cashflow",
    name: "15-Minute Income Or Money Admin Block",
    category: "money",
    difficulty: "hunter",
    target: 15,
    unit: "minutes",
    step: 5,
    xp: 32,
    dueTime: "20:45",
    description: "Invoice, follow up, compare a bill, review a statement, or move money with intention.",
    rewards: { vitality: 0, wealth: 10, intellect: 1, focus: 4 },
    custom: false,
  },
  {
    id: "starter-read",
    name: "Read 15 Pages",
    category: "intelligence",
    difficulty: "foundation",
    target: 15,
    unit: "pages",
    step: 5,
    xp: 26,
    dueTime: "22:15",
    description: "A realistic daily reading block that steadily grows knowledge and reasoning.",
    rewards: { vitality: 0, wealth: 0, intellect: 8, focus: 3 },
    custom: false,
  },
  {
    id: "starter-recall",
    name: "Write 5 Recall Notes From Today's Learning",
    category: "intelligence",
    difficulty: "foundation",
    target: 5,
    unit: "notes",
    step: 1,
    xp: 24,
    dueTime: "22:30",
    description: "Write the main ideas in your own words so the knowledge actually sticks.",
    rewards: { vitality: 0, wealth: 0, intellect: 7, focus: 4 },
    custom: false,
  },
  {
    id: "starter-skill",
    name: "30-Minute Deep Skill Practice",
    category: "skills",
    difficulty: "hunter",
    target: 30,
    unit: "minutes",
    step: 10,
    xp: 36,
    dueTime: "21:30",
    description: "One focused block on a real skill compounds faster than scattered effort.",
    rewards: { vitality: 0, wealth: 4, intellect: 5, focus: 6 },
    custom: false,
  },
];

export function createId(prefix = "item") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyStats() {
  return {
    vitality: 0,
    wealth: 0,
    intellect: 0,
    focus: 0,
  };
}

export function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getTodayKey(timeZone = "UTC", date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = Object.fromEntries(
      formatter
        .formatToParts(date)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );
    return `${parts.year}-${parts.month}-${parts.day}`;
  } catch (error) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

export function parseDayKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function diffDays(startKey, endKey) {
  const start = parseDayKey(startKey);
  const end = parseDayKey(endKey);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
}

export function deriveStep(unit, target) {
  const lowerUnit = unit.toLowerCase();

  if (lowerUnit.includes("check")) {
    return 1;
  }

  if (lowerUnit.includes("rep")) {
    return target >= 100 ? 10 : 5;
  }

  if (lowerUnit.includes("minute")) {
    return target >= 60 ? 15 : 5;
  }

  if (lowerUnit.includes("page")) {
    return target >= 20 ? 5 : 2;
  }

  if (target <= 10) {
    return 1;
  }

  if (target <= 30) {
    return 5;
  }

  return 10;
}

export function getTargetMultiplier(target, unit) {
  const lowerUnit = unit.toLowerCase();

  if (lowerUnit.includes("check")) {
    return 0.92;
  }

  if (lowerUnit.includes("minute")) {
    if (target >= 90) {
      return 1.34;
    }
    if (target >= 60) {
      return 1.22;
    }
    if (target >= 30) {
      return 1.1;
    }
  }

  if (lowerUnit.includes("rep")) {
    if (target >= 100) {
      return 1.28;
    }
    if (target >= 50) {
      return 1.14;
    }
  }

  if (lowerUnit.includes("page")) {
    if (target >= 30) {
      return 1.18;
    }
    if (target >= 20) {
      return 1.08;
    }
  }

  return target >= 60 ? 1.22 : target >= 30 ? 1.1 : 1;
}

export function normalizeCategory(category) {
  const key = String(category || "").trim().toLowerCase();
  if (CATEGORY_META[key]) {
    return key;
  }
  if (CATEGORY_ALIASES[key]) {
    return CATEGORY_ALIASES[key];
  }
  return "skills";
}

export function normalizeDueTime(value, fallback = "21:00") {
  const source = String(value || "").trim();

  if (!source) {
    return fallback;
  }

  const match = /^(\d{1,2}):(\d{2})$/.exec(source);
  if (!match) {
    return fallback;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return fallback;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function normalizeQuest(candidate) {
  const category = normalizeCategory(candidate.category);
  const categoryMeta = CATEGORY_META[category];
  const target = Math.max(1, Number(candidate.target) || 1);
  const unit = typeof candidate.unit === "string" && candidate.unit.trim() ? candidate.unit.trim() : "steps";
  const progress = clampNumber(Number(candidate.progress) || 0, 0, target);
  const rewards = {
    vitality: 0,
    wealth: 0,
    intellect: 0,
    focus: 0,
    ...(candidate.rewards || {}),
  };

  return {
    id: typeof candidate.id === "string" ? candidate.id : createId("quest"),
    name: typeof candidate.name === "string" && candidate.name.trim() ? candidate.name.trim() : "Untitled Quest",
    category,
    difficulty: DIFFICULTY_META[candidate.difficulty] ? candidate.difficulty : "foundation",
    target,
    unit,
    step: Math.max(1, Number(candidate.step) || deriveStep(unit, target)),
    xp: Math.max(10, Number(candidate.xp) || 10),
    description: typeof candidate.description === "string" && candidate.description.trim()
      ? candidate.description.trim()
      : "Daily progress compounds into visible growth.",
    rewards: {
      vitality: Math.max(0, Number(rewards.vitality) || 0),
      wealth: Math.max(0, Number(rewards.wealth) || 0),
      intellect: Math.max(0, Number(rewards.intellect) || 0),
      focus: Math.max(0, Number(rewards.focus) || 0),
    },
    progress,
    dueTime: normalizeDueTime(candidate.dueTime, categoryMeta.defaultDueTime),
    completed: Boolean(candidate.completed),
    completedAt: candidate.completedAt || null,
    custom: Boolean(candidate.custom),
    createdAt: candidate.createdAt || new Date().toISOString(),
  };
}

export function createStarterQuests() {
  return STARTER_QUESTS.map((quest) => normalizeQuest(quest));
}

export function mergeStarterQuests(quests = []) {
  const starterQuests = createStarterQuests();
  const starterById = new Map(starterQuests.map((quest) => [quest.id, quest]));
  const normalizedExisting = Array.isArray(quests)
    ? quests.map((quest) => normalizeQuest(quest))
    : [];

  const merged = normalizedExisting.map((quest) => {
    const starterQuest = starterById.get(quest.id);

    if (!starterQuest || quest.custom) {
      return quest;
    }

    if (quest.completed || quest.progress > 0) {
      return quest;
    }

    return normalizeQuest({
      ...starterQuest,
      createdAt: quest.createdAt,
      progress: 0,
      completed: false,
      completedAt: null,
      custom: false,
    });
  });

  const existingIds = new Set(merged.map((quest) => quest.id));
  starterQuests.forEach((starterQuest) => {
    if (!existingIds.has(starterQuest.id)) {
      merged.push(starterQuest);
    }
  });

  return merged;
}

export function createProfile({ name = "", timeZone = "UTC" } = {}) {
  return {
    displayName: name,
    timeZone,
    lastReset: getTodayKey(timeZone),
    xp: 0,
    streak: 0,
    stats: createEmptyStats(),
    quests: createStarterQuests(),
    history: [],
  };
}

export function normalizeProfile(profile, fallbackName = "") {
  const timeZone = typeof profile?.timeZone === "string" && profile.timeZone.trim() ? profile.timeZone : "UTC";
  const stats = {
    ...createEmptyStats(),
    ...(profile?.stats || {}),
  };

  return {
    displayName: typeof profile?.displayName === "string" && profile.displayName.trim()
      ? profile.displayName.trim()
      : fallbackName,
    timeZone,
    lastReset: typeof profile?.lastReset === "string" && profile.lastReset ? profile.lastReset : getTodayKey(timeZone),
    xp: Math.max(0, Number(profile?.xp) || 0),
    streak: Math.max(0, Number(profile?.streak) || 0),
    stats: {
      vitality: Math.max(0, Number(stats.vitality) || 0),
      wealth: Math.max(0, Number(stats.wealth) || 0),
      intellect: Math.max(0, Number(stats.intellect) || 0),
      focus: Math.max(0, Number(stats.focus) || 0),
    },
    quests: Array.isArray(profile?.quests) && profile.quests.length
      ? mergeStarterQuests(profile.quests)
      : createStarterQuests(),
    history: Array.isArray(profile?.history)
      ? profile.history.slice(0, 30).map((entry) => ({
          date: typeof entry?.date === "string" && entry.date ? entry.date : getTodayKey(timeZone),
          completionRate: clampNumber(Number(entry?.completionRate) || 0, 0, 100),
          completedCount: Math.max(0, Number(entry?.completedCount) || 0),
          totalCount: Math.max(0, Number(entry?.totalCount) || 0),
          xpEarned: Math.max(0, Number(entry?.xpEarned) || 0),
        }))
      : [],
  };
}

export function updateProfileTimeZone(profile, timeZone) {
  if (typeof timeZone === "string" && timeZone.trim() && timeZone.trim().length <= 80) {
    profile.timeZone = timeZone.trim();
  }
}

export function summarizeProfile(profile) {
  const totalCount = profile.quests.length;
  const completedQuests = profile.quests.filter((quest) => quest.completed);
  const completedCount = completedQuests.length;
  const todayXp = completedQuests.reduce((sum, quest) => sum + quest.xp, 0);

  return {
    totalCount,
    completedCount,
    completionRate: totalCount ? Math.round((completedCount / totalCount) * 100) : 0,
    todayXp,
  };
}

export function ensureCurrentDay(profile) {
  const today = getTodayKey(profile.timeZone || "UTC");

  if (!profile.lastReset) {
    profile.lastReset = today;
    return false;
  }

  if (profile.lastReset === today) {
    return false;
  }

  const summary = summarizeProfile(profile);
  const gap = diffDays(profile.lastReset, today);

  profile.history = [
    {
      date: profile.lastReset,
      completionRate: summary.completionRate,
      completedCount: summary.completedCount,
      totalCount: summary.totalCount,
      xpEarned: summary.todayXp,
    },
    ...(Array.isArray(profile.history) ? profile.history : []),
  ].slice(0, 30);

  if (gap === 1 && summary.completionRate >= 70) {
    profile.streak += 1;
  } else {
    profile.streak = 0;
  }

  profile.quests = profile.quests.map((quest) => ({
    ...quest,
    progress: 0,
    completed: false,
    completedAt: null,
  }));
  profile.lastReset = today;
  return true;
}

export function buildCustomQuest(values) {
  const category = normalizeCategory(values.category);
  const difficulty = DIFFICULTY_META[values.difficulty] ? values.difficulty : "hunter";
  const categoryMeta = CATEGORY_META[category];
  const difficultyMeta = DIFFICULTY_META[difficulty];
  const target = Math.max(1, Number(values.target) || categoryMeta.defaultTarget);
  const unit = typeof values.unit === "string" && values.unit.trim() ? values.unit.trim() : categoryMeta.defaultUnit;
  const effortMultiplier = getTargetMultiplier(target, unit);
  const rewards = {};

  Object.entries(categoryMeta.rewards).forEach(([key, baseValue]) => {
    rewards[key] = Math.max(0, Math.round(baseValue * difficultyMeta.multiplier * effortMultiplier));
  });

  return normalizeQuest({
    id: createId("quest"),
    name: values.name,
    category,
    difficulty,
    target,
    unit,
    step: deriveStep(unit, target),
    xp: Math.round((Object.values(rewards).reduce((sum, value) => sum + value, 0) * 2.4) + 8),
    description: values.description || categoryMeta.defaultDescription,
    dueTime: normalizeDueTime(values.dueTime, categoryMeta.defaultDueTime),
    rewards,
    custom: true,
  });
}

export function addCustomQuest(profile, values) {
  const quest = buildCustomQuest(values);
  profile.quests.push(quest);
  return quest;
}

export function changeQuestProgress(profile, questId, nextProgress) {
  const quest = profile.quests.find((item) => item.id === questId);
  if (!quest) {
    return null;
  }

  const clampedProgress = clampNumber(Number(nextProgress) || 0, 0, quest.target);
  const wasCompleted = quest.completed;
  const isCompleted = clampedProgress >= quest.target;

  quest.progress = clampedProgress;

  if (!wasCompleted && isCompleted) {
    quest.completed = true;
    quest.completedAt = new Date().toISOString();
    addRewards(profile.stats, quest.rewards);
    profile.xp += quest.xp;
  } else if (wasCompleted && !isCompleted) {
    quest.completed = false;
    quest.completedAt = null;
    removeRewards(profile.stats, quest.rewards);
    profile.xp = Math.max(0, profile.xp - quest.xp);
  }

  return quest;
}

export function removeQuest(profile, questId) {
  const quest = profile.quests.find((item) => item.id === questId);
  if (!quest) {
    return false;
  }

  if (quest.completed) {
    removeRewards(profile.stats, quest.rewards);
    profile.xp = Math.max(0, profile.xp - quest.xp);
  }

  profile.quests = profile.quests.filter((item) => item.id !== questId);
  return true;
}

export function addRewards(stats, rewards) {
  Object.keys(stats).forEach((key) => {
    stats[key] += rewards[key] || 0;
  });
}

export function removeRewards(stats, rewards) {
  Object.keys(stats).forEach((key) => {
    stats[key] = Math.max(0, stats[key] - (rewards[key] || 0));
  });
}

export function getLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

export function getTotalPower(profile) {
  return Object.values(profile.stats).reduce((sum, value) => sum + value, 0) + profile.xp;
}

export function getRank(power) {
  if (power >= 1500) {
    return "Monarch";
  }
  if (power >= 1150) {
    return "S-Rank";
  }
  if (power >= 850) {
    return "A-Rank";
  }
  if (power >= 600) {
    return "B-Rank";
  }
  if (power >= 400) {
    return "C-Rank";
  }
  if (power >= 240) {
    return "D-Rank";
  }
  if (power >= 120) {
    return "E-Rank";
  }
  return "Unawakened";
}

export function getGoalStage(percent) {
  if (percent >= 100) {
    return "Legendary";
  }
  if (percent >= 75) {
    return "Ascended";
  }
  if (percent >= 50) {
    return "Elite";
  }
  if (percent >= 25) {
    return "Momentum";
  }
  return "Foundation";
}

export function getGoalProgress(profile) {
  return GOAL_META.map((goal) => {
    const value = goal.getValue(profile);
    const percent = clampNumber(Math.round((value / goal.target) * 100), 0, 100);

    return {
      label: goal.label,
      description: goal.description,
      percent,
      stage: getGoalStage(percent),
    };
  });
}

export function buildDirective(profile) {
  if (!profile.quests.length) {
    return {
      title: "Forge your next quest.",
      copy: "Custom quests keep the system aligned with the life you actually want.",
    };
  }

  const weakestStat = Object.entries(profile.stats).sort((left, right) => left[1] - right[1])[0][0];
  const targetQuest = profile.quests
    .filter((quest) => !quest.completed)
    .sort((left, right) => {
      const weakestGap = (right.rewards[weakestStat] || 0) - (left.rewards[weakestStat] || 0);
      if (weakestGap !== 0) {
        return weakestGap;
      }
      return right.xp - left.xp;
    })[0];

  if (!targetQuest) {
    return {
      title: "All quests cleared. Protect the gains.",
      copy: "Use the rest of the day for recovery, stretching, journaling, or sleep.",
    };
  }

  return {
    title: `Raise ${STAT_META[weakestStat].label} next.`,
    copy: `${targetQuest.name} is your best current move. It grants ${formatRewards(targetQuest.rewards)} and ${targetQuest.xp} XP.`,
  };
}

export function formatRewards(rewards) {
  const parts = Object.entries(rewards)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `+${value} ${STAT_META[key].label}`);

  return parts.length ? parts.join(", ") : "no rewards";
}

export function describeBenefits(rewards) {
  const benefits = [];

  Object.entries(rewards).forEach(([key, value]) => {
    if (value > 0) {
      benefits.push(...STAT_META[key].benefits);
    }
  });

  return joinWords([...new Set(benefits)].slice(0, 3));
}

export function joinWords(values) {
  if (!values.length) {
    return "steady progress";
  }
  if (values.length === 1) {
    return values[0];
  }
  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }
  return `${values[0]}, ${values[1]}, and ${values[2]}`;
}

export function sentenceCase(text) {
  if (!text) {
    return "";
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}
