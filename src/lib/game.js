export {
  buildCustomQuest,
  buildDirective,
  CATEGORY_META,
  describeBenefits,
  DIFFICULTY_META,
  formatRewards,
  getGoalProgress,
  getLevel,
  getRank,
  getTotalPower,
  normalizeCategory,
  sentenceCase,
  STAT_META,
  summarizeProfile,
} from "../../shared/game.js";

export function sortQuests(quests) {
  return [...quests].sort((left, right) => {
    if (left.completed !== right.completed) {
      return Number(left.completed) - Number(right.completed);
    }

    const leftDue = getDueMinutes(left.dueTime);
    const rightDue = getDueMinutes(right.dueTime);

    if (leftDue !== rightDue) {
      return leftDue - rightDue;
    }

    return right.xp - left.xp;
  });
}

export function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatShortDate(dayKey, isLive) {
  if (isLive) {
    return "Today";
  }

  const [year, month, day] = dayKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function getDueMinutes(dueTime) {
  if (!dueTime || !/^\d{2}:\d{2}$/.test(dueTime)) {
    return Number.POSITIVE_INFINITY;
  }

  const [hour, minute] = dueTime.split(":").map(Number);
  return (hour * 60) + minute;
}

export function formatDueTime(dueTime) {
  if (!dueTime || !/^\d{2}:\d{2}$/.test(dueTime)) {
    return "No deadline";
  }

  const [rawHour, rawMinute] = dueTime.split(":").map(Number);
  const hour = rawHour % 12 || 12;
  const suffix = rawHour >= 12 ? "PM" : "AM";
  return `${hour}:${String(rawMinute).padStart(2, "0")} ${suffix}`;
}

export function getQuestDeadlineMeta(quest, timeZone = "UTC") {
  const dueTime = quest?.dueTime;

  if (!dueTime || !/^\d{2}:\d{2}$/.test(dueTime)) {
    return {
      label: "No deadline",
      tone: "neutral",
      overdue: false,
      dueSoon: false,
    };
  }

  const [dueHour, dueMinute] = dueTime.split(":").map(Number);
  const dueMinutes = (dueHour * 60) + dueMinute;

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date())
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
  const currentMinutes = (Number(parts.hour) * 60) + Number(parts.minute);
  const minutesLeft = dueMinutes - currentMinutes;
  const baseLabel = `Due by ${formatDueTime(dueTime)}`;

  if (quest.completed) {
    return {
      label: `Cleared before ${formatDueTime(dueTime)}`,
      tone: "complete",
      overdue: false,
      dueSoon: false,
    };
  }

  if (minutesLeft < 0) {
    return {
      label: `Overdue since ${formatDueTime(dueTime)}`,
      tone: "danger",
      overdue: true,
      dueSoon: false,
    };
  }

  if (minutesLeft <= 90) {
    return {
      label: `${baseLabel} · ${minutesLeft} min left`,
      tone: "warning",
      overdue: false,
      dueSoon: true,
    };
  }

  return {
    label: baseLabel,
    tone: "neutral",
    overdue: false,
    dueSoon: false,
  };
}
