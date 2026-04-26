import { useEffect, useMemo, useRef, useState } from 'react';

import { createQuest, deleteQuest, updateQuestProgress } from './lib/api.js';
import {
  buildCustomQuest,
  buildDirective,
  CATEGORY_META,
  describeBenefits,
  formatDueTime,
  formatLongDate,
  formatRewards,
  formatShortDate,
  getGoalProgress,
  getLevel,
  getQuestDeadlineMeta,
  getRank,
  getTotalPower,
  sentenceCase,
  sortQuests,
  STAT_META,
  summarizeProfile,
} from './lib/game.js';

const TAB_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'quests', label: 'Quests' },
  { id: 'progress', label: 'Progress' },
  { id: 'history', label: 'History' },
  { id: 'settings', label: 'Settings' },
];

const THEME_OPTIONS = [
  { id: 'light', label: 'White', description: 'Bright and clean.' },
  { id: 'dark', label: 'Dark', description: 'Low-light focus mode.' },
  { id: 'green', label: 'Green', description: 'Forest command center.' },
];

function createInitialForm() {
  return {
    name: '',
    category: 'skills',
    difficulty: 'hunter',
    target: String(CATEGORY_META.skills.defaultTarget),
    unit: CATEGORY_META.skills.defaultUnit,
    description: '',
    dueTime: CATEGORY_META.skills.defaultDueTime,
  };
}

export default function DashboardPage({
  profile,
  user,
  onLogout,
  onSessionChange,
}) {
  const [form, setForm] = useState(createInitialForm);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [questFilter, setQuestFilter] = useState('all');
  const [theme, setTheme] = useState(() =>
    readPreference(user.id, 'theme', 'light'),
  );
  const [soundEnabled, setSoundEnabled] = useState(
    () => readPreference(user.id, 'sound', 'on') === 'on',
  );
  const [pendingQuestId, setPendingQuestId] = useState('');
  const [pendingCreate, setPendingCreate] = useState(false);
  const [pendingLogout, setPendingLogout] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const audioContextRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writePreference(user.id, 'theme', theme);
  }, [theme, user.id]);

  useEffect(() => {
    writePreference(user.id, 'sound', soundEnabled ? 'on' : 'off');
  }, [soundEnabled, user.id]);

  const summary = summarizeProfile(profile);
  const totalPower = getTotalPower(profile);
  const level = getLevel(profile.xp);
  const rank = getRank(totalPower);
  const directive = buildDirective(profile);
  const liveStreak =
    summary.completionRate >= 70 ? profile.streak + 1 : profile.streak;
  const sortedQuests = useMemo(
    () => sortQuests(profile.quests),
    [profile.quests],
  );
  const filteredQuests = useMemo(() => {
    if (questFilter === 'all') {
      return sortedQuests;
    }

    return sortedQuests.filter((quest) => quest.category === questFilter);
  }, [questFilter, sortedQuests]);
  const goalProgress = getGoalProgress(profile);
  const previewQuest = buildCustomQuest({
    ...form,
    target: Number(form.target) || 1,
  });
  const recentHistory = useMemo(() => {
    const items = profile.history.slice(0, 6).reverse();
    items.push({
      date: profile.lastReset,
      completionRate: summary.completionRate,
      live: true,
    });
    return items;
  }, [profile.history, profile.lastReset, summary.completionRate]);
  const todayQuests = useMemo(() => sortedQuests.slice(0, 5), [sortedQuests]);
  const urgentQuests = useMemo(
    () => sortedQuests.filter((quest) => !quest.completed).slice(0, 4),
    [sortedQuests],
  );
  const categoryCards = useMemo(() => {
    return Object.entries(CATEGORY_META).map(([key, meta]) => {
      const quests = profile.quests.filter((quest) => quest.category === key);
      const completed = quests.filter((quest) => quest.completed).length;
      const percent = quests.length
        ? Math.round((completed / quests.length) * 100)
        : 0;

      return {
        key,
        label: meta.label,
        completed,
        total: quests.length,
        percent,
      };
    });
  }, [profile.quests]);
  const overdueQuests = useMemo(
    () =>
      sortedQuests.filter((quest) => {
        const deadlineMeta = getQuestDeadlineMeta(quest, profile.timeZone);
        return !quest.completed && deadlineMeta.overdue;
      }),
    [profile.timeZone, sortedQuests],
  );

  async function handleQuestProgress(quest, nextProgress) {
    setError('');
    setNotice('');
    setPendingQuestId(quest.id);

    try {
      const payload = await updateQuestProgress(quest.id, nextProgress);
      const nextQuest = payload.profile.quests.find(
        (item) => item.id === quest.id,
      );
      const completedNow = Boolean(
        nextQuest && !quest.completed && nextQuest.completed,
      );
      const nextLevel = getLevel(payload.profile.xp);
      const nextRank = getRank(getTotalPower(payload.profile));
      const promotedNow = nextLevel > level || nextRank !== rank;

      if (completedNow || promotedNow) {
        await playFeedback(audioContextRef, {
          completedNow,
          promotedNow,
          soundEnabled,
        });
      }

      if (promotedNow) {
        setNotice(
          `Promotion achieved. You are now level ${nextLevel} and rank ${nextRank}.`,
        );
      } else if (completedNow) {
        setNotice(`${quest.name} completed. Rewards claimed.`);
      }

      onSessionChange(payload);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPendingQuestId('');
    }
  }

  async function handleDeleteQuest(questId) {
    const confirmed = window.confirm(
      'Remove this custom quest from the system?',
    );
    if (!confirmed) {
      return;
    }

    setError('');
    setNotice('');
    setPendingQuestId(questId);

    try {
      const payload = await deleteQuest(questId);
      onSessionChange(payload);
      setNotice('Custom quest removed.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPendingQuestId('');
    }
  }

  async function handleCreateQuest(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setPendingCreate(true);

    try {
      const payload = await createQuest({
        ...form,
        target: Number(form.target) || 1,
      });
      onSessionChange(payload);
      setForm(createInitialForm());
      setNotice('Custom quest added to your mission board.');
      setActiveTab('quests');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPendingCreate(false);
    }
  }

  async function handleLogoutClick() {
    setPendingLogout(true);

    try {
      await onLogout();
    } finally {
      setPendingLogout(false);
    }
  }

  function updateForm(field, value) {
    setForm((current) => {
      const next = {
        ...current,
        [field]: value,
      };

      if (field === 'category' && CATEGORY_META[value]) {
        const categoryMeta = CATEGORY_META[value];
        next.target = String(categoryMeta.defaultTarget);
        next.unit = categoryMeta.defaultUnit;
        next.dueTime = categoryMeta.defaultDueTime;
        if (!current.description.trim()) {
          next.description = categoryMeta.defaultDescription;
        }
      }

      return next;
    });
  }

  return (
    <div className='page-shell'>
      <div className='backdrop-grid' aria-hidden='true'></div>
      <div className='backdrop-orb orb-one' aria-hidden='true'></div>
      <div className='backdrop-orb orb-two' aria-hidden='true'></div>

      <header className='app-bar panel'>
        <div>
          <p className='eyebrow'>Ascension System</p>
          <h1 className='app-bar-title'>Your personal progression system</h1>
        </div>

        <div className='app-bar-actions'>
          <div className='user-chip'>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>

          <button
            className='ghost-button'
            disabled={pendingLogout}
            onClick={handleLogoutClick}
            type='button'
          >
            {pendingLogout ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </header>

      {error ? <p className='banner error-banner'>{error}</p> : null}
      {notice ? <p className='banner notice-banner'>{notice}</p> : null}

      <section className='command-strip panel reveal'>
        <div className='command-strip-copy'>
          <p className='eyebrow'>Live Command Deck</p>
          <h2>{directive.title}</h2>
          <p>{directive.copy}</p>
        </div>

        <div className='command-strip-stats'>
          <div>
            <span>Date</span>
            <strong>{formatLongDate()}</strong>
          </div>
          <div>
            <span>Level / Rank</span>
            <strong>
              {level} / {rank}
            </strong>
          </div>
          <div>
            <span>Streak</span>
            <strong>
              {liveStreak} day{liveStreak === 1 ? '' : 's'}
            </strong>
          </div>
        </div>
      </section>

      <nav className='tab-bar panel' aria-label='Primary sections'>
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.id}
            aria-pressed={activeTab === tab.id}
            className={`tab-button ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type='button'
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'dashboard' ? (
        <>
          <header className='hero panel reveal'>
            <div className='hero-copy'>
              <p className='eyebrow'>Daily Evolution Console</p>
              <h1>Focused growth, not screen overload.</h1>
              <p className='hero-text'>
                Your quests now live in focused sections with realistic
                categories, daily deadlines, sound cues, and screen-adaptive
                layouts for mobile through desktop.
              </p>

              <div className='goal-tags' aria-label='Primary goals'>
                <span>Physically Fit</span>
                <span>Financially Independent</span>
                <span>Intellectually High</span>
                <span>Genius-Level Focus</span>
              </div>

              <section className='directive'>
                <p className='directive-label'>Today's System Directive</p>
                <h2>{directive.title}</h2>
                <p>{directive.copy}</p>
              </section>
            </div>

            <aside className='hero-panel'>
              <div className='hero-meta'>
                <span>Total Power</span>
                <strong>{totalPower}</strong>
              </div>

              <div
                className='level-ring'
                style={{ '--level-progress': `${profile.xp % 100}%` }}
              >
                <div className='level-ring-inner'>
                  <span>{level}</span>
                  <small>Level</small>
                </div>
              </div>

              <div className='hero-stats'>
                <div>
                  <span>Rank</span>
                  <strong>{rank}</strong>
                </div>
                <div>
                  <span>XP To Next</span>
                  <strong>{100 - (profile.xp % 100)}</strong>
                </div>
                <div>
                  <span>Quest Completion</span>
                  <strong>{summary.completionRate}%</strong>
                </div>
              </div>
            </aside>
          </header>

          <section className='status-grid reveal'>
            <article className='status-card panel'>
              <span>Live Streak</span>
              <strong>
                {liveStreak} day{liveStreak === 1 ? '' : 's'}
              </strong>
              <p>Keep completion above 70% to extend the chain.</p>
            </article>

            <article className='status-card panel'>
              <span>Today's XP</span>
              <strong>{summary.todayXp} XP</strong>
              <p>Rewards only trigger when a quest is fully cleared.</p>
            </article>

            <article className='status-card panel'>
              <span>Active Quests</span>
              <strong>{profile.quests.length}</strong>
              <p>
                Realistic missions spread across health, mind, money,
                intelligence, and skills.
              </p>
            </article>

            <article className='status-card panel'>
              <span>Urgent Deadlines</span>
              <strong>{overdueQuests.length}</strong>
              <p>
                {overdueQuests.length
                  ? 'Some quests need attention today.'
                  : 'No overdue tasks right now.'}
              </p>
            </article>
          </section>

          <section className='dashboard-grid'>
            <article className='panel dashboard-panel reveal'>
              <div className='section-head compact'>
                <div>
                  <p className='eyebrow'>Today's Quests</p>
                  <h2>Track progress right here</h2>
                </div>
                <button
                  className='filter-chip is-active'
                  onClick={() => setActiveTab('quests')}
                  type='button'
                >
                  Open full quest board
                </button>
              </div>

              <p className='section-copy'>
                These are your daily quests for today. Use the quick controls
                below to tick things off as you move.
              </p>

              <div className='today-quest-list'>
                {todayQuests.map((quest) => (
                  <TodayQuestRow
                    key={quest.id}
                    isPending={pendingQuestId === quest.id}
                    onComplete={() => handleQuestProgress(quest, quest.target)}
                    onDecrease={() =>
                      handleQuestProgress(quest, quest.progress - quest.step)
                    }
                    onIncrease={() =>
                      handleQuestProgress(quest, quest.progress + quest.step)
                    }
                    quest={quest}
                    timeZone={profile.timeZone}
                  />
                ))}
              </div>
            </article>

            <article className='panel dashboard-panel reveal'>
              <div className='section-head compact'>
                <div>
                  <p className='eyebrow'>Category Pulse</p>
                  <h2>Daily coverage</h2>
                </div>
              </div>

              <div className='category-card-grid'>
                {categoryCards.map((card) => (
                  <article
                    className={`category-card tone-${card.key}`}
                    key={card.key}
                  >
                    <strong>{card.label}</strong>
                    <span>
                      {card.completed}/{card.total} cleared
                    </span>
                    <div className='track compact-track'>
                      <span style={{ width: `${card.percent}%` }}></span>
                    </div>
                  </article>
                ))}
              </div>

              <div className='urgent-quest-stack'>
                <p className='eyebrow minor'>Most urgent right now</p>
                <div className='compact-quest-list'>
                  {urgentQuests.map((quest) => (
                    <CompactQuestRow
                      key={quest.id}
                      quest={quest}
                      timeZone={profile.timeZone}
                    />
                  ))}
                </div>
              </div>
            </article>
          </section>
        </>
      ) : null}

      {activeTab === 'quests' ? (
        <section className='tab-layout quests-layout'>
          <section className='quest-board panel reveal'>
            <div className='section-head'>
              <div>
                <p className='eyebrow'>Mission Board</p>
                <h2>Quests</h2>
              </div>
              <p className='section-copy'>
                Each quest has a category, due time, realistic scope, and
                server-tracked rewards.
              </p>
            </div>

            <div className='filter-row'>
              <button
                className={`filter-chip ${questFilter === 'all' ? 'is-active' : ''}`}
                onClick={() => setQuestFilter('all')}
                type='button'
              >
                All
              </button>
              {Object.entries(CATEGORY_META).map(([key, value]) => (
                <button
                  key={key}
                  className={`filter-chip ${questFilter === key ? 'is-active' : ''}`}
                  onClick={() => setQuestFilter(key)}
                  type='button'
                >
                  {value.label}
                </button>
              ))}
            </div>

            <div className='quest-list'>
              {filteredQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  isPending={pendingQuestId === quest.id}
                  onComplete={() => handleQuestProgress(quest, quest.target)}
                  onDecrease={() =>
                    handleQuestProgress(quest, quest.progress - quest.step)
                  }
                  onDelete={() => handleDeleteQuest(quest.id)}
                  onIncrease={() =>
                    handleQuestProgress(quest, quest.progress + quest.step)
                  }
                  quest={quest}
                  timeZone={profile.timeZone}
                />
              ))}
            </div>
          </section>

          <aside className='sidebar'>
            <section className='panel reveal'>
              <div className='section-head compact'>
                <div>
                  <p className='eyebrow'>System Forge</p>
                  <h2>Create A Quest</h2>
                </div>
                <p className='section-copy'>
                  Assign category, difficulty, and a daily deadline to make the
                  task realistic.
                </p>
              </div>

              <form className='quest-form' onSubmit={handleCreateQuest}>
                <label>
                  Quest name
                  <input
                    disabled={pendingCreate}
                    onChange={(event) => updateForm('name', event.target.value)}
                    placeholder='Example: 30 minutes of focused coding'
                    required
                    type='text'
                    value={form.name}
                  />
                </label>

                <div className='form-row'>
                  <label>
                    Category
                    <select
                      disabled={pendingCreate}
                      onChange={(event) =>
                        updateForm('category', event.target.value)
                      }
                      value={form.category}
                    >
                      {Object.entries(CATEGORY_META).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Difficulty
                    <select
                      disabled={pendingCreate}
                      onChange={(event) =>
                        updateForm('difficulty', event.target.value)
                      }
                      value={form.difficulty}
                    >
                      <option value='foundation'>Foundation</option>
                      <option value='hunter'>Hunter</option>
                      <option value='monarch'>Monarch</option>
                    </select>
                  </label>
                </div>

                <div className='form-row form-row-triple'>
                  <label>
                    Target
                    <input
                      disabled={pendingCreate}
                      max='500'
                      min='1'
                      onChange={(event) =>
                        updateForm('target', event.target.value)
                      }
                      required
                      type='number'
                      value={form.target}
                    />
                  </label>

                  <label>
                    Unit
                    <input
                      disabled={pendingCreate}
                      onChange={(event) =>
                        updateForm('unit', event.target.value)
                      }
                      required
                      type='text'
                      value={form.unit}
                    />
                  </label>

                  <label>
                    Deadline
                    <input
                      disabled={pendingCreate}
                      onChange={(event) =>
                        updateForm('dueTime', event.target.value)
                      }
                      required
                      type='time'
                      value={form.dueTime}
                    />
                  </label>
                </div>

                <label>
                  Why this matters
                  <textarea
                    disabled={pendingCreate}
                    onChange={(event) =>
                      updateForm('description', event.target.value)
                    }
                    placeholder='Example: Builds better attention and career leverage.'
                    rows='3'
                    value={form.description}
                  ></textarea>
                </label>

                <div className='form-preview'>
                  <strong>Preview: {previewQuest.name}</strong>
                  <p>{previewQuest.description}</p>
                  <p>
                    Rewards: {formatRewards(previewQuest.rewards)} and{' '}
                    {previewQuest.xp} XP.
                  </p>
                  <p>Deadline: {formatDueTime(previewQuest.dueTime)}</p>
                </div>

                <button
                  className='primary-button'
                  disabled={pendingCreate}
                  type='submit'
                >
                  {pendingCreate ? 'Forging quest...' : 'Forge Quest'}
                </button>
              </form>
            </section>

            <section className='panel reveal'>
              <div className='section-head compact'>
                <div>
                  <p className='eyebrow'>Deadline Guide</p>
                  <h2>Make tasks realistic</h2>
                </div>
              </div>

              <div className='deadline-guide'>
                <p>Health: movement or nutrition before the evening.</p>
                <p>Mind: meditation, planning, or reset before sleep.</p>
                <p>
                  Money: spending review or budget check before the day closes.
                </p>
                <p>
                  Intelligence: reading or study before your last leisure block.
                </p>
                <p>
                  Skills: one focused practice block before late-night fatigue
                  starts.
                </p>
              </div>
            </section>
          </aside>
        </section>
      ) : null}

      {activeTab === 'progress' ? (
        <section className='tab-layout progress-layout'>
          <section className='panel reveal'>
            <div className='section-head compact'>
              <div>
                <p className='eyebrow'>Hunter Profile</p>
                <h2>Core Stats</h2>
              </div>
            </div>

            <div className='stat-list'>
              {Object.entries(STAT_META).map(([key, meta]) => {
                const value = profile.stats[key];
                const width = Math.min(
                  100,
                  Math.round(
                    (value / Math.max(80, ...Object.values(profile.stats))) *
                      100,
                  ),
                );

                return (
                  <article className='stat-row' key={key}>
                    <div className='stat-copy'>
                      <span>{meta.label}</span>
                      <strong>{value}</strong>
                    </div>
                    <div className='track stat-track'>
                      <span
                        className={key}
                        style={{ width: `${width}%` }}
                      ></span>
                    </div>
                    <p>{meta.copy}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className='panel reveal'>
            <div className='section-head compact'>
              <div>
                <p className='eyebrow'>Long-Term Targets</p>
                <h2>Goal Paths</h2>
              </div>
            </div>

            <div className='goal-list'>
              {goalProgress.map((goal) => (
                <article className='goal-card' key={goal.label}>
                  <div className='goal-head'>
                    <span>{goal.label}</span>
                    <strong>{goal.percent}%</strong>
                  </div>
                  <div className='track'>
                    <span style={{ width: `${goal.percent}%` }}></span>
                  </div>
                  <p>
                    {goal.description} Current stage: {goal.stage}.
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className='panel reveal'>
            <div className='section-head compact'>
              <div>
                <p className='eyebrow'>What The Stats Mean</p>
                <h2>Benefits</h2>
              </div>
            </div>

            <div className='benefit-grid'>
              {Object.values(STAT_META).map((meta) => (
                <article key={meta.label}>
                  <h3>{meta.label}</h3>
                  <p>{meta.copy}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      ) : null}

      {activeTab === 'history' ? (
        <section className='tab-layout history-layout'>
          <section className='panel reveal'>
            <div className='section-head compact'>
              <div>
                <p className='eyebrow'>Recent Pace</p>
                <h2>History</h2>
              </div>
            </div>

            <div className='history-bars'>
              {recentHistory.map((entry, index) => (
                <div
                  className={`history-bar ${entry.live ? 'is-live' : ''}`}
                  key={`${entry.date}-${index}`}
                >
                  <div className='history-bar-rail'>
                    <div
                      className='history-bar-fill'
                      style={{
                        height: `${Math.max(10, entry.completionRate)}%`,
                      }}
                    ></div>
                  </div>
                  <strong>{entry.completionRate}%</strong>
                  <small>{formatShortDate(entry.date, entry.live)}</small>
                </div>
              ))}
            </div>

            <p className='history-summary'>
              Average completion:{' '}
              {Math.round(
                [
                  ...profile.history,
                  { completionRate: summary.completionRate },
                ].reduce((sum, entry) => sum + entry.completionRate, 0) /
                  Math.max(1, profile.history.length + 1),
              )}
              %. Best day:{' '}
              {Math.max(
                summary.completionRate,
                ...profile.history.map((entry) => entry.completionRate),
                0,
              )}
              %.
            </p>
          </section>

          <section className='panel reveal'>
            <div className='section-head compact'>
              <div>
                <p className='eyebrow'>Performance Notes</p>
                <h2>Insights</h2>
              </div>
            </div>

            <div className='insight-list'>
              <article className='insight-card'>
                <strong>{summary.completedCount} quests cleared today</strong>
                <p>Use this as your visible momentum marker for the day.</p>
              </article>
              <article className='insight-card'>
                <strong>{overdueQuests.length} overdue deadlines</strong>
                <p>
                  Deadline pressure is visible so the mission board stays
                  realistic.
                </p>
              </article>
              <article className='insight-card'>
                <strong>
                  {goalProgress.filter((goal) => goal.percent >= 50).length}{' '}
                  goals at 50%+
                </strong>
                <p>Your strongest goal paths are starting to compound.</p>
              </article>
            </div>
          </section>
        </section>
      ) : null}

      {activeTab === 'settings' ? (
        <section className='tab-layout settings-layout'>
          <section className='panel reveal'>
            <div className='section-head compact'>
              <div>
                <p className='eyebrow'>Appearance</p>
                <h2>Theme</h2>
              </div>
            </div>

            <div className='theme-grid'>
              {THEME_OPTIONS.map((option) => (
                <button
                  data-theme-preview={option.id}
                  key={option.id}
                  className={`theme-card ${theme === option.id ? 'is-active' : ''}`}
                  onClick={() => setTheme(option.id)}
                  type='button'
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section className='panel reveal'>
            <div className='section-head compact'>
              <div>
                <p className='eyebrow'>Feedback</p>
                <h2>Sounds</h2>
              </div>
            </div>

            <div className='settings-row'>
              <div>
                <strong>Task completion and promotion sounds</strong>
                <p>
                  Play a short cue when a quest completes or your level/rank
                  increases.
                </p>
              </div>

              <button
                className={`toggle-button ${soundEnabled ? 'is-active' : ''}`}
                onClick={() => setSoundEnabled((current) => !current)}
                type='button'
              >
                {soundEnabled ? 'Sounds On' : 'Sounds Off'}
              </button>
            </div>
          </section>

          <section className='panel reveal'>
            <div className='section-head compact'>
              <div>
                <p className='eyebrow'>Profile</p>
                <h2>Account Snapshot</h2>
              </div>
            </div>

            <div className='profile-snapshot'>
              <div>
                <span>Name</span>
                <strong>{user.name}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>
              <div>
                <span>Timezone</span>
                <strong>{profile.timeZone}</strong>
              </div>
              <div>
                <span>Total XP</span>
                <strong>{profile.xp}</strong>
              </div>
            </div>
          </section>
        </section>
      ) : null}
    </div>
  );
}

function QuestCard({
  isPending,
  onComplete,
  onDecrease,
  onDelete,
  onIncrease,
  quest,
  timeZone,
}) {
  const progressPercent = Math.min(
    100,
    Math.round((quest.progress / quest.target) * 100),
  );
  const category = CATEGORY_META[quest.category];
  const deadlineMeta = getQuestDeadlineMeta(quest, timeZone);

  return (
    <article className={`quest-card ${quest.completed ? 'is-complete' : ''}`}>
      <div className='quest-head'>
        <div>
          <div className='quest-title-row'>
            <h3 className={`task-title ${quest.completed ? 'is-complete' : ''}`}>
              {quest.name}
            </h3>
            <span className={`pill pill-${quest.category}`}>
              {category.label}
            </span>
            <span className={`pill pill-${quest.difficulty}`}>
              {sentenceCase(quest.difficulty)}
            </span>
          </div>
          <p className={`task-copy ${quest.completed ? 'is-complete' : ''}`}>
            {quest.description}
          </p>
        </div>

        <div className='quest-meta-stack'>
          <div className='quest-xp'>{quest.xp} XP</div>
          <span className={`deadline-chip tone-${deadlineMeta.tone}`}>
            {deadlineMeta.label}
          </span>
        </div>
      </div>

      <div className='benefit-line'>
        {quest.completed
          ? `Reward claimed. ${quest.xp} XP secured.`
          : `Benefit focus: ${sentenceCase(describeBenefits(quest.rewards))}.`}
      </div>

      <div className='reward-list'>
        {Object.entries(quest.rewards)
          .filter(([, value]) => value > 0)
          .map(([key, value]) => (
            <span className={`reward-chip ${key}`} key={key}>
              {STAT_META[key].label}
              <strong>+{value}</strong>
            </span>
          ))}
      </div>

      <div>
        <div className='quest-progress-copy'>
          <strong>
            {quest.progress} / {quest.target} {quest.unit}
          </strong>
          <span>{progressPercent}% cleared</span>
        </div>
        <div className='track'>
          <span style={{ width: `${progressPercent}%` }}></span>
        </div>
      </div>

      <div className='quest-controls'>
        <div className='stepper'>
          <button disabled={isPending} onClick={onDecrease} type='button'>
            - {quest.step}
          </button>
          <button disabled={isPending} onClick={onIncrease} type='button'>
            + {quest.step}
          </button>
          <button disabled={isPending} onClick={onComplete} type='button'>
            {quest.completed ? 'Completed' : 'Complete'}
          </button>
        </div>

        {quest.custom ? (
          <button
            className='ghost-button'
            disabled={isPending}
            onClick={onDelete}
            type='button'
          >
            Remove Quest
          </button>
        ) : (
          <span className='quest-note'>
            Starter mission / deadline {formatDueTime(quest.dueTime)}
          </span>
        )}
      </div>
    </article>
  );
}

function CompactQuestRow({ quest, timeZone }) {
  const deadlineMeta = getQuestDeadlineMeta(quest, timeZone);

  return (
    <article
      className={`compact-quest-card ${quest.completed ? 'is-complete' : ''}`}
    >
      <div>
        <strong className={`task-title ${quest.completed ? 'is-complete' : ''}`}>
          {quest.name}
        </strong>
        <p className={`task-copy ${quest.completed ? 'is-complete' : ''}`}>
          {CATEGORY_META[quest.category].label} / {quest.progress}/
          {quest.target} {quest.unit}
        </p>
      </div>
      <span className={`deadline-chip tone-${deadlineMeta.tone}`}>
        {deadlineMeta.label}
      </span>
    </article>
  );
}

function TodayQuestRow({
  isPending,
  onComplete,
  onDecrease,
  onIncrease,
  quest,
  timeZone,
}) {
  const deadlineMeta = getQuestDeadlineMeta(quest, timeZone);
  const progressPercent = Math.min(
    100,
    Math.round((quest.progress / quest.target) * 100),
  );

  return (
    <article
      className={`today-quest-card ${quest.completed ? 'is-complete' : ''}`}
    >
      <div className='today-quest-main'>
        <div>
          <strong className={`task-title ${quest.completed ? 'is-complete' : ''}`}>
            {quest.name}
          </strong>
          <p className={`task-copy ${quest.completed ? 'is-complete' : ''}`}>
            {CATEGORY_META[quest.category].label} / {quest.progress}/
            {quest.target} {quest.unit}
          </p>
        </div>

        <span className={`deadline-chip tone-${deadlineMeta.tone}`}>
          {deadlineMeta.label}
        </span>
      </div>

      <div className='track compact-track'>
        <span style={{ width: `${progressPercent}%` }}></span>
      </div>

      <div className='today-quest-actions'>
        <div className='stepper compact-stepper'>
          <button disabled={isPending} onClick={onDecrease} type='button'>
            - {quest.step}
          </button>
          <button disabled={isPending} onClick={onIncrease} type='button'>
            + {quest.step}
          </button>
          <button disabled={isPending} onClick={onComplete} type='button'>
            {quest.completed ? 'Completed' : 'Complete'}
          </button>
        </div>
        <span className='quest-note'>{quest.xp} XP</span>
      </div>
    </article>
  );
}

function readPreference(userId, key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  return window.localStorage.getItem(`ascension:${userId}:${key}`) || fallback;
}

function writePreference(userId, key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(`ascension:${userId}:${key}`, value);
}

async function playFeedback(
  audioContextRef,
  { completedNow, promotedNow, soundEnabled },
) {
  if (!soundEnabled || typeof window === 'undefined') {
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContextClass();
  }

  const context = audioContextRef.current;

  if (context.state === 'suspended') {
    await context.resume();
  }

  const sequence = [];

  if (completedNow) {
    sequence.push(
      { frequency: 523.25, duration: 0.12, delay: 0, gain: 0.03 },
      { frequency: 659.25, duration: 0.16, delay: 0.14, gain: 0.04 },
    );
  }

  if (promotedNow) {
    sequence.push(
      {
        frequency: 659.25,
        duration: 0.12,
        delay: completedNow ? 0.34 : 0,
        gain: 0.04,
      },
      {
        frequency: 783.99,
        duration: 0.14,
        delay: completedNow ? 0.48 : 0.14,
        gain: 0.05,
      },
      {
        frequency: 1046.5,
        duration: 0.22,
        delay: completedNow ? 0.64 : 0.3,
        gain: 0.06,
      },
    );
  }

  const now = context.currentTime;

  sequence.forEach((tone) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = tone.frequency;
    gainNode.gain.setValueAtTime(0.0001, now + tone.delay);
    gainNode.gain.exponentialRampToValueAtTime(
      tone.gain,
      now + tone.delay + 0.02,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      now + tone.delay + tone.duration,
    );
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(now + tone.delay);
    oscillator.stop(now + tone.delay + tone.duration + 0.02);
  });
}
