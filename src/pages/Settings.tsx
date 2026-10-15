import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from '@tanstack/react-router';
import { Card, Input, Button, Label, Description, Switch } from '@/components/ui';
import { useStorage } from '@/utils/storage';
import { Plus, Download, Upload, Trash2, Clock, Bell, Palette, Database, Shield, Info, Moon, Sun, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [focusDuration, setFocusDuration] = useState(25);
  const [focusActive, setFocusActive] = useState(false);
  const [focusTimeLeft, setFocusTimeLeft] = useState(25 * 60);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [exportData, setExportData] = useState('');

  // Focus timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (focusActive && focusTimeLeft > 0) {
      interval = setInterval(() => {
        setFocusTimeLeft(prev => {
          if (prev <= 1) {
            setFocusActive(false);
            // Save focus session
            useStorage.addFocusSession({
              id: Date.now().toString(),
              duration: focusDuration,
              date: new Date().toISOString(),
              completed: true,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [focusActive, focusTimeLeft, focusDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startFocus = () => {
    setFocusTimeLeft(focusDuration * 60);
    setFocusActive(true);
  };

  const pauseFocus = () => setFocusActive(false);

  const resetFocus = () => {
    setFocusActive(false);
    setFocusTimeLeft(focusDuration * 60);
  };

  const handleExport = () => {
    const data = useStorage.loadAppData();
    const json = JSON.stringify(data, null, 2);
    setExportData(json);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dayflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        localStorage.setItem('dayflow-data', JSON.stringify(data));
        window.location.reload();
      } catch {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('This will delete ALL your data. Are you sure?')) {
      localStorage.removeItem('dayflow-data');
      window.location.reload();
    }
  };

  const stats = useStorage.loadAppData();

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-medium">
          Settings
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Sun className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Focus Timer */}
      <Card className="mb-6 rounded-xl p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-indigo-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-medium text-lg">Focus Timer</h2>
            <p className="text-sm text-muted-foreground">Pomodoro-style focus sessions</p>
          </div>
        </div>

        {/* Timer Display */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative w-full aspect-square max-w-xs mx-auto mb-6"
        >
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted-foreground/20"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={283}
              strokeDashoffset={283 * (1 - (focusDuration * 60 - focusTimeLeft) / (focusDuration * 60))}
              style={{ color: 'hsl(var(--primary))' }}
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 * (1 - (focusDuration * 60 - focusTimeLeft) / (focusDuration * 60)) }}
              transition={{ duration: 0.5, ease: 'linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl md:text-5xl font-bold tabular-nums">
              {formatTime(focusTimeLeft)}
            </span>
            <span className="text-sm text-muted-foreground mt-1">
              {focusActive ? 'Focusing...' : 'Ready to focus'}
            </span>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Label className="flex-1">
            <span className="block text-sm text-muted-foreground mb-1">Duration (minutes)</span>
            <select
              value={focusDuration}
              onChange={(e) => {
                setFocusDuration(Number(e.target.value));
                setFocusTimeLeft(Number(e.target.value) * 60);
              }}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="5">5 min</option>
              <option value="15">15 min</option>
              <option value="25">25 min</option>
              <option value="50">50 min</option>
            </select>
          </Label>
        </div>

        <div className="flex gap-3">
          {focusActive ? (
            <>
              <Button
                onClick={pauseFocus}
                variant="outline"
                className="flex-1"
              >
                Pause
              </Button>
              <Button
                onClick={resetFocus}
                variant="ghost"
                className="flex-1"
              >
                Reset
              </Button>
            </>
          ) : (
            <Button
              onClick={startFocus}
              className="flex-1"
              size="lg"
            >
              <Clock className="w-4 h-4 mr-2" aria-hidden="true" />
              Start Focus Session
            </Button>
          )}
        </div>
      </Card>

      {/* Data Management */}
      <Card className="mb-6 rounded-xl p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-medium text-lg">Data Management</h2>
            <p className="text-sm text-muted-foreground">Backup and restore your data</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleExport}
            variant="outline"
            className="w-full justify-start"
          >
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            <div className="text-left">
              <span className="font-medium">Export Data</span>
              <p className="text-xs text-muted-foreground">Download JSON backup</p>
            </div>
          </Button>

          <div className="flex items-center gap-3">
            <Label className="flex-1 cursor-pointer">
              <span className="block text-sm text-muted-foreground mb-1">Import Data</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="sr-only"
                id="import-file"
              />
              <Button
                variant="outline"
                className="w-full justify-start"
                type="button"
                onClick={() => document.getElementById('import-file')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                <div className="text-left">
                  <span className="font-medium">Import Backup</span>
                  <p className="text-xs text-muted-foreground">Restore from JSON file</p>
                </div>
              </Button>
            </Label>
          </div>

          <Button
            onClick={handleClearAll}
            variant="destructive"
            className="w-full justify-start"
          >
            <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
            <div className="text-left">
              <span className="font-medium">Clear All Data</span>
              <p className="text-xs text-muted-foreground">Permanently delete everything</p>
            </div>
          </Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="mb-6 rounded-xl p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-medium text-lg">Notifications</h2>
            <p className="text-sm text-muted-foreground">Reminders and alerts</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Daily Reminders</p>
            <p className="text-sm text-muted-foreground">Get notified about habits and tasks</p>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
            aria-label="Enable daily reminders"
          />
        </div>
      </Card>

      {/* Appearance */}
      <Card className="mb-6 rounded-xl p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-medium text-lg">Appearance</h2>
            <p className="text-sm text-muted-foreground">Customize the look and feel</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Dark Mode</p>
            <p className="text-sm text-muted-foreground">Use dark theme</p>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            aria-label="Enable dark mode"
          />
        </div>
      </Card>

      {/* Stats */}
      <Card className="mb-6 rounded-xl p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Info className="w-5 h-5 text-blue-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-medium text-lg">Statistics</h2>
            <p className="text-sm text-muted-foreground">Your productivity overview</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold text-primary">{stats.tasks.length}</p>
            <p className="text-sm text-muted-foreground">Total Tasks</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold text-emerald-500">
              {stats.tasks.filter(t => t.status === 'completed').length}
            </p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold text-amber-500">{stats.habits.length}</p>
            <p className="text-sm text-muted-foreground">Active Habits</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold text-purple-500">
              {stats.focusSessions.length}
            </p>
            <p className="text-sm text-muted-foreground">Focus Sessions</p>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="rounded-xl p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-indigo-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-medium text-lg">About</h2>
            <p className="text-sm text-muted-foreground">App information</p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>DayFlow Planner v1.0.0</p>
          <p>Built with React, TypeScript, and Tailwind CSS</p>
          <p>Data stored locally on your device</p>
        </div>
      </Card>
    </div>
  );
}