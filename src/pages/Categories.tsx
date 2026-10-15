import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from '@tanstack/react-router';
import { Card, Input, Button, Label, Description } from '@/components/ui';
import { useStorage } from '@/utils/storage';
import { Plus, Tag, Trash2, Check, X, Calendar, Sun, Moon, Palette, BookOpen, DollarSign, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Categories() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#6366F1');
  const [categoryIcon, setCategoryIcon] = useState('tag');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [editingIcon, setEditingIcon] = useState('');

  const categoryIcons = [
    { name: 'work', icon: Palette, label: 'Work' },
    { name: 'personal', icon: Sun, label: 'Personal' },
    { name: 'health', icon: Moon, label: 'Health' },
    { name: 'learning', icon: BookOpen, label: 'Learning' },
    { name: 'finance', icon: DollarSign, label: 'Finance' },
    { name: 'social', icon: Users, label: 'Social' },
    { name: 'creative', icon: Palette, label: 'Creative' },
    { name: 'other', icon: Tag, label: 'Other' },
  ];

  const today = new Date().toISOString().split('T')[0];

  const handleAddCategory = () => {
    if (!categoryName.trim()) return;
    const newCategory: any = {
      id: Date.now().toString(),
      name: categoryName.trim(),
      color: categoryColor,
      icon: categoryIcon,
    };
    useStorage.saveCategory(newCategory);
    setCategoryName('');
    setShowAddCategory(false);
    navigate('/categories');
    window.location.reload();
  };

  const handleUpdateCategory = () => {
    if (!editingName.trim()) return;
    const updatedCategory: any = {
      id: editingCategoryId!,
      name: editingName.trim(),
      color: editingColor,
      icon: editingIcon,
    };
    useStorage.saveCategory(updatedCategory);
    setEditingCategoryId(null);
    navigate('/categories');
    window.location.reload();
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Delete this category? Tasks in this category will lose their category association.')) {
      useStorage.deleteCategory(id);
      navigate('/categories');
      window.location.reload();
    }
  };

  const categories = useStorage.loadAppData().categories;

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-medium">
          Categories & Tags
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

      {/* Categories list */}
      {categories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
            <Tag className="w-12 h-12 text-indigo-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-medium mb-2">No categories yet</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-xs">
            Organize your tasks by creating custom categories
          </p>
          <Button
            onClick={() => setShowAddCategory(true)}
            className="w-full max-w-xs"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Add First Category
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: category.id * 0.01 }}
              className="rounded-xl p-4 transition-all duration-300"
              style={{ background: `${category.color}15`, border: `1px solid ${category.color}40` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${category.color}20` }}
                  >
                    {categoryIcons.find(i => i.name === category.icon)?.icon ? (
                      React.createElement(categoryIcons.find(i => i.name === category.icon)!.icon, {
                        className: "w-6 h-6",
                        style: { color: category.color },
                        "aria-hidden": "true"
                      })
                    ) : (
                      <Tag className="w-6 h-6" style={{ color: category.color }} aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Used in {useStorage.loadAppData().tasks.filter(t => t.categoryId === category.id).length} tasks
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingCategoryId(category.id);
                      setEditingName(category.name);
                      setEditingColor(category.color);
                      setEditingIcon(category.icon);
                    }}
                    className="rounded-sm px-2 py-1 text-sm transition-all duration-200"
                    aria-label="Edit category"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="rounded-sm px-2 py-1 text-sm text-destructive transition-all duration-200"
                    aria-label="Delete category"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {(showAddCategory || editingCategoryId) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-20 right-4 z-40"
        >
          <div className="rounded-xl p-6 bg-card/95 backdrop-blur-sm border border-border shadow-lg w-80">
            <h3 className="font-medium mb-4">
              {editingCategoryId ? 'Edit Category' : 'New Category'}
            </h3>
            <Input
              placeholder="Category name"
              value={editingCategoryId ? editingName : categoryName}
              onChange={(e) => {
                if (editingCategoryId) setEditingName(e.target.value);
                else setCategoryName(e.target.value);
              }}
              className="mb-4"
            />
            <div className="mb-4">
              <Label className="block mb-2">Color</Label>
              <div className="flex gap-2 flex-wrap">
                {categoryIcons.map((icon) => (
                  <button
                    key={icon.name}
                    onClick={() => {
                      if (editingCategoryId) setEditingColor(icon.icon === Palette ? '#6366F1' : icon.icon === Sun ? '#FBBF24' : icon.icon === Moon ? '#6366F1' : '#10B981');
                      else setCategoryColor(icon.icon === Palette ? '#6366F1' : icon.icon === Sun ? '#FBBF24' : icon.icon === Moon ? '#6366F1' : '#10B981');
                    }}
                    className={cn(
                      'w-8 h-8 rounded-lg border-2 transition-all duration-200',
                      (editingCategoryId ? editingColor : categoryColor) ===
                        (icon.icon === Palette ? '#6366F1' : icon.icon === Sun ? '#FBBF24' : icon.icon === Moon ? '#6366F1' : '#10B981')
                        ? 'border-foreground scale-110'
                        : 'border-transparent'
                    )}
                    style={{ background: icon.icon === Palette ? '#6366F1' : icon.icon === Sun ? '#FBBF24' : icon.icon === Moon ? '#6366F1' : '#10B981' }}
                    aria-label={`Select ${icon.label} color`}
                  >
                    {icon.icon === Palette ? (
                      <Palette className="w-5 h-5" aria-hidden="true" />
                    ) : icon.icon === Sun ? (
                      <Sun className="w-5 h-5" aria-hidden="true" />
                    ) : icon.icon === Moon ? (
                      <Moon className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Tag className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <Label className="block mb-2">Icon</Label>
              <div className="flex gap-2">
                {categoryIcons.map(({ name, icon: Icon, label }) => (
                  <button
                    key={name}
                    onClick={() => {
                      if (editingCategoryId) setEditingIcon(name);
                      else setCategoryIcon(name);
                    }}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-200',
                      (editingCategoryId ? editingIcon : categoryIcon) === name
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent hover:border-muted'
                    )}
                  >
                    <Icon className="w-5 h-5" style={{ color: editingCategoryId ? editingColor : categoryColor }} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={editingCategoryId ? handleUpdateCategory : handleAddCategory}
              className="w-full mt-4"
              disabled={!(editingCategoryId ? editingName : categoryName).trim()}
            >
              {editingCategoryId ? 'Update Category' : 'Add Category'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 bg-amber-500 text-white"
        onClick={() => setShowAddCategory(true)}
      >
        <Plus className="w-6 h-6" aria-hidden="true" />
      </motion.button>
    </div>
  );
}