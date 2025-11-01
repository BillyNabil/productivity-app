/**
 * Chat Template System - Central Export Point
 * Import semua yang kamu butuh dari satu tempat
 */

// ============================================
// Template Definitions & Types
// ============================================
export {
  DEFAULT_CHAT_TEMPLATES,
  TEMPLATE_VARIABLES,
  QUICK_TEMPLATES,
  type ChatTemplate,
  type ChatTemplateType,
  type ChatTemplateVariable,
  type TemplateExecutionContext,
} from './chat-templates';

// ============================================
// Template Engine
// ============================================
export { chatTemplateEngine, ChatTemplateEngine, type ProcessedTemplate } from './chat-template-engine';

// ============================================
// Examples (for reference & testing)
// ============================================
export {
  exampleQuickUsage,
  exampleSearchAndDiscovery,
  exampleTemplateSuggestion,
  exampleVariableValidation,
  exampleCustomTemplate,
  exampleTemplateInstructions,
  exampleBuildingForm,
  exampleImportExport,
  exampleCompleteWorkflow,
  exampleListAllTemplates,
  runAllExamples,
} from './examples';
