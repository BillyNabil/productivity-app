/**
 * Chat Template System - Contoh Implementasi & Use Cases
 * File ini menunjukkan berbagai cara menggunakan template system
 */

import { chatTemplateEngine } from '@/lib/templates/chat-template-engine';
import { ChatTemplate } from '@/lib/templates/chat-templates';

// ============================================
// CONTOH 1: Quick Template Usage
// ============================================

export function exampleQuickUsage() {
  console.log('=== EXAMPLE 1: Quick Template Usage ===\n');

  // Membuat task dengan cepat
  const taskPrompt = chatTemplateEngine.createQuickTask('Finish project report');
  console.log('Quick Task:', taskPrompt);
  // Output: "Create a new task: Finish project report"

  // Membuat habit
  const habitPrompt = chatTemplateEngine.createQuickHabit('Meditation', 'meditation', 'daily');
  console.log('Quick Habit:', habitPrompt);
  // Output: "Create daily habit: Meditation in category meditation"

  // Membuat goal
  const goalPrompt = chatTemplateEngine.createQuickGoal(
    'Complete project',
    'Exercise 30 min',
    'Read 1 chapter'
  );
  console.log('Quick Goal:', goalPrompt);
  // Output: "Set daily goals: ..."

  // Membuat time block
  const blockPrompt = chatTemplateEngine.createQuickTimeBlock('Coding', 90);
  console.log('Quick TimeBlock:', blockPrompt);
  // Output: "Create focus time block: 90 minutes for Coding"

  // Membuat reminder
  const reminderPrompt = chatTemplateEngine.createQuickReminder('Drink water', 'in 1 hour');
  console.log('Quick Reminder:', reminderPrompt);
  // Output: "Remind me: Drink water at in 1 hour"
}

// ============================================
// CONTOH 2: Template Search & Discovery
// ============================================

export function exampleSearchAndDiscovery() {
  console.log('\n=== EXAMPLE 2: Template Search & Discovery ===\n');

  // Search templates dengan keyword
  const focusTemplates = chatTemplateEngine.searchTemplates('focus');
  console.log('Search "focus":', focusTemplates.map((t) => t.name));
  // Output: ["Focus Time Block"]

  const priorityTemplates = chatTemplateEngine.searchTemplates('priority');
  console.log('Search "priority":', priorityTemplates.map((t) => t.name));
  // Output: ["Detailed Task with Priority"]

  // Get templates by type
  const taskTemplates = chatTemplateEngine.getTemplatesByType('task');
  console.log('All task templates:', taskTemplates.map((t) => t.name));
  // Output: ["Simple Task Creation", "Detailed Task with Priority", ...]

  // Get templates by category
  const timeBlockTemplates = chatTemplateEngine.getTemplatesByCategory('time_block');
  console.log('All time block templates:', timeBlockTemplates.map((t) => t.name));
  // Output: ["Focus Time Block", "Meeting Time Block", ...]
}

// ============================================
// CONTOH 3: AI-Powered Template Suggestion
// ============================================

export function exampleTemplateSuggestion() {
  console.log('\n=== EXAMPLE 3: Template Suggestion ===\n');

  const testCases = [
    'I need to add a task',
    'Create a daily meditation habit',
    'Set my goals for today',
    'Block 2 hours for focused work',
    'Remind me to call mom',
    'Help me optimize my schedule',
  ];

  testCases.forEach((input) => {
    const suggested = chatTemplateEngine.suggestTemplate(input);
    console.log(`"${input}" → ${suggested?.name || 'No suggestion'}`);
  });
}

// ============================================
// CONTOH 4: Variable Validation
// ============================================

export function exampleVariableValidation() {
  console.log('\n=== EXAMPLE 4: Variable Validation ===\n');

  // Valid variables
  const valid = chatTemplateEngine.validateVariables('task-detailed', {
    title: 'Fix critical bug',
    priority: 'urgent',
    dueDate: 'tomorrow',
    duration: 120,
  });
  console.log('Valid variables:', valid);
  // Output: { valid: true, errors: [] }

  // Missing required variable
  const invalid = chatTemplateEngine.validateVariables('task-detailed', {
    title: 'Fix bug',
    // missing: priority, dueDate, duration
  });
  console.log('Invalid variables:', invalid);
  // Output: { valid: false, errors: ['Required variable missing: priority', ...] }
}

// ============================================
// CONTOH 5: Custom Template Registration
// ============================================

export function exampleCustomTemplate() {
  console.log('\n=== EXAMPLE 5: Custom Template ===\n');

  // Define custom template untuk developer
  const devTemplate: ChatTemplate = {
    id: 'dev-pr-review',
    name: 'Pull Request Review Task',
    type: 'task',
    category: 'development',
    promptTemplate:
      'Create task: Review Pull Request {{prNumber}} - {{description}}, priority {{priority}}',
    systemMessage: `You are a developer assistant. 
    Create a code review task with:
    - PR Number: {{prNumber}}
    - Description: {{description}}
    - Priority: {{priority}}
    
    Respond with JSON for task creation.`,
    examples: [
      'Review Pull Request #123 - Add authentication',
      'Review PR #456 - Fix performance issue - high priority',
    ],
    variables: ['prNumber', 'description', 'priority'],
    tags: ['development', 'code-review', 'github'],
    description: 'Template untuk code review tasks dari pull requests',
  };

  // Register custom template
  chatTemplateEngine.registerTemplate(devTemplate);
  console.log('Custom template registered:', devTemplate.name);

  // Use custom template
  const prompt = chatTemplateEngine.generatePrompt('dev-pr-review', {
    prNumber: '#789',
    description: 'Implement new API endpoint',
    priority: 'high',
  });
  console.log('Generated prompt:', prompt);
  // Output: "Create task: Review Pull Request #789 - Implement new API endpoint, priority high"
}

// ============================================
// CONTOH 6: Template Instructions for UI
// ============================================

export function exampleTemplateInstructions() {
  console.log('\n=== EXAMPLE 6: Template Instructions ===\n');

  // Generate instructions untuk user
  const taskInstructions = chatTemplateEngine.generateInstructions('task-detailed');
  console.log('Task Instructions:\n', taskInstructions);

  const habitInstructions = chatTemplateEngine.generateInstructions('habit-daily');
  console.log('\nHabit Instructions:\n', habitInstructions);

  // Get template dengan examples
  const template = chatTemplateEngine.getTemplateWithExamples('timeblock-focus');
  if (template) {
    console.log('\nTemplate dengan examples:');
    console.log('- Name:', template.name);
    console.log('- Description:', template.description);
    console.log('- Examples:', template.examples);
  }
}

// ============================================
// CONTOH 7: Building Form dari Template
// ============================================

export function exampleBuildingForm() {
  console.log('\n=== EXAMPLE 7: Building Form from Template ===\n');

  // Get template info untuk form building
  const template = chatTemplateEngine.getTemplate('task-detailed');
  if (template) {
    console.log('Template:', template.name);
    console.log('Description:', template.description);
    console.log('Examples:');
    template.examples?.forEach((ex) => console.log('  -', ex));

    // Simulate form submission
    const formData = {
      title: 'Fix critical bug',
      priority: 'urgent',
      dueDate: '2025-11-05',
      duration: 120,
    };

    // Validate form data
    const validation = chatTemplateEngine.validateVariables(template.id, formData);
    if (validation.valid) {
      console.log('\n✓ Form valid, processing...');

      // Build template dengan form data
      const processed = chatTemplateEngine.buildTemplateFromForm(template.id, formData);
      if (processed) {
        console.log('Generated Prompt:', processed.prompt);
        console.log('System Message:', processed.systemMessage.substring(0, 100) + '...');
      }
    }
  }
}

// ============================================
// CONTOH 8: Import/Export Templates
// ============================================

export function exampleImportExport() {
  console.log('\n=== EXAMPLE 8: Import/Export Templates ===\n');

  // Export current templates
  const exported = chatTemplateEngine.exportTemplates();
  console.log('Exported templates (first 200 chars):');
  console.log(exported.substring(0, 200) + '...');

  // Simulate saving and loading
  const templateData = exported;

  // Import templates
  const result = chatTemplateEngine.importTemplates(templateData);
  console.log('\nImport result:');
  console.log('- Success:', result.success);
  console.log('- Imported:', result.imported);
  console.log('- Errors:', result.errors.length);
}

// ============================================
// CONTOH 9: Template Workflow - Lengkap
// ============================================

export async function exampleCompleteWorkflow() {
  console.log('\n=== EXAMPLE 9: Complete Workflow ===\n');

  // Step 1: User input / AI suggestion
  const userInput = 'I want to schedule focused work time';
  const suggestedTemplate = chatTemplateEngine.suggestTemplate(userInput);
  console.log('1. Suggested Template:', suggestedTemplate?.name);

  if (suggestedTemplate) {
    // Step 2: Get template info
    const template = chatTemplateEngine.getTemplateWithExamples(suggestedTemplate.id);
    console.log('2. Template Info:');
    console.log('   -', template?.description);
    console.log('   - Examples:', template?.examples?.[0]);

    // Step 3: User fills form
    const userData = {
      task: 'API Development',
      duration: 120,
    };
    console.log('3. User Input:', userData);

    // Step 4: Validate
    const validation = chatTemplateEngine.validateVariables(suggestedTemplate.id, userData);
    console.log('4. Validation:', validation.valid ? '✓ Valid' : '✗ Invalid');

    if (validation.valid) {
      // Step 5: Process template
      const processed = chatTemplateEngine.processTemplate(suggestedTemplate.id, userData);
      console.log('5. Generated Prompt:', processed?.prompt);

      // Step 6: Send to AI
      console.log('6. Ready to send to AI service...');
      // const response = await aiService.processRequest(processed?.prompt || '');
    }
  }
}

// ============================================
// CONTOH 10: Listing All Available Templates
// ============================================

export function exampleListAllTemplates() {
  console.log('\n=== EXAMPLE 10: All Available Templates ===\n');

  const allTemplates = chatTemplateEngine.getAllTemplates();

  // Group by type
  const grouped: { [key: string]: typeof allTemplates } = {};
  allTemplates.forEach((t) => {
    if (!grouped[t.type]) grouped[t.type] = [];
    grouped[t.type].push(t);
  });

  Object.entries(grouped).forEach(([type, templates]) => {
    console.log(`\n${type.toUpperCase()} TEMPLATES (${templates.length}):`);
    templates.forEach((t) => {
      console.log(`  - ${t.name} (${t.id})`);
      console.log(`    ${t.description}`);
    });
  });

  console.log(`\nTotal Templates: ${allTemplates.length}`);
}

// ============================================
// Run Examples (uncomment untuk test)
// ============================================

export function runAllExamples() {
  exampleQuickUsage();
  exampleSearchAndDiscovery();
  exampleTemplateSuggestion();
  exampleVariableValidation();
  exampleCustomTemplate();
  exampleTemplateInstructions();
  exampleBuildingForm();
  exampleImportExport();
  exampleCompleteWorkflow();
  exampleListAllTemplates();
}
