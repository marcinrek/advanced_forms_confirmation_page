import { initFormSummary } from './src/formSummary.js';

// Initialize when window is fully loaded
if (document.readyState === 'complete') {
  initFormSummary();
} else {
  window.addEventListener('load', initFormSummary);
}

