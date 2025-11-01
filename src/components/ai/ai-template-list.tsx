'use client';

import { useState } from 'react';
import { DEFAULT_CHAT_TEMPLATES, QUICK_TEMPLATES } from '@/lib/templates/chat-templates';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Zap, FileText, Sparkles, Target, Clock, Bell, Lightbulb, BookOpen } from 'lucide-react';
import clsx from 'clsx';

interface TemplateListProps {
  onTemplateClick?: (templateId: string) => void;
}

export function AIChatTemplateList({ onTemplateClick }: TemplateListProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('quick');

  // Group templates by type
  const templates = Object.values(DEFAULT_CHAT_TEMPLATES);
  const grouped: Record<string, typeof templates> = {};

  templates.forEach((t) => {
    const category = t.category || t.type;
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(t);
  });

  const categories = [
    { key: 'quick', label: 'Quick Templates', icon: <Zap className="w-4 h-4" />, templates: QUICK_TEMPLATES.map(q => DEFAULT_CHAT_TEMPLATES[q.template as keyof typeof DEFAULT_CHAT_TEMPLATES]).filter(Boolean) },
    { key: 'task', label: 'Tasks', icon: <FileText className="w-4 h-4" /> },
    { key: 'habit', label: 'Habits', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'goal', label: 'Goals', icon: <Target className="w-4 h-4" /> },
    { key: 'time_block', label: 'Time Blocks', icon: <Clock className="w-4 h-4" /> },
    { key: 'reminder', label: 'Reminders', icon: <Bell className="w-4 h-4" /> },
    { key: 'general', label: 'General', icon: <Lightbulb className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-black-900 rounded-lg border border-black">
      {/* Header */}
      <div className="p-4 border-b border-black">
        <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Available Templates
        </h3>
        <p className="text-xs text-gray-400">Click a template to use it or get inspiration</p>
      </div>

      {/* Template Categories */}
      <div className="max-h-96 overflow-y-auto">
        {categories.map((category) => {
          const categoryTemplates = (category.key === 'quick' 
            ? category.templates 
            : grouped[category.key]) ?? [];
          
          if (categoryTemplates.length === 0) return null;

          const isExpanded = expandedCategory === category.key;

          return (
            <div key={category.key} className="border-b border-black last:border-b-0">
              {/* Category Header */}
              <button
                onClick={() =>
                  setExpandedCategory(isExpanded ? null : category.key)
                }
                className="w-full flex items-center justify-between p-3 hover:bg-black-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4">{category.icon}</div>
                  <span className="text-sm font-medium text-white">
                    {category.label}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto mr-2">
                    ({categoryTemplates.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Templates List */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2 bg-black-950">
                  {categoryTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => onTemplateClick?.(template.id)}
                      className="w-full text-left px-3 py-2 rounded border border-black bg-black-900 hover:bg-black-800 hover:border-blue-500 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white group-hover:text-blue-300 truncate">
                            {template.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-block text-xs px-1.5 py-0.5 bg-black-800 text-gray-300 rounded border border-black"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-black bg-black-950 text-xs text-gray-400 flex items-center gap-2">
        <Lightbulb className="w-4 h-4" />
        <p>Click any template to use it or get examples of how to use it.</p>
      </div>
    </div>
  );
}
