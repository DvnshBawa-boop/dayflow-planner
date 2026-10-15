import React, { useState } from 'react';
import { Task, PASTEL_COLOR_MAP, PRIORITY_CONFIG, PastelColor } from '@/types/planner';
import { usePlanner } from '@/context/PlannerContext';
import {
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Plus,
  Trash2,
  Edit2,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { toggleTaskCompletion, deleteTask, toggleSubtask, addSubtask, categories } = usePlanner();
  const [expanded, setExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  // Category matching
  const categoryDef = categories.find((c) => c.name.toLowerCase() === task.category.toLowerCase());
  const categoryColor: PastelColor = categoryDef?.color || 'indigo';
  const colorStyles = PASTEL_COLOR_MAP[categoryColor];
  const priorityStyle = PRIORITY_CONFIG[task.priority];

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle);
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 shadow-sm ${
        task.completed
          ? 'bg-slate-50/70 border-slate-200/60 opacity-75 dark:bg-slate-900/30 dark:border-slate-800/60'
          : 'bg-white border-slate-100/90 hover:border-slate-200 hover:shadow-md dark:bg-slate-900 dark:border-slate-800'
      }`}
    >
      <div className="p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Custom Android tactile checkbox */}
          <button
            onClick={() => toggleTaskCompletion(task.id)}
            className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all transform active:scale-90 ${
              task.completed
                ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-200 dark:ring-emerald-900'
                : 'border-2 border-slate-300 hover:border-indigo-500 dark:border-slate-600 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'
            }`}
            aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
          >
            {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span
                onClick={() => toggleTaskCompletion(task.id)}
                className={`text-sm sm:text-base font-medium leading-snug cursor-pointer transition-colors truncate ${
                  task.completed
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {task.title}
              </span>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-7 h-7 -mr-1 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 rounded-xl shadow-lg border-slate-100 dark:border-slate-800">
                  <DropdownMenuItem
                    onClick={() => onEdit(task)}
                    className="flex items-center gap-2 text-xs py-2 cursor-pointer font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteTask(task.id)}
                    className="flex items-center gap-2 text-xs py-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/40 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Notes if present */}
            {task.notes && (
              <p
                className={`text-xs mt-1 leading-relaxed line-clamp-2 ${
                  task.completed ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {task.notes}
              </p>
            )}

            {/* Badges / Metadata row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {/* Category Pill */}
              <span
                className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${colorStyles.badge}`}
              >
                {task.category}
              </span>

              {/* Priority Badge */}
              <span
                className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${priorityStyle.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-1 ${priorityStyle.iconBg}`} />
                {priorityStyle.label}
              </span>

              {/* Due Date & Time */}
              {task.dueTime && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {task.dueTime}
                </span>
              )}

              {/* Subtasks counter toggle */}
              {totalSubtasks > 0 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-0.5 rounded-full transition-colors ml-auto"
                >
                  <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                  {completedSubtasks}/{totalSubtasks}
                  {expanded ? (
                    <ChevronUp className="w-3 h-3 ml-0.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-0.5 text-slate-400" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subtasks Accordion Content */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 pl-9 space-y-2">
            <div className="space-y-1.5">
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => toggleSubtask(task.id, st.id)}
                  className="flex items-center gap-2 cursor-pointer group/st py-0.5"
                >
                  {st.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover/st:text-indigo-400 flex-shrink-0" />
                  )}
                  <span
                    className={`text-xs ${
                      st.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick add subtask input */}
            {isAddingSubtask ? (
              <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5 mt-2">
                <input
                  type="text"
                  placeholder="New subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  autoFocus
                  className="flex-1 text-xs px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <button
                  type="submit"
                  className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-lg font-medium hover:bg-indigo-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSubtask(false);
                    setNewSubtaskTitle('');
                  }}
                  className="text-xs text-slate-500 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingSubtask(true)}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline pt-1"
              >
                <Plus className="w-3 h-3" />
                Add checklist item
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
