/**
 * Chat Template Engine
 * Mengolah dan menjalankan chat templates dengan interpolasi variabel
 */

import {
  ChatTemplate,
  DEFAULT_CHAT_TEMPLATES,
  TEMPLATE_VARIABLES,
  ChatTemplateType,
  TemplateExecutionContext,
  ChatTemplateVariable,
} from './chat-templates';

export interface ProcessedTemplate {
  template: ChatTemplate;
  prompt: string;
  systemMessage: string;
  variables: ChatTemplateVariable[];
}

export class ChatTemplateEngine {
  private templates: Map<string, ChatTemplate> = new Map();

  constructor(initialTemplates?: Record<string, ChatTemplate>) {
    // Load default templates
    Object.entries(DEFAULT_CHAT_TEMPLATES).forEach(([key, template]) => {
      this.templates.set(key, template);
    });

    // Load custom templates if provided
    if (initialTemplates) {
      Object.entries(initialTemplates).forEach(([key, template]) => {
        this.templates.set(key, template);
      });
    }
  }

  /**
   * Dapatkan template berdasarkan ID
   */
  getTemplate(templateId: string): ChatTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Dapatkan semua template
   */
  getAllTemplates(): ChatTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Filter template berdasarkan tipe
   */
  getTemplatesByType(type: ChatTemplateType): ChatTemplate[] {
    return Array.from(this.templates.values()).filter((t) => t.type === type);
  }

  /**
   * Filter template berdasarkan category
   */
  getTemplatesByCategory(category: string): ChatTemplate[] {
    return Array.from(this.templates.values()).filter((t) => t.category === category);
  }

  /**
   * Cari template berdasarkan keywords
   */
  searchTemplates(query: string): ChatTemplate[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.templates.values()).filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description?.toLowerCase().includes(lowerQuery) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Register custom template
   */
  registerTemplate(template: ChatTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Remove template
   */
  removeTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  /**
   * Interpolate template dengan variables
   */
  interpolateTemplate(template: string, variables: Record<string, any>): string {
    let result = template;

    // Replace {{variableName}} dengan nilai dari variables
    const regex = /\{\{(\w+)\}\}/g;
    result = result.replace(regex, (match, varName) => {
      return variables[varName] !== undefined ? String(variables[varName]) : match;
    });

    return result;
  }

  /**
   * Process template dengan konteks eksekusi
   */
  processTemplate(
    templateId: string,
    variables: Record<string, any>
  ): ProcessedTemplate | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    const prompt = this.interpolateTemplate(template.promptTemplate, variables);
    const systemMessage = this.interpolateTemplate(template.systemMessage, variables);
    const templateVars = TEMPLATE_VARIABLES[template.type] || [];

    return {
      template,
      prompt,
      systemMessage,
      variables: templateVars,
    };
  }

  /**
   * Generate prompt dari template dengan variabel
   */
  generatePrompt(templateId: string, variables: Record<string, any>): string {
    const processed = this.processTemplate(templateId, variables);
    return processed ? processed.prompt : '';
  }

  /**
   * Generate system message dari template
   */
  generateSystemMessage(templateId: string, variables?: Record<string, any>): string {
    const processed = this.processTemplate(templateId, variables || {});
    return processed ? processed.systemMessage : '';
  }

  /**
   * Validate variables terhadap template requirements
   */
  validateVariables(templateId: string, variables: Record<string, any>): {
    valid: boolean;
    errors: string[];
  } {
    const template = this.getTemplate(templateId);
    if (!template) {
      return { valid: false, errors: ['Template not found'] };
    }

    const templateVars = TEMPLATE_VARIABLES[template.type] || [];
    const errors: string[] = [];

    // Check required variables
    templateVars.forEach((varDef) => {
      if (varDef.required && !variables[varDef.name]) {
        errors.push(`Required variable missing: ${varDef.name}`);
      }
    });

    // Validate variable types if strict validation is needed
    templateVars.forEach((varDef) => {
      const value = variables[varDef.name];
      if (value !== undefined && varDef.type === 'number' && typeof value !== 'number') {
        errors.push(`Variable ${varDef.name} must be a number`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Build chat template dengan wizard interface data
   */
  buildTemplateFromForm(templateId: string, formData: Record<string, any>): ProcessedTemplate | null {
    const validation = this.validateVariables(templateId, formData);
    if (!validation.valid) {
      console.warn('Template validation errors:', validation.errors);
      // Proceed anyway, but log warnings
    }

    return this.processTemplate(templateId, formData);
  }

  /**
   * Get template dengan examples untuk user reference
   */
  getTemplateWithExamples(templateId: string): ChatTemplate | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    return template;
  }

  /**
   * Generate natural language instruction dari template
   */
  generateInstructions(templateId: string): string {
    const template = this.getTemplateWithExamples(templateId);
    if (!template) return '';

    let instructions = `# ${template.name}\n\n`;
    instructions += `${template.description || template.name}\n\n`;

    const variables = TEMPLATE_VARIABLES[template.type] || [];
    if (variables && variables.length > 0) {
      instructions += '## Fill in the following:\n';
      variables.forEach((v: ChatTemplateVariable) => {
        instructions += `- **${v.name}** (${v.required ? 'required' : 'optional'}): ${v.placeholder}\n`;
      });
      instructions += '\n';
    }

    if (template.examples && template.examples.length > 0) {
      instructions += '## Examples:\n';
      template.examples.forEach((ex) => {
        instructions += `- "${ex}"\n`;
      });
    }

    return instructions;
  }

  /**
   * Quick template helpers untuk common patterns
   */
  createQuickTask(title: string, priority?: string, dueDate?: string): string {
    return this.generatePrompt('task-simple', { title, priority, dueDate });
  }

  createQuickHabit(habitName: string, category?: string, frequency?: string): string {
    return this.generatePrompt('habit-daily', { habitName, category, frequency });
  }

  createQuickGoal(goal1: string, goal2?: string, goal3?: string): string {
    return this.generatePrompt('goal-daily', { goal1, goal2, goal3 });
  }

  createQuickTimeBlock(task: string, duration: number): string {
    return this.generatePrompt('timeblock-focus', { task, duration });
  }

  createQuickReminder(message: string, time: string): string {
    return this.generatePrompt('reminder-simple', { message, time });
  }

  /**
   * Suggest template berdasarkan user input
   */
  suggestTemplate(userInput: string): ChatTemplate | null {
    const lowerInput = userInput.toLowerCase();

    // Simple keyword matching untuk suggest template
    if (
      lowerInput.includes('task') ||
      lowerInput.includes('add') ||
      lowerInput.includes('do')
    ) {
      return this.getTemplate('task-simple')!;
    }
    if (
      lowerInput.includes('habit') ||
      lowerInput.includes('routine') ||
      lowerInput.includes('daily')
    ) {
      return this.getTemplate('habit-daily')!;
    }
    if (
      lowerInput.includes('goal') ||
      lowerInput.includes('target') ||
      lowerInput.includes('achieve')
    ) {
      return this.getTemplate('goal-daily')!;
    }
    if (
      lowerInput.includes('time') ||
      lowerInput.includes('block') ||
      lowerInput.includes('schedule') ||
      lowerInput.includes('focus')
    ) {
      return this.getTemplate('timeblock-focus')!;
    }
    if (
      lowerInput.includes('remind') ||
      lowerInput.includes('reminder') ||
      lowerInput.includes('alert')
    ) {
      return this.getTemplate('reminder-simple')!;
    }

    return null;
  }

  /**
   * Export templates ke format JSON untuk backup/sharing
   */
  exportTemplates(): string {
    const templates = Array.from(this.templates.values());
    return JSON.stringify(templates, null, 2);
  }

  /**
   * Import templates dari format JSON
   */
  importTemplates(jsonString: string): { success: boolean; imported: number; errors: string[] } {
    const errors: string[] = [];
    let imported = 0;

    try {
      const templates = JSON.parse(jsonString) as ChatTemplate[];
      templates.forEach((template) => {
        try {
          this.registerTemplate(template);
          imported++;
        } catch (error) {
          errors.push(`Failed to import template ${template.id}: ${error}`);
        }
      });
    } catch (error) {
      errors.push(`Invalid JSON: ${error}`);
    }

    return { success: errors.length === 0, imported, errors };
  }
}

// Singleton instance
export const chatTemplateEngine = new ChatTemplateEngine();
