import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import TaskList from '../components/TaskList.jsx'
import TasksChart from '../components/TasksChart.jsx'
import { useToast } from '../components/ToastStack.jsx'
import { getIsLoggedIn } from '../interfaces/auth.js'
import {
  collectAllTags,
  createTask,
  getSmartSection,
  loadTasksFromStorage,
  normalizePriority,
  normalizeTags,
  saveTasksToStorage,
  sortTasksByPriority,
} from '../interfaces/task.js'

export default function Home() {
  const showToast = useToast()

  const [tasks, setTasks] = useState([])
  const [storageReady, setStorageReady] = useState(false)
  const [title, setTitle] = useState('')
  const [courseName, setCourseName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState(/** @type {'high'|'medium'|'low'} */ ('medium'))
  const [tagsInput, setTagsInput] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftCourse, setDraftCourse] = useState('')
  const [draftDeadline, setDraftDeadline] = useState('')
  const [draftPriority, setDraftPriority] = useState('medium')
  const [draftTags, setDraftTags] = useState('')
  const [filter, setFilter] = useState(/** @type {'all' | 'active' | 'completed'} */ ('all'))
  const [tagFilter, setTagFilter] = useState(/** @type {'all' | string} */ ('all'))
  const [search, setSearch] = useState('')

  useEffect(() => {
    setTasks(loadTasksFromStorage())
    setStorageReady(true)
  }, [])

  useEffect(() => {
    if (!storageReady) return
    saveTasksToStorage(tasks)
  }, [tasks, storageReady])

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const pending = total - completed
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { total, completed, pending, pct }
  }, [tasks])

  const allTags = useMemo(() => collectAllTags(tasks), [tasks])

  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks.filter((t) => {
      if (filter === 'active' && t.completed) return false
      if (filter === 'completed' && !t.completed) return false
      if (q && !(t.title || '').toLowerCase().includes(q)) return false
      if (tagFilter !== 'all') {
        const set = new Set(normalizeTags(t.tags).map((x) => x.toLowerCase()))
        if (!set.has(tagFilter.toLowerCase())) return false
      }
      return true
    })
  }, [tasks, filter, search, tagFilter])

  const sections = useMemo(() => {
    const incomplete = visibleTasks.filter((t) => !t.completed)
    const completed = sortTasksByPriority(visibleTasks.filter((t) => t.completed))

    const overdue = sortTasksByPriority(
      incomplete.filter((t) => getSmartSection(t) === 'overdue'),
    )
    const today = sortTasksByPriority(
      incomplete.filter((t) => getSmartSection(t) === 'today'),
    )
    const upcoming = sortTasksByPriority(
      incomplete.filter((t) => getSmartSection(t) === 'upcoming'),
    )

    return { overdue, today, upcoming, completed }
  }, [visibleTasks])

  function handleAdd(e) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedCourse = courseName.trim()
    if (!trimmedTitle && !trimmedCourse) return

    setTasks((prev) => [
      ...prev,
      createTask({
        title: trimmedTitle,
        courseName: trimmedCourse,
        deadline: deadline || '',
        priority,
        tags: normalizeTags(tagsInput),
      }),
    ])
    setTitle('')
    setCourseName('')
    setDeadline('')
    setPriority('medium')
    setTagsInput('')
    showToast('Task added', 'success')
  }

  function handleToggle(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }

  function handleDelete(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setEditingId((current) => (current === id ? null : current))
    showToast('Task deleted', 'success')
  }

  function handleStartEdit(task) {
    setEditingId(task.id)
    setDraftTitle(task.title)
    setDraftCourse(task.courseName)
    setDraftDeadline(task.deadline || '')
    setDraftPriority(normalizePriority(task.priority))
    setDraftTags(normalizeTags(task.tags).join(', '))
  }

  function handleDraftChange(field, value) {
    if (field === 'title') setDraftTitle(value)
    else if (field === 'courseName') setDraftCourse(value)
    else if (field === 'deadline') setDraftDeadline(value)
    else if (field === 'priority') setDraftPriority(value)
    else setDraftTags(value)
  }

  function handleSaveEdit() {
    if (!editingId) return
    const trimmedTitle = draftTitle.trim()
    const trimmedCourse = draftCourse.trim()
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? {
              ...t,
              title: trimmedTitle,
              courseName: trimmedCourse,
              deadline: draftDeadline || '',
              priority: normalizePriority(draftPriority),
              tags: normalizeTags(draftTags),
            }
          : t,
      ),
    )
    setEditingId(null)
    showToast('Task updated', 'success')
  }

  function handleCancelEdit() {
    setEditingId(null)
  }

  const listProps = {
    totalStoredCount: tasks.length,
    editingId,
    draftTitle,
    draftCourse,
    draftDeadline,
    draftPriority,
    draftTags,
    onToggleComplete: handleToggle,
    onDelete: handleDelete,
    onStartEdit: handleStartEdit,
    onDraftChange: handleDraftChange,
    onSaveEdit: handleSaveEdit,
    onCancelEdit: handleCancelEdit,
  }

  if (!getIsLoggedIn()) {
    return <Navigate to="/login" replace />
  }

  const filterBtn =
    'rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950'
  const filterActive = 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
  const filterIdle =
    'border border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-800'

  const tagChipBase =
    'rounded-full px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950'

  const showBuckets = filter !== 'completed'
  const showCompletedSection = filter !== 'active'

  function renderSection(title, subtitle, accentClass, bucketTasks, emptyCopy) {
    return (
      <section
        className={`rounded-2xl border border-slate-800/90 bg-slate-900/40 p-5 shadow-inner shadow-black/20 sm:p-6 ${accentClass}`}
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-bold tracking-tight text-white">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          </div>
          <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {bucketTasks.length}
          </span>
        </div>
        <TaskList
          {...listProps}
          tasks={bucketTasks}
          customEmpty={{
            title: emptyCopy.title,
            subtitle: emptyCopy.subtitle,
          }}
        />
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-14">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-4 lg:grid-cols-12 lg:items-stretch">
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total tasks</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</p>
              <p className="mt-2 text-3xl font-bold text-emerald-300">{stats.completed}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completion</p>
              <p className="mt-2 text-3xl font-bold text-indigo-300">{stats.pct}%</p>
            </div>
          </div>
          <div className="lg:col-span-4">
            <TasksChart completed={stats.completed} pending={stats.pending} />
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Dashboard</p>
              <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Task command center</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Priority colors on the left: High (rose), Medium (amber), Low (slate). Rows are sorted by
                priority inside each section. Cards still reflect deadline urgency when active.
              </p>
            </div>
            <div className="w-full max-w-md">
              <label className="sr-only" htmlFor="task-search">
                Search by title
              </label>
              <input
                id="task-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title…"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800/80 pt-6">
            <span className="mr-1 self-center text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </span>
            <button
              type="button"
              className={`${filterBtn} ${filter === 'all' ? filterActive : filterIdle}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`${filterBtn} ${filter === 'active' ? filterActive : filterIdle}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              type="button"
              className={`${filterBtn} ${filter === 'completed' ? filterActive : filterIdle}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tags</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`${tagChipBase} ${tagFilter === 'all' ? 'bg-indigo-500 text-white' : 'border border-slate-600 bg-slate-800/60 text-slate-300 hover:bg-slate-800'}`}
                onClick={() => setTagFilter('all')}
              >
                All tags
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`${tagChipBase} ${
                    tagFilter === tag
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
                      : 'border border-slate-600 bg-slate-800/60 text-slate-200 hover:border-sky-500/40 hover:bg-slate-800'
                  }`}
                  onClick={() => setTagFilter(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-12">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-6 shadow-xl shadow-black/25 backdrop-blur-sm xl:col-span-4">
            <h3 className="text-lg font-semibold text-white">New task</h3>
            <p className="mt-1 text-xs text-slate-500">Everything saves to localStorage automatically.</p>
            <form onSubmit={handleAdd} className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="task-title" className="text-sm font-medium text-slate-300">
                  Title
                </label>
                <input
                  id="task-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 3 homework"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="course-name" className="text-sm font-medium text-slate-300">
                  Course name
                </label>
                <input
                  id="course-name"
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Data structures"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="task-deadline" className="text-sm font-medium text-slate-300">
                  Deadline
                </label>
                <input
                  id="task-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="task-priority" className="text-sm font-medium text-slate-300">
                  Priority
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) =>
                    setPriority(/** @type {'high'|'medium'|'low'} */ (e.target.value))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="task-tags" className="text-sm font-medium text-slate-300">
                  Tags
                </label>
                <input
                  id="task-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. exam, reading (comma separated)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <button
                type="submit"
                className="mt-1 inline-flex items-center justify-center rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Add task
              </button>
            </form>
          </section>

          <div className="space-y-6 xl:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/35 px-4 py-3 sm:px-5">
              <h3 className="text-lg font-semibold text-white">Board</h3>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
                Showing {visibleTasks.length} of {tasks.length}
              </span>
            </div>

            {visibleTasks.length === 0 ? (
              <TaskList {...listProps} tasks={[]} customEmpty={null} />
            ) : (
              <div className="space-y-6">
                {showBuckets ? (
                  <>
                    {renderSection(
                      'Overdue',
                      'Past deadline — still active',
                      'ring-1 ring-rose-500/10',
                      sections.overdue,
                      {
                        title: 'No overdue tasks',
                        subtitle: 'Great job staying on schedule.',
                      },
                    )}
                    {renderSection(
                      'Today',
                      'Due today',
                      'ring-1 ring-amber-500/10',
                      sections.today,
                      {
                        title: 'Nothing due today',
                        subtitle: 'Check upcoming for what is next.',
                      },
                    )}
                    {renderSection(
                      'Upcoming',
                      'Future deadlines & unscheduled',
                      'ring-1 ring-sky-500/10',
                      sections.upcoming,
                      {
                        title: 'No upcoming tasks',
                        subtitle: 'Add a deadline or pick up something new.',
                      },
                    )}
                  </>
                ) : null}

                {showCompletedSection ? (
                  renderSection(
                    'Completed',
                    'Archived progress',
                    'ring-1 ring-emerald-500/10',
                    sections.completed,
                    {
                      title: 'No completed tasks',
                      subtitle: 'Finish something to see it here.',
                    },
                  )
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
