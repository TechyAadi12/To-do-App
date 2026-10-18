import React, { useEffect, useMemo, useState } from 'react';

const TASKS_STORAGE_KEY = 'daylight-tasks';
const EMPTY_START_KEY = 'daylight-empty-start-v1';

const categoryColors = {
  Work: 'lavender',
  Personal: 'mint',
  Errands: 'peach',
  Learning: 'blue',
};

function Icon({ name, size = 18 }) {
  const paths = {
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    chevron: <><path d="m9 18 6-6-6-6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function getStoredTasks() {
  try {
    if (!window.localStorage.getItem(EMPTY_START_KEY)) {
      window.localStorage.removeItem(TASKS_STORAGE_KEY);
      window.localStorage.setItem(EMPTY_START_KEY, 'done');
      return [];
    }

    const stored = window.localStorage.getItem(TASKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Could not load saved tasks:', error);
    return [];
  }
}

function App() {
  const [tasks, setTasks] = useState(getStoredTasks);
  const [section, setSection] = useState('Today');
  const [category, setCategory] = useState('All tasks');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newCategory, setNewCategory] = useState('Work');

  useEffect(() => {
    try {
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Could not save tasks:', error);
    }
  }, [tasks]);

  const completedCount = tasks.filter((task) => task.done).length;
  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesSection = section === 'Completed' ? task.done : section === 'Today' ? !task.done : true;
    const matchesCategory = category === 'All tasks' || task.category === category;
    const matchesSearch = task.title.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSection && matchesCategory && matchesSearch;
  }), [tasks, section, category, search]);

  const dateLabel = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  function addTask(event) {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    setTasks((current) => [{
      id: Date.now(),
      title,
      category: newCategory,
      time: 'Anytime',
      priority: 'Medium',
      done: false,
    }, ...current]);
    setNewTask('');
    setShowForm(false);
  }

  function toggleTask(id) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  const navItems = [
    { name: 'Today', icon: 'grid', count: tasks.filter((task) => !task.done).length },
    { name: 'Upcoming', icon: 'calendar' },
    { name: 'Completed', icon: 'check', count: completedCount },
  ];
  const categories = ['All tasks', 'Work', 'Personal', 'Errands', 'Learning'];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Daylight home" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><Icon name="sun" size={21} /></span>
          <span>daylight<span className="brand-dot">.</span></span>
        </a>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button className={`nav-item ${section === item.name ? 'active' : ''}`} key={item.name} onClick={() => setSection(item.name)}>
              <Icon name={item.icon} />
              <span>{item.name}</span>
              {item.count > 0 && <span className="nav-count">{item.count}</span>}
            </button>
          ))}
        </nav>

        <div className="category-heading"><span className="workspace-label">MY LISTS</span></div>
        <nav className="category-nav" aria-label="Task categories">
          {categories.map((item) => (
            <button key={item} className={`category-item ${category === item ? 'selected' : ''}`} onClick={() => setCategory(item)}>
              <span className={`category-dot ${categoryColors[item] || 'all'}`} />
              <span>{item}</span>
            </button>
          ))}
        </nav>

      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>My workspace</span><Icon name="chevron" size={14} /><strong>{section}</strong></div>
          <label className="search-box">
            <Icon name="search" size={17} />
            <input aria-label="Search tasks" placeholder="Search anything..." value={search} onChange={(event) => setSearch(event.target.value)} />
            <kbd>⌘ K</kbd>
          </label>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-sparkle">✳</span> YOUR PERSONAL SPACE</div>
              <h1>{section === 'Completed' ? 'Look at you go.' : section === 'Upcoming' ? 'Plan what’s next.' : 'Make today count.'}</h1>
              <p className="today-date">{dateLabel}</p>
            </div>
            <button className="add-button" onClick={() => setShowForm((open) => !open)}><Icon name={showForm ? 'close' : 'plus'} size={18} />{showForm ? 'Close' : 'New task'}</button>
          </section>

          <section className="progress-card" aria-label="Daily progress">
            <div className="progress-info">
              <div className="progress-title-row"><span className="progress-icon"><Icon name="sun" size={18} /></span><strong>Your daily progress</strong><span className="progress-percent">{tasks.length ? Math.round(completedCount / tasks.length * 100) : 0}%</span></div>
              <p>{tasks.length ? <>You’ve completed <strong>{completedCount} of {tasks.length} tasks</strong> today. Keep going at your own pace.</> : 'Your list is clear. Add a task whenever you’re ready.'}</p>
              <div className="progress-track"><span style={{ width: `${tasks.length ? completedCount / tasks.length * 100 : 0}%` }} /></div>
            </div>
          </section>

          <section className="task-section">
            <div className="section-heading">
              <div><h2>{section === 'Completed' ? 'Completed tasks' : section === 'Upcoming' ? 'All your tasks' : 'Today’s tasks'} <span className="task-total">{visibleTasks.length}</span></h2></div>
            </div>

            {showForm && (
              <form className="new-task-form" onSubmit={addTask}>
                <input autoFocus aria-label="New task title" placeholder="What needs to get done?" value={newTask} onChange={(event) => setNewTask(event.target.value)} />
                <select aria-label="Task category" value={newCategory} onChange={(event) => setNewCategory(event.target.value)}>
                  {categories.filter((item) => item !== 'All tasks').map((item) => <option key={item}>{item}</option>)}
                </select>
                <button type="submit" disabled={!newTask.trim()}>Add task <Icon name="plus" size={15} /></button>
              </form>
            )}

            <div className="task-list">
              {visibleTasks.map((task) => (
                <article className={`task-card ${task.done ? 'is-done' : ''}`} key={task.id}>
                  <button className={`task-check ${task.done ? 'checked' : ''}`} aria-label={task.done ? `Mark ${task.title} incomplete` : `Complete ${task.title}`} onClick={() => toggleTask(task.id)}>
                    {task.done && <Icon name="check" size={14} />}
                  </button>
                  <div className="task-copy">
                    <h3>{task.title}</h3>
                    <div className="task-meta"><span className={`tag ${categoryColors[task.category] || 'blue'}`}>{task.category}</span><span className="meta-time"><Icon name="clock" size={13} />{task.time}</span></div>
                  </div>
                  <span className={`priority priority-${task.priority.toLowerCase()}`}><i />{task.priority}</span>
                  <button className="delete-task" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)}><Icon name="close" size={16} /></button>
                </article>
              ))}
              {visibleTasks.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon"><Icon name={search ? 'search' : 'check'} size={24} /></span>
                  <strong>{search ? 'No tasks found' : 'Your day, your way.'}</strong>
                  <p>{search ? 'Try another search or change your filters.' : 'Your task list is empty. Add a task to get started.'}</p>
                  {!search && <button onClick={() => setShowForm(true)}><Icon name="plus" size={15} /> Add a task</button>}
                </div>
              )}
            </div>
          </section>

          <footer className="page-footer"><span>One thing at a time.</span><span>Made for a brighter day <span className="footer-heart">♥</span></span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
