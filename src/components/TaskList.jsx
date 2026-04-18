import TaskItem from './TaskItem.jsx'

/**
 * @param {object} props
 * @param {import('../interfaces/task.js').Task[]} props.tasks
 * @param {number} props.totalStoredCount
 * @param {{ title: string, subtitle?: string } | null} [props.customEmpty]
 * @param {string | null} props.editingId
 * @param {string} props.draftTitle
 * @param {string} props.draftCourse
 * @param {string} props.draftDeadline
 * @param {string} props.draftPriority
 * @param {string} props.draftTags
 * @param {(id: string) => void} props.onToggleComplete
 * @param {(id: string) => void} props.onDelete
 * @param {(task: import('../interfaces/task.js').Task) => void} props.onStartEdit
 * @param {(field: 'title' | 'courseName' | 'deadline' | 'priority' | 'tags', value: string) => void} props.onDraftChange
 * @param {() => void} props.onSaveEdit
 * @param {() => void} props.onCancelEdit
 */
export default function TaskList({
  tasks,
  totalStoredCount,
  customEmpty = null,
  editingId,
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
  if (tasks.length === 0) {
    if (customEmpty) {
      return (
        <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30 px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-400">{customEmpty.title}</p>
          {customEmpty.subtitle ? (
            <p className="mt-1 text-xs text-slate-500">{customEmpty.subtitle}</p>
          ) : null}
        </div>
      )
    }
    const isFilteredOut = totalStoredCount > 0
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-16 text-center">
        <p className="text-lg font-medium text-slate-400">
          {isFilteredOut ? 'No matching tasks' : 'No tasks yet'}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {isFilteredOut
            ? 'Try changing filters, tag, or search.'
            : 'Add a task using the form to get started.'}
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3 sm:gap-4">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskItem
            task={task}
            editing={editingId === task.id}
            draftTitle={draftTitle}
            draftCourse={draftCourse}
            draftDeadline={draftDeadline}
            draftPriority={draftPriority}
            draftTags={draftTags}
            onToggleComplete={() => onToggleComplete(task.id)}
            onDelete={() => onDelete(task.id)}
            onStartEdit={() => onStartEdit(task)}
            onDraftChange={onDraftChange}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
          />
        </li>
      ))}
    </ul>
  )
}
