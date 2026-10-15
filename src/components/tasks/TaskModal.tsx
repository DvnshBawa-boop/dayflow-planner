import React, { useState, useEffect } from 'react';
import { Task, PriorityLevel, PastelColor } from '@/types/planner';
import { usePlanner, getTodayString, getOffsetDateString } from '@/context/PlannerContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Calendar, Tag, AlertCircle, Plus, X } from 'lucide-react';

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskToEdit?: Task | null;
  defaultDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  open,
  onOpenChange,
  taskToEdit,
  defaultDate,
}) => {
  const { addTask, updateTask, categories, selectedDate } = usePlanner();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [dueDate, setDueDate] = useState(defaultDate || selectedDate || getTodayString());
  const [dueTime, setDueTime] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setNotes(taskToEdit.notes || '');
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate);
      setDueTime(taskToEdit.dueTime || '');
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 30);
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setNotes('');
      setCategory(categories[0]?.name || 'Work');
      setPriority('medium');
      setDueDate(defaultDate || selectedDate || getTodayString());
      setDueTime('12:00');
      setEstimatedMinutes(30);
      setSubtasks([]);
      setNewSubtaskInput('');
    }
  }, [taskToEdit, open, defaultDate, selectedDate, categories]);

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `st-${Date.now()}`, title: newSubtaskInput.trim(), completed: false },
    ]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        notes: notes.trim() || undefined,
        category,
        priority,
        dueDate,
        dueTime: dueTime || undefined,
        estimatedMinutes,
        subtasks,
      });
    } else {
      addTask({
        title: title.trim(),
        notes: notes.trim() || undefined,
        category,
        priority,
        dueDate,
        dueTime: dueTime || undefined,
        estimatedMinutes,
        completed: false,
        subtasks,
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[94vw] max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl">
        <DialogHeader className="text-left pb-2">
          <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <p className="text-xs text-slate-500">
            Organize with priority, time estimate, and checklist.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Task Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Review project proposal"
              className="rounded-xl border-slate-200 dark:border-slate-800 text-sm focus-visible:ring-indigo-500"
              required
              autoFocus
            />
          </div>

          {/* Category & Priority Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 py-2.5 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['low', 'medium', 'high', 'urgent'] as PriorityLevel[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`text-[11px] font-semibold capitalize py-2 rounded-lg border transition-all text-center ${
                        isSelected
                          ? p === 'urgent'
                            ? 'bg-rose-500 text-white border-rose-600'
                            : p === 'high'
                            ? 'bg-orange-500 text-white border-orange-600'
                            : p === 'medium'
                            ? 'bg-indigo-600 text-white border-indigo-700'
                            : 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {p.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl border-slate-200 dark:border-slate-800 text-xs sm:text-sm py-2"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Time (optional)
              </label>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="rounded-xl border-slate-200 dark:border-slate-800 text-xs sm:text-sm py-2"
              />
            </div>
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setDueDate(getTodayString())}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                dueDate === getTodayString()
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-transparent hover:bg-slate-200'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDueDate(getOffsetDateString(1))}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                dueDate === getOffsetDateString(1)
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-transparent hover:bg-slate-200'
              }`}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setDueDate(getOffsetDateString(7))}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
            >
              Next Week
            </button>
          </div>

          {/* Subtasks Checklist */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Checklist Steps
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800"
                >
                  <span className="truncate pr-2">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5">
              <Input
                placeholder="Add step or subtask..."
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="text-xs rounded-xl h-8"
              />
              <Button
                type="button"
                onClick={handleAddSubtask}
                size="sm"
                variant="outline"
                className="h-8 rounded-xl px-2.5 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Notes & Links
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details, thoughts, or context..."
              rows={2}
              className="rounded-xl border-slate-200 dark:border-slate-800 text-xs sm:text-sm resize-none focus-visible:ring-indigo-500"
            />
          </div>

          <DialogFooter className="pt-2 flex gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl text-xs sm:text-sm font-medium border-slate-200 dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 dark:shadow-none"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
