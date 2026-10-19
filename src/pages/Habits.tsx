import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Label, Description } from '@/components/ui';
import { useStorage } from '@/utils/storage';
import { Plus, Target, Flame, Trophy, Check, X, Calendar, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Habits() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [habitName, setHabitName] = useState('');
  const [habitColor, setHabitColor] = useState('#6366F1');
  const [habitIcon, setHabitIcon] = useState('target');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [celebratingHabit, setCelebratingHabit] = useState<string | null>(null);

  const habitColors = [
    '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'
  ];

  const habitIcons = [
    { name: 'target', icon: Target },
    { name: 'flame', icon: Flame },
    { name: 'star', icon: Star },
    { name: 'sparkles', icon: Sparkles },
    { name: 'calendar', icon: Calendar },
  ];

  const today = new Date().toISOString().split('T')[0];

  const handleAddHabit = () => {
    if (!habitName.trim()) return;
    const newHabit: any = {
      id: Date.now().toString(),
      name: habitName.trim(),
      color: habitColor,
      icon: habitIcon,
      frequency: 'daily',
      target: 1,
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    useStorage.addHabit(newHabit);
    setHabitName('');
    setShowAddHabit(false);
    navigate('/habits');
    window.location.reload();
  };

  const handleToggleHabit = (habitId: string) => {
    useStorage.toggleHabitCompletion(habitId, today);
    // Check for streak milestone
    const data = useStorage.loadAppData();
    const habit = data.habits.find(h => h.id === habitId);
    if (habit && habit.streak > 0 && habit.streak % 7 === 0) {
      setCelebratingHabit(habitId);
      setTimeout(() => setCelebratingHabit(null), 3000);
    }
    window.location.reload();
  };

  const habits = useStorage.loadAppData().habits;

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-medium">
          Habit Tracker
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => useTheme().toggleTheme()}
            className="rounded-full p-2 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Habit list */}
      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
            <Target className="w-12 h-12 text-indigo-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-medium mb-2">No habits yet</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-xs">
            Start building positive routines by adding your first habit
          </p>
          <Button
            onClick={() => setShowAddHabit(true)}
            className="w-full max-w-xs"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Add Your First Habit
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: habit.id * 0.01 }}
              className="rounded-xl p-4 transition-all duration-300"
              style={{ background: `${habit.color}15`, border: `1px solid ${habit.color}40` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${habit.color}20` }}
                  >
                    {habitIcons.find(i => i.name === habit.icon)?.icon ? (
                      React.createElement(habitIcons.find(i => i.name === habit.icon)!.icon, {
                        className: "w-6 h-6",
                        style: { color: habit.color },
                        "aria-hidden": "true"
                      })
                    ) : (
                      <Target className="w-6 h-6" style={{ color: habit.color }} aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{habit.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {habit.frequency === 'daily' ? 'Daily' : 'Weekly'} habit
                    </p>
                  </div>
                </div>

                {/* Streak badge */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-1 rounded-full"
                  style={{ background: `${habit.color}20` }}
                >
                  <Flame className="w-4 h-4" style={{ color: habit.color }} aria-hidden="true" />
                  <span className="font-bold" style={{ color: habit.color }}>
                    {habit.streak}
                  </span>
                  <span className="text-sm text-muted-foreground">day streak</span>
                </motion.div>
              </div>

              {/* Progress ring */}
              <div className="flex items-center justify-between mb-3">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-muted-foreground/20"
                    />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={176}
                      strokeDashoffset={176 * (1 - Math.min(habit.streak / 30, 1))}
                      style={{ color: habit.color }}
                      initial={{ strokeDashoffset: 176 }}
                      animate={{ strokeDashoffset: 176 * (1 - Math.min(habit.streak / 30, 1)) }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-bold text-lg" style={{ color: habit.color }}>
                      {Math.min(Math.round((habit.streak / 30) * 100), 100)}%
                    </span>
                  </div>
                </div>

                <div className="flex-1 ml-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">Today</span>
                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
                        habit.completedDates.includes(today)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      )}
                      aria-label={habit.completedDates.includes(today) ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {habit.completedDates.includes(today) ? (
                        <Check className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <X className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <div className="flex gap-1" role="progressbar" aria-valuenow={habit.streak} aria-valuemin={0} aria-valuemax={30}>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex-1 h-2 rounded"
                        style={{
                          background: i < habit.streak % 7 ? habit.color : 'transparent',
                          border: `1px solid ${habit.color}40`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Completion history */}
              <div className="flex gap-1 overflow-x-auto pb-2">
                {habit.completedDates.slice(-14).map((date, i) => (
                  <motion.div
                    key={date}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
                    style={{
                      background: habit.completedDates.includes(date) ? `${habit.color}20` : 'transparent',
                      border: `1px solid ${habit.color}40`,
                      color: habit.completedDates.includes(date) ? habit.color : 'transparent'
                    }}
                  >
                    {habit.completedDates.includes(date) && <Check className="w-4 h-4" aria-hidden="true" />}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Habit Modal */}
      {showAddHabit && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-20 right-4 z-40"
        >
          <div className="rounded-xl p-6 bg-card/95 backdrop-blur-sm border border-border shadow-lg w-80">
            <h3 className="font-medium mb-4">New Habit</h3>
            <Input
              placeholder="Habit name (e.g., Morning run)"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              className="mb-4"
            />
            <div className="mb-4">
              <Label className="block mb-2">Color</Label>
              <div className="flex gap-2 flex-wrap">
                {habitColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setHabitColor(color)}
                    className={cn(
                      'w-8 h-8 rounded-lg border-2 transition-all duration-200',
                      habitColor === color ? 'border-foreground scale-110' : 'border-transparent'
                    )}
                    style={{ background: color }}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <Label className="block mb-2">Icon</Label>
              <div className="flex gap-2">
                {habitIcons.map(({ name, icon: Icon }) => (
                  <button
                    key={name}
                    onClick={() => setHabitIcon(name)}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-200',
                      habitIcon === name ? 'border-primary bg-primary/10' : 'border-transparent hover:border-muted'
                    )}
                  >
                    <Icon className="w-5 h-5" style={{ color: habitColor }} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleAddHabit}
              className="w-full mt-4"
              disabled={!habitName.trim()}
            >
              {habitName.trim() ? 'Add Habit' : 'Add habit'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Celebration overlay */}
      <AnimatePresence>
        {celebratingHabit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setCelebratingHabit(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-card rounded-2xl p-8 max-w-md mx-4 text-center"
            >
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: `${habits.find(h => h.id === celebratingHabit)?.color}20` }}
              >
                <Trophy className="w-10 h-10"
                  style={{ color: habits.find(h => h.id === celebratingHabit)?.color }}
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">Streak Milestone!</h3>
              <p className="text-muted-foreground mb-6">
                You've reached a {habits.find(h => h.id === celebratingHabit)?.streak}-day streak!
              </p>
              <Button
                onClick={() => setCelebratingHabit(null)}
                className="w-full"
              >
                Awesome!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 bg-emerald-500 text-white"
        onClick={() => setShowAddHabit(true)}
      >
        <Plus className="w-6 h-6" aria-hidden="true" />
      </motion.button>
    </div>
  );
}