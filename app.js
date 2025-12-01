import { initFormSummary } from './src/formSummary.js';

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFormSummary);
} else {
  initFormSummary();
}

