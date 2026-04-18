/**
 * Öğrenci görevi veri modeli.
 *
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} courseName
 * @property {string} deadline ISO tarih YYYY-MM-DD veya boş
 * @property {boolean} completed
 * @property {'high' | 'medium' | 'low'} priority
 * @property {string[]} tags
 */

const STORAGE_KEY = 'student-task-manager-tasks'

const PRIORITY_RANK = /** @type {const} */ ({ high: 0, medium: 1, low: 2 })

/** @param {unknown} p */
export function normalizePriority(p) {
  const v = String(p ?? '')
    .toLowerCase()
    .trim()
  if (v === 'high') return 'high'
  if (v === 'low') return 'low'
  return 'medium'
}

/** @param {unknown} input */
export function normalizeTags(input) {
  if (Array.isArray(input)) {
    return [...new Set(input.map((x) => String(x).trim()).filter(Boolean))]
  }
  if (typeof input === 'string') {
    return [...new Set(input.split(/[,;]/).map((s) => s.trim()).filter(Boolean))]
  }
  return []
}

/** @param {Task} a @param {Task} b */
export function compareTasksByPriority(a, b) {
  const d = PRIORITY_RANK[normalizePriority(a.priority)] - PRIORITY_RANK[normalizePriority(b.priority)]
  if (d !== 0) return d
  return (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' })
}

/** @param {Task[]} tasks @returns {Task[]} */
export function sortTasksByPriority(tasks) {
  return [...tasks].sort(compareTasksByPriority)
}

/** @param {string} yyyyMmDd */
export function parseLocalDate(yyyyMmDd) {
  if (!yyyyMmDd || typeof yyyyMmDd !== 'string') return null
  const parts = yyyyMmDd.split('-').map(Number)
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null
  const [y, m, d] = parts
  return new Date(y, m - 1, d)
}

/**
 * Tamamlanmamış görevler için son teslim vurgusu.
 * @param {Task} task
 * @returns {'overdue' | 'upcoming' | 'normal' | 'none'}
 */
export function getDeadlineHighlight(task) {
  if (task.completed) return 'none'
  const due = parseLocalDate(task.deadline)
  if (!due) return 'none'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(due)
  end.setHours(0, 0, 0, 0)
  const diffDays = Math.round((end.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))

  if (diffDays < 0) return 'overdue'
  if (diffDays <= 3) return 'upcoming'
  return 'normal'
}

/**
 * Akıllı bölüm (tamamlanmamış görevler).
 * @param {Task} task
 * @returns {'overdue' | 'today' | 'upcoming'}
 */
export function getSmartSection(task) {
  if (task.completed) return 'upcoming'
  const due = parseLocalDate(task.deadline)
  if (!due) return 'upcoming'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(due)
  end.setHours(0, 0, 0, 0)
  const diffMs = end.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  return 'upcoming'
}

/**
 * @param {Partial<Task>} [overrides]
 * @returns {Task}
 */
export function createTask(overrides = {}) {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? '',
    courseName: overrides.courseName ?? '',
    deadline: overrides.deadline != null ? String(overrides.deadline) : '',
    completed: overrides.completed ?? false,
    priority: normalizePriority(overrides.priority),
    tags: normalizeTags(overrides.tags ?? []),
  }
}

/** @returns {Task[]} */
export function loadTasksFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((t) =>
      createTask({
        id: String(t.id),
        title: String(t.title ?? ''),
        courseName: String(t.courseName ?? ''),
        deadline: String(t.deadline ?? ''),
        completed: Boolean(t.completed),
        priority: t.priority,
        tags: t.tags,
      }),
    )
  } catch {
    return []
  }
}

/** @param {Task[]} tasks */
export function saveTasksToStorage(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    /* ignore quota / private mode */
  }
}

/** @param {Task[]} tasks @returns {string[]} */
export function collectAllTags(tasks) {
  const set = new Set()
  for (const t of tasks) {
    for (const tag of normalizeTags(t.tags)) {
      set.add(tag)
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}
