import {
  getDeadlineHighlight,
  normalizePriority,
} from '../interfaces/task.js'

const PRI_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }

const PRI_BADGE = {
  high: 'bg-rose-500/20 text-rose-200 ring-1 ring-rose-500/35',
  medium: 'bg-amber-500/20 text-amber-100 ring-1 ring-amber-500/30',
  low: 'bg-slate-600/50 text-slate-200 ring-1 ring-slate-500/40',
}

const PRI_LEFT = {
  high: 'border-l-rose-500',
  medium: 'border-l-amber-400',
  low: 'border-l-slate-500',
}

/**
 * @param {object} props
 * @param {import('../interfaces/task.js').Task} props.task
 * @param {boolean} props.editing
 * @param {string} props.draftTitle
 * @param {string} props.draftCourse
 * @param {string} props.draftDeadline
 * @param {string} props.draftPriority
 * @param {string} props.draftTags
 * @param {() => void} props.onToggleComplete
 * @param {() => void} props.onDelete
 * @param {() => void} props.onStartEdit
 * @param {(field: 'title' | 'courseName' | 'deadline' | 'priority' | 'tags', value: string) => void} props.onDraftChange
 * @param {() => void} props.onSaveEdit
 * @param {() => void} props.onCancelEdit
 */
export default function TaskItem({
  task,
  editing,
  draftTitle,
  draftCourse,
  draftDeadline,
  draftPriority,
  draftTags,
  onToggleComplete,
  onDelete,
  onStartEdit,
  onDraftChange,
  onSaveEdit,
  onCancelEdit,
}) {
  const completed = task.completed
  const urgency = getDeadlineHighlight(task)
  const pri = normalizePriority(task.priority)
  const leftAccent = PRI_LEFT[pri]

  let urgencyRing =
    'border-y border-r border-slate-700/90 bg-slate-900/70 shadow-lg shadow-black/20'
  if (!completed) {
    if (urgency === 'overdue') {
      urgencyRing =
        'border-y border-r border-rose-500/45 bg-rose-950/25 ring-1 ring-rose-500/25 shadow-lg shadow-rose-900/20'
    } else if (urgency === 'upcoming') {
      urgencyRing =
        'border-y border-r border-amber-500/40 bg-amber-950/20 ring-1 ring-amber-500/25 shadow-lg shadow-amber-900/15'
    }
  }

  const cardBase = completed
    ? 'border-y border-r border-slate-700/80 bg-slate-900/40 shadow-md'
    : urgencyRing

  const deadlineLabel = task.deadline
    ? new Date(task.deadline + 'T12:00:00').toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const tags = Array.isArray(task.tags) ? task.tags : []

  return (
    <article
      className={`rounded-2xl border-l-4 ${leftAccent} p-5 transition ${cardBase}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={completed}
            onChange={onToggleComplete}
            className="mt-1 h-5 w-5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-0 focus:ring-offset-slate-900"
          />
          <span className="min-w-0 flex-1">
            {editing ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => onDraftChange('title', e.target.value)}
                  placeholder="Task title"
                  className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                <input
                  type="text"
                  value={draftCourse}
                  onChange={(e) => onDraftChange('courseName', e.target.value)}
                  placeholder="Course name"
                  className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                <input
                  type="date"
                  value={draftDeadline}
                  onChange={(e) => onDraftChange('deadline', e.target.value)}
                  className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-slate-400">Priority</span>
                  <select
                    value={draftPriority}
                    onChange={(e) => onDraftChange('priority', e.target.value)}
                    className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={draftTags}
                  onChange={(e) => onDraftChange('tags', e.target.value)}
                  placeholder="Tags (comma separated)"
                  className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${PRI_BADGE[pri]}`}
                  >
                    {PRI_LABEL[pri]}
                  </span>
                  <span
                    className={`block text-lg font-semibold tracking-tight ${
                      completed ? 'text-slate-500 line-through decoration-slate-500' : 'text-white'
                    }`}
                  >
                    {task.title || 'Untitled task'}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      completed
                        ? 'bg-slate-800 text-slate-500 line-through'
                        : 'bg-indigo-500/15 text-indigo-200'
                    }`}
                  >
                    {task.courseName || 'No course'}
                  </span>
                  {deadlineLabel ? (
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        completed
                          ? 'bg-slate-800 text-slate-500'
                          : urgency === 'overdue'
                            ? 'bg-rose-500/20 text-rose-200'
                            : urgency === 'upcoming'
                              ? 'bg-amber-500/20 text-amber-100'
                              : 'bg-slate-700/80 text-slate-200'
                      }`}
                    >
                      Due {deadlineLabel}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">No deadline</span>
                  )}
                </div>
                {tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-slate-800/90 px-2 py-0.5 text-[11px] font-medium text-sky-200 ring-1 ring-sky-500/25"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                {!completed && urgency === 'overdue' ? (
                  <p className="mt-2 text-xs font-medium text-rose-300">Overdue</p>
                ) : null}
                {!completed && urgency === 'upcoming' ? (
                  <p className="mt-2 text-xs font-medium text-amber-200">Due soon</p>
                ) : null}
              </>
            )}
          </span>
        </label>

        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {editing ? (
            <>
              <button
                type="button"
                onClick={onSaveEdit}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-xl border border-slate-600 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onStartEdit}
                className="rounded-xl border border-slate-600 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-400/50 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-xl bg-rose-500/90 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
