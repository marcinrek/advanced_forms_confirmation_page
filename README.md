# Advanced Forms Confirmation Page

A JavaScript-based confirmation page solution for Squiz Advanced Forms (DXP). This library automatically generates a summary of user answers on multi-page forms, displaying it only on the final page before submission.

## Features

- **Automatic Summary Generation**: Creates a comprehensive summary of all form answers
- **Multi-Page Form Support**: Detects multi-page forms and shows summary only on the last page
- **Field Type Support**: Handles various field types including:
  - Text inputs
  - Textareas
  - Select dropdowns
  - Radio buttons
  - Checkboxes
  - File uploads
- **Section Grouping**: Groups fields by form sections/pages with headings
- **Accessibility**: Built with ARIA attributes and semantic HTML for screen reader support
- **Dynamic Updates**: Automatically updates when navigating between form pages
- **Smart Label Detection**: Intelligently finds and displays field labels from various form structures

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Advanced_Forms_Confirmation_Page
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Building the Bundle

Build the production bundle:
```bash
npm run build
```

This creates a minified `dist/bundle.js` file ready for production use.

### Development Mode

Run in watch mode for development (auto-rebuilds on changes):
```bash
npm run dev
```

Or use the watch command:
```bash
npm run watch
```

### Including in Your Form

Include the bundled script in your HTML form page.
Go to ***Form Settings*** -> ***Usability*** -> ***Advanced*** -> ***Enable customJS for this form (advanced)***

```js
    (function() {
      function loadBundle() {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/gh/marcinrek/advanced_forms_confirmation_page@master/dist/bundle.js';
        script.async = true;
        script.onload = function() {
          console.log('Form summary bundle loaded');
        };
        script.onerror = function() {
          console.error('Failed to load form summary bundle');
        };
        document.head.appendChild(script);
      }
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadBundle);
      } else {
        loadBundle();
      }
    })();
```

The script automatically initializes when the window loads and will:
- Detect if the form is multi-page
- Show the summary only on the last page (when the Finish button is visible)
- Update dynamically as users navigate between pages

## How It Works

1. **Initialization**: The script waits for the window to fully load before initializing
2. **Form Detection**: Checks if the form is multi-page by looking for a "Next" button
3. **Page Detection**: Monitors the visibility of the "Finish" button to determine if the user is on the last page
4. **Field Collection**: Collects all form fields including:
   - Regular form fields (text, select, textarea)
   - Checkboxes (only checked ones)
   - Radio buttons (selected value)
   - File uploads (from hidden inputs with class `hiddenfilevals`)
5. **Summary Generation**: Creates a structured summary grouped by form sections
6. **Dynamic Updates**: Uses MutationObserver to watch for form changes and updates the summary accordingly

## Project Structure

```
Advanced_Forms_Confirmation_Page/
├── app.js                 # Main entry point
├── src/
│   └── formSummary.js    # Core functionality
├── dist/
│   ├── bundle.js         # Bundled output (generated)
│   └── bundle.js.map     # Source map (generated)
├── formSample/
│   └── sample01.html     # Example form implementation
├── esbuild.config.js     # Build configuration
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Development

### Build Configuration

The project uses [esbuild](https://esbuild.github.io/) for bundling:
- **Format**: IIFE (Immediately Invoked Function Expression)
- **Target**: ES2015
- **Minification**: Enabled in production builds
- **Source Maps**: Generated in development mode

### Key Functions

- `initFormSummary()`: Main initialization function
- `appendFormSummary()`: Creates and displays the summary
- `updateSummaryVisibility()`: Shows/hides summary based on current page
- `collectFormFields()`: Gathers all form field data
- `getDisplayValue()`: Formats field values for display
- `getLabelText()`: Extracts field labels from various form structures

## Browser Support

- Modern browsers supporting ES2015+
- Requires support for:
  - ES6 Modules
  - MutationObserver API
  - FormData API

## License

MIT License

Copyright (c) 2024 Marcin Rek

See [LICENSE](LICENSE) file for details.

## Author

**Marcin Rek**
- GitHub: [@marcinrek](https://github.com/marcinrek)

## Notes

- The script automatically excludes system fields (those starting with `_` or `ajup_`)
- File uploads are parsed from JSON stored in hidden inputs
- The summary is inserted before the form's action buttons
- The script handles both explicit labels (`<label for="id">`) and wrapped labels

