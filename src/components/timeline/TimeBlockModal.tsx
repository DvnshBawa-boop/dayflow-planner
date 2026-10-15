import React, { useState, useEffect } from 'react';
import { TimeBlock, PastelColor, PASTEL_COLOR_MAP } from '@/types/planner';
import { usePlanner, getTodayString } from '@/context/PlannerContext';
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
import { Clock, Calendar, Tag, Palette } from 'lucide-react';

interface TimeBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockToEdit?: TimeBlock | null;
  defaultStartTime?: string;
  defaultDate?: string;
}

const AVAILABLE_COLORS: PastelColor[] = [
  'indigo',
  'mint',
  'lavender',
  'peach',
  'sky',
  'rose',
  'amber',
];

export const TimeBlockModal: React.FC<TimeBlockModalProps> = ({
  open,
  onOpenChange,
  blockToEdit,
  defaultStartTime,
  defaultDate,
}) => {
  const { addTimeBlock, updateTimeBlock, categories, selectedDate } = usePlanner();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || selectedDate || getTodayString());
  const [startTime, setStartTime] = useState(defaultStartTime || '09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState<PastelColor>('indigo');
  const [category, setCategory] = useState('Work');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (blockToEdit) {
      setTitle(blockToEdit.title);
      setDate(blockToEdit.date);
      setStartTime(blockToEdit.startTime);
      setEndTime(blockToEdit.endTime);
      setColor(blockToEdit.color);
      setCategory(blockToEdit.category);
      setNotes(blockToEdit.notes || '');
    } else {
      setTitle('');
      setDate(defaultDate || selectedDate || getTodayString());
      const start = defaultStartTime || '09:00';
      setStartTime(start);
      // Auto-set end time to 1 hr later
      const [h, m] = start.split(':').map(Number);
      const nextH = Math.min(23, (h || 9) + 1);
      setEndTime(`${String(nextH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`);
      setColor('indigo');
      setCategory(categories[0]?.name || 'Work');
      setNotes('');
    }
  }, [blockToEdit, open, defaultStartTime, defaultDate, selectedDate, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (blockToEdit) {
      updateTimeBlock(blockToEdit.id, {
        title: title.trim(),
        date,
        startTime,
        endTime,
        color,
        category,
        notes: notes.trim() || undefined,
      });
    } else {
      addTimeBlock({
        title: title.trim(),
        date,
        startTime,
        endTime,
        color,
        category,
        completed: false,
        notes: notes.trim() || undefined,
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[94vw] max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl">
        <DialogHeader className="text-left pb-2">
          <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {blockToEdit ? 'Edit Time Block' : 'Schedule Time Block'}
          </DialogTitle>
          <p className="text-xs text-slate-500">
            Block out dedicated hours for focused work, rest, or events.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Block Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Coding Session, Gym, Lunch"
              className="rounded-xl border-slate-200 dark:border-slate-800 text-sm focus-visible:ring-indigo-500"
              required
              autoFocus
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Schedule Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border-slate-200 dark:border-slate-800 text-xs sm:text-sm py-2"
              required
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Start Time
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-xl border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                End Time
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="rounded-xl border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Category & Color Selector */}
          <div className="space-y-3">
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

            {/* Pastel Color Swatches */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                Pastel Theme Tint
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {AVAILABLE_COLORS.map((c) => {
                  const isSelected = color === c;
                  const cStyle = PASTEL_COLOR_MAP[c];
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center relative ${
                        isSelected ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: cStyle.solid }}
                      title={c}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Block Intentions / Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What do you plan to achieve during this slot?"
              rows={2}
              className="rounded-xl border-slate-200 dark:border-slate-800 text-xs sm:text-sm resize-none focus-visible:ring-indigo-500"
            />
          </div>

          <DialogFooter className="pt-2 flex gap-2">
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
              {blockToEdit ? 'Save Block' : 'Add Time Block'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
