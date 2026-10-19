import React, { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Plus, Home, Target, Tag, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Today', icon: Home },
  { path: '/habits', label: 'Habits', icon: Target },
  { path: '/categories', label: 'Categories', icon: Tag },
  { path: '/settings', label: 'Settings', icon: Settings },
] as const;

export function Layout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Outlet />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border safe-area-inset-bottom">
        <div className="flex justify-around py-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )
              }
            >
              <Icon className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* FAB Menu */}
      <div className="fixed bottom-20 right-4 z-40 safe-area-inset-bottom">
        <AnimatePresence>
          {fabOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 right-0 w-56"
            >
              <div className="flex flex-col-reverse gap-3 pr-4">
                <motion.button
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ delay: 0.05 }}
                  onClick={() => {
                    setFabOpen(false);
                    // Navigate to add task
                    window.location.href = '/add-task';
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl shadow-lg border border-border text-left w-full hover:bg-accent transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="font-medium">New Task</span>
                </motion.button>

                <motion.button
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => {
                    setFabOpen(false);
                    window.location.href = '/add-habit';
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl shadow-lg border border-border text-left w-full hover:bg-accent transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-medium">New Habit</span>
                </motion.button>

                <motion.button
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ delay: 0.15 }}
                  onClick={() => {
                                      setFabOpen(false);
                                      window.location.href = '/categories';
                                    }}
                  className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl shadow-lg border border-border text-left w-full hover:bg-accent transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="font-medium">New Category</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300',
            'bg-primary text-primary-foreground',
            fabOpen && 'rotate-45 bg-primary/80'
          )}
        >
          <Plus className="w-6 h-6" aria-hidden="true" />
        </motion.button>
      </div>

      {/* Theme toggle floating button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-40 w-10 h-10 rounded-xl bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center shadow-lg hover:bg-accent transition-colors"
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? (
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </button>
    </div>
  );
}