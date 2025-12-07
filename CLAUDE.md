# BOPS Experiments

Prototyping environment for designing and testing UI concepts for the Back-office Planning System before building them in production.

## Architecture

```
public/
├── components/           # Shared CSS/JS components
│   ├── css/
│   └── js/
├── experiments/          # Organised by workflow
│   ├── review/
│   ├── validation/
│   ├── assessment/
│   ├── consultation/
│   └── other/
└── index.html            # Experiment directory
```

## Workflows

- **Review**: Senior officer reviews report. Single-page, sidebar anchors scroll to sections. Uses Agree/Return/Edit controls.
- **Validation**: Validating applications. Multi-page, sidebar links load separate pages.
- **Assessment**: Case officer assessing applications.
- **Consultation**: Managing consultee responses.

## Component Reuse

Components are shared across experiments. Change once, updates everywhere.
Import only what's needed:
- All experiments: layout.css, header.css, case-summary.css, sidebar.css
- Review only: review-controls.css, review-controls.js

## Creating New Experiments

1. Create folder: `experiments/{workflow}/{name}/`
2. Create `index.html`, import components from `/components/`
3. Update `/index.html` landing page to link to new experiment

---

# GOV.UK Design System - Project Reference

## Current Setup

- **GOV.UK Frontend**: v5.13.0 (installed October 2025)
- **Node.js**: v20 Alpine (via Docker)
- **Sass**: Dart Sass (required - do NOT use LibSass or Ruby Sass)

## Quick Commands

```bash
# Start the dev server
docker compose up

# Build custom CSS
docker compose exec app npm run build:css

# Watch for CSS changes
docker compose exec app npm run watch:css

# Access the app
http://localhost:8080
```

## Important: GOV.UK Brand Refresh (June 2025)

New services must implement the refreshed GOV.UK brand. If using Nunjucks, set:
```javascript
govukRebrand: true
```

## Upcoming Breaking Changes (v6.0.0)

- Sass colour system changing to functional colours via `govuk-functional-colour()`
- Requires Dart Sass 1.79+
- `govuk-tint` and `govuk-shade` functions deprecated

---

## Component Reference

### Button

```html
<!-- Default -->
<button type="submit" class="govuk-button" data-module="govuk-button">
  Save and continue
</button>

<!-- Start button (use for service entry points) -->
<a href="#" role="button" draggable="false" class="govuk-button govuk-button--start" data-module="govuk-button">
  Start now
  <svg class="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
  </svg>
</a>

<!-- Secondary -->
<button type="submit" class="govuk-button govuk-button--secondary" data-module="govuk-button">
  Find address
</button>

<!-- Warning (destructive actions) -->
<button type="submit" class="govuk-button govuk-button--warning" data-module="govuk-button">
  Delete account
</button>

<!-- Disabled -->
<button type="submit" disabled aria-disabled="true" class="govuk-button" data-module="govuk-button">
  Disabled button
</button>
```

### Text Input

```html
<!-- Basic with label as page heading -->
<div class="govuk-form-group">
  <h1 class="govuk-label-wrapper">
    <label class="govuk-label govuk-label--l" for="event-name">
      What is the name of the event?
    </label>
  </h1>
  <input class="govuk-input" id="event-name" name="eventName" type="text">
</div>

<!-- With hint -->
<div class="govuk-form-group">
  <label class="govuk-label" for="ni-number">National Insurance number</label>
  <div id="ni-number-hint" class="govuk-hint">
    It's on your National Insurance card, benefit letter, payslip or P60
  </div>
  <input class="govuk-input" id="ni-number" name="niNumber" type="text" aria-describedby="ni-number-hint">
</div>

<!-- Fixed widths: govuk-input--width-2, --width-3, --width-4, --width-5, --width-10, --width-20 -->
<input class="govuk-input govuk-input--width-5" id="postcode" name="postcode" type="text">

<!-- Fluid widths -->
<input class="govuk-input govuk-!-width-two-thirds" id="address" name="address" type="text">

<!-- With prefix/suffix -->
<div class="govuk-input__wrapper">
  <div class="govuk-input__prefix" aria-hidden="true">£</div>
  <input class="govuk-input govuk-input--width-5" id="cost" name="cost" type="text" spellcheck="false">
  <div class="govuk-input__suffix" aria-hidden="true">per item</div>
</div>
```

### Textarea

```html
<div class="govuk-form-group">
  <h1 class="govuk-label-wrapper">
    <label class="govuk-label govuk-label--l" for="more-detail">
      Can you provide more detail?
    </label>
  </h1>
  <div id="more-detail-hint" class="govuk-hint">
    Do not include personal or financial information
  </div>
  <textarea class="govuk-textarea" id="more-detail" name="moreDetail" rows="5" aria-describedby="more-detail-hint"></textarea>
</div>
```

### Select (Dropdown)

```html
<div class="govuk-form-group">
  <label class="govuk-label" for="sort">Sort by</label>
  <select class="govuk-select" id="sort" name="sort">
    <option value="published">Recently published</option>
    <option value="updated" selected>Recently updated</option>
    <option value="views">Most views</option>
  </select>
</div>
```

**Note**: Research shows selects are difficult for some users. Prefer radios/checkboxes when practical.

### Radios

```html
<!-- Standard radios -->
<div class="govuk-form-group">
  <fieldset class="govuk-fieldset">
    <legend class="govuk-fieldset__legend govuk-fieldset__legend--l">
      <h1 class="govuk-fieldset__heading">Where do you live?</h1>
    </legend>
    <div class="govuk-radios" data-module="govuk-radios">
      <div class="govuk-radios__item">
        <input class="govuk-radios__input" id="where-1" name="where" type="radio" value="england">
        <label class="govuk-label govuk-radios__label" for="where-1">England</label>
      </div>
      <div class="govuk-radios__item">
        <input class="govuk-radios__input" id="where-2" name="where" type="radio" value="scotland">
        <label class="govuk-label govuk-radios__label" for="where-2">Scotland</label>
      </div>
    </div>
  </fieldset>
</div>

<!-- Inline radios (only for 2 short options) -->
<div class="govuk-radios govuk-radios--inline" data-module="govuk-radios">
  <!-- items -->
</div>

<!-- With conditional reveal -->
<div class="govuk-radios__item">
  <input class="govuk-radios__input" id="contact" name="contact" type="radio" value="email" data-aria-controls="conditional-contact">
  <label class="govuk-label govuk-radios__label" for="contact">Email</label>
</div>
<div class="govuk-radios__conditional govuk-radios__conditional--hidden" id="conditional-contact">
  <div class="govuk-form-group">
    <label class="govuk-label" for="email">Email address</label>
    <input class="govuk-input" id="email" name="email" type="email">
  </div>
</div>
```

### Checkboxes

```html
<div class="govuk-form-group">
  <fieldset class="govuk-fieldset" aria-describedby="nationality-hint">
    <legend class="govuk-fieldset__legend govuk-fieldset__legend--l">
      <h1 class="govuk-fieldset__heading">What is your nationality?</h1>
    </legend>
    <div id="nationality-hint" class="govuk-hint">
      Select all options that apply
    </div>
    <div class="govuk-checkboxes" data-module="govuk-checkboxes">
      <div class="govuk-checkboxes__item">
        <input class="govuk-checkboxes__input" id="nationality-1" name="nationality" type="checkbox" value="british">
        <label class="govuk-label govuk-checkboxes__label" for="nationality-1">British</label>
      </div>
      <div class="govuk-checkboxes__item">
        <input class="govuk-checkboxes__input" id="nationality-2" name="nationality" type="checkbox" value="irish">
        <label class="govuk-label govuk-checkboxes__label" for="nationality-2">Irish</label>
      </div>
    </div>
  </fieldset>
</div>

<!-- With conditional reveal (same pattern as radios) -->
```

### Error States

```html
<!-- Error summary (top of page) -->
<div class="govuk-error-summary" data-module="govuk-error-summary">
  <div role="alert">
    <h2 class="govuk-error-summary__title">There is a problem</h2>
    <div class="govuk-error-summary__body">
      <ul class="govuk-list govuk-error-summary__list">
        <li><a href="#ni-number">Enter a National Insurance number</a></li>
      </ul>
    </div>
  </div>
</div>

<!-- Field with error -->
<div class="govuk-form-group govuk-form-group--error">
  <label class="govuk-label" for="ni-number">National Insurance number</label>
  <div id="ni-number-hint" class="govuk-hint">
    It's on your National Insurance card
  </div>
  <p id="ni-number-error" class="govuk-error-message">
    <span class="govuk-visually-hidden">Error:</span> Enter a National Insurance number
  </p>
  <input class="govuk-input govuk-input--error" id="ni-number" name="niNumber" type="text"
         aria-describedby="ni-number-hint ni-number-error">
</div>
```

**Error message guidelines**:
- Be specific (not "Enter a value" but "Enter your email address")
- Match language from the label
- Use same message in summary and inline
- Never clear user data on error

---

## Layout & Structure

### Page Template

```html
<!DOCTYPE html>
<html lang="en" class="govuk-template">
<head>
  <meta charset="utf-8">
  <title>Page title - Service name - GOV.UK</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="stylesheet" href="/stylesheets/govuk-frontend.min.css">
</head>
<body class="govuk-template__body">
  <script>document.body.className += ' js-enabled' + ('noModule' in HTMLScriptElement.prototype ? ' govuk-frontend-supported' : '');</script>

  <a href="#main-content" class="govuk-skip-link">Skip to main content</a>

  <header class="govuk-header" data-module="govuk-header">
    <!-- header content -->
  </header>

  <div class="govuk-width-container">
    <main class="govuk-main-wrapper" id="main-content" role="main">
      <!-- page content -->
    </main>
  </div>

  <footer class="govuk-footer">
    <!-- footer content -->
  </footer>

  <script type="module" src="/javascripts/govuk-frontend.min.js"></script>
  <script type="module">
    import { initAll } from '/javascripts/govuk-frontend.min.js'
    initAll()
  </script>
</body>
</html>
```

### Grid System

```html
<div class="govuk-grid-row">
  <div class="govuk-grid-column-two-thirds">
    <!-- Main content -->
  </div>
  <div class="govuk-grid-column-one-third">
    <!-- Sidebar -->
  </div>
</div>

<!-- Column classes:
  govuk-grid-column-full
  govuk-grid-column-one-half
  govuk-grid-column-one-third
  govuk-grid-column-two-thirds
  govuk-grid-column-one-quarter
  govuk-grid-column-three-quarters
-->
```

### Typography

```html
<h1 class="govuk-heading-xl">XL Heading</h1>
<h2 class="govuk-heading-l">Large Heading</h2>
<h3 class="govuk-heading-m">Medium Heading</h3>
<h4 class="govuk-heading-s">Small Heading</h4>

<p class="govuk-body">Normal paragraph</p>
<p class="govuk-body-l">Lead paragraph (larger)</p>
<p class="govuk-body-s">Small text</p>

<ul class="govuk-list govuk-list--bullet">
  <li>Bulleted item</li>
</ul>

<ol class="govuk-list govuk-list--number">
  <li>Numbered item</li>
</ol>
```

### Spacing

Override classes: `govuk-!-margin-{direction}-{size}` and `govuk-!-padding-{direction}-{size}`

- Directions: `top`, `right`, `bottom`, `left` (or omit for all sides)
- Sizes: `0` to `9`

Example: `govuk-!-margin-bottom-6`

---

## Available Patterns

### Ask users for:
- Addresses, Bank details, Dates, Email addresses
- Equality information, Names, National Insurance numbers
- Passwords, Payment card details, Phone numbers

### Help users to:
- Check a service is suitable
- Check answers
- Complete multiple tasks
- Confirm phone/email
- Contact department
- Create accounts/usernames
- Exit a page quickly
- Navigate a service
- Start using a service
- Recover from validation errors

### Page types:
- Confirmation pages
- Cookies page
- Page not found (404)
- Service unavailable
- Question pages
- Step by step navigation

---

## File Structure

```
public/
├── index.html
├── assets/
│   ├── fonts/
│   ├── images/
│   └── manifest.json
├── stylesheets/
│   └── govuk-frontend.min.css
└── javascripts/
    └── govuk-frontend.min.js

src/
└── scss/
    └── main.scss         # Custom Sass (imports govuk-frontend)
```

---

## Resources

- Design System: https://design-system.service.gov.uk/
- Frontend docs: https://frontend.design-system.service.gov.uk/
- GitHub: https://github.com/alphagov/govuk-frontend
- Components: https://design-system.service.gov.uk/components/
- Patterns: https://design-system.service.gov.uk/patterns/
