import React, { useState, useMemo, useEffect } from 'react';
import { usePlanner, getTodayString } from '@/context/PlannerContext';
import { TimeBlock, PASTEL_COLOR_MAP } from '@/types/planner';
import { TimeBlockModal } from './TimeBlockModal';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  MoreVertical,
  Play,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TimelineViewProps {
  onStartFocus?: (title: string, durationMinutes: number) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onStartFocus }) => {
  const {
    timeBlocks,
    selectedDate,
    setSelectedDate,
    deleteTimeBlock,
    toggleTimeBlockCompleted,
  } = usePlanner();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blockToEdit, setBlockToEdit] = useState<TimeBlock | null>(null);
  const [defaultStartTime, setDefaultStartTime] = useState<string>('09:00');
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(0);

  // Update current time indicator every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = getTodayString();
  const isViewingToday = selectedDate === todayStr;

  // Filter blocks for selected date
  const dayBlocks = useMemo(() => {
    return timeBlocks
      .filter((b) => b.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timeBlocks, selectedDate]);

  // Convert "HH:mm" to minutes from 00:00
  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Convert minutes to friendly format e.g. "1h 30m"
  const getDurationText = (start: string, end: string): string => {
    const diff = Math.max(0, timeToMinutes(end) - timeToMinutes(start));
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  // Generate 7-day date strip centered around selectedDate
  const dateStrip = useMemo(() => {
    const base = new Date(selectedDate + 'T00:00:00');
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({
        dateStr,
        dayName,
        dayNumber: d.getDate(),
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
      });
    }
    return days;
  }, [selectedDate, todayStr]);

  const handleShiftDay = (delta: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const handleSlotClick = (hourStr: string) => {
    setDefaultStartTime(hourStr);
    setBlockToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditBlock = (block: TimeBlock) => {
    setBlockToEdit(block);
    setIsModalOpen(true);
  };

  // Timeline hours from 06:00 to 22:00
  const START_HOUR = 6;
  const END_HOUR = 23;
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  // Calculate position of current time indicator in pixels
  // Each hour row is 72px tall
  const HOUR_HEIGHT = 76;
  const currentIndicatorTop = useMemo(() => {
    const startMinutes = START_HOUR * 60;
    if (currentTimeMinutes < startMinutes || currentTimeMinutes > END_HOUR * 60) return null;
    const offsetMinutes = currentTimeMinutes - startMinutes;
    return (offsetMinutes / 60) * HOUR_HEIGHT;
  }, [currentTimeMinutes]);

  return (
    <div className="space-y-4 pb-20">
      {/* Date Header & Horizontal Selector Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleShiftDay(-1)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                weekday: 'long',
              })}
            </h2>
            <button
              onClick={() => handleShiftDay(1)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isViewingToday && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60"
              >
                Today
              </button>
            )}
            <button
              onClick={() => {
                setBlockToEdit(null);
                setDefaultStartTime('09:00');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1 text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-xl hover:bg-indigo-700 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Block
            </button>
          </div>
        </div>

        {/* Date Strip */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {dateStrip.map((item) => (
            <button
              key={item.dateStr}
              onClick={() => setSelectedDate(item.dateStr)}
              className={`flex flex-col items-center py-2 px-1 rounded-2xl transition-all ${
                item.isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none scale-105'
                  : item.isToday
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <span className="text-[10px] font-medium uppercase">{item.dayName}</span>
              <span className="text-sm sm:text-base font-bold mt-0.5">{item.dayNumber}</span>
              {item.isToday && !item.isSelected && (
                <span className="w-1 h-1 rounded-full bg-indigo-500 mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Summary Stat Card */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100/60 dark:border-indigo-900/40 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>
            <strong>{dayBlocks.length}</strong> scheduled blocks today
          </span>
        </div>
        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
          {dayBlocks.filter((b) => b.completed).length} completed
        </span>
      </div>

      {/* Hourly Timeline Container */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-3 sm:p-4 shadow-sm overflow-hidden">
        {/* Hourly lines */}
        <div className="relative">
          {hours.map((hour) => {
            const hourFormatted = `${String(hour).padStart(2, '0')}:00`;
            const displayLabel = `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour} ${
              hour >= 12 ? 'PM' : 'AM'
            }`;

            // Find blocks starting in this hour slot
            const blocksThisHour = dayBlocks.filter((b) => {
              const startH = parseInt(b.startTime.split(':')[0], 10);
              return startH === hour;
            });

            return (
              <div
                key={hour}
                style={{ minHeight: `${HOUR_HEIGHT}px` }}
                className="relative group border-t border-slate-100 dark:border-slate-800/80 flex items-start pt-1.5"
              >
                {/* Time label */}
                <div className="w-14 sm:w-16 flex-shrink-0 text-[11px] font-medium text-slate-400 select-none">
                  {displayLabel}
                </div>

                {/* Content lane */}
                <div className="flex-1 pl-2 relative min-h-[64px] flex flex-col justify-center">
                  {blocksThisHour.length === 0 && (
                    <button
                      onClick={() => handleSlotClick(hourFormatted)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-indigo-600 dark:text-indigo-400 font-medium py-1 px-2.5 rounded-lg border border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 inline-flex items-center gap-1 self-start"
                    >
                      <Plus className="w-3 h-3" />
                      Block {displayLabel}
                    </button>
                  )}

                  {/* Render blocks in this hour */}
                  <div className="space-y-2 w-full">
                    {blocksThisHour.map((block) => {
                      const colorStyle = PASTEL_COLOR_MAP[block.color];
                      const duration = getDurationText(block.startTime, block.endTime);
                      const durationMins =
                        timeToMinutes(block.endTime) - timeToMinutes(block.startTime);

                      return (
                        <div
                          key={block.id}
                          className={`rounded-2xl border p-3 transition-all shadow-xs ${colorStyle.bg} ${colorStyle.border} ${
                            block.completed ? 'opacity-60 line-through' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1">
                              {/* Complete Checkbox */}
                              <button
                                onClick={() => toggleTimeBlockCompleted(block.id)}
                                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                  block.completed
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-400/60 bg-white/80 dark:bg-slate-800'
                                }`}
                              >
                                {block.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4
                                    className={`text-xs sm:text-sm font-semibold truncate ${colorStyle.text}`}
                                  >
                                    {block.title}
                                  </h4>
                                  <span
                                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorStyle.badge}`}
                                  >
                                    {block.category}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                  <span>
                                    {block.startTime} – {block.endTime}
                                  </span>
                                  <span>•</span>
                                  <span className="font-medium">{duration}</span>
                                </div>

                                {block.notes && (
                                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                                    {block.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              {onStartFocus && !block.completed && (
                                <button
                                  onClick={() =>
                                    onStartFocus(block.title, Math.max(15, durationMins || 25))
                                  }
                                  title="Start focus timer for this block"
                                  className="w-7 h-7 rounded-lg bg-white/80 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:scale-105 shadow-xs transition-transform"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                </button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center">
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-32 rounded-xl text-xs">
                                  <DropdownMenuItem
                                    onClick={() => handleEditBlock(block)}
                                    className="cursor-pointer"
                                  >
                                    <Edit2 className="w-3 h-3 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => deleteTimeBlock(block.id)}
                                    className="cursor-pointer text-rose-600"
                                  >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Current Time Indicator Red/Indigo Line */}
          {isViewingToday && currentIndicatorTop !== null && (
            <div
              className="absolute left-14 sm:left-16 right-0 z-10 pointer-events-none flex items-center"
              style={{ top: `${currentIndicatorTop}px` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-200 dark:ring-rose-900/60 -ml-1.5 animate-pulse" />
              <div className="flex-1 h-[2px] bg-rose-500/80 shadow-xs" />
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/80 px-1.5 py-0.5 rounded-md ml-1 shadow-xs border border-rose-200">
                NOW
              </span>
            </div>
          )}
        </div>
      </div>

      {/* TimeBlock Modal */}
      <TimeBlockModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        blockToEdit={blockToEdit}
        defaultStartTime={defaultStartTime}
        defaultDate={selectedDate}
      />
    </div>
  );
};
