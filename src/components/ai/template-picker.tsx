'use client';

import { useState, useMemo } from 'react';
import { ChatTemplate, ChatTemplateType, DEFAULT_CHAT_TEMPLATES, TEMPLATE_VARIABLES, QUICK_TEMPLATES } from '@/lib/templates/chat-templates';
import { chatTemplateEngine } from '@/lib/templates/chat-template-engine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Zap, Lightbulb, CheckSquare, Repeat2, Target, Clock, Bell } from 'lucide-react';
import clsx from 'clsx';

// Icon name to component map
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CheckSquare,
  Repeat2,
  Target,
  Clock,
  Bell,
  Search,
  BookOpen,
  Zap,
  Lightbulb,
};

interface TemplatePickerProps {
  onTemplateSelect: (templateId: string, variables: Record<string, any>) => void;
  onClose?: () => void;
}

export function TemplatePicker({ onTemplateSelect, onClose }: TemplatePickerProps) {
  const [view, setView] = useState<'quick' | 'browse' | 'search'>('quick');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ChatTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [templateType, setTemplateType] = useState<ChatTemplateType | 'all'>('all');

  // Filter templates berdasarkan search dan type
  const filteredTemplates = useMemo(() => {
    let templates = Object.values(DEFAULT_CHAT_TEMPLATES);

    if (templateType !== 'all') {
      templates = templates.filter((t) => t.type === templateType);
    }

    if (searchQuery) {
      templates = chatTemplateEngine.searchTemplates(searchQuery);
    }

    return templates;
  }, [searchQuery, templateType]);

  const handleTemplateSelect = (template: ChatTemplate) => {
    setSelectedTemplate(template);
    setFormData({});
  };

  const handleFormChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = () => {
    if (selectedTemplate) {
      const validation = chatTemplateEngine.validateVariables(selectedTemplate.id, formData);
      if (!validation.valid) {
        alert(`Missing required fields:\n${validation.errors.join('\n')}`);
        return;
      }
      onTemplateSelect(selectedTemplate.id, formData);
      setSelectedTemplate(null);
      setFormData({});
      onClose?.();
    }
  };

  const templateVars = selectedTemplate ? TEMPLATE_VARIABLES[selectedTemplate.type] || [] : [];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-black pb-2">
        <button
          onClick={() => setView('quick')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t transition-colors',
            view === 'quick'
              ? 'bg-blue-600 text-white'
              : 'bg-black-800 text-gray-300 hover:bg-black-700'
          )}
        >
          <Zap className="w-4 h-4" />
          Quick Templates
        </button>
        <button
          onClick={() => setView('browse')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t transition-colors',
            view === 'browse'
              ? 'bg-blue-600 text-white'
              : 'bg-black-800 text-gray-300 hover:bg-black-700'
          )}
        >
          <BookOpen className="w-4 h-4" />
          Browse All
        </button>
        <button
          onClick={() => setView('search')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t transition-colors',
            view === 'search'
              ? 'bg-blue-600 text-white'
              : 'bg-black-800 text-gray-300 hover:bg-black-700'
          )}
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {/* Quick Templates View */}
      {view === 'quick' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {QUICK_TEMPLATES.map((quick) => {
              const template = chatTemplateEngine.getTemplate(quick.template);
              if (!template) return null;
              
              const IconComponent = ICON_MAP[quick.icon];

              return (
                <Button
                  key={quick.template}
                  variant="outline"
                  className="h-auto p-4 text-left justify-start flex-col items-start border-black bg-black-800 hover:bg-black-700"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-center gap-2">
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                    <div className="font-semibold">{quick.label}</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{quick.shortcut}</div>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Browse Templates View */}
      {view === 'browse' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Filter by Type</label>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value as any)}
              className="w-full px-3 py-2 bg-black-800 border border-black rounded text-white"
            >
              <option value="all">All Templates</option>
              <option value="task">Tasks</option>
              <option value="habit">Habits</option>
              <option value="goal">Goals</option>
              <option value="time_block">Time Blocks</option>
              <option value="reminder">Reminders</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={clsx(
                  'cursor-pointer p-4 rounded border transition-colors',
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-black-700'
                    : 'border-black bg-black-800 hover:bg-black-700'
                )}
                onClick={() => handleTemplateSelect(template)}
              >
                <h3 className="font-semibold text-base text-white">{template.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-black-900 rounded text-gray-300 border border-black"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search View */}
      {view === 'search' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black-800 border-black"
            />
          </div>

          {searchQuery && filteredTemplates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={clsx(
                    'cursor-pointer p-4 rounded border transition-colors',
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-black-700'
                      : 'border-black bg-black-800 hover:bg-black-700'
                  )}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <h3 className="font-semibold text-base text-white">{template.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                  {template.examples?.[0] && (
                    <p className="text-xs text-gray-500 mt-2">Example: "{template.examples[0]}"</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {searchQuery && filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No templates found for "{searchQuery}"
            </div>
          )}

          {!searchQuery && (
            <div className="text-center py-8 text-gray-400">
              Start typing to search for templates...
            </div>
          )}
        </div>
      )}

      {/* Template Form */}
      {selectedTemplate && (
        <div className="mt-6 p-6 rounded border border-black bg-black-800">
          <h2 className="text-lg font-semibold text-white mb-2">{selectedTemplate.name}</h2>
          <p className="text-sm text-gray-400 mb-4">{selectedTemplate.description}</p>

          <div className="space-y-4">
            {/* Template Info */}
            {selectedTemplate.examples && selectedTemplate.examples.length > 0 && (
              <div className="p-3 bg-black-900 rounded border border-black">
                <p className="text-xs font-semibold text-gray-300 mb-2">Examples:</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  {selectedTemplate.examples.slice(0, 3).map((ex, i) => (
                    <li key={i}>• "{ex}"</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form Fields */}
            {templateVars.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-white">Fill in the details:</p>
                {templateVars.map((varDef) => (
                  <div key={varDef.name} className="space-y-2">
                    <label className="text-sm text-white font-medium">
                      {varDef.name}
                      {varDef.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {varDef.type === 'select' && varDef.options ? (
                      <select
                        value={formData[varDef.name] || ''}
                        onChange={(e) => handleFormChange(varDef.name, e.target.value)}
                        className="w-full px-3 py-2 bg-black-900 border border-black rounded text-white"
                      >
                        <option value="">{varDef.placeholder}</option>
                        {varDef.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : varDef.type === 'number' ? (
                      <Input
                        type="number"
                        placeholder={varDef.placeholder}
                        value={formData[varDef.name] || ''}
                        onChange={(e) =>
                          handleFormChange(varDef.name, e.target.value ? parseInt(e.target.value) : '')
                        }
                        className="bg-black-900 border-black"
                      />
                    ) : varDef.type === 'date' ? (
                      <Input
                        type="date"
                        placeholder={varDef.placeholder}
                        value={formData[varDef.name] || ''}
                        onChange={(e) => handleFormChange(varDef.name, e.target.value)}
                        className="bg-black-900 border-black"
                      />
                    ) : (
                      <Input
                        placeholder={varDef.placeholder}
                        value={formData[varDef.name] || ''}
                        onChange={(e) => handleFormChange(varDef.name, e.target.value)}
                        className="bg-black-900 border-black"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-black">
              <Button variant="outline" onClick={() => setSelectedTemplate(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Use Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
