// Helper function to get the first element from a field (handles radio groups, etc.)
export function getFirstFieldElement(field) {
  if (!field) return null;
  if (field instanceof Element) return field;
  if (typeof field.length === 'number' && field.length > 0) {
    for (let i = 0; i < field.length; i++) {
      if (field[i] instanceof Element) return field[i];
    }
  }
  return null;
}

// Check if a field should be included in the summary
export function shouldIncludeField(field) {
  const el = getFirstFieldElement(field);
  if (!el) return false;

  // Allow hidden inputs that contain file upload data
  if (el.tagName === 'INPUT' && el.type === 'hidden') {
    // Include file upload hidden inputs (they have class 'hiddenfilevals')
    if (el.classList && el.classList.contains('hiddenfilevals')) {
      return true;
    }
    return false;
  }
  if (el.name && el.name === 'frontend_event_log') return false;
  if (el.name && el.name.startsWith('ajup_')) return false;
  if (el.name && el.name.startsWith('_')) return false;

  return true;
}

// Get label text for a field with special handling for radio groups
export function getLabelText(field, name, form) {
  const el = getFirstFieldElement(field);
  if (!el) return name || '';

  let labelText = '';

  // For radio groups, prefer the radiogroup container label
  if (el.type === 'radio') {
    const radio = el;
    const group = radio.closest('.radio-group[role="radiogroup"]');
    if (group) {
      // 1) aria-labelledby
      const labelledById = group.getAttribute('aria-labelledby');
      if (labelledById) {
        const labelEl = document.getElementById(labelledById);
        if (labelEl) labelText = labelEl.textContent.trim();
      }
      // 2) preceding .control-label in same snap-field
      if (!labelText) {
        const snapField = group.closest('.snap-field');
        if (snapField) {
          const ctrlLabel = snapField.querySelector('.control-label');
          if (ctrlLabel) labelText = ctrlLabel.textContent.trim();
        }
      }
    }
  }

  // Normal explicit label
  if (!labelText && el.id) {
    const explicit = form.querySelector(`label[for="${el.id}"]`);
    if (explicit) labelText = explicit.textContent.trim();
  }

  // Wrapped label
  if (!labelText) {
    const wrapped = el.closest && el.closest('label');
    if (wrapped) labelText = wrapped.textContent.trim();
  }

  // Snapforms .control-label for non-radio fields
  if (!labelText) {
    const snapField = el.closest && el.closest('.snap-field');
    if (snapField) {
      const heading = snapField.querySelector('.control-label');
      if (heading) labelText = heading.textContent.trim();
    }
  }

  // Fallback to name
  if (!labelText) {
    labelText = name || el.name || '';
  }

  // Remove asterisk and any surrounding whitespace
  return labelText.replace(/\s*\*\s*/g, ' ').trim();
}

// Get display value for a field with special handling for radio groups and file uploads
export function getDisplayValue(field, rawValue, form) {
  const el = getFirstFieldElement(field);
  if (!el) return rawValue;

  // Handle file uploads (hidden inputs with class 'hiddenfilevals' containing JSON)
  if (el.type === 'hidden' && el.classList && el.classList.contains('hiddenfilevals')) {
    if (!rawValue || rawValue.trim() === '' || rawValue.trim() === '[]') {
      return 'No files uploaded';
    }
    try {
      // element.value already decodes HTML entities automatically
      const files = JSON.parse(rawValue);
      if (Array.isArray(files) && files.length > 0) {
        return files.map(f => f.name || 'Unnamed file').join(', ');
      }
    } catch (e) {
      // If JSON parsing fails, return a fallback message
      console.warn('Failed to parse file upload JSON:', e, rawValue);
    }
    return 'No files uploaded';
  }

  if (el.type === 'checkbox') {
    // For checkboxes, if checked, show the value or a default message
    if (el.checked) {
      // Try to get label text for better display
      const checkboxLabel = form.querySelector(`label[for="${el.id}"]`);
      if (checkboxLabel) {
        const labelText = checkboxLabel.textContent.trim();
        // Remove asterisk and return clean label
        return labelText.replace(/\s*\*\s*/g, ' ').trim() || rawValue;
      }
      // Return the value or a default
      return rawValue || 'Yes';
    }
    return rawValue;
  }

  if (el.type === 'radio') {
    // Find checked radio in the group
    const radios = field.length ? field : form.elements[el.name];
    let checkedRadio = null;

    if (radios && typeof radios.length === 'number') {
      for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
          checkedRadio = radios[i];
          break;
        }
      }
    } else if (el.checked) {
      checkedRadio = el;
    }

    if (checkedRadio) {
      // Try label[for=id] for the checked radio
      const radioLabel = form.querySelector(`label[for="${checkedRadio.id}"]`);
      if (radioLabel) return radioLabel.textContent.trim();

      // Fallback: check within same .radio span
      const span = checkedRadio.closest('span');
      if (span) {
        const lbl = span.querySelector('label');
        if (lbl) return lbl.textContent.trim();
      }
    }

    return rawValue;
  }

  return rawValue;
}

// Get the section container for a field
export function getSectionContainer(field) {
  const el = getFirstFieldElement(field);
  if (!el) return null;
  return el.closest &&
    (el.closest('section[role="tabpanel"]') ||
     el.closest('section') ||
     el.closest('.form-group'));
}

// Get the page heading (first fieldtype_heading) from a section
export function getPageHeading(section) {
  if (!section) return null;
  // Look for the first heading with class fieldtype_heading (can be h1, h2, h3, etc.)
  const heading = section.querySelector('h1.fieldtype_heading, h2.fieldtype_heading, h3.fieldtype_heading, h4.fieldtype_heading, h5.fieldtype_heading, h6.fieldtype_heading');
  if (heading) {
    return heading.textContent.trim();
  }
  return null;
}

// Check if form is multi-page (has Next button)
export function isMultiPageForm(form) {
  const nextButton = form.querySelector('a[href="#next"]');
  return !!nextButton;
}

// Check if we're on the last page (has visible Finish button)
export function isLastPage(form) {
  const finishButton = form.querySelector('a[href="#finish"]');
  if (!finishButton) return false;
  
  const finishLi = finishButton.closest('li');
  return finishLi && 
    finishLi.style.display !== 'none' &&
    finishLi.getAttribute('aria-hidden') !== 'true';
}

// Create or get the summary element
export function createSummaryElement(form) {
  const actionsContainer = form.querySelector('.actions.clearfix') || form.querySelector('.actions');
  if (!actionsContainer) return null;

  let summary = form.querySelector('[data-form-summary]');
  if (!summary) {
    summary = document.createElement('section');
    summary.setAttribute('data-form-summary', 'true');
    summary.setAttribute('aria-live', 'polite');
    summary.setAttribute('role', 'region');
    summary.setAttribute('aria-labelledby', 'form-summary-heading');
    summary.setAttribute('tabindex', '0');
    summary.className = 'form-summary content clearfix';
    summary.style.marginBottom = '30px';
    summary.style.minHeight = 'auto';
    summary.innerHTML = `
      <h2 id="form-summary-heading" class="form-summary__heading">Summary of your answers</h2>
    `;
    // Insert before the actions container
    actionsContainer.parentNode.insertBefore(summary, actionsContainer);
  } else {
    // Ensure existing summary has the classes and margin
    summary.className = 'form-summary content clearfix';
    summary.style.marginBottom = '30px';
    summary.style.minHeight = 'auto';
  }

  // Clear existing content (except the h2)
  const existingH2 = summary.querySelector('h2');
  summary.innerHTML = '';
  if (existingH2) {
    summary.appendChild(existingH2);
  }

  return summary;
}

// Collect file upload fields
export function collectFileUploads(form) {
  const fieldMap = new Map();
  const fileUploadInputs = form.querySelectorAll('input.hiddenfilevals[type="hidden"]');
  
  for (const fileInput of fileUploadInputs) {
    const name = fileInput.name;
    if (!name) continue;
    
    const value = fileInput.value || '';
    if (!value || value.trim() === '' || value.trim() === '[]') continue; // Skip empty file uploads
    
    // Check if it's actually a valid JSON array with files
    try {
      const files = JSON.parse(value);
      if (!Array.isArray(files) || files.length === 0) continue; // Skip empty arrays
    } catch (e) {
      // If not valid JSON, skip it
      continue;
    }
    
    fieldMap.set(name, { field: fileInput, value: value });
  }
  
  return fieldMap;
}

// Collect other form fields from FormData
export function collectFormFields(form, fieldMap) {
  const data = new FormData(form);
  
  // First, collect checkboxes directly (they may not appear in FormData if unchecked)
  const checkboxes = form.querySelectorAll('input[type="checkbox"]:not(.hiddenfilevals)');
  for (const checkbox of checkboxes) {
    const name = checkbox.name;
    if (!name || fieldMap.has(name)) continue;
    
    // Only include checked checkboxes
    if (checkbox.checked && shouldIncludeField(checkbox)) {
      fieldMap.set(name, { field: checkbox, value: checkbox.value || 'Yes' });
    }
  }
  
  // Then collect other fields from FormData
  for (const [name, value] of data.entries()) {
    if (!value || fieldMap.has(name)) continue; // Skip if already added as file upload or checkbox

    const field = form.elements[name];
    if (!field || !shouldIncludeField(field)) continue;
    
    // Skip checkboxes here as we've already handled them above
    const el = getFirstFieldElement(field);
    if (el && el.type === 'checkbox') continue;

    fieldMap.set(name, { field: field, value: value });
  }
  
  return fieldMap;
}

// Build the summary content
export function buildSummaryContent(summary, form, fieldMap) {
  const processed = new Set();
  let lastSection = null;
  let currentSectionContainer = null;
  let currentDl = null;

  // Get all form elements in document order
  const allFormElements = Array.from(form.querySelectorAll('input, textarea, select'));
  
  // Process fields in document order
  for (const element of allFormElements) {
    const name = element.name;
    if (!name || !fieldMap.has(name) || processed.has(name)) continue;
    
    const { field, value } = fieldMap.get(name);
    processed.add(name);

    const section = getSectionContainer(field);
    if (section && section !== lastSection) {
      // Close previous section if it exists
      if (currentDl && currentSectionContainer) {
        currentSectionContainer.appendChild(currentDl);
        summary.appendChild(currentSectionContainer);
      }
      
      // Add separator between sections
      if (lastSection !== null) {
        summary.appendChild(document.createElement('hr'));
      }
      
      // Create new section container
      currentSectionContainer = document.createElement('div');
      currentSectionContainer.className = 'form-summary__section';
      currentSectionContainer.setAttribute('role', 'region');
      
      // Add page heading if available
      const pageHeading = getPageHeading(section);
      if (pageHeading) {
        const headingId = `summary-heading-${processed.size}`;
        const headingEl = document.createElement('h3');
        headingEl.id = headingId;
        headingEl.className = 'form-summary__section-heading';
        headingEl.textContent = pageHeading;
        headingEl.setAttribute('tabindex', '0');
        currentSectionContainer.setAttribute('aria-labelledby', headingId);
        currentSectionContainer.appendChild(headingEl);
      }
      
      // Create new container for this section's fields
      currentDl = document.createElement('div');
      currentDl.className = 'form-summary__fields';
      currentDl.setAttribute('role', 'list');
      
      lastSection = section;
    }

    // Create a single focusable div for each field if we have a current container
    if (currentDl) {
      const fieldDiv = document.createElement('div');
      fieldDiv.className = 'form-summary__field';
      fieldDiv.setAttribute('tabindex', '0');
      fieldDiv.setAttribute('role', 'listitem');
      
      const label = getLabelText(field, name, form);
      const fieldValue = getDisplayValue(field, value, form);
      
      // Combine label and value in a way that screen readers will read both
      fieldDiv.setAttribute('aria-label', `${label}: ${fieldValue}`);
      fieldDiv.innerHTML = `<strong class="form-summary__field-label">${label}:</strong> <span class="form-summary__field-value">${fieldValue}</span>`;

      currentDl.appendChild(fieldDiv);
    }
  }
  
  // Close the last section
  if (currentDl && currentSectionContainer) {
    currentSectionContainer.appendChild(currentDl);
    summary.appendChild(currentSectionContainer);
  }
}

// Main function to append form summary
export function appendFormSummary(formSelector = 'form') {
  const form = typeof formSelector === 'string'
    ? document.querySelector(formSelector)
    : formSelector;

  if (!form) return;

  // Check if this is a multi-page form
  if (!isMultiPageForm(form)) {
    return;
  }

  // Check if we're on the last page
  if (!isLastPage(form)) {
    // Not on last page - remove summary if it exists
    const existingSummary = form.querySelector('[data-form-summary]');
    if (existingSummary) {
      existingSummary.remove();
    }
    return;
  }

  // Create or get summary element
  const summary = createSummaryElement(form);
  if (!summary) return;

  // Collect all fields
  let fieldMap = collectFileUploads(form);
  fieldMap = collectFormFields(form, fieldMap);

  // Build summary content
  buildSummaryContent(summary, form, fieldMap);
}

// Update summary visibility based on current page
export function updateSummaryVisibility(form) {
  const finishButton = form.querySelector('a[href="#finish"]');
  if (!finishButton) {
    // No finish button - remove summary
    const existingSummary = form.querySelector('[data-form-summary]');
    if (existingSummary) {
      existingSummary.remove();
    }
    return;
  }
  
  const finishLi = finishButton.closest('li');
  const isLastPage = finishLi && 
    finishLi.style.display !== 'none' &&
    finishLi.getAttribute('aria-hidden') !== 'true';

  if (isLastPage) {
    // On last page - show/update summary
    appendFormSummary(form);
  } else {
    // Not on last page - remove summary
    const existingSummary = form.querySelector('[data-form-summary]');
    if (existingSummary) {
      existingSummary.remove();
    }
  }
}

// Initialize summary functionality
export function initFormSummary() {
  const form = document.querySelector('form');
  if (!form) return;

  // Check if this is a multi-page form
  if (!isMultiPageForm(form)) {
    return;
  }

  // Script run
  console.log('Summary script loaded');

  // Attach event to Next button
  const nextButton = form.querySelector('a[href="#next"]');
  if (nextButton) {
    nextButton.addEventListener('click', function(e) {
      // Use setTimeout to allow page transition to complete
      setTimeout(() => updateSummaryVisibility(form), 100);
    });
  }

  // Attach event to Previous button
  const previousButton = form.querySelector('a[href="#previous"]');
  if (previousButton) {
    previousButton.addEventListener('click', function(e) {
      // Remove summary when going back
      setTimeout(() => updateSummaryVisibility(form), 100);
    });
  }

  // Initial check
  updateSummaryVisibility(form);

  // Also watch for dynamic changes (in case form updates without navigation)
  const observer = new MutationObserver(function(mutations) {
    updateSummaryVisibility(form);
  });

  // Observe changes to the finish button's parent li visibility and the actions container
  const finishButton = form.querySelector('a[href="#finish"]');
  const actionsContainer = form.querySelector('.actions');
  
  if (finishButton && finishButton.closest('li')) {
    observer.observe(finishButton.closest('li'), {
      attributes: true,
      attributeFilter: ['style', 'aria-hidden']
    });
  }
  
  // Also observe the actions container for any changes
  if (actionsContainer) {
    observer.observe(actionsContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'aria-hidden']
    });
  }
}
